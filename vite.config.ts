import path from 'node:path';
import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import dts from 'vite-plugin-dts';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

const isLibBuild = process.env.BUILD_MODE === 'lib';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
    tsconfigPaths(),
    ...(isLibBuild
      ? [
          dts({
            rollupTypes: true,
            outDir: 'dist',
            tsconfigPath: path.resolve(__dirname, './tsconfig.app.json'),
            insertTypesEntry: true,
          }),
          cssInjectedByJsPlugin(),
        ]
      : []),
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
    ...(isLibBuild
      ? {
          lib: {
            entry: path.resolve(__dirname, './src/index.ts'),
            name: 'white-editor',
            fileName: (format) => `index.${format}.js`,
            formats: ['es'],
          },
          rollupOptions: {
            external: [
              'react',
              'react-dom',
              'react/jsx-runtime',
              '@tiptap/core',
              '@tiptap/react',
              '@tiptap/pm',
              '@tiptap/starter-kit',
              '@tiptap/extensions',
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
              'katex',
              'lowlight',
              '@floating-ui/dom',
              '@floating-ui/react',
              'react-hotkeys-hook',
              'lodash.throttle',
              'lucide-react',
              'class-variance-authority',
              'clsx',
              'tailwind-merge',
              'tui-image-editor',
              '@toast-ui/react-image-editor',
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
          commonjsOptions: {
            esmExternals: ['react'],
          },
        }
      : {
          // Web app build configuration
          outDir: 'dist',
          rollupOptions: {
            input: {
              main: path.resolve(__dirname, 'index.html'),
            },
          },
        }),
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
