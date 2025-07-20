import React, { useCallback } from 'react';
import { PhotoIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface ImageUploaderProps {
  images: File[];
  onImagesChange: (newImages: File[]) => void;
  maxFiles?: number;
  maxFileSizeMB?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  maxFiles = 3,
  maxFileSizeMB = 5,
}) => {
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      const errors: string[] = [];

      newFiles.forEach((file) => {
        if (images.length + validFiles.length >= maxFiles) {
          errors.push(`Maximum ${maxFiles} files allowed.`);
          return;
        }
        if (file.size > maxFileSizeMB * 1024 * 1024) {
          errors.push(`File "${file.name}" is too large (max ${maxFileSizeMB}MB).`);
          return;
        }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          errors.push(`File "${file.name}" is not a valid image type (JPEG, PNG, WEBP allowed).`);
          return;
        }
        validFiles.push(file);
      });

      if (errors.length > 0) {
        alert(errors.join('\n')); // Simple alert for errors
      }
      onImagesChange([...images, ...validFiles]);
    }
  }, [images, onImagesChange, maxFiles, maxFileSizeMB]);

  const handleRemoveImage = useCallback((indexToRemove: number) => {
    onImagesChange(images.filter((_, index) => index !== indexToRemove));
  }, [images, onImagesChange]);

  const imageUrls = images.map(file => URL.createObjectURL(file));

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Property Photos (Max {maxFiles})</label>
      <div
        className="flex min-h-[150px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center hover:border-primary hover:bg-gray-100"
        onClick={() => document.getElementById('file-upload-input')?.click()}
      >
        <input
          id="file-upload-input"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          disabled={images.length >= maxFiles}
        />
        {images.length === 0 ? (
          <div className="text-gray-500">
            <PhotoIcon className="w-12 h-12 mx-auto" />
            <p className="mt-2 text-sm">Drag & drop your photos here, or click to browse</p>
            <p className="text-xs">Up to {maxFiles} images, max {maxFileSizeMB}MB each</p>
          </div>
        ) : (
          <p className="text-sm text-primary">Click to add more photos (current: {images.length}/{maxFiles})</p>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {imageUrls.map((url, index) => (
            <div key={index} className="relative overflow-hidden rounded-md shadow-sm aspect-video">
              <img src={url} alt={`Property image ${index + 1}`} className="object-cover w-full h-full" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemoveImage(index); }}
                className="absolute p-1 text-white transition-opacity bg-red-500 rounded-full right-1 top-1 opacity-90 hover:opacity-100"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;