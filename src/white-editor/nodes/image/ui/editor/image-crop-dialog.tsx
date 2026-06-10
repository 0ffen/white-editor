import { useEffect, useRef } from 'react';
import TuiImageEditor from 'tui-image-editor';
import { cn, Dialog, DialogContent, DialogHeader, DialogTitle, useTranslate } from '@/shared';
import { ImageEditorFooter } from '@/white-editor';
import type { default as TuiImageEditorType } from 'tui-image-editor';

interface ImageCropDialogProps {
  isOpen: boolean;
  /** 자를 이미지의 data URL (로컬 파일을 읽은 결과) */
  imageUrl: string | null;
  onOpenChange: (open: boolean) => void;
  /** 자르기 완료 시 결과 data URL 전달 */
  onCropped: (dataUrl: string) => void;
}

const CROP_DISPLAY_WIDTH = 640;
const CROP_DISPLAY_HEIGHT = 400;

/**
 * 캔버스에 이미지를 추가하기 전에 먼저 잘라내는 다이얼로그.
 * 추가 이미지를 위한 별도의 tui-image-editor 인스턴스를 CROPPER 모드로 띄운다.
 */
export function ImageCropDialog(props: ImageCropDialogProps) {
  const { isOpen, imageUrl, onOpenChange, onCropped } = props;
  const t = useTranslate();
  const rootEl = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<TuiImageEditorType | null>(null);

  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    let instance: TuiImageEditorType | null = null;
    let cancelled = false;

    // 다이얼로그가 완전히 레이아웃된 다음 프레임에 초기화 (레이아웃 전 생성 시 캔버스가 비는 문제 방지)
    const raf = requestAnimationFrame(() => {
      if (cancelled || !rootEl.current) return;

      instance = new TuiImageEditor(rootEl.current, {
        cssMaxWidth: CROP_DISPLAY_WIDTH,
        cssMaxHeight: CROP_DISPLAY_HEIGHT,
        usageStatistics: false,
        selectionStyle: {
          cornerSize: 10,
          rotatingPointOffset: 10,
          borderColor: '#ffffff',
          lineWidth: 2,
          cornerColor: '#ffffff',
          cornerStrokeColor: '#161616',
        },
      });
      editorRef.current = instance;

      instance
        .loadImageFromURL(imageUrl, 'CropImage')
        .then(() => {
          if (!cancelled) instance?.startDrawingMode('CROPPER');
        })
        .catch(() => {
          if (!cancelled) onOpenChange(false);
        });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      instance?.destroy();
      editorRef.current = null;
    };
  }, [isOpen, imageUrl, onOpenChange]);

  const handleApply = async () => {
    const editor = editorRef.current;
    if (!editor) {
      onOpenChange(false);
      return;
    }
    try {
      const rect = editor.getCropzoneRect();
      // 사용자가 영역을 지정한 경우에만 crop, 아니면 원본 그대로 사용
      if (rect && rect.width > 0 && rect.height > 0) {
        await editor.crop(rect);
      }
      editor.stopDrawingMode();
      onCropped(editor.toDataURL());
    } finally {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton
        className={cn(
          'white-editor we:max-h-[90vh] we:overflow-y-auto we:max-w-[720px] we:min-w-[480px] we:px-0 we:text-text-normal we:p-0! we:gap-0! we:flex we:flex-col'
        )}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className='we:px-4 we:pt-5 we:border-b we:border-border-default we:pb-4'>
          <DialogTitle className='we:text-[16px] we:text-text-normal'>{t('자르기')}</DialogTitle>
        </DialogHeader>

        <div className='we:relative we:flex we:w-full we:items-center we:justify-center we:overflow-auto we:bg-elevation-level1 we:py-4'>
          <div
            ref={rootEl}
            className='we:flex we:items-center we:justify-center'
            style={{ width: `${CROP_DISPLAY_WIDTH}px`, height: `${CROP_DISPLAY_HEIGHT}px` }}
          />
        </div>

        <ImageEditorFooter
          onCancel={() => onOpenChange(false)}
          onApply={handleApply}
          cancelLabel={t('취소')}
          applyLabel={t('확인')}
        />
      </DialogContent>
    </Dialog>
  );
}
