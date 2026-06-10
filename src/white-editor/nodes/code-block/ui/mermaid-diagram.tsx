'use client';

import React from 'react';
import { useTranslate } from '@/shared';
import { cn } from '@/shared/utils';
import { MermaidViewerModal } from './mermaid-viewer-modal';

let mermaidIdSeq = 0;
let elkRegistered = false;

const MERMAID_FONT_SIZE = '14px';

function readVar(style: CSSStyleDeclaration, name: string, fallback: string): string {
  const value = style.getPropertyValue(name).trim();
  return value || fallback;
}

function buildMermaidConfig(el: HTMLElement | null) {
  const target = el ?? document.documentElement;
  const style = getComputedStyle(target);

  const nodeBg = readVar(style, '--we-elevation-level1', '#f1f1f1'); // 박스 배경 (연한 회색)
  const nodeBorder = readVar(style, '--we-border-default', '#e6e6e6'); // 얇은 보더
  const textColor = readVar(style, '--we-text-normal', '#161616'); // 본문 텍스트
  const lineColor = readVar(style, '--we-text-light', '#9f9f9f'); // 엣지/화살표
  const clusterBg = readVar(style, '--we-elevation-level1', '#f8f8f8'); // 서브그래프 배경
  const fontFamily = readVar(style, '--we-font-family-base', 'sans-serif');

  const themeVariables = {
    background: 'transparent',
    mainBkg: nodeBg,
    primaryColor: nodeBg,
    primaryBorderColor: nodeBorder,
    primaryTextColor: textColor,
    secondaryColor: clusterBg,
    secondaryBorderColor: nodeBorder,
    secondaryTextColor: textColor,
    tertiaryColor: clusterBg,
    tertiaryBorderColor: nodeBorder,
    tertiaryTextColor: textColor,
    nodeBorder: nodeBorder,
    nodeTextColor: textColor,
    lineColor: lineColor,
    textColor: textColor,
    clusterBkg: clusterBg,
    clusterBorder: nodeBorder,
    edgeLabelBackground: clusterBg,
    fontFamily: fontFamily,
    fontSize: MERMAID_FONT_SIZE,
  };

  // 라벨 텍스트 색상/폰트 크기
  const themeCSS = `
    .nodeLabel, .edgeLabel, .cluster-label, .label, .titleText { color: ${textColor} !important; fill: ${textColor} !important; }
    .nodeLabel *, .edgeLabel *, .cluster-label * { color: ${textColor} !important; }
    text, tspan { fill: ${textColor} !important; }
    .nodeLabel, .edgeLabel, .cluster-label, .label, .titleText,
    .nodeLabel p, .edgeLabel p, .cluster-label p, .label p { font-size: ${MERMAID_FONT_SIZE} !important; }
    .nodeLabel p, .edgeLabel p, .cluster-label p, .label p { margin: 0 !important; line-height: 1.3 !important; }
  `;

  return { themeVariables, themeCSS, fontFamily };
}

interface MermaidDiagramProps {
  code: string;
  className?: string;
  /** true이면 다이어그램 클릭 시 확대 모달을 연다 (뷰어 모드 전용) */
  zoomable?: boolean;
}

/**
 * mermaid 소스 코드를 SVG 다이어그램으로 렌더링한다.
 * - 색상은 디자인 토큰(--we-*)에서 읽어와 다크/라이트 테마와 노션 스타일을 따른다.
 * - 구문 오류 시 에러 메시지를 노출한다.
 * - SSR 환경에서는 NodeView 자체가 마운트되지 않으므로 브라우저 전용으로 동작한다.
 */
