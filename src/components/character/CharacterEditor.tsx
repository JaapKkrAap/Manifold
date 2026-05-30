import { useEffect, useState } from 'react'
import { ArrowLeft, Download } from 'lucide-react'
import { useCharacters } from '@/stores/characters'
import { useUI } from '@/stores/ui'
import { exportCharacter, downloadJSON } from '@/lib/export'
import type { CharacterData } from '@/types/character'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FieldWithTokens } from './FieldWithTokens'
import { QualityPanel } from './QualityPanel'

export function CharacterEditor() {
  const { getActive, update } = useCharacters()
  const { setView } = useUI()
  const character = getActive()

  const [draft, setDraft] = useState<CharacterData | null>(null)

  useEffect(() => {
    if (character) setDraft({ ...character.data })
  }, [character?.id])

  if (!character || !draft) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No character selected.
      </div>
    )
  }

  function patch<K extends keyof CharacterData>(key: K, value: CharacterData[K]) {
    if (!draft) return
    const next = { ...draft, [key]: value }
    setDraft(next)
    update(character!.id, { [key]: value } as Partial<CharacterData>)
  }

  function handleExport() {
    const json = exportCharacter(character!, 'sillytavern_v2')
    downloadJSON(`${draft!.name || 'character'}.json`, json)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <Button variant="ghost" size="icon" onClick={() => setView('library')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold flex-1 truncate">{draft.name || 'Untitled'}</h1>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main editor */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            <Tabs defaultValue="core">
              <TabsList className="mb-6">
                <TabsTrigger value="core">Core</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
                <TabsTrigger value="meta">Meta</TabsTrigger>
              </TabsList>

              <TabsContent value="core" className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label>Name</Label>
                  <Input
                    value={draft.name}
                    onChange={(e) => patch('name', e.target.value)}
                    placeholder="Character name"
                  />
                </div>
                <FieldWithTokens
                  label="Description"
                  value={draft.description}
                  onChange={(v) => patch('description', v)}
                  placeholder="Describe your character's appearance, background, and defining traits…"
                  rows={6}
                />
                <FieldWithTokens
                  label="Personality"
                  value={draft.personality}
                  onChange={(v) => patch('personality', v)}
                  placeholder="Personality traits, speech style, quirks…"
                  rows={4}
                />
                <FieldWithTokens
                  label="Scenario"
                  value={draft.scenario}
                  onChange={(v) => patch('scenario', v)}
                  placeholder="The context or setting for interactions…"
                  rows={3}
                />
                <FieldWithTokens
                  label="First Message"
                  value={draft.first_mes}
                  onChange={(v) => patch('first_mes', v)}
                  placeholder="The character's opening message…"
                  rows={5}
                />
              </TabsContent>

              <TabsContent value="advanced" className="flex flex-col gap-5">
                <FieldWithTokens
                  label="Example Messages"
                  value={draft.mes_example}
                  onChange={(v) => patch('mes_example', v)}
                  placeholder={'<START>\n{{user}}: Hello!\n{{char}}: ...'}
                  rows={8}
                />
                <FieldWithTokens
                  label="System Prompt"
                  value={draft.system_prompt}
                  onChange={(v) => patch('system_prompt', v)}
                  placeholder="Custom system prompt override…"
                  rows={4}
                />
                <FieldWithTokens
                  label="Post-History Instructions"
                  value={draft.post_history_instructions}
                  onChange={(v) => patch('post_history_instructions', v)}
                  placeholder="Instructions injected after the chat history…"
                  rows={3}
                />
              </TabsContent>

              <TabsContent value="meta" className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label>Creator Notes</Label>
                  <FieldWithTokens
                    label=""
                    value={draft.creator_notes}
                    onChange={(v) => patch('creator_notes', v)}
                    placeholder="Notes for users of this character card…"
                    rows={4}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Label>Creator</Label>
                    <Input
                      value={draft.creator}
                      onChange={(e) => patch('creator', e.target.value)}
                      placeholder="Your name or handle"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Label>Version</Label>
                    <Input
                      value={draft.character_version}
                      onChange={(e) => patch('character_version', e.target.value)}
                      placeholder="e.g. 1.0"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    value={draft.tags.join(', ')}
                    onChange={(e) =>
                      patch('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))
                    }
                    placeholder="fantasy, female, warrior, …"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        {/* Right sidebar */}
        <div className="hidden xl:flex w-72 flex-col gap-4 border-l border-border p-4">
          <QualityPanel data={draft} />
        </div>
      </div>
    </div>
  )
}
