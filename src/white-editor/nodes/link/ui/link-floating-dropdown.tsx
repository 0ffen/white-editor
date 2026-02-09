import * as React from 'react';

import { getTranslate } from '@/shared';
import { Popover, PopoverContent, PopoverAnchor } from '@/shared/components';
import { useTiptapEditor } from '@/shared/hooks';
import { cn } from '@/shared/utils';
import { useLinkPopover, LinkMain } from '@/white-editor';
import type { Editor } from '@tiptap/react';

export interface LinkFloatingDropdownProps {
  editor?: Editor | null;
  className?: string;
}

export function LinkFloatingDropdown({ editor: providedEditor, className }: LinkFloatingDropdownProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = React.useState(false);
  const [isPositionReady, setIsPositionReady] = React.useState(false);
  const [localUrl, setLocalUrl] = React.useState<string>('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const hoveredLinkRef = React.useRef<HTMLElement | null>(null);
  const clickedLinkRef = React.useRef<HTMLElement | null>(null);
  const toolbarButtonClickRef = React.useRef<boolean>(false);
  const isHoveringDropdownRef = React.useRef<boolean>(false);

  const { isActive, url, removeLink } = useLinkPopover({
    editor,
    hideWhenUnavailable: false,
  });

  // 드롭다운이 열릴 때 현재 링크 URL을 로컬 상태로 초기화
  const prevIsVisibleRef = React.useRef(false);
  React.useLayoutEffect(() => {
    // 드롭다운이 처음 열릴 때만 초기화 (입력 중에는 덮어쓰지 않음)
    if (isVisible && !prevIsVisibleRef.current && isActive && url) {
      setLocalUrl(url);
    } else if (!isVisible) {
      // 드롭다운이 닫히면 로컬 상태 초기화
      setLocalUrl('');
    }
    prevIsVisibleRef.current = isVisible;
  }, [isVisible, isActive, url]);

  // 드롭다운이 열려 있을 때는 항상 로컬 상태 사용 (빈 문자열도 표시해 수정 시 지울 수 있음)
  const currentUrl = React.useMemo(() => {
    if (isVisible) return localUrl;
    return isActive && url ? url : url || '';
  }, [isVisible, localUrl, isActive, url]);

  // 로컬 URL 업데이트 함수 - 드롭다운이 열려있을 때는 로컬 상태만 사용
  // useLinkPopover의 selectionUpdate가 입력 중인 값을 덮어쓰지 않도록 함
  const handleSetUrl: React.Dispatch<React.SetStateAction<string | null>> = React.useCallback(
    (value: React.SetStateAction<string | null>) => {
      const newValue = typeof value === 'function' ? value(localUrl || null) : value;
      setLocalUrl(newValue || '');
    },
    [localUrl]
  );

  const anchorRef = React.useRef<HTMLDivElement>(null);

  // 플로팅 툴바의 링크 버튼 클릭 시: 항상 선택 영역 아래에 드롭다운 노출 (첫 입력/수정 동일)
  React.useEffect(() => {
    if (!editor) return;

    const handleToolbarLinkClick = () => {
      const { state } = editor;
      const { selection } = state;
      const { from, to } = selection;
      if (from === to) return;

      toolbarButtonClickRef.current = true;

      // 링크 수정 시 참조용 (표시 조건 등)
      if (editor.isActive('link')) {
        const domFrom = editor.view.domAtPos(from);
        let node: Node | null = domFrom.node;
        if (node?.nodeType === Node.TEXT_NODE) node = node.parentElement;
        if (node?.nodeType === Node.ELEMENT_NODE) {
          const linkEl = (node as HTMLElement).closest('a[href]') as HTMLElement | null;
          if (linkEl) {
            clickedLinkRef.current = linkEl;
            hoveredLinkRef.current = linkEl;
          }
        }
      }
    };

    window.addEventListener('link-toolbar-button-click', handleToolbarLinkClick);
    return () => window.removeEventListener('link-toolbar-button-click', handleToolbarLinkClick);
  }, [editor]);

  // 선택 변경 시: 드롭다운이 열려 있으면 위치만 갱신, 링크 밖으로 나가면 닫기
  React.useEffect(() => {
    if (!editor) return;

    const updatePosition = () => {
      // 링크가 아니고 툴바 클릭으로 연 것도 아니면 닫기
      if (!editor.isActive('link') && !toolbarButtonClickRef.current) {
        setIsVisible(false);
        setIsPositionReady(false);
        clickedLinkRef.current = null;
        hoveredLinkRef.current = null;
        toolbarButtonClickRef.current = false;
        window.dispatchEvent(new CustomEvent('link-dropdown-close'));
        window.dispatchEvent(new CustomEvent('link-hover-end'));
        return;
      }

      // 링크인데 드롭다운이 열려 있음: 클릭된 링크가 DOM에 없으면 닫기
      if (clickedLinkRef.current && !editor.view.dom.contains(clickedLinkRef.current)) {
        setIsVisible(false);
        setIsPositionReady(false);
        clickedLinkRef.current = null;
        hoveredLinkRef.current = null;
        toolbarButtonClickRef.current = false;
        window.dispatchEvent(new CustomEvent('link-dropdown-close'));
        window.dispatchEvent(new CustomEvent('link-hover-end'));
      }
    };

    updatePosition();
    editor.on('selectionUpdate', updatePosition);
    return () => {
      editor.off('selectionUpdate', updatePosition);
    };
  }, [editor, isVisible, isPositionReady]);

  // 드래그 시작 시 드롭다운 닫기
  React.useEffect(() => {
    if (!editor) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (!isVisible) return;

      const target = event.target as HTMLElement;
      const linkElement = target.closest('a[href]') as HTMLElement | null;

      if (linkElement) {
        // 드래그 시작 시 드롭다운 닫기 (약간의 지연을 두어 SelectionToolbar가 나타나도록 함)
        setTimeout(() => {
          setIsVisible(false);
          setIsPositionReady(false);
          clickedLinkRef.current = null;
          hoveredLinkRef.current = null;
          toolbarButtonClickRef.current = false;
          window.dispatchEvent(new CustomEvent('link-dropdown-close'));
          window.dispatchEvent(new CustomEvent('link-hover-end'));
        }, 50);
      }
    };

    const editorDom = editor.view.dom;
    editorDom.addEventListener('mousedown', handleMouseDown);

    return () => {
      editorDom.removeEventListener('mousedown', handleMouseDown);
    };
  }, [editor, isVisible]);

  // 외부 클릭 시 드롭다운 닫기
  React.useEffect(() => {
    if (!isVisible) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;

      // 드롭다운 내부 클릭이면 무시
      if (dropdownRef.current?.contains(target)) return;

      // 링크 클릭이면 무시
      if (clickedLinkRef.current?.contains(target as HTMLElement)) return;

      // 툴바 내부 클릭이면 무시
      const isInsideToolbar = (target as Element).closest?.('[role="toolbar"]');
      if (isInsideToolbar) return;

      setIsVisible(false);
      clickedLinkRef.current = null;
      hoveredLinkRef.current = null;
      toolbarButtonClickRef.current = false;
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isVisible]);

  const handleSetLink = React.useCallback(() => {
    const urlToSet = (localUrl || url || '').trim();
    if (!editor) {
      setLocalUrl('');
      setIsVisible(false);
      return;
    }
    if (!urlToSet) {
      setLocalUrl('');
      setIsVisible(false);
      return;
    }

    const { selection } = editor.state;
    const isEmpty = selection.empty;
    const chain = editor.chain().focus().extendMarkRange('link').setLink({ href: urlToSet });
    if (isEmpty) chain.insertContent({ type: 'text', text: urlToSet });
    chain.run();

    setLocalUrl('');
    setIsVisible(false);
    setIsPositionReady(false);
    clickedLinkRef.current = null;
    hoveredLinkRef.current = null;
    toolbarButtonClickRef.current = false;
    window.dispatchEvent(new CustomEvent('link-dropdown-close'));
    window.dispatchEvent(new CustomEvent('link-hover-end'));

    setTimeout(() => {
      editor.commands.blur();
      const { selection: currentSelection } = editor.state;
      if (!currentSelection.empty) editor.commands.setTextSelection(currentSelection.from);
    }, 10);
  }, [editor, localUrl, url]);

  const handleRemoveLink = React.useCallback(() => {
    removeLink();
    setIsVisible(false);
    setIsPositionReady(false);
    clickedLinkRef.current = null;
    hoveredLinkRef.current = null;
    toolbarButtonClickRef.current = false;
    window.dispatchEvent(new CustomEvent('link-dropdown-close'));
    window.dispatchEvent(new CustomEvent('link-hover-end'));
  }, [removeLink]);

  const handleOpenChange = React.useCallback((open: boolean) => {
    // 팝오버가 닫히려고 할 때, 드롭다운에 호버 중이거나 링크에 호버 중이면 닫지 않음
    if (!open) {
      // 드롭다운에 호버 중이거나 링크에 호버 중이면 닫지 않음
      if (isHoveringDropdownRef.current || hoveredLinkRef.current || clickedLinkRef.current) {
        // 강제로 다시 열기
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
        return;
      }
      // 드롭다운 닫힘 이벤트 발생
      setIsPositionReady(false);
      window.dispatchEvent(new CustomEvent('link-dropdown-close'));
      window.dispatchEvent(new CustomEvent('link-hover-end'));
    } else {
      // 드롭다운 열림 이벤트 발생
      window.dispatchEvent(new CustomEvent('link-dropdown-open'));
    }
    setIsVisible(open);
  }, []);

  // 플로팅 툴바 버튼 클릭으로 열린 경우 또는 링크가 활성화된 경우 표시
  const shouldShow = isVisible && (clickedLinkRef.current || toolbarButtonClickRef.current || isActive);
  if (!editor || !shouldShow) return null;

  return (
    <Popover open={isVisible} onOpenChange={handleOpenChange}>
      <PopoverAnchor
        ref={anchorRef}
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          visibility: 'hidden',
        }}
      />
      <PopoverContent
        ref={(node) => {
          dropdownRef.current = node;
        }}
        align='start'
        side='bottom'
        sideOffset={4}
        className={cn(
          'we:w-[240px] we:rounded-lg we:p-1.5 we:shadow-lg',
          !isPositionReady && 'we:opacity-0',
          className
        )}
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          if (
            dropdownRef.current?.contains(target) ||
            hoveredLinkRef.current?.contains(target) ||
            isHoveringDropdownRef.current
          ) {
            e.preventDefault();
          }
        }}
        onMouseEnter={() => {
          isHoveringDropdownRef.current = true;
        }}
        onMouseLeave={(e) => {
          // relatedTarget이 링크나 드롭다운 내부가 아니면 호버 상태 해제
          const relatedTarget = e.relatedTarget as HTMLElement;
          if (!hoveredLinkRef.current?.contains(relatedTarget) && !dropdownRef.current?.contains(relatedTarget)) {
            isHoveringDropdownRef.current = false;
          }
        }}
      >
        <LinkMain
          url={currentUrl}
          setUrl={handleSetUrl}
          setLink={handleSetLink}
          removeLink={handleRemoveLink}
          isActive={isActive || !!clickedLinkRef.current}
          placeholder={getTranslate('링크를 입력하세요')}
        />
      </PopoverContent>
    </Popover>
  );
}

LinkFloatingDropdown.displayName = 'LinkFloatingDropdown';
