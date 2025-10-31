import { useCallback } from 'react';
import { Capture } from './useGallery';

export function useCapture() {
  const captureFrame = useCallback(async (
    videoElement: HTMLVideoElement,
    options: {
      mirror?: boolean;
      flash?: boolean;
      sound?: boolean;
    } = {}
  ): Promise<Capture> => {
    const { mirror = false, flash = true, sound = true } = options;

    // Flash effect
    if (flash) {
      const flashDiv = document.createElement('div');
      flashDiv.style.cssText = 'position:fixed;inset:0;background:white;z-index:9999;pointer-events:none;';
      document.body.appendChild(flashDiv);
      setTimeout(() => flashDiv.remove(), 150);
    }

    // Shutter sound
    if (sound) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ0PVqzn77BdGAg+ltv0xnMoBSuAzvLaiTcIGWi77eefTRAMUKfj8LZjHAY4kdfyy3ksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUxh9Hz04IzBh5uwO/jmVENAA==');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }

    // Create canvas and capture
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = videoElement.videoWidth || 1280;
    canvas.height = videoElement.videoHeight || 720;

    if (mirror) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Get full res data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

    // Create thumbnail
    const thumbCanvas = document.createElement('canvas');
    const thumbCtx = thumbCanvas.getContext('2d')!;
    const thumbSize = 200;
    const aspectRatio = canvas.width / canvas.height;
    
    if (aspectRatio > 1) {
      thumbCanvas.width = thumbSize;
      thumbCanvas.height = thumbSize / aspectRatio;
    } else {
      thumbCanvas.width = thumbSize * aspectRatio;
      thumbCanvas.height = thumbSize;
    }

    thumbCtx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
    const thumbUrl = thumbCanvas.toDataURL('image/jpeg', 0.7);

    const capture: Capture = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      createdAt: Date.now(),
      width: canvas.width,
      height: canvas.height,
      mime: 'image/jpeg',
      dataUrl,
      thumbUrl,
    };

    return capture;
  }, []);

  return { captureFrame };
}
