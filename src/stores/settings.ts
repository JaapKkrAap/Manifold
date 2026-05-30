import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { db } from '@/db'
import type { AIEndpoint, AppSettings } from '@/types/settings'
import { generateId } from '@/lib/utils'

interface SettingsState {
  settings: AppSettings
  loaded: boolean
  load: () => Promise<void>
  save: (patch: Partial<AppSettings>) => Promise<void>
  addEndpoint: (ep: Omit<AIEndpoint, 'id'>) => Promise<void>
  updateEndpoint: (id: string, patch: Partial<AIEndpoint>) => Promise<void>
  removeEndpoint: (id: string) => Promise<void>
  setDefault: (id: string) => Promise<void>
  getDefault: () => AIEndpoint | undefined
}

const DEFAULTS: AppSettings = {
  theme: 'dark',
  aiEndpoints: [],
  defaultExportFormat: 'sillytavern_v2',
  showTokenCounts: true,
}

export const useSettings = create<SettingsState>()(
  immer((set, get) => ({
    settings: DEFAULTS,
    loaded: false,

    load: async () => {
      const rec = await db.settings.get('singleton')
      set((s) => {
        s.settings = rec ? { ...DEFAULTS, ...rec.data } : DEFAULTS
        s.loaded = true
      })
    },

    save: async (patch) => {
      set((s) => { Object.assign(s.settings, patch) })
      await db.settings.put({ id: 'singleton', data: get().settings })
    },

    addEndpoint: async (ep) => {
      const newEp: AIEndpoint = { ...ep, id: generateId() }
      set((s) => {
        if (s.settings.aiEndpoints.length === 0) newEp.isDefault = true
        s.settings.aiEndpoints.push(newEp)
      })
      await db.settings.put({ id: 'singleton', data: get().settings })
    },

    updateEndpoint: async (id, patch) => {
      set((s) => {
        const ep = s.settings.aiEndpoints.find((e) => e.id === id)
        if (ep) Object.assign(ep, patch)
      })
      await db.settings.put({ id: 'singleton', data: get().settings })
    },

    removeEndpoint: async (id) => {
      set((s) => {
        s.settings.aiEndpoints = s.settings.aiEndpoints.filter((e) => e.id !== id)
        // promote next endpoint to default if needed
        if (s.settings.aiEndpoints.length > 0 && !s.settings.aiEndpoints.some((e) => e.isDefault)) {
          s.settings.aiEndpoints[0].isDefault = true
        }
      })
      await db.settings.put({ id: 'singleton', data: get().settings })
    },

    setDefault: async (id) => {
      set((s) => {
        s.settings.aiEndpoints.forEach((e) => { e.isDefault = e.id === id })
      })
      await db.settings.put({ id: 'singleton', data: get().settings })
    },

    getDefault: () => {
      const eps = get().settings.aiEndpoints
      return eps.find((e) => e.isDefault) ?? eps[0]
    },
  }))
)
