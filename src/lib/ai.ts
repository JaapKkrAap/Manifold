import type { AIEndpoint } from '@/types/settings'
import type { CharacterData } from '@/types/character'

export interface StreamChunk {
  delta: string
  done: boolean
}

export async function* streamCompletion(
  endpoint: AIEndpoint,
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[]
): AsyncGenerator<StreamChunk> {
  const res = await fetch(`${endpoint.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${endpoint.apiKey}`,
    },
    body: JSON.stringify({
      model: endpoint.model,
      messages,
      stream: true,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`AI API error ${res.status}: ${err}`)
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buf = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const data = trimmed.slice(5).trim()
      if (data === '[DONE]') {
        yield { delta: '', done: true }
        return
      }
      try {
        const json = JSON.parse(data)
        const delta: string = json.choices?.[0]?.delta?.content ?? ''
        if (delta) yield { delta, done: false }
      } catch {
        // skip malformed SSE lines
      }
    }
  }
  yield { delta: '', done: true }
}

// ── Field-specific prompts ────────────────────────────────────────────────────

function charContext(data: CharacterData): string {
  const parts: string[] = []
  if (data.name) parts.push(`Name: ${data.name}`)
  if (data.description) parts.push(`Description: ${data.description}`)
  if (data.personality) parts.push(`Personality: ${data.personality}`)
  if (data.scenario) parts.push(`Scenario: ${data.scenario}`)
  return parts.join('\n')
}

const SYSTEM = `You are an expert AI character card writer for SillyTavern and similar roleplay platforms.
Write vivid, immersive prose. Use second person for descriptions when appropriate.
Keep output concise and field-appropriate. Do not add explanations — output only the field content.`

export type AIField =
  | 'description'
  | 'personality'
  | 'scenario'
  | 'first_mes'
  | 'mes_example'
  | 'system_prompt'
  | 'post_history_instructions'
  | 'alternate_greeting'
  | 'tags'

export function buildPrompt(
  field: AIField,
  data: CharacterData,
  existing: string,
  instruction?: string
): { role: 'system' | 'user' | 'assistant'; content: string }[] {
  const ctx = charContext(data)
  const action = existing.trim()
    ? `Rewrite and improve the existing content${instruction ? ` with this guidance: ${instruction}` : ''}. Existing:\n${existing}`
    : `Write ${instruction ? `with this guidance: ${instruction}` : 'from scratch'}.`

  const fieldGuide: Record<AIField, string> = {
    description: 'Write the character description. Cover appearance, background, and defining traits. ~200-400 words.',
    personality: 'Write the personality field. List key traits, speech style, mannerisms, and quirks. ~100-200 words.',
    scenario: 'Write the scenario. Describe the setting and context for interactions. ~50-150 words.',
    first_mes: 'Write the opening message in the character\'s voice. Should be immersive and invite roleplay. ~100-300 words.',
    mes_example: 'Write 2-3 example dialogue exchanges using <START> blocks.\nFormat:\n<START>\n{{user}}: ...\n{{char}}: ...',
    system_prompt: 'Write a system prompt that will be prepended to all interactions. Keep it directive and concise.',
    post_history_instructions: 'Write brief instructions injected after the chat history. Usually a reminder of key traits.',
    alternate_greeting: 'Write an alternate opening message in the character\'s voice. Different tone from the first.',
    tags: 'Generate 5-10 relevant tags as a comma-separated list. Example: fantasy, female, warrior, tsundere, elf',
  }

  return [
    { role: 'system', content: SYSTEM },
    {
      role: 'user',
      content: `Character context:\n${ctx}\n\nTask: ${fieldGuide[field]}\n\n${action}`,
    },
  ]
}
