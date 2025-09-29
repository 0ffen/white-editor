import path, { resolve } from 'node:path';
import { defineConfig } from 'vite';
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
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      name: 'white-editor',
      fileName: (format) => `index.${format}.js`,
      formats: ['es'],
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'tailwindcss'],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'react/jsx-runtime',
        },
        manualChunks: {
          // UI 라이브러리들
          radix: [
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
          ],
          // TipTap 코어 및 기본 확장
          tiptap: ['@tiptap/core', '@tiptap/react', '@tiptap/starter-kit', '@tiptap/extensions'],
          // TipTap 확장들
          'tiptap-extensions': [
            '@tiptap/extension-code-block',
            '@tiptap/extension-code-block-lowlight',
            '@tiptap/extension-color',
            '@tiptap/extension-highlight',
            '@tiptap/extension-horizontal-rule',
            '@tiptap/extension-image',
            '@tiptap/extension-link',
            '@tiptap/extension-list',
            '@tiptap/extension-mathematics',
            '@tiptap/extension-mention',
            '@tiptap/extension-subscript',
            '@tiptap/extension-superscript',
            '@tiptap/extension-table',
            '@tiptap/extension-text',
            '@tiptap/extension-text-align',
            '@tiptap/extension-text-style',
            '@tiptap/extension-typography',
            'tiptap-markdown',
          ],
          syntax: ['katex', 'lowlight'],
          utils: [
            '@floating-ui/dom',
            '@floating-ui/react',
            'react-hotkeys-hook',
            'lodash.throttle',
            'lucide-react',
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
          ],
          tui: ['tui-image-editor', '@toast-ui/react-image-editor'],
        },
      },
    },
    commonjsOptions: {
      esmExternals: ['react'],
    },
  },
});
