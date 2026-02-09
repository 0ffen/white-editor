import * as React from 'react';

import { FloatingToolbar, Separator } from '@/shared/components';
import { useTiptapEditor } from '@/shared/hooks';
import { cn } from '@/shared/utils';
import { ColorPopover, MarkButton, HighlightPopover, LinkPopover, CodeBlockButton } from '@/white-editor';
import { TextSelection } from '@tiptap/pm/state';
import type { Editor } from '@tiptap/react';

export interface SelectionToolbarProps {
  editor?: Editor | null;
  className?: string;
}

/** 선택 영역의 bounding rect를 가져오는 함수 */
function getSelectionBoundingRect(editor: Editor | null): DOMRect | null {
  if (!editor) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return null;

    return range.getBoundingClientRect();
  }

  // Tiptap 에디터의 선택 범위를 직접 사용
  const { state } = editor;
  const { selection } = state;
  const { from, to } = selection;

  if (from === to) return null;

  try {
    // Tiptap의 posToDOMRect를 사용하여 선택 범위의 DOM 위치 계산
    const startRect = editor.view.coordsAtPos(from);
    const endRect = editor.view.coordsAtPos(to);

    // 선택 범위의 bounding rect 계산
    const top = Math.min(startRect.top, endRect.top);
    const bottom = Math.max(startRect.bottom, endRect.bottom);
    const left = Math.min(startRect.left, endRect.left);
    const right = Math.max(startRect.right, endRect.right);

    return {
      top,
      bottom,
      left,
      right,
      width: right - left,
      height: bottom - top,
      x: left,
      y: top,
      toJSON: () => ({}),
    } as DOMRect;
  } catch {
    // 실패 시 window.getSelection() 사용
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return null;

    return range.getBoundingClientRect();
  }
}

/** 텍스트 선택이 유효한지 확인하는 함수 */
function isTextSelectionValid(editor: Editor): boolean {
  const { state } = editor;
  const { selection } = state;

  // 빈 선택이면 무효
  if (selection.empty) return false;

  // TextSelection이 아니면 무효 (NodeSelection 등 제외)
  if (!(selection instanceof TextSelection)) return false;

  // 코드블록 내부면 무효
  if (editor.isActive('codeBlock')) return false;

  // 이미지가 선택된 경우 무효
  if (editor.isActive('image')) return false;

  // 링크가 활성화되어 있어도 사용자가 드래그한 경우 플로팅 툴바 표시
  // (호버 상태는 isLinkHovered로 별도 관리)

  return true;
}

/** 드래그 후 플로팅 툴바를 보여주기까지 지연(ms) */
const TOOLBAR_SHOW_DELAY_MS = 300;

const FADE_DURATION_MS = 200;

