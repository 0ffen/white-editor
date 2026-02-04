import React from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignVerticalSpaceAround,
  Edit3,
  GalleryVerticalIcon,
  TvMinimal,
} from 'lucide-react';
import { Button, cn, getTranslate, Separator, Toolbar, Tooltip, TooltipContent, TooltipTrigger } from '@/shared';

export type ImageWidthMode = 'recommended' | 'full';

interface ImageFloatingControlsProps {
  onEditClick: (e: React.MouseEvent) => void;
  onResizeStart: (e: React.MouseEvent) => void;
  showControls: boolean;
  align: 'left' | 'center' | 'right';
  onAlignChange: (align: 'left' | 'center' | 'right') => void;
  onWidthModeChange?: (mode: ImageWidthMode) => void;
  /** 현재 width 모드 (Recommended 버튼 활성화용) */
  widthMode?: ImageWidthMode;
  /** 캡션 버튼 클릭 시 (인라인 캡션 편집 시작) */
  onCaptionClick?: (e: React.MouseEvent) => void;
  /** 캡션 인풋 포커스 여부 (캡션 버튼 active 표시용) */
  isCaptionEditing?: boolean;
}

const alignButtons = [
  { type: 'left', icon: AlignLeft, titleKey: '좌측정렬' },
  { type: 'center', icon: AlignCenter, titleKey: '중앙정렬' },
  { type: 'right', icon: AlignRight, titleKey: '우측정렬' },
];

/**
 * 이미지 클릭시 노출되는 플로팅 메뉴
 */
export const ImageFloatingControls: React.FC<ImageFloatingControlsProps> = (props: ImageFloatingControlsProps) => {
  const {
    onEditClick,
    onResizeStart,
    showControls,
    align,
    onAlignChange,
    onWidthModeChange,
    widthMode,
    onCaptionClick,
    isCaptionEditing,
  } = props;
  if (!showControls) return null;

  return (
    <>
      <Toolbar
        variant='floating'
        className='we:absolute we:top-2 we:right-1/2 we:h-[40px] we:w-fit we:translate-x-1/2 we:border-none we:p-2'
      >
        {widthMode !== 'full' && (
          <>
            {alignButtons.map(({ type, icon: Icon, titleKey }) => (
              <Button
                key={type}
                onClick={() => onAlignChange(type as 'left' | 'center' | 'right')}
                tooltip={getTranslate(titleKey)}
                type='button'
                className={cn(align === type && 'we:bg-primary/20')}
                isActive={align === type}
              >
                <Icon size={16} className={cn(align === type && 'we:text-primary')} />
              </Button>
            ))}
            <Separator orientation='vertical' className='we:mx-0.5 we:h-2' />
          </>
        )}
        <Button
          tooltip={getTranslate('권장너비')}
          type='button'
          onClick={() => onWidthModeChange?.('recommended')}
          className={cn(widthMode === 'recommended' && 'we:bg-primary/20')}
          isActive={widthMode === 'recommended'}
        >
          <AlignVerticalSpaceAround size={16} className={cn(widthMode === 'recommended' && 'we:text-primary')} />
        </Button>
        <Button
          tooltip={getTranslate('전체너비')}
          type='button'
          onClick={() => onWidthModeChange?.('full')}
          className={cn(widthMode === 'full' && 'we:bg-primary/20')}
          isActive={widthMode === 'full'}
        >
          <GalleryVerticalIcon size={16} className={cn(widthMode === 'full' && 'we:text-primary')} />
        </Button>
        <Separator orientation='vertical' className='we:mx-0.5 we:h-2' />
        <Button
          onClick={onCaptionClick}
          tooltip={getTranslate('캡션')}
          type='button'
          className={cn(isCaptionEditing && 'we:bg-primary/20')}
          isActive={isCaptionEditing}
        >
          <TvMinimal size={16} className={cn(isCaptionEditing && 'we:text-primary')} />
        </Button>
        <Button onClick={onEditClick} tooltip={getTranslate('이미지 편집')} type='button'>
          <Edit3 />
        </Button>
      </Toolbar>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className='we:resize-handle we:bg-primary we:absolute we:-right-2 we:-bottom-2 we:h-4 we:w-4 we:cursor-se-resize we:rounded-full'
            onMouseDown={onResizeStart}
          />
        </TooltipTrigger>
        <TooltipContent side='bottom'>
          <div className='we:flex we:flex-col we:items-center we:text-center'>{getTranslate('이미지 크기 조절')}</div>
        </TooltipContent>
      </Tooltip>
    </>
  );
};
