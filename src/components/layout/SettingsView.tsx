import { Settings } from 'lucide-react'

export function SettingsView() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
      <Settings className="h-12 w-12 opacity-30" />
      <div className="text-center">
        <p className="font-medium">Settings</p>
        <p className="text-sm">AI endpoints, export defaults, and more — coming soon</p>
      </div>
    </div>
  )
}
