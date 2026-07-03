/**
 * AI Research Agent — bare-metal 402 seller
 *
 * The dependency-light version of the research agent economy.
 * Gates research briefs behind Solana micropayments.
 *
 *   GET /api/research?q=topic     → 402 + payment challenge
 *   GET /api/research?q=topic (+ proof headers) → 200 { data }
 *
 * Fork point: the research logic is in agent/research.ts → analyzeTopic()
 */
import express from 'express'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { verifyPayment } from '../../agent-economy/quickstart/verify.js'
import { analyzeTopic } from '../agent/research.js'

const PORT = Number(process.env.PORT ?? 3002)
const RECIPIENT = process.env.SELLER_WALLET ?? process.env.WALLET ?? ''
const PRICE_SOL = Number(process.env.PRICE_SOL ?? 0.0001)
const RPC = process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com'

if (process.env.ALLOW_MAINNET !== '1' && /mainnet/i.test(RPC)) {
  console.error('Refusing mainnet RPC — devnet only. Set ALLOW_MAINNET=1 to override.')
  process.exit(1)
}

const conn = new Connection(RPC, 'confirmed')
const pending = new Map<string, string>()
const app = express()

app.get('/api/research', async (req, res) => {
  const proof = req.header('x-payment-proof')
  const topic = (req.query.q as string) || 'Solana agent economy'
  const depth = (req.query.depth as string) || 'brief'

  if (!proof) {
    const reference = Keypair.generate().publicKey.toBase58()
    pending.set(reference, topic)
    res
      .status(402)
      .set('x-payment-required', JSON.stringify({ recipient: RECIPIENT, amountSol: PRICE_SOL, reference }))
      .json({ error: 'payment required', recipient: RECIPIENT, amountSol: PRICE_SOL, reference, topic })
    return
  }

  const ref = req.header('x-payment-reference') ?? req.query.reference?.toString()
  if (!ref || !pending.has(ref)) {
    res.status(400).json({ error: 'missing or unknown payment reference' })
    return
  }

  const sig = await verifyPayment(conn, new PublicKey(ref), new PublicKey(RECIPIENT), PRICE_SOL)
  if (!sig) {
    res.status(402).json({ error: 'payment not confirmed on-chain' })
    return
  }

  const q = pending.get(ref)!
  pending.delete(ref)
  let data: unknown
  try {
    data = await analyzeTopic(depth, q)
  } catch (e) {
    data = { error: `research failed after payment: ${String(e)}` }
  }
  res.json({ data, paidWith: sig, topic: q })
})

app.listen(PORT, () => {
  console.error(`[research-agent] 402 server on :${PORT} — recipient ${RECIPIENT}, price ${PRICE_SOL} SOL`)
})
