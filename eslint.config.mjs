import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  typescript: true,
  nextjs: true,
  test: false,
  ignores: [
    '.agent/**',
    '.claude/**',
    '**/*.md',
    'openspec/**',
  ],
  rules: {
    'ts/consistent-type-definitions': ['off'],
  },
})
