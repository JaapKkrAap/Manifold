import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type View = 'library' | 'editor' | 'lorebooks' | 'playground' | 'settings'

interface UIState {
  view: View
  sidebarOpen: boolean
  setView: (v: View) => void
  toggleSidebar: () => void
}

export const useUI = create<UIState>()(
  immer((set) => ({
    view: 'library',
    sidebarOpen: true,
    setView: (v) => set((s) => { s.view = v }),
    toggleSidebar: () => set((s) => { s.sidebarOpen = !s.sidebarOpen }),
  }))
)
