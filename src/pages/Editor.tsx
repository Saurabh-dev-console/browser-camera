import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RotateCw, FlipHorizontal, FlipVertical } from 'lucide-react';
import { useGallery } from '@/hooks/useGallery';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCapture } = useGallery();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capture, setCapture] = useState(getCapture(id!));
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  useEffect(() => {
    if (!capture) {
      navigate('/gallery');
      return;
    }
    drawImage();
  }, [capture, rotation, flipH, flipV, brightness, contrast]);

  const drawImage = () => {
    if (!canvasRef.current || !capture) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      const isRotated = rotation === 90 || rotation === 270;
      canvas.width = isRotated ? img.height : img.width;
      canvas.height = isRotated ? img.width : img.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      // Apply transforms
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      // Apply filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();
    };

    img.src = capture.dataUrl;
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `selfie-${new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')}.jpg`;
    link.href = canvasRef.current.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  if (!capture) return null;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="p-4 glass border-b border-border">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/gallery')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Edit Photo</h1>
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full shadow-2xl rounded-lg"
        />
      </div>

      {/* Controls */}
      <div className="p-4 glass border-t border-border space-y-4">
        {/* Transform Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setRotation((r) => (r + 90) % 360)}
          >
            <RotateCw className="w-5 h-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setFlipH(!flipH)}
          >
            <FlipHorizontal className="w-5 h-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setFlipV(!flipV)}
          >
            <FlipVertical className="w-5 h-5" />
          </Button>
        </div>

        {/* Filter Controls */}
        <div className="space-y-3 max-w-md mx-auto">
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Brightness</label>
            <Slider
              value={[brightness]}
              onValueChange={([v]) => setBrightness(v)}
              min={50}
              max={150}
              step={1}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Contrast</label>
            <Slider
              value={[contrast]}
              onValueChange={([v]) => setContrast(v)}
              min={50}
              max={150}
              step={1}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
