export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'add', // 코드/파일/리소스 추가
        'chore', // 빌드, 설정, 도구 변경
        'delete', // 기존 기능 또는 파일 제거
        'docs', // 문서 수정
        'feat', // 새로운 기능 추가
        'fix', // 버그 수정
        'refactor', // 기능 변경 없는 코드 리팩토링
        'typo', // 오타, 주석, 텍스트 수정
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
  },
};
