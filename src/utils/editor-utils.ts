import type { Node as TiptapNode } from '@tiptap/pm/model';
import { NodeSelection, Selection, TextSelection } from '@tiptap/pm/state';
import type { Editor } from '@tiptap/react';

export const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

export const MAC_SYMBOLS: Record<string, string> = {
  mod: '⌘',
  command: '⌘',
  meta: '⌘',
  ctrl: '⌃',
  control: '⌃',
  alt: '⌥',
  option: '⌥',
  shift: '⇧',
  backspace: 'Del',
  delete: '⌦',
  enter: '⏎',
  escape: '⎋',
  capslock: '⇪',
} as const;

/**
 * 현재 플랫폼이 macOS인지 확인합니다.
 * @returns Mac 플랫폼 여부를 나타내는 boolean
 */
export function isMac(): boolean {
  return typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac');
}

/**
 * 플랫폼(Mac 또는 비Mac)에 따라 단축키를 포맷합니다.
 * @param key - 포맷할 키 (예: "ctrl", "alt", "shift")
 * @param isMac - Mac 플랫폼 여부
 * @param capitalize - 키를 대문자로 변환할지 여부 (기본값: true)
 * @returns 포맷된 단축키 심볼
 */
export const formatShortcutKey = (key: string, isMac: boolean, capitalize: boolean = true) => {
  if (isMac) {
    const lowerKey = key.toLowerCase();
    return MAC_SYMBOLS[lowerKey] || (capitalize ? key.toUpperCase() : key);
  }

  return capitalize ? key.charAt(0).toUpperCase() + key.slice(1) : key;
};

/**
 * 단축키 문자열을 포맷된 키 심볼 배열로 파싱합니다.
 * @param shortcutKeys - 단축키 문자열 (예: "ctrl-alt-shift")
 * @param delimiter - 키를 분리하는 구분자 (기본값: "+")
 * @param capitalize - 키를 대문자로 변환할지 여부 (기본값: true)
 * @returns 포맷된 단축키 심볼 배열
 */
export const parseShortcutKeys = (props: {
  shortcutKeys: string | undefined;
  delimiter?: string;
  capitalize?: boolean;
}) => {
  const { shortcutKeys, delimiter = '+', capitalize = true } = props;

  if (!shortcutKeys) return [];

  return shortcutKeys
    .split(delimiter)
    .map((key) => key.trim())
    .map((key) => formatShortcutKey(key, isMac(), capitalize));
};

/**
 * 에디터 스키마에 마크가 존재하는지 확인합니다.
 * @param markName - 확인할 마크 이름
 * @param editor - 에디터 인스턴스
 * @returns 마크 존재 여부
 */
export const isMarkInSchema = (markName: string, editor: Editor | null): boolean => {
  if (!editor?.schema) return false;
  return editor.schema.spec.marks.get(markName) !== undefined;
};

/**
 * 에디터 스키마에 노드가 존재하는지 확인합니다.
 * @param nodeName - 확인할 노드 이름
 * @param editor - 에디터 인스턴스
 * @returns 노드 존재 여부
 */
export const isNodeInSchema = (nodeName: string, editor: Editor | null): boolean => {
  if (!editor?.schema) return false;
  return editor.schema.spec.nodes.get(nodeName) !== undefined;
};

/**
 * 에디터에서 다음 노드로 포커스를 이동합니다.
 * @param editor - 에디터 인스턴스
 * @returns 포커스 이동 성공 여부
 */
export function focusNextNode(editor: Editor) {
  const { state, view } = editor;
  const { doc, selection } = state;

  const nextSel = Selection.findFrom(selection.$to, 1, true);
  if (nextSel) {
    view.dispatch(state.tr.setSelection(nextSel).scrollIntoView());
    return true;
  }

  const paragraphType = state.schema.nodes.paragraph;
  if (!paragraphType) {
    return false;
  }

  const end = doc.content.size;
  const para = paragraphType.create();
  let tr = state.tr.insert(end, para);

  // 새 단락 내부에 selection을 위치시킵니다.
  const $inside = tr.doc.resolve(end + 1);
  tr = tr.setSelection(TextSelection.near($inside)).scrollIntoView();
  view.dispatch(tr);
  return true;
}

