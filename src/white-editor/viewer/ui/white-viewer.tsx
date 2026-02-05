import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import { cn, getHeadingsFromContent, normalizeContentSchema } from '@/shared/utils';
import { createViewerExtensions } from '@/shared/utils/extensions';
import type { HeadingItem } from '@/shared/utils/get-headings-from-content';
import type { ExtensibleEditorConfig } from '@/white-editor';
import { EditorContent, useEditor, type JSONContent } from '@tiptap/react';

import '@/shared/styles/viewer.css';

const EMPTY_DOC: JSONContent = { type: 'doc', content: [] };

const HEADING_SELECTOR = '.ProseMirror :is(h1, h2, h3, h4, h5, h6)';

/** 헤딩 텍스트를 HTML id 및 URL hash로 쓸 수 있는 slug로 변환. 중복 시 used Set에 따라 suffix 부여. */
function slugifyForId(text: string, used: Set<string>): string {
  const slug =
    text
      .trim()
      .replace(/\s+/g, '-')
      .replace(/^[^a-zA-Z가-힣0-9]+/, '')
      .replace(/[^a-zA-Z가-힣0-9_-]/g, '') || 'section';
  let id = slug;
  let n = 0;
  while (used.has(id)) {
    id = `${slug}-${++n}`;
  }
  used.add(id);
  return id;
}

export interface TableOfContentsConfig {
  /** 목차 위치. top=뷰어 상단, left/right=좌/우 사이드바. */
  position?: 'top' | 'left' | 'right';
  maxLevel?: number;
}

export interface WhiteViewerProps extends ExtensibleEditorConfig {
  /** JSONContent 또는 { content: JSONContent, html?: string } 등 래퍼 형태. 내부에서 정규화합니다. */
  content: unknown;
  className?: string;
  footer?: React.ReactNode;
  /** 목차 표시. true면 상단 기본 설정, 객체면 position/maxLevel 지정. */
  tableOfContents?: boolean | TableOfContentsConfig;
  /** 헤딩 목록과 scrollToIndex를 전달. 목차를 뷰어 밖 원하는 위치에 직접 렌더할 때 사용. */
  onHeadingsReady?: (headings: HeadingItem[], scrollToIndex: (index: number) => void) => void;
}

