import * as React from 'react';
import type { Editor } from '@tiptap/react';

type Orientation = 'horizontal' | 'vertical' | 'both';

interface MenuNavigationOptions<T> {
  editor?: Editor | null;
  containerRef?: React.RefObject<HTMLElement | null>; //키보드 이벤트를 처리할 컨테이너 요소의 ref.
  query?: string; // 선택된 아이템에 영향을 주는 검색 쿼리
  items: T[]; //탐색할 아이템 배열.
  onSelect?: (item: T) => void;
  onClose?: () => void;
  orientation?: Orientation; //메뉴의 탐색 방향. default: "vertical"
  autoSelectFirstItem?: boolean; //메뉴가 열릴 때 첫 번째 아이템을 자동으로 선택할지 여부. default: true
}

/**
 * @name useMenuNavigation
 * @description
 * 드롭다운 메뉴 및 커맨드 팔레트의 키보드 탐색을 구현하는 훅.
 *
 * 방향키, 탭, 홈/엔드, 엔터(선택), ESC(닫기) 키 처리
 * Tiptap 에디터와 일반 DOM 요소 모두에서 동작
 *
 * @param options - 메뉴 탐색을 위한 설정 옵션
 * @returns 선택된 인덱스와 setter 함수가 포함된 객체
 */
export function useMenuNavigation<T>({
  editor,
  containerRef,
  query,
  items,
  onSelect,
  onClose,
  orientation = 'vertical',
  autoSelectFirstItem = true,
}: MenuNavigationOptions<T>) {
  const [selectedIndex, setSelectedIndex] = React.useState<number>(autoSelectFirstItem ? 0 : -1);

  React.useEffect(() => {
    const handleKeyboardNavigation = (event: KeyboardEvent) => {
      if (!items.length) return false;

      const moveNext = () =>
        setSelectedIndex((currentIndex) => {
          if (currentIndex === -1) return 0;
          return (currentIndex + 1) % items.length;
        });

      const movePrev = () =>
        setSelectedIndex((currentIndex) => {
          if (currentIndex === -1) return items.length - 1;
          return (currentIndex - 1 + items.length) % items.length;
        });

      switch (event.key) {
        case 'ArrowUp': {
          // 수평 메뉴에서는 무시
          if (orientation === 'horizontal') return false;
          event.preventDefault();
          movePrev();
          return true;
        }

        case 'ArrowDown': {
          // 수평 메뉴에서는 무시
          if (orientation === 'horizontal') return false;
          event.preventDefault();
          moveNext();
          return true;
        }

        case 'ArrowLeft': {
          // 수직 메뉴에서는 무시
          if (orientation === 'vertical') return false;
          event.preventDefault();
          movePrev();
          return true;
        }

        case 'ArrowRight': {
          // 수직 메뉴에서는 무시
          if (orientation === 'vertical') return false;
          event.preventDefault();
          moveNext();
          return true;
        }

        case 'Tab': {
          event.preventDefault();
          if (event.shiftKey) {
            movePrev();
          } else {
            moveNext();
          }
          return true;
        }

        case 'Home': {
          event.preventDefault();
          setSelectedIndex(0);
          return true;
        }

        case 'End': {
          event.preventDefault();
          setSelectedIndex(items.length - 1);
          return true;
        }

        case 'Enter': {
          if (event.isComposing) return false;
          event.preventDefault();
          if (selectedIndex !== -1 && items[selectedIndex]) {
            onSelect?.(items[selectedIndex]);
          }
          return true;
        }

        case 'Escape': {
          event.preventDefault();
          onClose?.();
          return true;
        }

        default:
          return false;
      }
    };

    let targetElement: HTMLElement | null = null;

    if (editor) {
      targetElement = editor.view.dom;
    } else if (containerRef?.current) {
      targetElement = containerRef.current;
    }

    if (targetElement) {
      targetElement.addEventListener('keydown', handleKeyboardNavigation, true);

      return () => {
        targetElement?.removeEventListener('keydown', handleKeyboardNavigation, true);
      };
    }

    return undefined;
  }, [editor, containerRef, items, selectedIndex, onSelect, onClose, orientation]);

  React.useEffect(() => {
    // 쿼리가 변경되면 선택 인덱스 초기화
    if (query) {
      setSelectedIndex(autoSelectFirstItem ? 0 : -1);
    }
  }, [query, autoSelectFirstItem]);

  return {
    selectedIndex: items.length ? selectedIndex : undefined,
    setSelectedIndex,
  };
}
