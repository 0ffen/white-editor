'use client';

import { createContext, useContext } from 'react';

export interface ImageUploadConfig {
  upload?: (file: File) => Promise<string>;
  onError?: (error: Error) => void;
  onSuccess?: (url: string) => void;
  onImageInserted?: (url: string, caption?: string) => void;
  accept?: string;
  maxSize?: number;
  limit?: number;
}

export const ImageUploadContext = createContext<ImageUploadConfig>({});

export function useImageUploadConfig(): ImageUploadConfig {
  return useContext(ImageUploadContext);
}
