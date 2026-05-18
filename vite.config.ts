import path from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

const enableVisualizer = process.env.ANALYZE === 'true' || process.env.ANALYZE === '1';

// https://vite.dev/config/
export default defineConfig({
  // 데모용 자산(logo/white.png 등)은 demo/에 둔다. dev에서만 서빙하고, 라이브러리 빌드(dist/)에는 build.copyPublicDir=false로 복사 차단.
  publicDir: 'demo',
  plugins: [
    react(),
    svgr(),
    tsconfigPaths(),
    dts({
      rollupTypes: true,
      outDir: 'dist',
      tsconfigPath: path.resolve(__dirname, './tsconfig.app.json'),
      insertTypesEntry: true,
    }),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: 'src/shared/assets/fonts/*',
          dest: 'assets/fonts',
        },
        // Pretendard @font-face 선언만 분리해 컨슈머가 opt-in import하도록 노출
        //   컨슈머: `import '@0ffen/white-editor/pretendard.css'`
        {
          src: 'src/shared/styles/pretendard.css',
          dest: '.',
        },
        // D2Coding(코드블록 모노스페이스) @font-face도 opt-in subpath로 분리
        //   컨슈머: `import '@0ffen/white-editor/codeblock.css'`
        {
          src: 'src/shared/styles/codeblock.css',
          dest: '.',
        },
        // KaTeX CSS를 dist/katex.css로 재배포 (woff2 only). 컨슈머: `import '@0ffen/white-editor/katex.css'`
        {
          src: 'node_modules/katex/dist/katex.min.css',
          dest: '.',
          rename: 'katex.css',
          transform: (content) =>
            (content as unknown as string)
              .toString()
              .replace(/,url\(fonts\/[^)]+\.woff\) format\("woff"\)/g, '')
              .replace(/,url\(fonts\/[^)]+\.ttf\) format\("truetype"\)/g, ''),
        },
        // KaTeX woff2 폰트만 (woff/ttf 폴백 제외) — dist/katex.css가 ./fonts/ 상대경로로 참조
        {
          src: 'node_modules/katex/dist/fonts/*.woff2',
          dest: 'fonts',
        },
      ],
    }),
    ...(enableVisualizer
      ? [
          visualizer({
            filename: 'dist/stats.html',
            template: 'treemap',
            gzipSize: true,
            brotliSize: true,
            open: true,
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 0,
    // 라이브러리 빌드 산출물(dist/)에는 demo/의 데모 자산을 복사하지 않는다 (dev 미리보기 전용).
    copyPublicDir: false,
    lib: {
      entry: {
        index: path.resolve(__dirname, './src/index.ts'),
        util: path.resolve(__dirname, './src/entries/util.ts'),
        editor: path.resolve(__dirname, './src/entries/editor.ts'),
        viewer: path.resolve(__dirname, './src/entries/viewer.ts'),
      },
      formats: ['es'],
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      external: [
        /^react($|\/)/,
        /^react-dom($|\/)/,
        /^@tiptap\//,
        /^prosemirror-/,
        // @radix-ui: 직접 의존하는 패키지만 명시. regex로 전부 잡으면 cmdk 등이 내부적으로
        // 쓰는 transitive(@radix-ui/react-primitive, react-id, compose-refs)까지 external로 잡혀
        // 컨슈머 측에서 resolution 실패함.
        '@radix-ui/react-context-menu',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-popover',
        '@radix-ui/react-select',
        '@radix-ui/react-separator',
        '@radix-ui/react-slider',
        '@radix-ui/react-slot',
        '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group',
        '@radix-ui/react-tooltip',
        '@floating-ui/dom',
        '@floating-ui/react',
        'katex',
        'lowlight',
        'highlight.js',
        'tui-image-editor',
        '@toast-ui/react-image-editor',
        'i18next',
        'react-i18next',
        'lucide-react',
        'tiptap-markdown',
        // tiptap-markdown의 transitive deps — 컨슈머 측에서 자동 해결됨
        'markdown-it',
        'markdown-it-task-lists',
        'entities',
        'linkify-it',
        'mdurl',
        'punycode.js',
        'uc.micro',
        // cmdk / tailwind-merge / lodash-es — 컨슈머 node_modules에 라이브러리 dep로 자동 설치됨
        'cmdk',
        'tailwind-merge',
        /^lodash-es($|\/)/,
      ],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        // 라이브러리 CSS 청크를 단일 style.css로 통일 (entry별로 분리되지 않고 한 파일로 묶임)
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0] ?? '';
          if (name.endsWith('.css')) return 'style.css';
          return 'assets/[name]-[hash][extname]';
        },
        manualChunks(id) {
          const nodeModules = path.sep + 'node_modules' + path.sep;
          if (!id.includes(nodeModules)) return undefined;
          if (id.includes(nodeModules + '@tiptap')) return 'tiptap';
          if (id.includes(nodeModules + 'lowlight') || id.includes(nodeModules + 'highlight.js')) return 'lowlight';
          if (id.includes(nodeModules + 'katex')) return 'katex';
          if (id.includes(nodeModules + 'prosemirror')) return 'prosemirror';
          if (id.includes(nodeModules + '@radix-ui')) return 'radix-ui';
          if (id.includes(nodeModules + '@floating-ui')) return 'floating-ui';
          return undefined;
        },
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'react/jsx-runtime',
          '@tiptap/core': 'TipTapCore',
          '@tiptap/react': 'TipTapReact',
          '@tiptap/pm': 'TipTapPM',
          '@tiptap/extensions': 'TipTapExtensions',
        },
      },
    },
  },
});
