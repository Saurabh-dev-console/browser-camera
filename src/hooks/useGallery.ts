import { useState, useEffect } from 'react';

export interface Capture {
  id: string;
  createdAt: number;
  width: number;
  height: number;
  mime: string;
  dataUrl: string;
  thumbUrl: string;
}

const MAX_CAPTURES = 20;
const STORAGE_KEY = 'selfie-gallery';

export function useGallery() {
  const [captures, setCaptures] = useState<Capture[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(captures));
  }, [captures]);

  const addCapture = (capture: Capture) => {
    setCaptures(prev => [capture, ...prev].slice(0, MAX_CAPTURES));
  };

  const deleteCapture = (id: string) => {
    setCaptures(prev => prev.filter(c => c.id !== id));
  };

  const clearAll = () => {
    setCaptures([]);
  };

  const getCapture = (id: string) => {
    return captures.find(c => c.id === id);
  };

  return { captures, addCapture, deleteCapture, clearAll, getCapture };
}
