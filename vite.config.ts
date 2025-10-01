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
            external: ['react', 'react-dom', 'react/jsx-runtime'],
            output: {
              entryFileNames: '[name].js',
              globals: {
                react: 'React',
                'react-dom': 'ReactDOM',
                'react/jsx-runtime': 'react/jsx-runtime',
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
