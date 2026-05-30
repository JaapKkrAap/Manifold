import { z } from 'zod'
import { CharacterSchema } from '@/types/character'
import type { Character } from '@/types/character'
import { generateId, now } from './utils'

export function importCharacterJSON(json: string): Character {
  const raw = JSON.parse(json)

  // SillyTavern V2
  if (raw.spec === 'chara_card_v2') {
    return CharacterSchema.parse({
      id: generateId(),
      spec: 'chara_card_v2',
      spec_version: '2.0',
      data: raw.data,
      createdAt: now(),
      updatedAt: now(),
      tags: raw.data?.tags ?? [],
      isFavorite: false,
    })
  }

  // TavernAI / flat format
  if (raw.name) {
    return CharacterSchema.parse({
      id: generateId(),
      spec: 'chara_card_v2',
      spec_version: '2.0',
      data: {
        name: raw.name,
        description: raw.description ?? '',
        personality: raw.personality ?? '',
        scenario: raw.scenario ?? '',
        first_mes: raw.first_mes ?? '',
        mes_example: raw.mes_example ?? '',
        creator_notes: raw.creator_notes ?? '',
        system_prompt: raw.system_prompt ?? '',
        post_history_instructions: raw.post_history_instructions ?? '',
        alternate_greetings: raw.alternate_greetings ?? [],
        tags: raw.tags ?? [],
        creator: raw.creator ?? '',
        character_version: raw.character_version ?? '',
        extensions: raw.extensions ?? {},
      },
      createdAt: now(),
      updatedAt: now(),
      tags: raw.tags ?? [],
      isFavorite: false,
    })
  }

  throw new z.ZodError([
    { code: 'custom', message: 'Unrecognised character format', path: [] },
  ])
}
