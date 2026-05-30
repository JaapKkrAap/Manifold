import type { CharacterData, QualityScore } from '@/types/character'
import { estimateTokens } from './utils'

export function scoreCharacter(data: CharacterData): QualityScore {
  const checks = [
    {
      label: 'Name',
      score: data.name.trim().length > 0 ? 10 : 0,
      max: 10,
      tip: data.name.trim().length === 0 ? 'Add a character name' : undefined,
    },
    {
      label: 'Description',
      score: scoreLength(data.description, 50, 800),
      max: 20,
      tip: 'Aim for 50–800 tokens in description',
    },
    {
      label: 'Personality',
      score: scoreLength(data.personality, 20, 400),
      max: 15,
      tip: 'Aim for 20–400 tokens in personality',
    },
    {
      label: 'First message',
      score: scoreLength(data.first_mes, 30, 600),
      max: 20,
      tip: 'First message should be 30–600 tokens',
    },
    {
      label: 'Scenario',
      score: data.scenario.trim().length > 0 ? 10 : 0,
      max: 10,
      tip: data.scenario.trim().length === 0 ? 'Add a scenario' : undefined,
    },
    {
      label: 'Example messages',
      score: data.mes_example.trim().length > 30 ? 15 : 0,
      max: 15,
      tip: 'Add dialogue examples using <START> blocks',
    },
    {
      label: 'Tags',
      score: data.tags.length >= 3 ? 10 : data.tags.length * 3,
      max: 10,
      tip: 'Add at least 3 tags for discoverability',
    },
  ]

  const total = checks.reduce((sum, c) => sum + c.score, 0)
  const maxTotal = checks.reduce((sum, c) => sum + c.max, 0)

  return {
    total: Math.round((total / maxTotal) * 100),
    breakdown: checks,
  }
}

function scoreLength(text: string, minTokens: number, maxTokens: number): number {
  const tokens = estimateTokens(text)
  if (tokens === 0) return 0
  if (tokens < minTokens) return Math.round((tokens / minTokens) * 10)
  if (tokens <= maxTokens) return 10 + Math.round(((maxTokens - tokens) / maxTokens) * 10)
  return Math.max(0, 20 - Math.round(((tokens - maxTokens) / maxTokens) * 10))
}
