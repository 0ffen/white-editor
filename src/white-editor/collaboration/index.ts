/**
 * 협업(Yjs) 전용 모듈.
 *
 * 주의: 이 디렉토리는 src/white-editor/index.ts에서 export하지 않는다.
 * yjs/@tiptap/y-tiptap은 optional peerDependency라 메인 번들에 포함되면
 * 비협업 소비자가 설치하지 않은 의존성을 resolve하게 된다.
 * 반드시 `@0ffen/white-editor/collaboration` 서브패스로만 노출할 것.
 */
export { CollaborationCaret } from './collaboration-caret';
export type {
  CollaborationCaretAwareness,
  CollaborationCaretProvider,
  CollaborationCaretUser,
  CollaborationCaretOptions,
} from './collaboration-caret';
