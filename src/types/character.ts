import { z } from 'zod'

// ── SillyTavern V2 spec ───────────────────────────────────────────────────────

export const LorebookEntrySchema = z.object({
  id: z.string(),
  keys: z.array(z.string()),
  content: z.string(),
  enabled: z.boolean().default(true),
  priority: z.number().int().default(10),
  comment: z.string().default(''),
})

export const LorebookSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().default(''),
  entries: z.array(LorebookEntrySchema),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const CharacterDataSchema = z.object({
  // Core V2 fields
  name: z.string().min(1, 'Name is required'),
  description: z.string().default(''),
  personality: z.string().default(''),
  scenario: z.string().default(''),
  first_mes: z.string().default(''),
  mes_example: z.string().default(''),
  creator_notes: z.string().default(''),
  system_prompt: z.string().default(''),
  post_history_instructions: z.string().default(''),
  alternate_greetings: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  creator: z.string().default(''),
  character_version: z.string().default(''),
  // Linked lorebook
  character_book: LorebookSchema.optional(),
  // Passthrough for unknown extension fields
  extensions: z.record(z.string(), z.unknown()).default({}),
})

export const CharacterSchema = z.object({
  id: z.string(),
  spec: z.literal('chara_card_v2').default('chara_card_v2'),
  spec_version: z.literal('2.0').default('2.0'),
  data: CharacterDataSchema,
  // App metadata (not exported in card)
  avatarDataUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  tags: z.array(z.string()).default([]),
  isFavorite: z.boolean().default(false),
})

export type LorebookEntry = z.infer<typeof LorebookEntrySchema>
export type Lorebook = z.infer<typeof LorebookSchema>
export type CharacterData = z.infer<typeof CharacterDataSchema>
export type Character = z.infer<typeof CharacterSchema>

// ── Export format targets ─────────────────────────────────────────────────────

export type ExportFormat = 'sillytavern_v2' | 'tavernai' | 'json'

// ── Quality score ─────────────────────────────────────────────────────────────

export interface QualityScore {
  total: number
  breakdown: {
    label: string
    score: number
    max: number
    tip?: string
  }[]
}