/**
 * 값이 유효한 숫자인지 확인합니다 (null, undefined, NaN이 아님)
 * @param value - 확인할 값
 * @returns 유효한 숫자인지 여부
 */
export function isValidPosition(pos: number | null | undefined): pos is number {
  return typeof pos === 'number' && pos >= 0;
}

/**
 * 하나 이상의 확장(extension)이 Tiptap 에디터에 등록되어 있는지 확인합니다.
 * @param editor - Tiptap 에디터 인스턴스
 * @param extensionNames - 확인할 확장 이름 또는 이름 배열
 * @returns 확장 중 하나라도 등록되어 있으면 true, 아니면 false
 */
export function isExtensionAvailable(editor: Editor | null, extensionNames: string | string[]): boolean {
  if (!editor) return false;

  const names = Array.isArray(extensionNames) ? extensionNames : [extensionNames];

  const found = names.some((name) => editor.extensionManager.extensions.some((ext) => ext.name === name));

  if (!found) {
    return false;
  }

  return found;
}

/**
 * 지정한 위치에서 노드를 찾고, 오류 발생 시 null을 반환합니다.
 * @param editor Tiptap 에디터 인스턴스
 * @param position 문서 내 위치
 * @returns 해당 위치의 노드 또는 null
 */
export function findNodeAtPosition(editor: Editor, position: number) {
  try {
    const node = editor.state.doc.nodeAt(position);
    if (!node) {
      return null;
    }
    return node;
  } catch (error) {
    return null;
  }
}

/**
 * 문서에서 노드의 위치와 인스턴스를 찾습니다.
 * @param props editor, node(선택), nodePos(선택)를 포함하는 객체
 * @param props.editor Tiptap 에디터 인스턴스
 * @param props.node 찾을 노드 (nodePos가 있으면 선택)
 * @param props.nodePos 찾을 노드의 위치 (node가 있으면 선택)
 * @returns 위치와 노드를 포함한 객체 또는 null
 */
export function findNodePosition(props: {
  editor: Editor | null;
  node?: TiptapNode | null;
  nodePos?: number | null;
}): { pos: number; node: TiptapNode } | null {
  const { editor, node, nodePos } = props;

  if (!editor || !editor.state?.doc) return null;

  // 0도 유효한 위치입니다.
  const hasValidNode = node !== undefined && node !== null;
  const hasValidPos = isValidPosition(nodePos);

  if (!hasValidNode && !hasValidPos) {
    return null;
  }

  // 노드가 있으면 문서에서 노드를 먼저 찾습니다.
  if (hasValidNode) {
    let foundPos = -1;
    let foundNode: TiptapNode | null = null;

    editor.state.doc.descendants((currentNode, pos) => {
      // TODO: Needed?
      // if (currentNode.type && currentNode.type.name === node!.type.name) {
      if (currentNode === node) {
        foundPos = pos;
        foundNode = currentNode;
        return false;
      }
      return true;
    });

    if (foundPos !== -1 && foundNode !== null) {
      return { pos: foundPos, node: foundNode };
    }
  }

  // 유효한 위치가 있으면 findNodeAtPosition을 사용합니다.
  if (hasValidPos) {
    const nodeAtPos = findNodeAtPosition(editor, nodePos!);
    if (nodeAtPos) {
      return { pos: nodePos!, node: nodeAtPos };
    }
  }

  return null;
}

/**
 * 에디터의 현재 selection이 지정한 타입의 노드 선택인지 확인합니다.
 * @param editor Tiptap 에디터 인스턴스
 * @param types 확인할 노드 타입 이름 배열
 * @returns 선택된 노드가 타입에 포함되면 true, 아니면 false
 */
