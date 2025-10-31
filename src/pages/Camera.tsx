import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera as CameraIcon, FlipHorizontal, Grid3x3, SwitchCamera, Settings, Image, Timer } from 'lucide-react';
import { useMedia } from '@/contexts/MediaContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useCapture } from '@/hooks/useCapture';
import { useGallery } from '@/hooks/useGallery';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Camera() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { stream, devices, permissionState, error, startCamera, switchCamera } = useMedia();
  const { settings, updateSettings } = useSettings();
  const { captureFrame } = useCapture();
  const { addCapture, captures } = useGallery();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    startCamera();
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleCapture = async () => {
    if (!videoRef.current || isCapturing) return;

    if (settings.countdownSec > 0) {
      setCountdown(settings.countdownSec);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      setTimeout(async () => {
        await doCapture();
      }, settings.countdownSec * 1000);
    } else {
      await doCapture();
    }
  };

  const doCapture = async () => {
    if (!videoRef.current) return;
    
    setIsCapturing(true);
    try {
      const capture = await captureFrame(videoRef.current, {
        mirror: settings.mirrorPreview,
        flash: true,
        sound: settings.soundOn,
      });
      addCapture(capture);
      
      // Navigate to editor after a brief delay
      setTimeout(() => {
        navigate(`/edit/${capture.id}`);
      }, 300);
    } catch (err) {
      console.error('Capture failed:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  if (permissionState === 'idle' || permissionState === 'requesting') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <CameraIcon className="w-16 h-16 mx-auto text-muted-foreground" />
          <p className="text-lg">Requesting camera access...</p>
        </div>
      </div>
    );
  }

  if (permissionState === 'denied' || error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <CameraIcon className="w-16 h-16 mx-auto text-destructive" />
          <h2 className="text-xl font-semibold">Camera Access Required</h2>
          <p className="text-muted-foreground">{error || 'Please grant camera permission to use this app.'}</p>
          <Button onClick={() => startCamera()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-screen bg-background overflow-hidden">
      {/* Video Preview */}
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            "absolute inset-0 w-full h-full object-cover",
            settings.mirrorPreview && "scale-x-[-1]"
          )}
        />

        {/* Grid Overlay */}
        {settings.gridOn && (
          <div className="absolute inset-0 pointer-events-none grid-overlay" />
        )}

        {/* Countdown */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="text-9xl font-bold text-white animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 glass">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/gallery')}
              className="text-foreground hover:bg-secondary"
            >
              <Image className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updateSettings({ gridOn: !settings.gridOn })}
                className={cn(
                  "text-foreground hover:bg-secondary",
                  settings.gridOn && "bg-accent text-accent-foreground"
                )}
              >
                <Grid3x3 className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const next = settings.countdownSec === 0 ? 3 : settings.countdownSec === 3 ? 5 : 0;
                  updateSettings({ countdownSec: next });
                }}
                className="text-foreground hover:bg-secondary"
              >
                <Timer className="w-5 h-5" />
                {settings.countdownSec > 0 && (
                  <span className="absolute -top-1 -right-1 text-xs bg-accent text-accent-foreground rounded-full w-4 h-4 flex items-center justify-center">
                    {settings.countdownSec}
                  </span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/settings')}
                className="text-foreground hover:bg-secondary"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-8 glass">
          <div className="flex items-center justify-between max-w-xl mx-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => updateSettings({ mirrorPreview: !settings.mirrorPreview })}
              className={cn(
                "text-foreground hover:bg-secondary",
                settings.mirrorPreview && "bg-accent text-accent-foreground"
              )}
            >
              <FlipHorizontal className="w-5 h-5" />
            </Button>

            {/* Capture Button */}
            <button
              onClick={handleCapture}
              disabled={isCapturing || countdown !== null}
              className="relative w-20 h-20 rounded-full bg-accent border-4 border-background shadow-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 capture-pulse"
            >
              <div className="absolute inset-2 rounded-full bg-background" />
            </button>

            <Button
              variant="ghost"
              size="icon"
              onClick={switchCamera}
              disabled={devices.length < 2}
              className="text-foreground hover:bg-secondary disabled:opacity-30"
            >
              <SwitchCamera className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Last Capture Thumbnail */}
        {captures.length > 0 && (
          <button
            onClick={() => navigate('/gallery')}
            className="absolute bottom-10 left-6 w-14 h-14 rounded-lg border-2 border-border overflow-hidden hover:scale-105 transition-transform"
          >
            <img src={captures[0].thumbUrl} alt="Last" className="w-full h-full object-cover" />
          </button>
        )}
      </div>
    </div>
  );
}