export const MermaidDiagram = ({ code, className, zoomable = false }: MermaidDiagramProps) => {
  const t = useTranslate();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [svg, setSvg] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  // 다크/라이트 전환 시 재렌더를 유발하기 위한 버전 카운터
  const [themeVersion, setThemeVersion] = React.useState<number>(0);
  const idRef = React.useRef<string>(`we-mermaid-${(mermaidIdSeq += 1)}`);

  // 다크/라이트 전환을 감지해 다이어그램을 다시 렌더한다.
  // 테마는 .dark 클래스 + 인라인 CSS 변수(--we-*) 형태로 `.white-editor` 래퍼(또는 documentElement)에 적용되므로,
  // 가장 가까운 .white-editor 래퍼와 documentElement의 class·style 변화를 모두 감시한다. (style: 인라인 CSS 변수 변경 감지)
  React.useEffect(() => {
    if (typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(() => setThemeVersion((v) => v + 1));
    const opts: MutationObserverInit = { attributes: true, attributeFilter: ['class', 'style'] };
    const themedWrapper = containerRef.current?.closest('.white-editor');
    if (themedWrapper) observer.observe(themedWrapper, opts);
    observer.observe(document.documentElement, opts);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    const source = code.trim();

    if (!source) {
      setSvg('');
      setError(null);
      return;
    }

    const timer = setTimeout(() => {
      const { themeVariables, themeCSS, fontFamily } = buildMermaidConfig(containerRef.current);

      Promise.all([import('mermaid'), import('@mermaid-js/layout-elk')])
        .then(async ([{ default: mermaid }, { default: elkLayouts }]) => {
          // ELK 레이아웃 엔진 등록 (1회) → subgraph direction과 고립 노드를 조밀하게 배치 (노션 스타일)
          if (!elkRegistered) {
            mermaid.registerLayoutLoaders(elkLayouts);
            elkRegistered = true;
          }

          const baseConfig = {
            startOnLoad: false,
            securityLevel: 'strict' as const,
            theme: 'base' as const,
            fontFamily,
            themeVariables,
            themeCSS,
            htmlLabels: false,
            flowchart: { htmlLabels: false, useMaxWidth: true },
          };

          mermaid.initialize({ ...baseConfig, layout: 'elk' });
          await mermaid.parse(source);

          const renderWith = (layout: 'elk' | 'dagre') => {
            mermaid.initialize({ ...baseConfig, layout });
            return mermaid.render(idRef.current, source);
          };

          let rendered: string;
          try {
            ({ svg: rendered } = await renderWith('elk'));
          } catch {
            document.getElementById(`d${idRef.current}`)?.remove();
            document.getElementById(idRef.current)?.remove();
            ({ svg: rendered } = await renderWith('dagre'));
          }

          if (!cancelled) {
            setSvg(rendered);
            setError(null);
          }
        })
        .catch((e: unknown) => {
          // mermaid는 렌더 실패 시 임시 측정 노드(#d{id})와 에러 다이어그램을 DOM에 남긴다.
          // 우리 자체 에러 UI만 보여주기 위해 잔여 노드를 제거한다.
          document.getElementById(`d${idRef.current}`)?.remove();
          document.getElementById(idRef.current)?.remove();
          if (!cancelled) {
            setSvg('');
            setError(e instanceof Error ? e.message : String(e));
          }
        });
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [code, themeVersion]);

  if (!code.trim()) {
    return (
      <div ref={containerRef} className={cn('we:text-text-light we:py-6 we:text-center we:text-sm', className)}>
        {t('다이어그램을 입력하세요')}
      </div>
    );
  }

  if (error) {
    return (
      <div ref={containerRef} className={cn('we:py-4 we:px-4', className)}>
        <p className='we:text-red-default we:text-sm we:font-medium'>{t('다이어그램 구문 오류')}</p>
        <pre className='we:text-text-light we:mt-2 we:text-xs we:break-words we:whitespace-pre-wrap'>{error}</pre>
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className={cn(
          'we:flex we:justify-center we:overflow-x-auto we:py-4',
          zoomable && 'we:cursor-zoom-in',
          className
        )}
        onClick={
          zoomable
            ? (e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }
            : undefined
        }
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {zoomable && <MermaidViewerModal open={isModalOpen} onOpenChange={setIsModalOpen} svg={svg} />}
    </>
  );
};
