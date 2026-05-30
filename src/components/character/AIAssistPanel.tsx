import { useState } from 'react'
import { Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { useSettings } from '@/stores/settings'
import { useUI } from '@/stores/ui'
import { streamCompletion, buildPrompt, type AIField } from '@/lib/ai'
import type { CharacterData } from '@/types/character'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Props {
  field: AIField
  fieldLabel: string
  data: CharacterData
  current: string
  onResult: (text: string) => void
}

export function AIAssistButton({ field, fieldLabel, data, current, onResult }: Props) {
  const { getDefault } = useSettings()
  const { setView } = useUI()
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [instruction, setInstruction] = useState('')
  const [open, setOpen] = useState(false)

  const endpoint = getDefault()

  async function run() {
    if (!endpoint) return
    setStreaming(true)
    setError(null)
    setOpen(false)
    let accumulated = ''
    try {
      const messages = buildPrompt(field, data, current, instruction || undefined)
      for await (const chunk of streamCompletion(endpoint, messages)) {
        if (chunk.done) break
        accumulated += chunk.delta
        onResult(accumulated)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setStreaming(false)
      setInstruction('')
    }
  }

  if (!endpoint) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-6 gap-1 text-xs text-muted-foreground"
        onClick={() => setView('settings')}
        title="Configure an AI endpoint in Settings"
      >
        <Sparkles className="h-3 w-3" />
        AI (setup)
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      {error && (
        <span className="text-xs text-red-400 flex items-center gap-1" title={error}>
          <AlertCircle className="h-3 w-3" />
          Error
        </span>
      )}

      {open && !streaming && (
        <Input
          className="h-6 text-xs w-48"
          placeholder={`Guidance for ${fieldLabel}…`}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') run() }}
          autoFocus
        />
      )}

      <Button
        variant="ghost"
        size="sm"
        className={cn('h-6 gap-1 text-xs', streaming && 'text-primary')}
        disabled={streaming}
        onClick={() => {
          if (open) run()
          else setOpen(true)
        }}
        title={current ? `Enhance ${fieldLabel} with AI` : `Generate ${fieldLabel} with AI`}
      >
        {streaming ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Sparkles className="h-3 w-3" />
        )}
        {streaming ? 'Writing…' : open ? 'Go' : 'AI'}
      </Button>

      {open && !streaming && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs text-muted-foreground"
          onClick={() => setOpen(false)}
        >
          ✕
        </Button>
      )}
    </div>
  )
}
