import { defineConfig } from 'tsdown';

export default defineConfig({
  // must match package.json exports
  entry: [
    'src/address-book/index.ts',
    'src/address-book/*/index.ts',
    'src/types/*.ts',
    'src/util/*.ts',
  ],
  outDir: 'dist',
  format: ['esm', 'cjs'],
  platform: 'neutral',
  dts: true,
  unbundle: true,
  clean: true,
  // chainIdMap.ts back-compat
  outputOptions: { exports: 'named' },
});
