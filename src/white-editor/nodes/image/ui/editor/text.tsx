import { useCallback, useEffect, useRef, useState } from 'react';
import { Ban, Bold, Italic, Plus, Strikethrough, Trash2, Underline } from 'lucide-react';
import { Button, cn, useTranslate, Textarea } from '@/shared';
import { EDITOR_COLORS, normalizeCanvasColor, TRANSPARENT_COLOR } from '@/white-editor';
import type { default as TuiImageEditorType } from 'tui-image-editor';

const TEXTAREA_MIN_HEIGHT = 40;
const TEXTAREA_MAX_HEIGHT = 300;

const DEFAULT_FONT_SIZE = 40;

/** 흰 배경에서도 보이도록 회색 테두리. 텍스트 색상/배경 피커에만 흰색을 추가 (공유 EDITOR_COLORS는 변경하지 않음) */
const WHITE_COLOR = { label: 'White', value: '#ffffff', hex: '#ffffff', editorHex: '#ffffff', border: '#9f9f9f' };
const TEXT_COLORS = [...EDITOR_COLORS, WHITE_COLOR];

/** 밑줄/취소선은 tui changeTextStyle API상 동시 적용이 불가하여 라디오식으로 처리 */
type TextDecoration = 'none' | 'underline' | 'line-through';

/** changeTextStyle의 공개 타입(ITextStyleConfig)엔 textBackgroundColor가 없지만 내부적으로 fabric set에 전달됨 */
type ChangeTextStyleArg = Parameters<TuiImageEditorType['changeTextStyle']>[1] & {
  textBackgroundColor?: string;
};

/** addText 옵션. 공개 타입엔 autofocus가 없지만 내부에서 사용됨. true면 fabric 자체 편집모드가 열려 React textarea와 충돌하므로 끔 */
type AddTextOptions = Parameters<TuiImageEditorType['addText']>[1] & { autofocus?: boolean };

/** tui 내부 fabric 객체. 비율 유지(uniform scaling)를 위해 직접 접근 */
interface FabricTextObject {
  lockUniScaling?: boolean;
  setControlsVisibility?: (options: Record<string, boolean>) => void;
}
type GraphicsAccessor = { _graphics?: { getObject?: (id: number) => FabricTextObject | undefined } };

interface TextEditorProps {
  editorRef: React.RefObject<TuiImageEditorType | null>;
}

