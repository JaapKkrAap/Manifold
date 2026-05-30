import { useEffect } from 'react'
import { useUI } from '@/stores/ui'
import { useCharacters } from '@/stores/characters'
import { Sidebar } from '@/components/layout/Sidebar'
import { LibraryView } from '@/components/library/LibraryView'
import { CharacterEditor } from '@/components/character/CharacterEditor'
import { LorebookView } from '@/components/lorebook/LorebookView'
import { PlaygroundView } from '@/components/playground/PlaygroundView'
import { SettingsView } from '@/components/layout/SettingsView'

export default function App() {
  const { view } = useUI()
  const { load } = useCharacters()

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="flex h-svh overflow-hidden">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        {view === 'library' && <LibraryView />}
        {view === 'editor' && <CharacterEditor />}
        {view === 'lorebooks' && <LorebookView />}
        {view === 'playground' && <PlaygroundView />}
        {view === 'settings' && <SettingsView />}
      </main>
    </div>
  )
}
