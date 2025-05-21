import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import pluginReact from 'eslint-plugin-react';
import pluginPrettier from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';
import tanstackQuery from '@tanstack/eslint-plugin-query';
import airbnb from 'eslint-config-airbnb';
import nextPlugin from '@next/eslint-plugin-next'; // Next.js 플러그인 추가

const baseConfig = {
  languageOptions: {
    globals: {
      ...globals.browser,
      process: 'readonly',
    },
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  plugins: {
    '@typescript-eslint': tseslint,
    react: pluginReact,
    prettier: pluginPrettier,
    '@tanstack/query': tanstackQuery,
    '@next/next': nextPlugin, // Next.js 플러그인 추가
  },
  settings: {
    react: {
      version: 'detect', // React 버전 자동 감지 설정
    },
  },
  rules: {
    ...pluginJs.configs.recommended.rules,
    ...tseslint.configs.recommended.rules,
    ...pluginReact.configs.flat.recommended.rules,
    ...airbnb.rules,
    ...nextPlugin.configs.recommended.rules, // Next.js 권장 규칙 추가
    ...nextPlugin.configs['core-web-vitals'].rules, // Next.js core-web-vitals 규칙 추가
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'react/react-in-jsx-scope': 'off',
    ...tanstackQuery.configs.recommended.rules,
  },
};

const storybookConfig = {
  files: ['.storybook/main.ts'],
  rules: {
    '@typescript-eslint/no-require-imports': 'off',
  },
};

const prettierAndReactConfig = {
  rules: {
    ...configPrettier.rules,
    'react/jsx-props-no-spreading': 'off',
    'react/no-unescaped-entities': 'off', // 이스케이프되지 않은 엔티티 경고 비활성화
    'react/no-unknown-property': ['error', { ignore: ['jsx'] }], // jsx 속성 허용
  },
  ignores: ['node_modules', 'dist'],
};

export default [
  {
    ...baseConfig,
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
  },
  storybookConfig,
  prettierAndReactConfig,
];
