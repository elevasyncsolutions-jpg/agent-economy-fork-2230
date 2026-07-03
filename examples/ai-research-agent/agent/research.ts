/**
 * research.ts — the AI research engine.
 *
 * Uses whichever LLM provider is configured (Venice AI, Anthropic, OpenAI)
 * to generate structured research briefs. Falls back to deterministic output
 * when no LLM key is available so the demo always renders.
 */
interface ResearchResult {
  summary: string;
  keyFindings: string[];
  sources: string[];
  confidence: 'high' | 'medium' | 'low';
  llmProvider?: string;
}

async function callLLM(prompt: string): Promise<string> {
  const provider = process.env.LLM_PROVIDER || 'venice';
  const apiKey = process.env.VENICE_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('No LLM API key configured. Set VENICE_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY in .env');
  }

  if (provider === 'venice' || provider === 'openai') {
    const base = provider === 'venice' ? 'https://api.venice.ai/api/v1' : 'https://api.openai.com/v1';
    const model = process.env.LLM_MODEL || (provider === 'venice' ? 'default' : 'gpt-4o');
    const r = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...(provider === 'venice' ? {} : {}),
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a research assistant. Return concise, sourced briefs.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 2000,
      }),
    });
    const data = await r.json() as { choices?: Array<{ message?: { content?: string } }> };
    return data.choices?.[0]?.message?.content || 'Research unavailable.';
  }

  if (provider === 'anthropic') {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await r.json() as { content?: Array<{ text?: string }> };
    return data.content?.[0]?.text || 'Research unavailable.';
  }

  throw new Error(`Unknown LLM provider: ${provider}`);
}

export async function analyzeTopic(depth: string, topic: string): Promise<ResearchResult> {
  const prompt = buildPrompt(depth, topic);

  try {
    const response = await callLLM(prompt);
    return {
      summary: response.slice(0, 500),
      keyFindings: response.split('\n').filter(l => l.match(/^[*-] /)).slice(0, 5),
      sources: ['LLM-generated research — verify key claims independently'],
      confidence: response.length > 200 ? 'high' : 'medium',
      llmProvider: process.env.LLM_PROVIDER || 'venice',
    };
  } catch (e) {
    // Deterministic fallback so the demo always renders
    return {
      summary: `[Research Brief] ${topic}\n\nThis is a deterministic fallback response. Configure an LLM API key in .env (VENICE_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY) to get AI-generated research.\n\nKey areas for investigation:\n1. Current state and recent developments\n2. Market dynamics and key players\n3. Technical architecture and tradeoffs\n4. Future outlook and emerging trends`,
      keyFindings: [
        `${topic} is an active area of development in the blockchain ecosystem`,
        'Multiple implementations and approaches exist with different tradeoffs',
        'Community and developer adoption continues to grow',
        'Integration with existing infrastructure is an ongoing focus',
      ],
      sources: ['Fallback mode — add LLM API key for live research'],
      confidence: 'low',
    };
  }
}

function buildPrompt(depth: string, topic: string): string {
  const instructions = depth === 'deep'
    ? 'Write a detailed 500+ word analysis covering: background, current state, key debates, future outlook. Include specific technical details, market context, and concrete examples.'
    : depth === 'compare'
    ? 'Write a structured comparison covering: core differences, tradeoffs, use cases, ecosystem support, and recommendations.'
    : 'Write a concise 3-paragraph research brief covering: what it is, why it matters, and current state.';

  return `${instructions}\n\nTopic: ${topic}\n\nFormat: Plain text with bullet points for key findings.`;
}
