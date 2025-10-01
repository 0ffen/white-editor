import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'White Editor',
  description: 'Modern Rich Text Editor for React',
  lang: 'ko-KR',
  head: [['link', { rel: 'icon', href: '/logo.svg' }]],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '홈', link: '/' },
      { text: '가이드', link: '/guide/getting-started' },
      { text: 'API', link: '/api/editor-props' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '시작하기',
          items: [
            { text: '설치 및 시작', link: '/guide/getting-started' },
            { text: '기본 사용법', link: '/guide/usage' },
          ],
        },
        {
          text: '기능',
          items: [
            { text: '툴바 커스터마이징', link: '/guide/toolbar' },
            { text: '확장 기능', link: '/guide/extensions' },
            { text: '이미지 업로드', link: '/guide/image-upload' },
          ],
        },
        {
          text: '고급',
          items: [
            { text: '에디터 제어', link: '/guide/editor-control' },
            { text: '유틸리티', link: '/guide/utilities' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 레퍼런스',
          items: [
            { text: 'Editor Props', link: '/api/editor-props' },
            { text: 'Viewer', link: '/api/viewer' },
            { text: 'Types', link: '/api/types' },
            { text: 'Utilities', link: '/api/utilities' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/0ffen/white-editor' }],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 ENKI',
    },
  },
  base: '/white-editor/',
});
