/* eslint-disable no-undef */
module.exports = {
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['react-refresh'],
  rules: {
    'linebreak-style': ['off'],
    'comma-dangle': ['error', 'always-multiline'],
    'max-len': ['error', { code: 125 }],
    'max-lines': ['error', 300],
    'arrow-parens': ['error', 'always'],
    'no-param-reassign': ['error', { props: false }],
    'operator-linebreak': ['error', 'before'],
    'semi': ['error', 'always'],
    'no-extra-semi': 'error',
    'quotes': ['error', 'single'],
    'space-before-function-paren': [
			'error',
			{
				'anonymous': 'always',
				'named': 'never',
				'asyncArrow': 'always',
			},
		],
    'no-trailing-spaces': 'error',
    'max-depth': ['error', 4],

    'react-refresh/only-export-components': 'warn',
    'react-hooks/exhaustive-deps': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
