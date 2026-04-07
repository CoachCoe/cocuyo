'use client';

/**
 * PhotoUpload — Component for uploading photos to signals.
 *
 * Features:
 * - Drag-and-drop or click to select
 * - Max 3 photos, max 5MB each
 * - Image preview grid with remove button
 */

import { useState, useCallback, useRef, type ReactElement, type DragEvent } from 'react';
import { MAX_POST_PHOTOS } from '@cocuyo/types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export interface PhotoUploadProps {
  /** Currently selected photos */
  photos: File[];
  /** Callback when photos change */
  onChange: (photos: File[]) => void;
  /** Whether upload is disabled */
  disabled?: boolean;
  /** Translation strings */
  translations?: {
    dropzone: string;
    browse: string;
    maxFiles: string;
    maxSize: string;
    remove: string;
  };
}

export function PhotoUpload({
  photos,
  onChange,
  disabled = false,
  translations: t,
}: PhotoUploadProps): ReactElement {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const canAddMore = photos.length < MAX_POST_PHOTOS;

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `${file.name}: Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File too large. Maximum size is 5MB.`;
    }
    return null;
  }, []);

  const addPhotos = useCallback(
    (files: FileList | File[]) => {
      setError(null);

      const fileArray = Array.from(files);
      const validFiles: File[] = [];
      const errors: string[] = [];

      for (const file of fileArray) {
        if (photos.length + validFiles.length >= MAX_POST_PHOTOS) {
          errors.push(`Maximum ${MAX_POST_PHOTOS} photos allowed.`);
          break;
        }

        const validationError = validateFile(file);
        if (validationError !== null) {
          errors.push(validationError);
        } else {
          validFiles.push(file);
        }
      }

      if (errors.length > 0) {
        setError(errors[0] ?? null);
      }

      if (validFiles.length > 0) {
        onChange([...photos, ...validFiles]);
      }
    },
    [photos, onChange, validateFile]
  );

  const removePhoto = useCallback(
    (index: number) => {
      onChange(photos.filter((_, i) => i !== index));
      setError(null);
    },
    [photos, onChange]
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (!disabled && canAddMore && e.dataTransfer.files.length > 0) {
        addPhotos(e.dataTransfer.files);
      }
    },
    [disabled, canAddMore, addPhotos]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files !== null && e.target.files.length > 0) {
        addPhotos(e.target.files);
      }
      // Reset input so same file can be selected again
      e.target.value = '';
    },
    [addPhotos]
  );

  const handleClick = useCallback(() => {
    if (!disabled && canAddMore) {
      inputRef.current?.click();
    }
  }, [disabled, canAddMore]);

  return (
    <div className="space-y-3">
      {/* Dropzone */}
      {canAddMore && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`
            relative border-2 border-dashed rounded-nested p-4 text-center cursor-pointer transition-colors
            ${disabled ? 'opacity-50 cursor-not-allowed border-[var(--border-subtle)]' : ''}
            ${isDragging
              ? 'border-[var(--color-firefly-gold)] bg-[var(--color-firefly-gold)]/5'
              : 'border-[var(--border-default)] hover:border-[var(--fg-tertiary)]'
            }
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            multiple
            onChange={handleInputChange}
            disabled={disabled}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            <svg
              className="w-8 h-8 text-[var(--fg-tertiary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-[var(--fg-secondary)]">
              {t?.dropzone ?? 'Drop photos here or'}{' '}
              <span className="text-[var(--color-firefly-gold)]">
                {t?.browse ?? 'browse'}
              </span>
            </p>
            <p className="text-xs text-[var(--fg-tertiary)]">
              {t?.maxFiles ?? `Up to ${MAX_POST_PHOTOS} photos`} &bull;{' '}
              {t?.maxSize ?? 'Max 5MB each'}
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error !== null && (
        <p className="text-xs text-[var(--fg-error)]">{error}</p>
      )}

      {/* Photo previews */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <div key={`${photo.name}-${index}`} className="relative aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element -- Blob URLs cannot use next/image */}
              <img
                src={URL.createObjectURL(photo)}
                alt={`Upload preview ${index + 1}`}
                className="w-full h-full object-cover rounded-nested"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 p-1 bg-[var(--bg-primary)]/80 rounded-full hover:bg-[var(--bg-primary)] transition-colors"
                aria-label={t?.remove ?? 'Remove photo'}
              >
                <svg
                  className="w-4 h-4 text-[var(--fg-primary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
