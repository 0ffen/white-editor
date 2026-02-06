import path from 'node:path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

/**
 * 에디터/뷰어 공통 스타일만 dist/index.css로 빌드.
 * CSS-in-JS 플러그인 없이 실행해 실제 CSS 파일이 산출됨.
 * 사용 예: import '@0ffen/white-editor/dist/index.css'
 */
export default defineConfig({
  plugins: [tsconfigPaths(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist-css',
    emptyOutDir: true,
    target: 'es2020',
    minify: false,
    sourcemap: false,
    cssCodeSplit: false,
    // .ttf만 url() 유지, 나머지는 기본 동작 (KaTeX 등)
    assetsInlineLimit: (filePath) => (filePath?.endsWith('.ttf') ? false : undefined),
    lib: {
      entry: path.resolve(__dirname, './src/entries/styles.css-entry.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        entryFileNames: '_styles.js',
        assetFileNames: () => 'index.css',
      },
    },
  },
});
