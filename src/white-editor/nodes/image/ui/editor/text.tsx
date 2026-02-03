import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, cn, getTranslate, Input } from '@/shared';
import { EDITOR_COLORS, normalizeCanvasColor } from '@/white-editor';
import type { default as TuiImageEditorType } from 'tui-image-editor';

interface TextEditorProps {
  editorRef: React.RefObject<TuiImageEditorType | null>;
}

export function TextEditor(props: TextEditorProps) {
  const { editorRef } = props;

  const [textColor, setTextColor] = useState<string>(EDITOR_COLORS[0].editorHex);
  const [activeTextId, setActiveTextId] = useState<number | null>(null);
  const [textInput, setTextInput] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);

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

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      <div className='we:flex we:w-full we:gap-2 we:h-full we:items-center'>
        <h3 className='we:text-text-normal we:text-sm we:m-0! we:min-w-[80px]'>{getTranslate('텍스트')}</h3>
        <div className='we:flex we:w-full we:space-x-2'>
          <Input
            type='text'
            value={textInput}
            onChange={handleTextChange}
            onKeyDown={(e) => e.key === 'Enter' && handleAddButton()}
            className='we:w-full we:h-[36px]'
            placeholder={getTranslate('내용을 입력하세요')}
          />
          {!isEditing && (
            <Button type='button' variant='secondary' onClick={handleAddButton} className='we:w-[36px]'>
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
        <h3 className='we:text-text-normal we:text-sm we:m-0! we:min-w-[80px]'>{getTranslate('텍스트 색상')}</h3>
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
