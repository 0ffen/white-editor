import path from 'node:path';
import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import dts from 'vite-plugin-dts';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
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
    cssInjectedByJsPlugin({
      // 멀티 진입점에서 각 번들(index/editor/viewer)에 해당 진입점이 사용한 CSS만 주입
      relativeCSSInjection: true,
    }),
    tailwindcss(),
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
    lib: {
      entry: {
        index: path.resolve(__dirname, './src/index.ts'),
        utils: path.resolve(__dirname, './src/entries/utils.ts'),
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
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        entryFileNames: '[name].js',
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