export function isNodeTypeSelected(editor: Editor | null, types: string[] = []): boolean {
  if (!editor || !editor.state.selection) return false;

  const { state } = editor;
  const { selection } = state;

  if (selection.empty) return false;

  if (selection instanceof NodeSelection) {
    const node = selection.node;
    return node ? types.includes(node.type.name) : false;
  }

  return false;
}

/**
 * 이미지 업로드를 진행하며, 진행률 추적 및 취소 기능을 제공합니다.
 * @param file 업로드할 파일
 * @param onProgress 업로드 진행률 콜백 (선택)
 * @param abortSignal 업로드 취소용 AbortSignal (선택)
 * @param maxFileSize 허용할 최대 파일 크기 (바이트 단위, 기본값: 3MB)
 * @returns 업로드된 이미지의 URL을 반환하는 Promise
 */
export const handleImageUpload = async (
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal,
  maxFileSize?: number
): Promise<string> => {
  // 파일 유효성 검사
  if (!file) {
    throw new Error('No file provided');
  }

  const fileSize = maxFileSize || MAX_FILE_SIZE;

  if (file.size > fileSize) {
    throw new Error(`File size exceeds maximum allowed (${fileSize / (1024 * 1024)}MB)`);
  }

  // 데모/테스트용: 업로드 진행률을 시뮬레이션합니다. 실제 환경에서는 아래 코드를 교체하세요.
  for (let progress = 0; progress <= 100; progress += 10) {
    if (abortSignal?.aborted) {
      throw new Error('Upload cancelled');
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
    onProgress?.({ progress });
  }

  return '/images/tiptap-ui-placeholder-image.jpg';
};

type ProtocolOptions = {
  /**
   * 등록할 프로토콜 스킴
   * @default ''
   * @example 'ftp'
   * @example 'git'
   */
  scheme: string;

  /**
   * 활성화 시, 프로토콜 뒤에 슬래시를 허용합니다.
   * @default false
   * @example true
   */
  optionalSlashes?: boolean;
};

type ProtocolConfig = Array<ProtocolOptions | string>;

const ATTR_WHITESPACE =
  // eslint-disable-next-line no-control-regex
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g;

/**
 * URI가 허용된 프로토콜을 사용하는지 확인합니다.
 * @param uri 검사할 URI
 * @param protocols 허용할 프로토콜 설정 (선택)
 * @returns 허용된 URI면 true, 아니면 false
 */
export function isAllowedUri(uri: string | undefined, protocols?: ProtocolConfig) {
  const allowedProtocols: string[] = ['http', 'https', 'ftp', 'ftps', 'mailto', 'tel', 'callto', 'sms', 'cid', 'xmpp'];

  if (protocols) {
    protocols.forEach((protocol) => {
      const nextProtocol = typeof protocol === 'string' ? protocol : protocol.scheme;

      if (nextProtocol) {
        allowedProtocols.push(nextProtocol);
      }
    });
  }

  return (
    !uri ||
    uri.replace(ATTR_WHITESPACE, '').match(
      new RegExp(
        // eslint-disable-next-line no-useless-escape
        `^(?:(?:${allowedProtocols.join('|')}):|[^a-z]|[a-z0-9+.\-]+(?:[^a-z+.\-:]|$))`,
        'i'
      )
    )
  );
}

/**
 * 입력된 URL을 허용된 프로토콜로 sanitize합니다.
 * @param inputUrl 입력 URL
 * @param baseUrl 기준이 되는 base URL
 * @param protocols 허용할 프로토콜 설정 (선택)
 * @returns 허용된 URL 또는 '#' (잘못된 경우)
 */
export function sanitizeUrl(inputUrl: string, baseUrl: string, protocols?: ProtocolConfig): string {
  try {
    const url = new URL(inputUrl, baseUrl);

    if (isAllowedUri(url.href, protocols)) {
      return url.href;
    }
  } catch {
    // URL 생성 실패 시, 잘못된 것으로 간주
  }
  return '#';
}
