import { Check, Loader2 } from 'lucide-react';
import { Button, cn, useTranslate } from '@/shared';

export interface ImageEditorFooterProps {
  onCancel: () => void;
  onApply: () => void;
  cancelLabel?: React.ReactNode;
  applyLabel?: React.ReactNode;
  /** Apply 버튼에 체크 아이콘 표시 (isApplyLoading이 false일 때) */
  showApplyIcon?: boolean;
  isApplyLoading?: boolean;
  isApplyDisabled?: boolean;
  isCancelDisabled?: boolean;
  /** border-top 표시 여부 (crop, main 제외하고 text/draw/shape에만 true) */
  showBorderTop?: boolean;
}

const FOOTER_BASE_CLASS = 'we:flex we:justify-end we:items-center we:gap-2 we:p-4';

/**
 * 이미지 편집 다이얼로그 / 에디터 옵션(crop, text, draw, shape) 공통 푸터
 * - 취소 + 적용 버튼, 간격·패딩·보더 디자인 통일
 */
export function ImageEditorFooter(props: ImageEditorFooterProps) {
  const {
    onCancel,
    onApply,
    cancelLabel,
    applyLabel,
    showApplyIcon = true,
    isApplyLoading = false,
    isApplyDisabled = false,
    isCancelDisabled = false,
    showBorderTop = false,
  } = props;
  const t = useTranslate();
  const resolvedCancelLabel = cancelLabel ?? t('취소');
  const resolvedApplyLabel = applyLabel ?? t('적용');

  return (
    <div className={cn(FOOTER_BASE_CLASS, showBorderTop && 'we:border-t we:border-border-default')}>
      <Button type='button' variant='secondary' className='we:w-fit' onClick={onCancel} disabled={isCancelDisabled}>
        {resolvedCancelLabel}
      </Button>
      <Button type='button' variant='default' className='we:w-fit' onClick={onApply} disabled={isApplyDisabled}>
        {isApplyLoading ? (
          <Loader2 className='we:h-4 we:w-4 we:animate-spin' />
        ) : (
          <>
            {showApplyIcon && <Check className='we:mr-1 we:h-4 we:w-4' />}
            {resolvedApplyLabel}
          </>
        )}
      </Button>
    </div>
  );
}
