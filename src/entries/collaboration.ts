/**
 * Collaboration(Yjs) 전용 진입점.
 * import { CollaborationCaret } from '@0ffen/white-editor/collaboration'
 * import '@0ffen/white-editor/collaboration.css'
 *
 * yjs / @tiptap/y-tiptap은 optional peerDependency — 이 서브패스를 쓰는 소비자만 설치한다.
 * @tiptap/extension-collaboration(문서 동기화)은 소비자가 직접 설치/구성한다.
 * CSS는 style.css에 합쳐지지 않도록 별도 파일(collaboration.css)로 배포한다 (vite.config viteStaticCopy).
 */
export { CollaborationCaret } from '@/white-editor/collaboration';
export type {
  CollaborationCaretAwareness,
  CollaborationCaretProvider,
  CollaborationCaretUser,
  CollaborationCaretOptions,
} from '@/white-editor/collaboration';
