'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, ZoomIn, ImagePlus, Crop } from 'lucide-react';
import { ImageCropper } from './image-cropper';
import { toast } from 'sonner';

interface ImageUploadProps {
  readonly value: string;
  readonly onChange: (url: string) => void;
  readonly folder?: string;
  readonly placeholder?: string;
  readonly className?: string;
  readonly enableCrop?: boolean;
  readonly aspectRatio?: number;
}

async function deleteFromProvider(url: string): Promise<void> {
  if (!url) return;

  try {
    const apiUrl = import.meta.env['VITE_API_URL'] ?? '/api/v1';
    await fetch(`${apiUrl}/admin/upload`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('admin_token') ?? ''}`,
      },
      body: JSON.stringify({ url }),
    });
  } catch {
    // Non-blocking — failing to delete an orphan is not critical
  }
}

export function ImageUpload({
  value,
  onChange,
  folder = 'products',
  placeholder = 'Upload image',
  className = '',
  enableCrop = false,
  aspectRatio,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadBlob(blob: Blob, filename: string) {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', blob, filename);
      formData.append('folder', folder);

      const apiUrl = import.meta.env['VITE_API_URL'] ?? '/api/v1';
      const response = await fetch(`${apiUrl}/admin/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token') ?? ''}` },
        body: formData,
      });

      const result = await response.json() as { success: boolean; data: { url: string } | null; error: string | null };

      if (result.success && result.data) {
        onChange(result.data.url);
        setImgError(false);
        toast.success('Image uploaded');
      } else {
        toast.error(result.error ?? 'Upload failed');
      }
    } catch {
      toast.error('Upload failed');
    }
    setIsUploading(false);
  }

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { toast.error('Only images allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }

    if (enableCrop) {
      setPendingFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setCropSrc(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      void uploadBlob(file, file.name);
    }
  }

  function handleRemove() {
    if (value) {
      void deleteFromProvider(value);
    }
    onChange('');
    setImgError(false);
  }

  async function handleReplace(newFile: File) {
    const oldUrl = value;
    handleFile(newFile);
    if (oldUrl) {
      void deleteFromProvider(oldUrl);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (value) {
        void handleReplace(file);
      } else {
        handleFile(file);
      }
    }
  }

  return (
    <div className={className}>
      {value && !imgError ? (
        <div className="group relative">
          <img src={value} alt="Uploaded" className="h-36 w-full rounded-xl border border-gray-200 object-cover dark:border-gray-700" onError={() => setImgError(true)} />
          <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-xl bg-black/0 transition-all group-hover:bg-black/40">
            <button type="button" onClick={() => inputRef.current?.click()} className="rounded-lg bg-white p-2 text-gray-700 opacity-0 shadow transition-all hover:text-blue-600 group-hover:opacity-100" title="Replace">
              <Upload className="h-4 w-4" />
            </button>
            {enableCrop && (
              <button type="button" onClick={() => { setCropSrc(value); setPendingFile(null); }} className="rounded-lg bg-white p-2 text-gray-700 opacity-0 shadow transition-all hover:text-purple-600 group-hover:opacity-100" title="Crop">
                <Crop className="h-4 w-4" />
              </button>
            )}
            <button type="button" onClick={() => window.open(value, '_blank')} className="rounded-lg bg-white p-2 text-gray-700 opacity-0 shadow transition-all hover:text-blue-600 group-hover:opacity-100" title="Full size">
              <ZoomIn className="h-4 w-4" />
            </button>
            <button type="button" onClick={handleRemove} className="rounded-lg bg-white p-2 text-gray-700 opacity-0 shadow transition-all hover:text-red-600 group-hover:opacity-100" title="Remove">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : value && imgError ? (
        <div className="flex h-36 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
          <p className="text-xs text-red-500">Image not loading</p>
          <button type="button" onClick={handleRemove} className="mt-1 text-xs text-red-600 underline">Remove</button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${
            dragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 dark:border-gray-600'
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="mb-1 h-6 w-6 animate-spin text-blue-500" />
              <p className="text-xs text-blue-500">Uploading...</p>
            </>
          ) : (
            <>
              <ImagePlus className="mb-1.5 h-7 w-7 text-gray-400" />
              <p className="text-xs font-medium text-gray-500">{placeholder}</p>
              <p className="mt-0.5 text-[10px] text-gray-400">Click or drag & drop</p>
            </>
          )}
        </div>
      )}

      <input
        type="url"
        value={value}
        onChange={(e) => { onChange(e.target.value); setImgError(false); }}
        placeholder="Or paste image URL..."
        className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs focus:border-blue-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            if (value) {
              void handleReplace(file);
            } else {
              handleFile(file);
            }
          }
          e.target.value = '';
        }}
      />

      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          open={true}
          onClose={() => { setCropSrc(null); setPendingFile(null); }}
          onCrop={async (blob) => {
            setCropSrc(null);
            setPendingFile(null);
            await uploadBlob(blob, 'cropped.jpg');
          }}
          onSkip={async () => {
            setCropSrc(null);
            if (pendingFile) {
              await uploadBlob(pendingFile, pendingFile.name);
              setPendingFile(null);
            }
          }}
          aspectRatio={aspectRatio}
          isUploading={isUploading}
        />
      )}
    </div>
  );
}
