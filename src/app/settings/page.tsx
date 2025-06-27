import { ModeToggle } from '@/components/mode-toggle';

export default function SettingsPage() {
  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Configure your Loop Agent preferences.
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="border rounded-lg p-4 bg-card">
          <h3 className="font-semibold mb-3">Appearance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">
                Choose your preferred color theme
              </p>
            </div>
            <ModeToggle />
          </div>
        </div>
        
        <div className="border rounded-lg p-4 bg-card">
          <h3 className="font-semibold mb-3">Chat Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Auto-scroll</p>
                <p className="text-xs text-muted-foreground">
                  Automatically scroll to new messages
                </p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Show timestamps</p>
                <p className="text-xs text-muted-foreground">
                  Display message timestamps
                </p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 bg-card">
          <h3 className="font-semibold mb-3">API Configuration</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-1">API Key Status</p>
              <p className="text-xs text-muted-foreground">
                Configure your Anthropic API key in .env.local
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
