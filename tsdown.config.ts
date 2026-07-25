import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/app.ts'],
  outDir: 'dist',
  format: 'esm',
  platform: 'node',
  target: 'node26',
  dts: false,
  sourcemap: true,
  minify: false,
  clean: true,
  define: {
    'process.env.NODE_ENV': '"production"',
    // @apollo/client
    __DEV__: 'false',
  },
  unbundle: true,
  deps: { neverBundle: ['redis', 'jsonpath'] },
});
