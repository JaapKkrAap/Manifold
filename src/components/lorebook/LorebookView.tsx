import { BookOpen } from 'lucide-react'

export function LorebookView() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
      <BookOpen className="h-12 w-12 opacity-30" />
      <div className="text-center">
        <p className="font-medium">Lorebooks</p>
        <p className="text-sm">Coming in the next milestone</p>
      </div>
    </div>
  )
}
