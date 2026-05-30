import { Heart, Trash2 } from 'lucide-react'
import type { Character } from '@/types/character'
import { useCharacters } from '@/stores/characters'
import { useUI } from '@/stores/ui'
import { scoreCharacter } from '@/lib/quality'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Props {
  character: Character
}

export function CharacterCard({ character }: Props) {
  const { remove, toggleFavorite, setActive } = useCharacters()
  const { setView } = useUI()
  const score = scoreCharacter(character.data)

  function open() {
    setActive(character.id)
    setView('editor')
  }

  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer overflow-hidden">
      {/* Avatar / placeholder */}
      <div
        className="aspect-[3/4] w-full bg-muted flex items-center justify-center text-4xl select-none"
        onClick={open}
      >
        {character.avatarDataUrl ? (
          <img src={character.avatarDataUrl} alt={character.data.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-muted-foreground">{character.data.name[0]?.toUpperCase()}</span>
        )}
      </div>

      {/* Quality badge */}
      <div className="absolute top-2 right-2">
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-semibold',
            score.total >= 80 ? 'bg-green-500/20 text-green-400' :
            score.total >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          )}
        >
          {score.total}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1" onClick={open}>
        <p className="font-medium text-sm truncate">{character.data.name}</p>
        <div className="flex flex-wrap gap-1">
          {character.data.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">{tag}</Badge>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-end gap-1 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-card">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => { e.stopPropagation(); toggleFavorite(character.id) }}
        >
          <Heart className={cn('h-4 w-4', character.isFavorite && 'fill-red-500 text-red-500')} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={(e) => { e.stopPropagation(); remove(character.id) }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
