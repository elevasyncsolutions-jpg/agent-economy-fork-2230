# Slide 3: Live Demo

## End-to-End Agent Payment on Devnet

**The flow (fully working on devnet):**

```
  Buyer Agent: "I need a research brief on Solana staking"
       ↓
  CoralOS broadcasts WANT → 3 seller agents bid
       ↓
  Buyer awards best value → escrow deposits 0.001 SOL
       ↓
  Seller delivers research brief → escrow releases payment
       ↓
  Buyer receives: { summary, keyFindings, sources }
       ↓
  Explorer link confirms settlement: tx on Solana devnet
```

**Demo components:**
| Component | What it does |
|-----------|-------------|
| `deliverService()` | The fork point — returns research briefs via LLM |
| `analyzeTopic()` | LLM-powered research with fallback |
| Quickstart server | HTTP 402 pay-per-call (no Docker needed) |
| CoralOS agents | Docker-based autonomous agent-to-agent loop |
| Web UI | React dashboard with 3 tabs (Auto, Checkout, Swarm) |

**The same escrow, market, and Solana Pay rails that ship with the starter kit.**
