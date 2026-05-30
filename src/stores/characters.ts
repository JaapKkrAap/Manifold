import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { db } from '@/db'
import type { Character, CharacterData } from '@/types/character'
import { generateId, now } from '@/lib/utils'
import { CharacterSchema } from '@/types/character'

interface CharactersState {
  characters: Character[]
  loading: boolean
  activeId: string | null

  load: () => Promise<void>
  create: (partial?: Partial<CharacterData>) => Promise<Character>
  update: (id: string, patch: Partial<CharacterData>) => Promise<void>
  remove: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
  setActive: (id: string | null) => void
  getActive: () => Character | undefined
}

export const useCharacters = create<CharactersState>()(
  immer((set, get) => ({
    characters: [],
    loading: false,
    activeId: null,

    load: async () => {
      set((s) => { s.loading = true })
      const all = await db.characters.toArray()
      set((s) => {
        s.characters = all
        s.loading = false
      })
    },

    create: async (partial = {}) => {
      const character = CharacterSchema.parse({
        id: generateId(),
        spec: 'chara_card_v2',
        spec_version: '2.0',
        data: {
          name: partial.name ?? 'New Character',
          description: partial.description ?? '',
          personality: partial.personality ?? '',
          scenario: partial.scenario ?? '',
          first_mes: partial.first_mes ?? '',
          mes_example: partial.mes_example ?? '',
          creator_notes: partial.creator_notes ?? '',
          system_prompt: partial.system_prompt ?? '',
          post_history_instructions: partial.post_history_instructions ?? '',
          alternate_greetings: partial.alternate_greetings ?? [],
          tags: partial.tags ?? [],
          creator: partial.creator ?? '',
          character_version: partial.character_version ?? '',
          extensions: partial.extensions ?? {},
        },
        createdAt: now(),
        updatedAt: now(),
        tags: partial.tags ?? [],
        isFavorite: false,
      })
      await db.characters.add(character)
      set((s) => { s.characters.unshift(character) })
      return character
    },

    update: async (id, patch) => {
      const updated = now()
      await db.characters.where('id').equals(id).modify((c) => {
        Object.assign(c.data, patch)
        c.updatedAt = updated
        if (patch.tags) c.tags = patch.tags
      })
      set((s) => {
        const c = s.characters.find((c) => c.id === id)
        if (c) {
          Object.assign(c.data, patch)
          c.updatedAt = updated
          if (patch.tags) c.tags = patch.tags
        }
      })
    },

    remove: async (id) => {
      await db.characters.delete(id)
      set((s) => {
        s.characters = s.characters.filter((c) => c.id !== id)
        if (s.activeId === id) s.activeId = null
      })
    },

    toggleFavorite: async (id) => {
      const c = get().characters.find((c) => c.id === id)
      if (!c) return
      const next = !c.isFavorite
      await db.characters.where('id').equals(id).modify({ isFavorite: next })
      set((s) => {
        const ch = s.characters.find((ch) => ch.id === id)
        if (ch) ch.isFavorite = next
      })
    },

    setActive: (id) => set((s) => { s.activeId = id }),

    getActive: () => {
      const { characters, activeId } = get()
      return characters.find((c) => c.id === activeId)
    },
  }))
)
