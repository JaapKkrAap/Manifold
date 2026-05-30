import { estimateTokens, formatTokenCount } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface Props {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  className?: string
}

export function FieldWithTokens({ label, value, onChange, placeholder, rows = 4, className }: Props) {
  const tokens = estimateTokens(value)

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs text-muted-foreground">{formatTokenCount(tokens)} tokens</span>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  )
}
