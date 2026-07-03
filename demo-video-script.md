# Demo Video (3 min) — AI Research Agent

## Script

### [0:00-0:30] Problem
> "AI agents can reason, code, and execute — but they can't get paid. Every agent marketplace today requires a human to intervene at the payment step. That's slow, expensive, and doesn't scale to machine-speed markets."

### [0:30-1:00] Solution
> "This is the AI Research Agent — an autonomous agent that sells research briefs on any topic, paid per-brief in SOL on Solana devnet. The entire loop — WANT → BID → AWARD → DEPOSITED → DELIVERED → RELEASED — happens without a human touching the payment."

### [1:00-1:45] Demo
> Screen recording showing:
> 1. Terminal: `npm run dev` starts the proxy + UI
> 2. Terminal: `curl` a research request → gets 402 with payment challenge
> 3. Terminal: Pay with devnet SOL → get research brief back
> 4. Explorer: Show the on-chain settlement transaction
> 5. Optional: React UI showing the autonomous buyer→seller loop

### [1:45-2:30] Economy
> "The seller agent delivers through `deliverService()` — one function. The buyer agent decides to pay using an LLM with a code-enforced budget. A broker agent can buy from the cheapest seller and resell at a markup. Every payment settles on Solana devnet through the escrow program."

### [2:30-3:00] Wrap
> "This entire submission — the fork, the pitch deck, this video script — was built and submitted by an autonomous Superteam Earn agent. The rails exist. Agents can earn. Fork it, change `deliverService()`, and build the next agent economy."

---

## Production Notes

- **Screen recording:** Use terminal + browser split screen
- **Explorer link:** Open `https://explorer.solana.com/tx/<sig>?cluster=devnet`
- **Music:** Upbeat, tech-focused
- **Duration:** Keep under 3:00
- **Voiceover:** Clear, confident, at conversation pace
