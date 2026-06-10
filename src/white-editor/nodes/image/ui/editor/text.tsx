import { useCallback, useEffect, useRef, useState } from 'react';
import { Ban, Bold, Italic, Plus, Strikethrough, Trash2, Underline } from 'lucide-react';
import { Button, cn, useTranslate, Textarea } from '@/shared';
import { EDITOR_COLORS, normalizeCanvasColor, TRANSPARENT_COLOR } from '@/white-editor';
import { applyHandleScale, getDisplayInverseScale, getEditorFontFamily } from '../../util';
import type { default as TuiImageEditorType } from 'tui-image-editor';

const TEXTAREA_MIN_HEIGHT = 40;
const TEXTAREA_MAX_HEIGHT = 300;

/** 화면상 표시되는 기준 폰트 크기(px). 이미지 해상도와 무관하게 항상 이 크기로 보이도록 보정 */
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
  /** IME 조합 진행 중 여부 (조합 중에는 캔버스 동기화를 미룸) */
  const isComposingRef = useRef(false);

  const [textColor, setTextColor] = useState<string>(EDITOR_COLORS[0].editorHex);
  const [activeTextId, setActiveTextId] = useState<number | null>(null);
  /** selectionCleared 이벤트 핸들러가 매 입력마다 재등록되지 않도록 최신 activeTextId를 ref로 참조 */
  const activeTextIdRef = useRef<number | null>(null);
  useEffect(() => {
    activeTextIdRef.current = activeTextId;
  }, [activeTextId]);
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

  /** 텍스트 객체의 크기 조절이 비율을 유지하도록 fabric 객체에 uniform scaling 적용 + 변/중간 핸들 숨김 + 핸들 크기 보정 */
  const constrainTextScaling = useCallback(
    (id: number) => {
      const fabricObj = (editorRef.current as unknown as GraphicsAccessor | null)?._graphics?.getObject?.(id);
      if (!fabricObj) return;
      fabricObj.lockUniScaling = true;
      fabricObj.setControlsVisibility?.({ mt: false, mb: false, ml: false, mr: false });
      // 큰 이미지에서 선택 핸들이 작아지지 않도록 화면 표시 배율로 보정
      if (editorRef.current) applyHandleScale(editorRef.current, id);
    },
    [editorRef]
  );

  const addNewText = useCallback(() => {
    const text = textInput.trimEnd();
    if (editorRef.current && text !== '') {
      // 이미지 크기와 무관하게 화면상 항상 DEFAULT_FONT_SIZE로 보이도록 표시 배율로 폰트 크기 보정
      const fontSize = Math.round(DEFAULT_FONT_SIZE * getDisplayInverseScale(editorRef.current));
      editorRef.current
        .addText(text, {
          styles: {
            fill: textColor,
            fontSize,
            // 한글 지원 폰트로 지정 (기본 'Times New Roman'은 한글이 없어 폴백 측정·렌더 불일치로 trailing 갭 발생)
            fontFamily: getEditorFontFamily(),
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

  /** 캔버스 텍스트 끝의 공백/줄바꿈 제거. 편집 중 changeText는 trim하지 않으므로 완료 시점에 1회 정리 */
  const trimActiveTextTrailing = useCallback(() => {
    const editor = editorRef.current;
    const id = activeTextIdRef.current;
    if (!editor || !id) return;
    const objProps = editor.getObjectProperties(id, ['text']) as { text?: string };
    const text = typeof objProps?.text === 'string' ? objProps.text : '';
    const trimmed = text.replace(/\s+$/, '');
    if (trimmed !== text) editor.changeText(id, trimmed);
  }, [editorRef]);

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
      trimActiveTextTrailing();
      editorRef.current.discardSelection();
      setActiveTextId(null);
      setTextInput('');
      setIsEditing(false);
    } else {
      addNewText();
    }
  }, [isEditing, editorRef, addNewText, trimActiveTextTrailing]);

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
    trimActiveTextTrailing();
    setActiveTextId(null);
    setTextInput('');
    setIsEditing(false);
  }, [trimActiveTextTrailing]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.on('objectActivated', handleObjectActivated);
      editorRef.current.on('selectionCleared', handleSelectionCleared);
    }
  }, [editorRef, handleObjectActivated, handleSelectionCleared]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [textInput, adjustTextareaHeight]);

  /** 캔버스에는 끝 공백/줄바꿈을 제거하여 반영 (배경 색상 적용 시 trailing space가 보이는 문제 방지) */
  const applyCanvasText = (value: string) => {
    if (isEditing && editorRef.current && activeTextId) {
      editorRef.current.changeText(activeTextId, value.replace(/\s+$/, ''));
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setTextInput(newText);
    // IME 조합(한글 등) 중에는 캔버스 동기화를 미룸. 조합 중간 상태가 fabric에 들어가면 캔버스에 trailing space가 렌더되는 문제 방지
    if (!isComposingRef.current) applyCanvasText(newText);
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLTextAreaElement>) => {
    isComposingRef.current = false;
    // 조합 확정된 최종 값만 캔버스에 반영
    applyCanvasText(e.currentTarget.value);
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
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              // tui가 document에서 Backspace/Delete로 선택 객체 삭제, Ctrl+Z 등 단축키를 처리하므로
              // textarea 편집 중 키 입력이 document로 전파되지 않도록 차단 (입력 중 글자 삭제 시 객체가 지워지는 문제 방지)
              e.stopPropagation();
              // IME 조합 중 Enter는 조합 확정용이므로 추가/완료를 트리거하지 않음
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
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
              tooltip={t('취소선')}
              aria-label={t('취소선')}
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
