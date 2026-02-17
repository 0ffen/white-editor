import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, cn, useTranslate, Textarea } from '@/shared';
import { EDITOR_COLORS, normalizeCanvasColor } from '@/white-editor';
import type { default as TuiImageEditorType } from 'tui-image-editor';

const TEXTAREA_MIN_HEIGHT = 40;
const TEXTAREA_MAX_HEIGHT = 300;

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

  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(Math.max(el.scrollHeight, TEXTAREA_MIN_HEIGHT), TEXTAREA_MAX_HEIGHT)}px`;
  }, []);

  const addNewText = useCallback(() => {
    if (editorRef.current && textInput.trim() !== '') {
      editorRef.current
        .addText(textInput, {
          styles: {
            fill: textColor,
            fontSize: 40,
          },
          position: { x: 150, y: 150 },
        })
        .then((obj) => {
          setActiveTextId(obj.id);
        });
    }
  }, [editorRef, textInput, textColor]);

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

  const handleObjectActivated = useCallback((obj: { type: string; id: number; text: string; fill: string }) => {
    if (obj.type === 'i-text') {
      setActiveTextId(obj.id);
      setTextInput(obj.text);
      if (obj.fill) {
        setTextColor(normalizeCanvasColor(obj.fill));
      }
      setIsEditing(true);
    }
  }, []);

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

      {/* Color Picker */}
      <div className='we:flex we:w-full we:gap-2 we:items-center'>
        <h3 className='we:text-text-normal we:text-sm we:m-0! we:min-w-[80px]'>{t('텍스트 색상')}</h3>
        <div className='we:flex we:flex-wrap we:items-center we:gap-1'>
          {EDITOR_COLORS.map((color) => (
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
    </div>
  );
}
