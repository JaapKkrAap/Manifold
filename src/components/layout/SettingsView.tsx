import { useEffect, useState } from 'react'
import { Plus, Trash2, Star } from 'lucide-react'
import { useSettings } from '@/stores/settings'
import type { AIEndpoint } from '@/types/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

const BLANK: Omit<AIEndpoint, 'id'> = {
  label: '',
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o',
  isDefault: false,
}

export function SettingsView() {
  const { settings, load, addEndpoint, updateEndpoint, removeEndpoint, setDefault } = useSettings()
  const [form, setForm] = useState<Omit<AIEndpoint, 'id'>>(BLANK)
  const [editing, setEditing] = useState<string | null>(null)
  const [testStatus, setTestStatus] = useState<Record<string, 'idle' | 'testing' | 'ok' | 'fail'>>({})

  useEffect(() => { load() }, [])

  async function handleSave() {
    if (!form.label || !form.baseUrl || !form.model) return
    if (editing) {
      await updateEndpoint(editing, form)
      setEditing(null)
    } else {
      await addEndpoint(form)
    }
    setForm(BLANK)
  }

  function startEdit(ep: AIEndpoint) {
    setEditing(ep.id)
    setForm({ label: ep.label, baseUrl: ep.baseUrl, apiKey: ep.apiKey, model: ep.model, isDefault: ep.isDefault })
  }

  function cancelEdit() {
    setEditing(null)
    setForm(BLANK)
  }

  async function handleTest(ep: AIEndpoint) {
    setTestStatus((s) => ({ ...s, [ep.id]: 'testing' }))
    try {
      const res = await fetch(`${ep.baseUrl}/models`, {
        headers: { Authorization: `Bearer ${ep.apiKey}` },
      })
      setTestStatus((s) => ({ ...s, [ep.id]: res.ok ? 'ok' : 'fail' }))
    } catch {
      setTestStatus((s) => ({ ...s, [ep.id]: 'fail' }))
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <h1 className="text-lg font-semibold">Settings</h1>
      </div>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-2xl p-6 flex flex-col gap-6">

          {/* Endpoint list */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Endpoints</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {settings.aiEndpoints.length === 0 && (
                <p className="text-sm text-muted-foreground">No endpoints configured. Add one below to enable AI features.</p>
              )}
              {settings.aiEndpoints.map((ep) => (
                <div
                  key={ep.id}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border border-border p-3 text-sm',
                    ep.isDefault && 'border-primary/50 bg-primary/5'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{ep.label}</p>
                    <p className="text-muted-foreground text-xs truncate">{ep.baseUrl} · {ep.model}</p>
                  </div>
                  <span className={cn(
                    'text-xs px-1.5 py-0.5 rounded',
                    testStatus[ep.id] === 'ok' && 'bg-green-500/20 text-green-400',
                    testStatus[ep.id] === 'fail' && 'bg-red-500/20 text-red-400',
                    testStatus[ep.id] === 'testing' && 'bg-muted text-muted-foreground',
                  )}>
                    {testStatus[ep.id] === 'ok' ? '✓ connected' :
                     testStatus[ep.id] === 'fail' ? '✗ failed' :
                     testStatus[ep.id] === 'testing' ? 'testing…' : ''}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => handleTest(ep)}>Test</Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    title="Set as default"
                    onClick={() => setDefault(ep.id)}
                  >
                    <Star className={cn('h-4 w-4', ep.isDefault && 'fill-yellow-400 text-yellow-400')} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => startEdit(ep)}>Edit</Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => removeEndpoint(ep.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Add / Edit form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{editing ? 'Edit Endpoint' : 'Add Endpoint'}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Label</Label>
                  <Input
                    value={form.label}
                    onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                    placeholder="OpenAI / Local LLM / …"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Model</Label>
                  <Input
                    value={form.model}
                    onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                    placeholder="gpt-4o"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Base URL</Label>
                <Input
                  value={form.baseUrl}
                  onChange={(e) => setForm((f) => ({ ...f, baseUrl: e.target.value }))}
                  placeholder="https://api.openai.com/v1"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={form.apiKey}
                  onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
                  placeholder="sk-… (stored locally, never sent to any server)"
                />
              </div>
              <div className="flex gap-2 justify-end">
                {editing && <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>}
                <Button onClick={handleSave} disabled={!form.label || !form.baseUrl || !form.model}>
                  <Plus className="h-4 w-4" />
                  {editing ? 'Save Changes' : 'Add Endpoint'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground text-center">
            API keys are stored only in your browser's IndexedDB — they never leave your device except in direct calls to your configured endpoint.
          </p>
        </div>
      </ScrollArea>
    </div>
  )
}
