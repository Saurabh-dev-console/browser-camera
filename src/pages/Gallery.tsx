import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Camera } from 'lucide-react';
import { useGallery } from '@/hooks/useGallery';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Gallery() {
  const navigate = useNavigate();
  const { captures, deleteCapture, clearAll } = useGallery();

  if (captures.length === 0) {
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
            <h1 className="text-lg font-semibold">Gallery</h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <Camera className="w-16 h-16 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">No photos yet</h2>
            <p className="text-muted-foreground">Take your first selfie!</p>
            <Button onClick={() => navigate('/')}>
              <Camera className="w-4 h-4 mr-2" />
              Open Camera
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-lg font-semibold">Gallery ({captures.length})</h1>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="w-5 h-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all photos?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {captures.length} photos from your gallery.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearAll}>Clear All</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {captures.map((capture) => (
            <div key={capture.id} className="group relative aspect-square">
              <button
                onClick={() => navigate(`/edit/${capture.id}`)}
                className="w-full h-full rounded-lg overflow-hidden hover:scale-105 transition-transform"
              >
                <img
                  src={capture.thumbUrl}
                  alt="Capture"
                  className="w-full h-full object-cover"
                />
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this photo?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteCapture(capture.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
