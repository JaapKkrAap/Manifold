import { BookOpen, Library, MessageSquare, Settings, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUI, type View } from '@/stores/ui'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const navItems: { view: View; icon: React.FC<{ className?: string }>; label: string }[] = [
  { view: 'library', icon: Library, label: 'Library' },
  { view: 'editor', icon: Sparkles, label: 'Editor' },
  { view: 'lorebooks', icon: BookOpen, label: 'Lorebooks' },
  { view: 'playground', icon: MessageSquare, label: 'Playground' },
]

export function Sidebar() {
  const { view, setView } = useUI()

  return (
    <aside className="flex h-full w-16 flex-col items-center gap-2 border-r border-border bg-card py-4">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm select-none">
        M
      </div>
      <Separator className="w-8" />
      <nav className="flex flex-1 flex-col items-center gap-1 pt-2">
        {navItems.map(({ view: v, icon: Icon, label }) => (
          <Button
            key={v}
            variant="ghost"
            size="icon"
            title={label}
            onClick={() => setView(v)}
            className={cn(
              'h-10 w-10',
              view === v && 'bg-accent text-accent-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
          </Button>
        ))}
      </nav>
      <Button
        variant="ghost"
        size="icon"
        title="Settings"
        onClick={() => setView('settings')}
        className={cn('h-10 w-10', view === 'settings' && 'bg-accent text-accent-foreground')}
      >
        <Settings className="h-5 w-5" />
      </Button>
    </aside>
  )
}
