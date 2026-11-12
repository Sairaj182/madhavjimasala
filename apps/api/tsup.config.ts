import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  target: 'node22',
  clean: true,
  outDir: 'dist',
  splitting: false,
  dts: false,
  noExternal: ['@repo/auth', '@repo/db'],
})
