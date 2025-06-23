module.exports = {
  extends: [
    'next/core-web-vitals',
    // 'next/typescript' // `parser`と`plugins`で個別に設定するため不要
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    // TypeScript関連のルール
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',

    // Import順序のルール
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'index',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],

    // React関連のルール
    'react/prop-types': 'off', // TypeScriptを使うため無効化
    'react-hooks/exhaustive-deps': 'warn',

    // クリーンアーキテクチャ関連（将来的に追加予定）
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../../../*'],
            message:
              '深すぎるrelative importは禁止です。絶対パスを使用してください。',
          },
        ],
      },
    ],
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
}; 