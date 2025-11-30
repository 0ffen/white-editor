import type { ComponentType } from 'react';
import type React from 'react';
import type { MentionConfig, ToolbarItem, ToolbarItemProps } from '@/white-editor';
import type { Node as TipTapNode } from '@tiptap/core';
import type { EditorProps } from '@tiptap/pm/view';
import type { Content, JSONContent, Extension } from '@tiptap/react';

import type { Editor } from '@tiptap/react';

interface EditorExtensions<T = Record<string, unknown>, P = Record<string, unknown>> {
  mention?: MentionConfig<T>;
  pageMention?: {
    data: P[];
    id: keyof P;
    title: keyof P;
    href: keyof P;
    path?: keyof P; // 경로 정보 (optional)
    icon?: keyof P; // 아이콘 (optional)
    renderLabel?: (item: P) => React.ReactNode; // 커스텀 제목 렌더링 (optional)
  };
  character?: {
    show?: boolean;
    limit?: number;
    className?: string;
  };
  imageUpload?: {
    upload?: (file: File) => Promise<string>;
    onError?: (error: Error) => void;
    onSuccess?: (url: string) => void;
  };
}

interface WhiteEditorUIProps {
  editorClassName?: string;
  contentClassName?: string;
  toolbarItems?: ToolbarItem[][];
  toolbarProps?: ToolbarItemProps;
  theme?: 'light' | 'dark';
  footer?: React.ReactNode;
  disabled?: boolean;
  placeholder?: string;
  showToolbar?: boolean;
}

interface WhiteEditorExtensions<T = Record<string, unknown>> {
  extension?: EditorExtensions<T>;
}

/**
 * 기본 extensions의 설정을 오버라이드하기 위한 설정 객체
 * extension 이름을 키로 사용하여 configure 옵션을 전달
 */
interface OverrideExtensionsConfig {
  [extensionName: string]: Record<string, unknown>;
}

/**
 * 커스텀 노드 뷰 컴포넌트 매핑
 * 노드 타입 이름을 키로 사용하여 React 컴포넌트를 매핑
 */
interface CustomNodeViews {
  [nodeType: string]: ComponentType<Record<string, unknown>>;
}

/**
 * 확장 가능한 에디터 설정
 */
interface ExtensibleEditorConfig {
  /** 외부 TipTap extensions 배열 (Extension만) - 이 프로젝트에 없는 extension을 추가할 때 사용 */
  addExtensions?: Array<Extension>;
  /** 커스텀 노드 배열 (Node만) - Node.create()로 만든 커스텀 노드를 추가할 때 사용 */
  customNodes?: Array<TipTapNode>;
  /** 기본 extensions 설정 오버라이드 */
  overrideExtensions?: OverrideExtensionsConfig;
  /** 커스텀 노드 뷰 컴포넌트 매핑 */
  customNodeViews?: CustomNodeViews;
}

interface TipTapEditorOptions {
  content?: Content;
  autofocus?: boolean | 'start' | 'end' | number;
  editable?: boolean;
  injectCSS?: boolean;
  injectNonce?: string;
  parseOptions?: Record<string, unknown>;
  enableInputRules?: boolean;
  enablePasteRules?: boolean;
  enableCoreExtensions?: boolean;
  immediatelyRender?: boolean;
  shouldRerenderOnTransaction?: boolean;
}

interface UseWhiteEditorReturn {
  editor: Editor | null;
  charactersCount: number;
  getHTML: () => string;
  getJSON: () => JSONContent;
  getText: () => string;
  setContent: (content: string | JSONContent) => void;
  focus: () => void;
  blur: () => void;
  isEmpty: boolean;
  clear: () => void;
}

interface WhiteEditorProps<T>
  extends WhiteEditorUIProps,
    WhiteEditorExtensions<T>,
    TipTapEditorOptions,
    ExtensibleEditorConfig {
  onChange?: (jsonContent: JSONContent) => void;
  onUpdate?: (jsonContent: JSONContent) => void;
  onBlur?: (jsonContent: JSONContent) => void;
  onFocus?: (jsonContent: JSONContent) => void;
  onCreate?: (editor: Editor) => void;
  onDestroy?: () => void;
  onSelectionUpdate?: (editor: Editor) => void;
  editorProps?: EditorProps;
}

export type {
  WhiteEditorProps,
  WhiteEditorUIProps,
  WhiteEditorExtensions,
  UseWhiteEditorReturn,
  TipTapEditorOptions,
  EditorExtensions,
  OverrideExtensionsConfig,
  CustomNodeViews,
  ExtensibleEditorConfig,
};
