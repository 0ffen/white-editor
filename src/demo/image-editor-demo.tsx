import React from 'react';
import { WhiteEditor } from '@/editor/editor';
import { DefaultImageServerAPI } from '@/editor/image';
import type { ImageUploadConfig } from '@/editor/image';

/**
 * Demo component showing how to use the image editor with resizable images
 * and server upload functionality
 */
export function ImageEditorDemo() {
  // Create a custom server API instance
  const serverAPI = new DefaultImageServerAPI();

  // Configure image upload settings
  const imageConfig: ImageUploadConfig = {
    accept: 'image/*',
    maxSize: 10 * 1024 * 1024, // 10MB
    limit: 1,
    upload: async (file, onProgress, abortSignal) => {
      // Use the server API for upload
      const response = await serverAPI.upload(file, onProgress, abortSignal);
      return response.url;
    },
    onError: (error) => {
      console.error('Image upload error:', error);
      alert('Failed to upload image: ' + error.message);
    },
    onSuccess: (url) => {
      console.log('Image uploaded successfully:', url);
    },
  };

  return (
    <div className='p-6'>
      <h1 className='mb-4 text-2xl font-bold'>Image Editor Demo</h1>

      <div className='mb-4 rounded-lg bg-gray-50 p-4'>
        <h2 className='mb-2 text-lg font-semibold'>Features:</h2>
        <ul className='list-inside list-disc space-y-1 text-sm text-gray-700'>
          <li>✅ Upload images with drag & drop or file picker</li>
          <li>✅ Edit images with TUI Image Editor (crop, draw, text, shapes)</li>
          <li>✅ Add captions to images</li>
          <li>✅ Image alignment using toolbar align buttons</li>
          <li>✅ Resizable images in the editor</li>
          <li>✅ Click on images to edit them again</li>
          <li>✅ Modular server API for uploads</li>
          <li>✅ Progress tracking during uploads</li>
        </ul>
      </div>

      <div className='rounded-lg border'>
        <WhiteEditor imageConfig={imageConfig} contentClassName='min-h-[400px] p-4' />
      </div>

      <div className='mt-4 rounded-lg bg-blue-50 p-4'>
        <h3 className='text-md mb-2 font-semibold'>How to use:</h3>
        <ol className='list-inside list-decimal space-y-1 text-sm text-gray-700'>
          <li>Click the image upload button in the toolbar</li>
          <li>Select or drag an image file</li>
          <li>Edit the image using the built-in editor tools</li>
          <li>Add a caption if desired</li>
          <li>Save to insert into the editor</li>
          <li>Select the image and use toolbar alignment buttons (left/center/right)</li>
          <li>Click on inserted images to resize them</li>
          <li>Hover over images to see edit controls</li>
          <li>Click the edit icon on images to edit them again</li>
        </ol>
      </div>
    </div>
  );
}
