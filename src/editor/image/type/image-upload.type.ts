import type { NodeType } from '@tiptap/pm/model';

export type UploadFunction = (
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal
) => Promise<string>;

export interface ImageUploadNodeOptions {
  type?: string | NodeType | undefined;
  accept?: string; // @default 'image/*'
  limit?: number; //default : 1
  maxSize?: number;
  upload?: UploadFunction; //업로드 핸들러
  onError?: (error: Error) => void; //업로드 실패시 실행하는 콜백
  onSuccess?: (url: string) => void; //업로드 성공시 실행하는 콜백
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HTMLAttributes?: Record<string, any>;
}

export interface ImageUploadConfig {
  accept?: string;
  maxSize?: number;
  limit?: number;
  upload: UploadFunction;
  onError?: (error: Error) => void;
  onSuccess?: (url: string) => void;
}
