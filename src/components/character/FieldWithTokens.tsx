import { estimateTokens, formatTokenCount, cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  className?: string
  assist?: React.ReactNode
}

export function FieldWithTokens({ label, value, onChange, placeholder, rows = 4, className, assist }: Props) {
  const tokens = estimateTokens(value)

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between gap-2">
        {label ? <Label>{label}</Label> : <span />}
        <div className="flex items-center gap-2">
          {assist}
          <span className="text-xs text-muted-foreground">{formatTokenCount(tokens)} tokens</span>
        </div>
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
