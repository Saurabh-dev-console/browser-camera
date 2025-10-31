import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function Settings() {
  const navigate = useNavigate();
  const { settings, updateSettings, resetSettings } = useSettings();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="p-4 glass border-b border-border">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Settings</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="flex-1 p-4 space-y-6 max-w-2xl mx-auto w-full">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Camera</h2>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-card">
            <div className="space-y-1">
              <Label htmlFor="mirror">Mirror Preview</Label>
              <p className="text-sm text-muted-foreground">
                Flip camera preview horizontally
              </p>
            </div>
            <Switch
              id="mirror"
              checked={settings.mirrorPreview}
              onCheckedChange={(checked) => updateSettings({ mirrorPreview: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-card">
            <div className="space-y-1">
              <Label htmlFor="grid">Grid Lines</Label>
              <p className="text-sm text-muted-foreground">
                Show rule-of-thirds grid
              </p>
            </div>
            <Switch
              id="grid"
              checked={settings.gridOn}
              onCheckedChange={(checked) => updateSettings({ gridOn: checked })}
            />
          </div>

          <div className="p-4 rounded-lg bg-card space-y-3">
            <Label>Countdown Timer</Label>
            <div className="flex gap-2">
              {([0, 3, 5] as const).map((sec) => (
                <Button
                  key={sec}
                  variant={settings.countdownSec === sec ? 'default' : 'secondary'}
                  onClick={() => updateSettings({ countdownSec: sec })}
                  className="flex-1"
                >
                  {sec === 0 ? 'Off' : `${sec}s`}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Audio</h2>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-card">
            <div className="space-y-1">
              <Label htmlFor="sound">Shutter Sound</Label>
              <p className="text-sm text-muted-foreground">
                Play sound when capturing
              </p>
            </div>
            <Switch
              id="sound"
              checked={settings.soundOn}
              onCheckedChange={(checked) => updateSettings({ soundOn: checked })}
            />
          </div>
        </div>

        <div className="pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={resetSettings}
            className="w-full"
          >
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
}
