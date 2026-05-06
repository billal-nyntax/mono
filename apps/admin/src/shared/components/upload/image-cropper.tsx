import { useState, useRef, useCallback } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Crop as CropIcon, RotateCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';

interface ImageCropperProps {
  readonly src: string;
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onCrop: (blob: Blob) => void;
  readonly onSkip: () => void;
  readonly aspectRatio?: number;
  readonly isUploading?: boolean;
}

export function ImageCropper({
  src,
  open,
  onClose,
  onCrop,
  onSkip,
  aspectRatio,
  isUploading,
}: ImageCropperProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);

  const onImageLoad = useCallback(() => {
    const w = 80;
    const h = aspectRatio ? w / aspectRatio : 80;
    setCrop({ unit: '%', x: 10, y: (100 - h) / 2, width: w, height: Math.min(h, 90) });
  }, [aspectRatio]);

  function handleCrop() {
    const img = imgRef.current;
    if (!img || !completedCrop) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropW = completedCrop.width * scaleX;
    const cropH = completedCrop.height * scaleY;

    const maxDim = 1200;
    const scale = Math.min(1, maxDim / Math.max(cropW, cropH));
    canvas.width = Math.round(cropW * scale);
    canvas.height = Math.round(cropH * scale);

    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) onCrop(blob);
    }, 'image/jpeg', 0.92);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="h-5 w-5 text-blue-600" />
            Crop Image
          </DialogTitle>
        </DialogHeader>

        <div className="mt-3">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            className="mx-auto max-h-[420px] [&_img]:max-h-[420px]"
          >
            <img
              ref={imgRef}
              src={src}
              alt="Crop"
              onLoad={onImageLoad}
              className="max-w-full"
              crossOrigin="anonymous"
            />
          </ReactCrop>

          <p className="mt-3 text-center text-xs text-gray-400">
            Drag to select crop area. Drag corners to resize.
          </p>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onSkip} disabled={isUploading}>
            <RotateCw className="mr-1.5 h-4 w-4" />
            Upload Original
          </Button>
          <Button onClick={handleCrop} disabled={isUploading || !completedCrop}>
            <CropIcon className="mr-1.5 h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Crop & Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
