import { useState } from 'react'
import { Plus, Search, Upload } from 'lucide-react'
import { useCharacters } from '@/stores/characters'
import { useUI } from '@/stores/ui'
import { importCharacterJSON } from '@/lib/import'
import { db } from '@/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CharacterCard } from './CharacterCard'

export function LibraryView() {
  const { characters, create, load } = useCharacters()
  const { setView } = useUI()
  const [query, setQuery] = useState('')

  const filtered = characters.filter((c) =>
    c.data.name.toLowerCase().includes(query.toLowerCase()) ||
    c.data.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
  )

  async function handleCreate() {
    const c = await create()
    useCharacters.getState().setActive(c.id)
    setView('editor')
  }

  async function handleImport() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      try {
        const character = importCharacterJSON(text)
        await db.characters.add(character)
        await load()
      } catch (err) {
        console.error('Import failed:', err)
        alert('Could not parse character file. Check the format and try again.')
      }
    }
    input.click()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <h1 className="text-lg font-semibold mr-auto">Library</h1>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search characters…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="sm" onClick={handleImport}>
          <Upload className="h-4 w-4" />
          Import
        </Button>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          New Character
        </Button>
      </div>

      {/* Grid */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-muted-foreground">
              <p className="text-lg">No characters yet.</p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4" />
                Create your first character
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filtered.map((c) => (
                <CharacterCard key={c.id} character={c} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
