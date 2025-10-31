import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface MediaContextType {
  stream: MediaStream | null;
  devices: MediaDeviceInfo[];
  currentDeviceId: string | null;
  permissionState: 'idle' | 'requesting' | 'granted' | 'denied';
  error: string | null;
  startCamera: (deviceId?: string) => Promise<void>;
  stopCamera: () => void;
  switchCamera: () => Promise<void>;
  loadDevices: () => Promise<void>;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export function MediaProvider({ children }: { children: ReactNode }) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [error, setError] = useState<string | null>(null);

  const loadDevices = useCallback(async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceList.filter(d => d.kind === 'videoinput');
      setDevices(videoDevices);
    } catch (err) {
      console.error('Failed to enumerate devices:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(async (deviceId?: string) => {
    setPermissionState('requesting');
    setError(null);
    
    stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId 
          ? { deviceId: { exact: deviceId } }
          : { facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setPermissionState('granted');
      
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        setCurrentDeviceId(videoTrack.getSettings().deviceId || null);
      }
      
      await loadDevices();
    } catch (err: any) {
      setPermissionState('denied');
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Failed to access camera: ' + err.message);
      }
      console.error('Camera error:', err);
    }
  }, [stopCamera, loadDevices]);

  const switchCamera = useCallback(async () => {
    if (devices.length < 2) return;
    
    const currentIndex = devices.findIndex(d => d.deviceId === currentDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDevice = devices[nextIndex];
    
    if (nextDevice) {
      await startCamera(nextDevice.deviceId);
    }
  }, [devices, currentDeviceId, startCamera]);

  return (
    <MediaContext.Provider value={{
      stream,
      devices,
      currentDeviceId,
      permissionState,
      error,
      startCamera,
      stopCamera,
      switchCamera,
      loadDevices,
    }}>
      {children}
    </MediaContext.Provider>
  );
}

export function useMedia() {
  const context = useContext(MediaContext);
  if (!context) throw new Error('useMedia must be used within MediaProvider');
  return context;
}
