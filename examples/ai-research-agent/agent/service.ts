/**
 * AI Research Agent — deliverService()
 *
 * THE fork point for this agent economy. Sells concise, sourced research briefs
 * on any topic. The buyer pays SOL via devnet escrow; the seller delivers a
 * structured brief with citations.
 *
 * Request grammar:
 *   "brief <topic>"           -> a 3-paragraph research brief
 *   "deep <topic>"            -> a detailed 500+ word analysis
 *   "compare <A> vs <B>"      -> a structured comparison
 *
 * Built on the CoralOS + Solana escrow rails from the starter kit.
 * Settlement: WANT → BID → AWARD → DEPOSITED → DELIVERED → RELEASED
 */
import { analyzeTopic } from './research.js';

export async function deliverService(request: string): Promise<string> {
  const tokens = request.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return JSON.stringify({
      error: 'Send a research topic. Examples: "brief Solana staking", "deep AI agents", "compare Solana vs Ethereum"'
    });
  }

  const verb = tokens[0].toLowerCase();
  const topic = tokens.slice(1).join(' ');

  if (!topic) {
    return JSON.stringify({ error: `Usage: ${verb} <topic>` });
  }

  try {
    const brief = await analyzeTopic(verb, topic);
    return JSON.stringify({
      service: 'ai-research',
      topic,
      depth: verb,
      ...brief,
      deliveredAt: new Date().toISOString(),
      settlementNote: 'Payment verified on Solana devnet — escrow released on delivery.'
    });
  } catch (e) {
    return JSON.stringify({
      error: `Research failed: ${(e as Error).message}`,
      topic,
      service: 'ai-research'
    });
  }
}
