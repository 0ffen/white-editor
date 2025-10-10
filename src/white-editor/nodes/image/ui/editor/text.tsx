import { useCallback, useEffect, useState } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { Button, cn, Input } from '@/shared';
import { EDITOR_COLORS } from '@/white-editor';
import type { default as TuiImageEditorType } from 'tui-image-editor';

interface TextEditorProps {
  editorRef: React.RefObject<TuiImageEditorType | null>;
}

export function TextEditor(props: TextEditorProps) {
  const { editorRef } = props;

  const [textColor, setTextColor] = useState<string>('#000000');
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
    } else {
      addNewText();
    }
  }, [isEditing, editorRef, addNewText]);

  const handleObjectActivated = useCallback((obj: { type: string; id: number; text: string; fill: string }) => {
    if (obj.type === 'i-text') {
      setActiveTextId(obj.id);
      setTextInput(obj.text);
      if (obj.fill) {
        setTextColor(obj.fill);
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
    (colorHex: string) => {
      setTextColor(colorHex);
      if (editorRef.current && activeTextId) {
        editorRef.current.changeTextStyle(activeTextId, {
          fill: colorHex,
        });
      }
    },
    [editorRef, activeTextId]
  );

  return (
    <div className='we:flex we:flex-col we:space-y-4 we:p-2'>
      <div className='we:flex we:flex-col we:space-y-2'>
        <h3 className='we:text-muted-foreground we:text-xs we:font-medium'>Text</h3>
        <div className='we:flex we:space-x-2'>
          <Input
            type='text'
            value={textInput}
            onChange={handleTextChange}
            onKeyDown={(e) => e.key === 'Enter' && handleAddButton()}
          />
          <Button type='button' variant={'default'} onClick={handleAddButton} className='we:w-10'>
            {isEditing ? <Check /> : <Plus />}
          </Button>
          <Button
            type='button'
            variant={'secondary'}
            onClick={handleDeleteText}
            disabled={!isEditing && !activeTextId}
            className='we:w-10'
          >
            <Trash2 className='we:text-muted-foreground' />
          </Button>
        </div>
      </div>

      {/* Color Picker */}
      <div className='we:flex we:flex-col we:space-y-2'>
        <h3 className='we:text-muted-foreground we:text-xs we:font-medium'>Text Color</h3>
        <div className='we:flex we:flex-wrap we:items-center we:gap-3'>
          {EDITOR_COLORS.map((color) => (
            <Button
              isActive={textColor === color.hex}
              key={color.value}
              type='button'
              className={cn(
                'we:h-6 we:w-6 we:cursor-pointer we:rounded-full we:border we:transition-all',
                textColor === color.hex && 'we:ring-2 we:ring-blue-500 we:ring-offset-0'
              )}
              style={{ backgroundColor: color.value, borderColor: color.border }}
              onClick={() => handleColorChange(color.hex)}
              title={color.label}
              aria-label={`${color.label} color`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