export const WhiteViewer = React.memo(function WhiteViewer(props: WhiteViewerProps) {
  const {
    content,
    className,
    footer,
    tableOfContents: tableOfContentsProp,
    onHeadingsReady,
    addExtensions,
    customNodes,
    overrideExtensions,
    customNodeViews,
  } = props;

  const tocConfig =
    tableOfContentsProp === true
      ? ({ position: 'top' as const, maxLevel: 4 } satisfies TableOfContentsConfig)
      : (tableOfContentsProp ?? null);

  const showHeadingAnchors = Boolean(tocConfig || onHeadingsReady);

  const containerRef = useRef<HTMLDivElement>(null);

  const extensions = useMemo(
    () => createViewerExtensions(addExtensions, customNodes, overrideExtensions, customNodeViews),
    [addExtensions, customNodes, overrideExtensions, customNodeViews]
  );

  const normalizedContent = useMemo(() => {
    try {
      return normalizeContentSchema(content);
    } catch (error) {
      console.warn('Failed to normalize content schema, using fallback:', error);
      return EMPTY_DOC;
    }
  }, [content]);

  const headings = useMemo(() => getHeadingsFromContent(normalizedContent), [normalizedContent]);

  const tocItems = useMemo(() => {
    if (!tocConfig) return [];
    const maxLevel = tocConfig.maxLevel ?? 4;
    return headings.filter((h) => h.level <= maxLevel);
  }, [headings, tocConfig]);

  const updateUrlWithHash = useCallback((id: string) => {
    const path = window.location.pathname.replace(/\/$/, '') || '';
    const hash = '#' + encodeURIComponent(id);
    const url = path
      ? window.location.origin + path + window.location.search + hash
      : window.location.origin + window.location.search + hash;
    window.history.replaceState(null, '', url);
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const nodes = container.querySelectorAll<HTMLElement>(HEADING_SELECTOR);
    const el = nodes[index];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const scrollToHeading = useCallback(
    (item: HeadingItem) => {
      const container = containerRef.current;
      if (!container) return;
      const nodes = container.querySelectorAll<HTMLElement>(HEADING_SELECTOR);
      const el = nodes[item.index];
      if (el) {
        if (el.id) {
          updateUrlWithHash(el.id);
        }
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [updateUrlWithHash]
  );

  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions,
    content: normalizedContent || { type: 'doc', content: [] },
    editorProps: {
      attributes: {
        spellcheck: 'false',
        contenteditable: 'false',
      },
    },
  });

  useEffect(() => {
    if (!onHeadingsReady || headings.length === 0) return;
    onHeadingsReady(headings, scrollToIndex);
  }, [onHeadingsReady, headings, scrollToIndex]);

  const headingAnchorsRef = useRef<{ heading: HTMLElement; button: HTMLButtonElement; onHeadingClick: () => void }[]>(
    []
  );

  useEffect(() => {
    if (!showHeadingAnchors || headings.length === 0 || !containerRef.current) return;

    const container = containerRef.current;
    const usedIds = new Set<string>();

    const run = () => {
      headingAnchorsRef.current.forEach(({ heading, button, onHeadingClick }) => {
        heading.removeEventListener('click', onHeadingClick);
        if (button.parentNode === heading) {
          heading.removeChild(button);
        }
        heading.removeAttribute('id');
      });
      headingAnchorsRef.current = [];
      usedIds.clear();

      const nodes = container.querySelectorAll<HTMLElement>(HEADING_SELECTOR);
      nodes.forEach((heading, i) => {
        const text = headings[i]?.text?.trim() || '';
        const id = slugifyForId(text || `section-${i}`, usedIds);
        heading.id = id;

        const existing = heading.querySelector('.we\\:viewer-heading-anchor');
        if (existing) return;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'we:viewer-heading-anchor';
        button.setAttribute('aria-label', '섹션 링크');
        button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
        button.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          updateUrlWithHash(heading.id);
          heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        const onHeadingClick = () => {
          updateUrlWithHash(heading.id);
          heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        heading.addEventListener('click', onHeadingClick);

        heading.appendChild(button);
        headingAnchorsRef.current.push({ heading, button, onHeadingClick });
      });

      const hash = window.location.hash?.slice(1);
      if (hash) {
        const decoded = decodeURIComponent(hash);
        const el = container.querySelector(`#${CSS.escape(decoded)}`);
        if (el) {
          (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    const raf = requestAnimationFrame(run);
    return () => {
      cancelAnimationFrame(raf);
      headingAnchorsRef.current.forEach(({ heading, button, onHeadingClick }) => {
        heading.removeEventListener('click', onHeadingClick);
        if (button.parentNode === heading) {
          heading.removeChild(button);
        }
        heading.removeAttribute('id');
      });
      headingAnchorsRef.current = [];
    };
  }, [editor, normalizedContent, showHeadingAnchors, headings, updateUrlWithHash]);

  const contentArea = (
    <>
      <EditorContent
        editor={editor}
        className={cn('readonly we:prose we:dark:prose-invert we:max-w-full we:h-full markdown')}
      />
      {footer && <>{footer}</>}
    </>
  );

  const hasBuiltInToc = tocConfig && tocItems.length > 0;

  if (!hasBuiltInToc) {
    return (
      <div ref={containerRef} className={cn('white-editor viewer', className)}>
        {contentArea}
      </div>
    );
  }

  const position = tocConfig.position ?? 'top';
  const tocSidebar = (
    <nav
      className={cn(
        'we:viewer-toc',
        position === 'top' && 'we:viewer-toc-top',
        position === 'left' && 'we:viewer-toc-left',
        position === 'right' && 'we:viewer-toc-right'
      )}
      aria-label='목차'
    >
      <ul className='we:viewer-toc-list'>
        {tocItems.map((item) => (
          <li key={item.index} className='we:viewer-toc-item' style={{ ['--we-toc-level' as string]: item.level }}>
            <button type='button' className='we:viewer-toc-link' onClick={() => scrollToHeading(item)}>
              {item.text || '(제목 없음)'}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );

  if (position === 'top') {
    return (
      <div ref={containerRef} className={cn('white-editor viewer we:viewer-with-toc we:viewer-toc-top', className)}>
        {tocSidebar}
        <div className='we:viewer-body'>{contentArea}</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('white-editor viewer we:viewer-with-toc', className)}>
      {position === 'left' ? (
        <>
          {tocSidebar}
          <div className='we:viewer-body'>{contentArea}</div>
        </>
      ) : (
        <>
          <div className='we:viewer-body'>{contentArea}</div>
          {tocSidebar}
        </>
      )}
    </div>
  );
});
