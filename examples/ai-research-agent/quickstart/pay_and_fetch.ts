/**
 * pay_and_fetch.ts — devnet settlement demo
 *
 * Usage: tsx pay_and_fetch.ts [topic]
 *
 * Sends SOL from buyer → seller on devnet, captures the transaction,
 * then uses that as proof to fetch the research data.
 *
 * Output includes live Explorer link proving settlement.
 */
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';
import { readFileSync } from 'node:fs';

const SERVER = process.env.SERVER_URL ?? 'http://localhost:3002';
const RPC = process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com';
const PRICE_SOL = parseFloat(process.env.PRICE_SOL ?? '0.02');

async function main() {
  const topic = process.argv[2] || 'Solana agent economy on devnet';

  const env = readFileSync('.env', 'utf-8');
  const b58 = env.match(/BUYER_KEYPAIR_B58=(\S+)/)?.[1];
  if (!b58) throw new Error('BUYER_KEYPAIR_B58 not found in .env');
  const buyer = Keypair.fromSecretKey(bs58.decode(b58));
  const sellerWallet = env.match(/SELLER_WALLET=(\S+)/)?.[1] || env.match(/WALLET=(\S+)/)?.[1];
  if (!sellerWallet) throw new Error('SELLER_WALLET not found in .env');

  const conn = new Connection(RPC, 'confirmed');
  const balance = await conn.getBalance(buyer.publicKey);
  console.log(`\nBuyer:  ${buyer.publicKey.toBase58()}`);
  console.log(`Seller: ${sellerWallet}`);
  console.log(`Balance: ${balance / LAMPORTS_PER_SOL} SOL\n`);

  // Step 1: Make a real devnet transfer (settlement proof)
  console.log(`[1] Sending ${PRICE_SOL} SOL to seller on devnet...`);
  const recipient = new PublicKey(sellerWallet);
  const amountLamports = Math.floor(PRICE_SOL * LAMPORTS_PER_SOL);

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: buyer.publicKey,
      toPubkey: recipient,
      lamports: amountLamports,
    })
  );

  const { blockhash } = await conn.getLatestBlockhash('confirmed');
  tx.recentBlockhash = blockhash;
  tx.feePayer = buyer.publicKey;
  
  tx.sign(buyer);
  const sig = await conn.sendRawTransaction(tx.serialize());
  
  console.log(`     TX sent: ${sig}`);
  
  const confirmResult = await conn.confirmTransaction(sig, 'confirmed');
  if (confirmResult.value.err) {
    throw new Error(`Transaction failed: ${confirmResult.value.err}`);
  }
  
  const explorerUrl = `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
  console.log(`[2] ✅ SETTLEMENT CONFIRMED ON DEVNET`);
  console.log(`     🔗 ${explorerUrl}`);

  // Step 3: Try to fetch research with the payment proof
  console.log(`\n[3] Fetching research with payment proof...`);
  try {
    const dataRes = await fetch(
      `${SERVER}/api/research?q=${encodeURIComponent(topic)}`,
      {
        headers: {
          'x-payment-proof': sig,
          'x-payment-reference': sig,
        },
      }
    );
    const data = await dataRes.json();
    if (dataRes.ok) {
      console.log(`[4] Research delivered ✅`);
    } else {
      console.log(`[4] Research server response: ${JSON.stringify(data).slice(0, 200)}`);
    }
  } catch {
    console.log(`[4] Server not running — payment already proven on-chain`);
  }

  console.log(`\n═══════════════════════════════════════════════`);
  console.log(`  SETTLEMENT PROOF FOR SUBMISSION`);
  console.log(`  Explorer: ${explorerUrl}`);
  console.log(`  From: ${buyer.publicKey.toBase58()}`);
  console.log(`  To:   ${sellerWallet}`);
  console.log(`  Amount: ${PRICE_SOL} SOL`);
  console.log(`═══════════════════════════════════════════════\n`);

  // Save for later use
  const fs = await import('node:fs');
  fs.writeFileSync('/tmp/settlement_proof.txt', explorerUrl);
  fs.writeFileSync('/tmp/settlement_tx.txt', sig);
}

main().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
