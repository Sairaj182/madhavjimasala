import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'seed-superadmin': 'src/scripts/seed-superadmin.ts',
  },
  format: ['cjs'],
  target: 'node22',
  clean: true,
  outDir: 'dist',
  splitting: false,
  dts: false,
  noExternal: ['@repo/auth', '@repo/db'],
})