export function SelectionToolbar({ editor: providedEditor, className }: SelectionToolbarProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = React.useState(false);
  const [isLinkHovered, setIsLinkHovered] = React.useState(false);
  const [isFadedIn, setIsFadedIn] = React.useState(false);
  const showDelayTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const getAnchorRect = React.useCallback(() => (editor ? getSelectionBoundingRect(editor) : null), [editor]);

  // 툴바가 보일 때 fade-in 트리거, 숨겨질 때 리셋
  React.useEffect(() => {
    if (!isVisible) {
      setIsFadedIn(false);
      return;
    }
    const id = requestAnimationFrame(() => {
      setIsFadedIn(true);
    });
    return () => cancelAnimationFrame(id);
  }, [isVisible]);

  // 링크 호버 드롭다운 상태 추적
  React.useEffect(() => {
    const handleLinkDropdownOpen = () => {
      setIsLinkHovered(true);
    };

    const handleLinkDropdownClose = () => {
      setIsLinkHovered(false);
    };

    window.addEventListener('link-hover-start', handleLinkDropdownOpen);
    window.addEventListener('link-hover-end', handleLinkDropdownClose);
    window.addEventListener('link-dropdown-open', handleLinkDropdownOpen);
    window.addEventListener('link-dropdown-close', handleLinkDropdownClose);

    return () => {
      window.removeEventListener('link-hover-start', handleLinkDropdownOpen);
      window.removeEventListener('link-hover-end', handleLinkDropdownClose);
      window.removeEventListener('link-dropdown-open', handleLinkDropdownOpen);
      window.removeEventListener('link-dropdown-close', handleLinkDropdownClose);
    };
  }, []);

  // 선택 변경 시: 유효하면 지연 후 표시, 무효하면 즉시 숨김
  React.useEffect(() => {
    if (!editor) return;

    const updateFloating = () => {
      if (showDelayTimerRef.current) {
        clearTimeout(showDelayTimerRef.current);
        showDelayTimerRef.current = null;
      }

      if (isLinkHovered) {
        setIsVisible(false);
        return;
      }

      const isValid = isTextSelectionValid(editor);
      const rect = getSelectionBoundingRect(editor);

      if (!isValid || !rect || rect.width === 0) {
        setIsVisible(false);
        return;
      }

      showDelayTimerRef.current = setTimeout(() => {
        showDelayTimerRef.current = null;
        if (!editor.isDestroyed && isTextSelectionValid(editor) && getSelectionBoundingRect(editor)) {
          setIsVisible(true);
        }
      }, TOOLBAR_SHOW_DELAY_MS);
    };

    editor.on('selectionUpdate', updateFloating);

    return () => {
      editor.off('selectionUpdate', updateFloating);
      if (showDelayTimerRef.current) {
        clearTimeout(showDelayTimerRef.current);
        showDelayTimerRef.current = null;
      }
    };
  }, [editor, isLinkHovered]);

  // 스크롤/리사이즈 시 선택 영역이 에디터 영역 밖이면 툴바 숨김
  React.useEffect(() => {
    if (!editor || !isVisible) return;

    const MARGIN = 24;

    /** 에디터가 렌더된 컨테이너 요소 (스크롤 가능한 부모 또는 직계 부모) */
    const getEditorContainer = (): HTMLElement | null => {
      let el: HTMLElement | null = editor.view.dom?.parentElement ?? null;
      while (el && el !== document.body) {
        const { overflowY } = getComputedStyle(el);
        if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
          return el;
        }
        el = el.parentElement;
      }
      return editor.view.dom?.parentElement ?? null;
    };

    const hideIfOutOfEditorArea = () => {
      if (editor.isDestroyed) return;
      const rect = getSelectionBoundingRect(editor);
      if (!rect) {
        setIsVisible(false);
        return;
      }
      const container = getEditorContainer();
      if (!container) return;

      const editorRect = container.getBoundingClientRect();
      const inEditorArea =
        rect.bottom >= editorRect.top - MARGIN &&
        rect.top <= editorRect.bottom + MARGIN &&
        rect.right >= editorRect.left - MARGIN &&
        rect.left <= editorRect.right + MARGIN;
      if (!inEditorArea) setIsVisible(false);
    };

    window.addEventListener('scroll', hideIfOutOfEditorArea, true);
    window.addEventListener('resize', hideIfOutOfEditorArea);

    const scrollParents: HTMLElement[] = [];
    let el: HTMLElement | null = editor.view.dom?.parentElement ?? null;
    while (el && el !== document.body) {
      scrollParents.push(el);
      el.addEventListener('scroll', hideIfOutOfEditorArea, true);
      el = el.parentElement;
    }

    return () => {
      window.removeEventListener('scroll', hideIfOutOfEditorArea, true);
      window.removeEventListener('resize', hideIfOutOfEditorArea);
      scrollParents.forEach((parent) => {
        parent.removeEventListener('scroll', hideIfOutOfEditorArea, true);
      });
    };
  }, [editor, isVisible]);

  if (!editor) return null;

  return (
    <FloatingToolbar
      isOpen={isVisible}
      getAnchorRect={getAnchorRect}
      placement='top'
      offset={{ y: 8 }}
      className={cn(className)}
      style={{
        opacity: isFadedIn ? 1 : 0,
        transition: `opacity ${FADE_DURATION_MS}ms ease-out`,
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* 색상 */}
      <ColorPopover editor={editor} />

      <Separator orientation='vertical' className='we:h-4! we:mx-1' />

      {/* 텍스트 서식 */}
      <MarkButton editor={editor} type='bold' />
      <MarkButton editor={editor} type='italic' />
      <MarkButton editor={editor} type='strike' />
      <MarkButton editor={editor} type='underline' />
      <HighlightPopover editor={editor} />
      <LinkPopover editor={editor} autoOpenOnLinkActive={false} />

      <Separator orientation='vertical' className='we:h-4! we:mx-1' />

      {/* 코드 */}
      <MarkButton editor={editor} type='code' />
      <CodeBlockButton editor={editor} />
    </FloatingToolbar>
  );
}

SelectionToolbar.displayName = 'SelectionToolbar';
