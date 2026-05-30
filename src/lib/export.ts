import type { Character, ExportFormat } from '@/types/character'

export function exportCharacter(character: Character, format: ExportFormat): string {
  switch (format) {
    case 'sillytavern_v2':
      return exportSillyTavernV2(character)
    case 'tavernai':
      return exportTavernAI(character)
    case 'json':
      return JSON.stringify(character, null, 2)
  }
}

function exportSillyTavernV2(character: Character): string {
  const payload = {
    spec: 'chara_card_v2',
    spec_version: '2.0',
    data: {
      name: character.data.name,
      description: character.data.description,
      personality: character.data.personality,
      scenario: character.data.scenario,
      first_mes: character.data.first_mes,
      mes_example: character.data.mes_example,
      creator_notes: character.data.creator_notes,
      system_prompt: character.data.system_prompt,
      post_history_instructions: character.data.post_history_instructions,
      alternate_greetings: character.data.alternate_greetings,
      tags: character.data.tags,
      creator: character.data.creator,
      character_version: character.data.character_version,
      character_book: character.data.character_book,
      extensions: character.data.extensions,
    },
  }
  return JSON.stringify(payload, null, 2)
}

function exportTavernAI(character: Character): string {
  const payload = {
    name: character.data.name,
    description: character.data.description,
    personality: character.data.personality,
    scenario: character.data.scenario,
    first_mes: character.data.first_mes,
    mes_example: character.data.mes_example,
    tags: character.data.tags,
  }
  return JSON.stringify(payload, null, 2)
}

export function downloadJSON(filename: string, content: string) {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
