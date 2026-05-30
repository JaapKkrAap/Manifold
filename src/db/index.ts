import Dexie, { type EntityTable } from 'dexie'
import type { Character } from '@/types/character'
import type { Lorebook } from '@/types/character'
import type { AppSettings } from '@/types/settings'

interface SettingsRecord {
  id: 'singleton'
  data: AppSettings
}

class ManifoldDB extends Dexie {
  characters!: EntityTable<Character, 'id'>
  lorebooks!: EntityTable<Lorebook, 'id'>
  settings!: EntityTable<SettingsRecord, 'id'>

  constructor() {
    super('ManifoldDB')
    this.version(1).stores({
      characters: 'id, data.name, createdAt, updatedAt, isFavorite, *tags',
      lorebooks: 'id, name, createdAt, updatedAt',
      settings: 'id',
    })
  }
}

export const db = new ManifoldDB()
