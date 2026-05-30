import { useEffect, useRef, useState } from 'react'
import { Send, Trash2, ChevronDown } from 'lucide-react'
import { useSettings } from '@/stores/settings'
import { useCharacters } from '@/stores/characters'
import { useUI } from '@/stores/ui'
import { streamCompletion } from '@/lib/ai'
import type { Character } from '@/types/character'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function buildSystemPrompt(char: Character): string {
  const d = char.data
  const parts: string[] = []
  if (d.system_prompt) parts.push(d.system_prompt)
  if (d.name) parts.push(`You are ${d.name}.`)
  if (d.description) parts.push(d.description)
  if (d.personality) parts.push(`Personality: ${d.personality}`)
  if (d.scenario) parts.push(`Scenario: ${d.scenario}`)
  return parts.join('\n\n')
}

export function PlaygroundView() {
  const { settings, load, getDefault } = useSettings()
  const { characters } = useCharacters()
  const { setView } = useUI()

  const [selectedCharId, setSelectedCharId] = useState<string>('')
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { load() }, [])

  useEffect(() => {
    const def = getDefault()
    if (def) setSelectedEndpointId(def.id)
  }, [settings.aiEndpoints])

  useEffect(() => {
    if (characters.length > 0 && !selectedCharId) setSelectedCharId(characters[0].id)
  }, [characters])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const character = characters.find((c) => c.id === selectedCharId)
  const endpoint = settings.aiEndpoints.find((e) => e.id === selectedEndpointId)

  async function send() {
    if (!input.trim() || !endpoint || !character || streaming) return
    const userMsg: Message = { role: 'user', content: input.trim() }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setStreaming(true)
    setError(null)

    const systemPrompt = buildSystemPrompt(character)
    // Inject first_mes as first assistant message if history was empty
    const apiMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
    ]
    if (character.data.first_mes && history.length === 1) {
      apiMessages.push({ role: 'assistant', content: character.data.first_mes })
    }
    if (character.data.mes_example) {
      // parse <START> blocks into alternating turns
      const blocks = character.data.mes_example.split('<START>').filter(Boolean)
      for (const block of blocks) {
        const lines = block.trim().split('\n').filter(Boolean)
        for (const line of lines) {
          if (line.startsWith('{{user}}:')) {
            apiMessages.push({ role: 'user', content: line.slice(9).trim() })
          } else if (line.startsWith('{{char}}:')) {
            apiMessages.push({ role: 'assistant', content: line.slice(9).trim() })
          }
        }
      }
    }
    apiMessages.push(...history.map((m) => ({ role: m.role, content: m.content })))

    const assistantMsg: Message = { role: 'assistant', content: '' }
    setMessages([...history, assistantMsg])

    try {
      let accumulated = ''
      for await (const chunk of streamCompletion(endpoint, apiMessages)) {
        if (chunk.done) break
        accumulated += chunk.delta
        setMessages([...history, { role: 'assistant', content: accumulated }])
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setMessages(history)
    } finally {
      setStreaming(false)
    }
  }

  const noEndpoints = settings.aiEndpoints.length === 0

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-3 flex-wrap">
        <h1 className="text-lg font-semibold">Playground</h1>

        {/* Character picker */}
        <div className="relative">
          <select
            value={selectedCharId}
            onChange={(e) => { setSelectedCharId(e.target.value); setMessages([]) }}
            className="appearance-none rounded-md border border-input bg-background px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {characters.length === 0 && <option value="">No characters</option>}
            {characters.map((c) => (
              <option key={c.id} value={c.id}>{c.data.name}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-2 h-4 w-4 text-muted-foreground" />
        </div>

        {/* Endpoint picker */}
        <div className="relative">
          <select
            value={selectedEndpointId}
            onChange={(e) => setSelectedEndpointId(e.target.value)}
            className="appearance-none rounded-md border border-input bg-background px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            disabled={noEndpoints}
          >
            {noEndpoints && <option value="">No endpoints</option>}
            {settings.aiEndpoints.map((ep) => (
              <option key={ep.id} value={ep.id}>{ep.label} · {ep.model}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-2 h-4 w-4 text-muted-foreground" />
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={() => setMessages([])}
          disabled={messages.length === 0}
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </Button>
      </div>

      {noEndpoints ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
          <p>No AI endpoint configured.</p>
          <Button onClick={() => setView('settings')}>Configure endpoint</Button>
        </div>
      ) : (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-4 p-6 max-w-3xl mx-auto">
              {/* First message opener */}
              {messages.length === 0 && character?.data.first_mes && (
                <div className="rounded-xl bg-muted/50 p-4 text-sm whitespace-pre-wrap">
                  <span className="block text-xs text-muted-foreground mb-1 font-medium">{character.data.name}</span>
                  {character.data.first_mes}
                </div>
              )}

              {messages.length === 0 && !character?.data.first_mes && (
                <p className="text-center text-sm text-muted-foreground py-12">
                  Send a message to start chatting with {character?.data.name || 'the character'}.
                </p>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-xl p-4 text-sm whitespace-pre-wrap',
                    m.role === 'user'
                      ? 'bg-primary/10 ml-12'
                      : 'bg-muted/50 mr-12'
                  )}
                >
                  <span className="block text-xs text-muted-foreground mb-1 font-medium">
                    {m.role === 'user' ? 'You' : character?.data.name}
                  </span>
                  {m.content}
                  {streaming && i === messages.length - 1 && m.role === 'assistant' && (
                    <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse" />
                  )}
                </div>
              ))}

              {error && (
                <p className="text-xs text-red-400 text-center">{error}</p>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2 max-w-3xl mx-auto">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message…"
                rows={2}
                className="resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
              />
              <Button
                size="icon"
                onClick={send}
                disabled={!input.trim() || streaming || !endpoint || !character}
                className="h-auto"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">Enter to send · Shift+Enter for newline</p>
          </div>
        </>
      )}
    </div>
  )
}