export function TextEditor(props: TextEditorProps) {
  const { editorRef } = props;
  const t = useTranslate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [textColor, setTextColor] = useState<string>(EDITOR_COLORS[0].editorHex);
  const [activeTextId, setActiveTextId] = useState<number | null>(null);
  const [textInput, setTextInput] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [decoration, setDecoration] = useState<TextDecoration>('none');
  const [bgColor, setBgColor] = useState<string>(TRANSPARENT_COLOR);

  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(Math.max(el.scrollHeight, TEXTAREA_MIN_HEIGHT), TEXTAREA_MAX_HEIGHT)}px`;
  }, []);

  /** 텍스트 객체의 크기 조절이 비율을 유지하도록 fabric 객체에 uniform scaling 적용 + 변/중간 핸들 숨김 */
  const constrainTextScaling = useCallback(
    (id: number) => {
      const fabricObj = (editorRef.current as unknown as GraphicsAccessor | null)?._graphics?.getObject?.(id);
      if (!fabricObj) return;
      fabricObj.lockUniScaling = true;
      fabricObj.setControlsVisibility?.({ mt: false, mb: false, ml: false, mr: false });
    },
    [editorRef]
  );

  const addNewText = useCallback(() => {
    const text = textInput.trimEnd();
    if (editorRef.current && text !== '') {
      editorRef.current
        .addText(text, {
          styles: {
            fill: textColor,
            fontSize: DEFAULT_FONT_SIZE,
            fontWeight: isBold ? 'bold' : 'normal',
            fontStyle: isItalic ? 'italic' : 'normal',
            textDecoration: decoration === 'none' ? '' : decoration,
            textBackgroundColor: bgColor,
          } as ChangeTextStyleArg,
          position: { x: 150, y: 150 },
          // fabric 자체 편집모드(hidden textarea)를 열지 않아 React textarea와의 desync(trailing space) 방지
          autofocus: false,
        } as AddTextOptions)
        .then((obj) => {
          setActiveTextId(obj.id);
          constrainTextScaling(obj.id);
        });
    }
  }, [editorRef, textInput, textColor, isBold, isItalic, decoration, bgColor, constrainTextScaling]);

  const handleDeleteText = useCallback(() => {
    if (editorRef.current && activeTextId) {
      editorRef.current.removeObject(activeTextId);
      setActiveTextId(null);
      setTextInput('');
      setIsEditing(false);
    }
  }, [editorRef, activeTextId]);

  const handleAddButton = useCallback(() => {
    if (isEditing && editorRef.current) {
      editorRef.current.discardSelection();
      setActiveTextId(null);
      setTextInput('');
      setIsEditing(false);
    } else {
      addNewText();
    }
  }, [isEditing, editorRef, addNewText]);

  const handleObjectActivated = useCallback(
    (obj: { type: string; id: number; text: string; fill: string }) => {
      if (obj.type === 'i-text') {
        setActiveTextId(obj.id);
        setTextInput(obj.text);
        if (obj.fill) {
          setTextColor(normalizeCanvasColor(obj.fill));
        }
        // fabric 객체에서 실제 스타일을 읽어 state 동기화 (textDecoration은 underline/linethrough boolean으로 저장됨)
        const style = editorRef.current?.getObjectProperties(obj.id, [
          'fontWeight',
          'fontStyle',
          'underline',
          'linethrough',
          'textBackgroundColor',
        ]);
        if (style) {
          setIsBold(style.fontWeight === 'bold');
          setIsItalic(style.fontStyle === 'italic');
          setDecoration(style.underline ? 'underline' : style.linethrough ? 'line-through' : 'none');
          const bg = style.textBackgroundColor;
          setBgColor(typeof bg === 'string' && bg ? normalizeCanvasColor(bg) : TRANSPARENT_COLOR);
        }
        constrainTextScaling(obj.id);
        setIsEditing(true);
      }
    },
    [editorRef, constrainTextScaling]
  );

  const handleSelectionCleared = useCallback(() => {
    setActiveTextId(null);
    setTextInput('');
    setIsEditing(false);
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.on('objectActivated', handleObjectActivated);
      editorRef.current.on('selectionCleared', handleSelectionCleared);
    }
  }, [editorRef, handleObjectActivated, handleSelectionCleared]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [textInput, adjustTextareaHeight]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setTextInput(newText);
    if (isEditing && editorRef.current && activeTextId) {
      editorRef.current.changeText(activeTextId, newText);
    }
  };

  const handleColorChange = useCallback(
    (editorHex: string) => {
      setTextColor(editorHex);
      if (editorRef.current && activeTextId) {
        editorRef.current.changeTextStyle(activeTextId, {
          fill: editorHex,
        });
      }
    },
    [editorRef, activeTextId]
  );

  // 부수효과를 setState 업데이터 밖에서 1회만 호출. (StrictMode에서 업데이터가 2회 실행되면
  // tui changeTextStyle의 토글-reset 동작과 겹쳐 적용이 상쇄되므로 주의)
  const handleToggleBold = useCallback(() => {
    const next = !isBold;
    setIsBold(next);
    if (editorRef.current && activeTextId) {
      editorRef.current.changeTextStyle(activeTextId, { fontWeight: next ? 'bold' : 'normal' });
    }
  }, [editorRef, activeTextId, isBold]);

  const handleToggleItalic = useCallback(() => {
    const next = !isItalic;
    setIsItalic(next);
    if (editorRef.current && activeTextId) {
      editorRef.current.changeTextStyle(activeTextId, { fontStyle: next ? 'italic' : 'normal' });
    }
  }, [editorRef, activeTextId, isItalic]);

  const handleSetDecoration = useCallback(
    (value: Exclude<TextDecoration, 'none'>) => {
      const next = decoration === value ? 'none' : value;
      setDecoration(next);
      if (editorRef.current && activeTextId) {
        editorRef.current.changeTextStyle(activeTextId, { textDecoration: next === 'none' ? '' : next });
      }
    },
    [editorRef, activeTextId, decoration]
  );

  const handleBgColorChange = useCallback(
    (color: string) => {
      setBgColor(color);
      if (editorRef.current && activeTextId) {
        editorRef.current.changeTextStyle(activeTextId, { textBackgroundColor: color } as ChangeTextStyleArg);
      }
    },
    [editorRef, activeTextId]
  );

  return (
    <div className='we:flex we:flex-col we:space-y-2 we:py-4 we:gap-2'>
      <div className='we:flex we:w-full we:gap-2 we:items-start'>
        <h3 className='we:text-text-normal we:text-sm we:m-0! we:min-w-[80px] we:pt-2'>{t('텍스트')}</h3>
        <div className='we:flex we:w-full we:space-x-2'>
          <Textarea
            ref={textareaRef}
            id='text-input'
            value={textInput}
            onChange={handleTextChange}
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddButton();
              }
            }}
            className='we:w-full we:min-h-[40px] we:max-h-[200px] we:resize-none we:overflow-y-auto'
            placeholder={t('내용을 입력하세요')}
            rows={1}
          />
          {!isEditing && (
            <Button
              type='button'
              variant='secondary'
              onClick={handleAddButton}
              className='we:w-[36px]'
              disabled={textInput.trim() === ''}
            >
              <Plus />
            </Button>
          )}
          {isEditing && (
            <Button type='button' variant='destructive' onClick={handleDeleteText} className='we:w-[36px]'>
              <Trash2 />
            </Button>
          )}
        </div>
      </div>

      {/* Text Style */}
      <div className='we:flex we:w-full we:gap-2 we:items-center'>
        <h3 className='we:text-text-normal we:text-sm we:m-0! we:min-w-[80px]'>{t('스타일')}</h3>
        <div className='we:flex we:items-center we:gap-3'>
          <div className='we:flex we:items-center we:gap-1'>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='we:h-7 we:w-7'
              isActive={isBold}
              onClick={handleToggleBold}
              tooltip={t('굵기')}
              aria-label={t('굵기')}
              aria-pressed={isBold}
            >
              <Bold />
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='we:h-7 we:w-7'
              isActive={isItalic}
              onClick={handleToggleItalic}
              tooltip={t('기울기')}
              aria-label={t('기울기')}
              aria-pressed={isItalic}
            >
              <Italic />
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='we:h-7 we:w-7'
              isActive={decoration === 'underline'}
              onClick={() => handleSetDecoration('underline')}
              tooltip={t('밑줄')}
              aria-label={t('밑줄')}
              aria-pressed={decoration === 'underline'}
            >
              <Underline />
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='we:h-7 we:w-7'
              isActive={decoration === 'line-through'}
              onClick={() => handleSetDecoration('line-through')}
              tooltip={t('강조')}
              aria-label={t('강조')}
              aria-pressed={decoration === 'line-through'}
            >
              <Strikethrough />
            </Button>
          </div>
        </div>
      </div>

      <div className='we:flex we:w-full we:gap-4'>
        {/* Color Picker */}
        <div className='we:flex we:w-full we:gap-2 we:items-center'>
          <h3 className='we:text-text-normal we:text-sm we:m-0! we:min-w-[80px]'>{t('텍스트 색상')}</h3>
          <div className='we:flex we:flex-wrap we:items-center we:gap-1'>
            {TEXT_COLORS.map((color) => (
              <Button
                size='icon'
                isActive={textColor === color.editorHex}
                key={color.value}
                type='button'
                className={cn(
                  'we:h-6 we:w-6 we:cursor-pointer we:rounded-full we:border we:transition-all we:m-1',
                  textColor === color.editorHex && 'we:ring-2 we:ring-brand-default we:ring-offset-1'
                )}
                style={{ backgroundColor: color.value, borderColor: color.border }}
                onClick={() => handleColorChange(color.editorHex)}
                title={color.label}
                aria-label={`${color.label} color`}
              />
            ))}
          </div>
        </div>

        {/* Background Color Picker */}
        <div className='we:flex we:w-full we:gap-2 we:items-center'>
          <h3 className='we:text-text-normal we:text-sm we:m-0! we:min-w-[80px]'>{t('배경 색상')}</h3>
          <div className='we:flex we:flex-wrap we:items-center we:gap-1'>
            {TEXT_COLORS.map((color) => (
              <Button
                size='icon'
                isActive={bgColor === color.editorHex}
                key={color.value}
                type='button'
                className={cn(
                  'we:h-6 we:w-6 we:cursor-pointer we:rounded-full we:border we:transition-all we:m-1',
                  bgColor === color.editorHex && 'we:ring-2 we:ring-brand-default we:ring-offset-1'
                )}
                style={{ backgroundColor: color.value, borderColor: color.border }}
                onClick={() => handleBgColorChange(color.editorHex)}
                title={color.label}
                aria-label={`${color.label} background color`}
              />
            ))}
            <button
              type='button'
              onClick={() => handleBgColorChange(TRANSPARENT_COLOR)}
              className={cn(
                'we:h-6 we:w-6 we:cursor-pointer we:rounded-full we:border we:border-none we:transition-all we:m-1',
                bgColor === TRANSPARENT_COLOR && 'we:ring-2 we:ring-brand-default we:ring-offset-1'
              )}
              title={t('투명')}
              aria-label={t('투명 배경')}
            >
              <Ban size={24} className='we:text-text-light' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
