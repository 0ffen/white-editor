import { useCallback, useEffect, useState } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { EDITOR_COLORS } from '@/editor';
import { Button, cn, Input } from '@/shared';
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
    <div className='flex flex-col space-y-4 p-2'>
      <div className='flex flex-col space-y-2'>
        <h3 className='text-muted-foreground text-xs font-medium'>Text</h3>
        <div className='flex space-x-2'>
          <Input
            type='text'
            value={textInput}
            onChange={handleTextChange}
            onKeyDown={(e) => e.key === 'Enter' && handleAddButton()}
          />
          <Button type='button' variant={'default'} onClick={handleAddButton} className='w-10'>
            {isEditing ? <Check /> : <Plus />}
          </Button>
          <Button
            type='button'
            variant={'secondary'}
            onClick={handleDeleteText}
            disabled={!isEditing && !activeTextId}
            className='w-10'
          >
            <Trash2 className='text-muted-foreground' />
          </Button>
        </div>
      </div>

      {/* Color Picker */}
      <div className='flex flex-col space-y-2'>
        <h3 className='text-muted-foreground text-xs font-medium'>Text Color</h3>
        <div className='flex flex-wrap items-center gap-3'>
          {EDITOR_COLORS.map((color) => (
            <button
              key={color.value}
              type='button'
              className={cn(
                'h-6 w-6 cursor-pointer rounded-full border transition-all',
                textColor === color.hex && 'ring-2 ring-blue-500 ring-offset-2'
              )}
              style={{ backgroundColor: color.value, borderColor: color.border }}
              onClick={() => handleColorChange(color.hex)}
              title={color.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
