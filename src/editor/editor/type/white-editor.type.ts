import type { ImageUploadConfig } from '@/editor';
import type { ListItemConfig } from '@/shared/utils';

interface WhiteEditorProps<T> {
  mentionItems?: ListItemConfig<T>;
  toolbar?: React.ReactNode;
  editorClassName?: string;
  contentClassName?: string;
  /**
   * 이미지 업로드 설정 - 단순히 imageConfig만 전달하면 됩니다
   */
  imageConfig?: ImageUploadConfig;
}

export type { WhiteEditorProps };
