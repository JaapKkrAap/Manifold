import type { CharacterData } from '@/types/character'
import { scoreCharacter } from '@/lib/quality'
import { cn } from '@/lib/utils'

interface Props {
  data: CharacterData
}

export function QualityPanel({ data }: Props) {
  const { total, breakdown } = scoreCharacter(data)

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Quality Score</span>
        <span
          className={cn(
            'text-2xl font-bold',
            total >= 80 ? 'text-green-400' : total >= 50 ? 'text-yellow-400' : 'text-red-400'
          )}
        >
          {total}
        </span>
      </div>

      {/* Bar */}
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            total >= 80 ? 'bg-green-500' : total >= 50 ? 'bg-yellow-500' : 'bg-red-500'
          )}
          style={{ width: `${total}%` }}
        />
      </div>

      {/* Breakdown */}
      <div className="flex flex-col gap-1.5">
        {breakdown.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs">
            <span className="w-28 text-muted-foreground">{item.label}</span>
            <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary/60 rounded-full"
                style={{ width: `${(item.score / item.max) * 100}%` }}
              />
            </div>
            {item.tip && <span className="text-muted-foreground truncate max-w-[120px]" title={item.tip}>⚠</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
