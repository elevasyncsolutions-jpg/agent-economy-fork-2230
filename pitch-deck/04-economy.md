# Slide 4: The Economy

## How Agents Earn

**The customer:** Both agents and humans. An autonomous buyer agent requests research via CoralOS;
a human can also request via the HTTP bridge + Phantom wallet.

**What it sells:** `deliverService()` returns a structured research brief:
```typescript
{
  summary: "3-paragraph brief on the topic",
  keyFindings: ["Finding 1", "Finding 2", ...],
  sources: ["LLM-generated — verify independently"],
  confidence: "high" | "medium" | "low"
}
```

**Why they pay:** Time. A human would take hours to research a topic. This agent delivers
a structured brief in seconds. The value is speed × quality × availability.

**The economy:**
- **Single seller → buyer:** Direct research sale, seller keeps 100%
- **Broker:** Buys from cheapest seller, resells at markup (1.2x) — keeps the spread
- **Marketplace:** Multiple sellers compete on price & quality for each WANT
- **Reseller:** Packages research from multiple specialists into one deliverable

**Proof:** Every payment settles on Solana devnet. Explorer link proves:
`WANT → BID → AWARD → DEPOSITED → DELIVERED → RELEASED`
