import * as React from 'react';
import {
  BringToFront,
  CropIcon,
  ImagePlusIcon,
  PencilIcon,
  Redo2,
  SendToBack,
  Square,
  TypeIcon,
  Undo2,
} from 'lucide-react';
import { Button, useTranslate, Separator, Toolbar } from '@/shared';
import { useImageUploadConfig } from '@/shared/contexts';
import { applyHandleScale, getAddImageScale, setImageOriginalSrc } from '../../util';
import { ImageCropDialog } from './image-crop-dialog';

import type { ZOrderAction } from '../../util';
import type { default as TuiImageEditorType } from 'tui-image-editor';

/** addImageObject 반환 객체 (공개 타입은 Promise<void>이나 런타임은 objectProps를 resolve함) */
type AddedImageObject = { id: number; width: number; height: number };

interface ImageEditorToolbarProps {
  editorRef: React.RefObject<TuiImageEditorType | null>;
  activeMode: string | null;
  handleModeChange: (mode: string | null) => void;
  /** 캔버스에 객체가 선택되어 있는지 (z-순서 버튼 활성화 여부) */
  hasSelection: boolean;
  /** 선택된 객체의 z-순서 변경 */
  onChangeZOrder: (action: ZOrderAction) => void;
}

/** 캔버스에 추가하는 이미지 최대 용량 기본값 (50MB) - 업로드 설정에 maxSize 미지정 시 사용 */
const DEFAULT_MAX_ADD_IMAGE_SIZE = 50 * 1024 * 1024;

export function ImageEditorToolbar(props: ImageEditorToolbarProps) {
  const { editorRef, activeMode, handleModeChange, hasSelection, onChangeZOrder } = props;
  const t = useTranslate();
  const { maxSize } = useImageUploadConfig();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const errorTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  /** 자르기 대기 중인 추가 이미지의 data URL (null이면 다이얼로그 닫힘) */
  const [cropImageUrl, setCropImageUrl] = React.useState<string | null>(null);
  /** 업로드한 원본 data URL (자르기 전). 추가된 객체에 보관해 재크롭 시 원본부터 다시 자르도록 함 */
  const pendingOriginalRef = React.useRef<string | null>(null);

  const showError = React.useCallback((message: string) => {
    setError(message);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setError(null), 3000);
  }, []);

  React.useEffect(() => {
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  const handleAddImage = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (inputRef.current) inputRef.current.value = '';
      if (!file || !editorRef.current) return;

      const maxBytes = maxSize ?? DEFAULT_MAX_ADD_IMAGE_SIZE;
      if (file.size > maxBytes) {
        showError(t('이미지 크기가 너무 큽니다'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        // 바로 추가하지 않고 자르기 다이얼로그를 먼저 띄움
        if (typeof reader.result === 'string') {
          pendingOriginalRef.current = reader.result;
          setCropImageUrl(reader.result);
        }
      };
      reader.onerror = () => showError(t('이미지를 업로드 할 수 없습니다'));
      reader.readAsDataURL(file);
    },
    [editorRef, maxSize, showError, t]
  );

  /** 자르기 완료된 이미지를 캔버스에 추가 (기본 이미지보다 작게 축소 + 핸들 크기 보정) */
  const addImageToCanvas = React.useCallback(
    (dataURL: string) => {
      const editor = editorRef.current;
      if (!editor) return;
      // 자르기 전 업로드 원본 (재크롭 시 원본부터 다시 자르도록 객체에 보관)
      const original = pendingOriginalRef.current ?? dataURL;
      (editor.addImageObject(dataURL) as unknown as Promise<AddedImageObject>).then((obj) => {
        if (!obj) return;
        const scale = getAddImageScale(editor, obj.width, obj.height);
        if (scale < 1) {
          editor.setObjectProperties(obj.id, { scaleX: scale, scaleY: scale });
        }
        applyHandleScale(editor, obj.id);
        setImageOriginalSrc(editor, obj.id, original);
      });
    },
    [editorRef]
  );

  return (
    <div className='we:relative we:h-[44px] we:text-text-sub we:flex-shrink-0'>
      <Toolbar className='we:border-none'>
        <Button
          type='button'
          className='we:h-fit we:w-fit'
          variant='ghost'
          size='icon'
          onClick={() => {
            if (editorRef.current) {
              editorRef.current?.undo();
            }
          }}
          tooltip={t('실행 취소')}
        >
          <Undo2 />
        </Button>
        <Button
          type='button'
          className='we:h-fit we:w-fit'
          variant='ghost'
          size='icon'
          onClick={() => editorRef.current?.redo()}
          tooltip={t('다시 실행')}
        >
          <Redo2 />
        </Button>

        <Separator orientation='vertical' className='we:mx-3 we:h-full we:min-h-4' />

        <Button
          type='button'
          className='we:h-fit we:w-fit'
          variant='ghost'
          size='icon'
          isActive={activeMode === 'crop'}
          onClick={() => handleModeChange(activeMode === 'crop' ? null : 'crop')}
          tooltip={t('자르기')}
        >
          <CropIcon />
        </Button>

        <Button
          type='button'
          className='we:h-fit we:w-fit'
          variant='ghost'
          size='icon'
          isActive={activeMode === 'text'}
          onClick={() => handleModeChange(activeMode === 'text' ? null : 'text')}
          tooltip={t('글자 넣기')}
        >
          <TypeIcon />
        </Button>

        <Button
          type='button'
          className='we:h-fit we:w-fit'
          variant='ghost'
          size='icon'
          isActive={activeMode === 'draw'}
          onClick={() => handleModeChange(activeMode === 'draw' ? null : 'draw')}
          tooltip={t('그리기')}
        >
          <PencilIcon />
        </Button>

        <Button
          type='button'
          className='we:h-fit we:w-fit'
          variant='ghost'
          size='icon'
          isActive={activeMode === 'shape'}
          onClick={() => handleModeChange(activeMode === 'shape' ? null : 'shape')}
          tooltip={t('도형 추가')}
        >
          <Square />
        </Button>

        <Button
          type='button'
          className='we:h-fit we:w-fit'
          variant='ghost'
          size='icon'
          onClick={() => inputRef.current?.click()}
          tooltip={t('이미지 추가')}
        >
          <ImagePlusIcon />
        </Button>
        <input ref={inputRef} type='file' accept='image/*' onChange={handleAddImage} style={{ display: 'none' }} />

        <Separator orientation='vertical' className='we:mx-3 we:h-full we:min-h-4' />

        <Button
          type='button'
          className='we:h-fit we:w-fit'
          variant='ghost'
          size='icon'
          disabled={!hasSelection}
          onClick={() => onChangeZOrder('front')}
          tooltip={t('맨 앞으로')}
        >
          <BringToFront />
        </Button>

        <Button
          type='button'
          className='we:h-fit we:w-fit'
          variant='ghost'
          size='icon'
          disabled={!hasSelection}
          onClick={() => onChangeZOrder('back')}
          tooltip={t('맨 뒤로')}
        >
          <SendToBack />
        </Button>
      </Toolbar>

      {error && (
        <div
          role='alert'
          className='we:absolute we:left-0 we:top-full we:z-10 we:mt-1 we:rounded we:bg-red-weak we:px-2 we:py-1 we:text-xs we:text-red-default we:shadow'
        >
          {error}
        </div>
      )}

      <ImageCropDialog
        isOpen={cropImageUrl !== null}
        imageUrl={cropImageUrl}
        onOpenChange={(open) => {
          if (!open) setCropImageUrl(null);
        }}
        onCropped={addImageToCanvas}
      />
    </div>
  );
}
