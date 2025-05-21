import { join, resolve } from 'path';
import type { StorybookConfig } from '@storybook/nextjs';
import type { RuleSetRule } from 'webpack';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-onboarding',
    '@chromatic-com/storybook',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  staticDirs: ['../public'],
  docs: {
    autodocs: 'tag',
  },
  webpackFinal: async (config) => {
    // SVG 처리
    const fileLoaderRule = config.module?.rules?.find(
      (rule): rule is { test: RegExp; exclude?: RegExp } =>
        typeof rule === 'object' &&
        rule !== null &&
        'test' in rule &&
        rule.test instanceof RegExp &&
        rule.test.toString().includes('svg')
    );

    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/;
    }

    config.module?.rules?.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // SCSS 설정
    if (config.module?.rules) {
      const rules = config.module.rules as RuleSetRule[];

      const scssRule = rules.find(
        (rule) =>
          typeof rule === 'object' &&
          rule?.test instanceof RegExp &&
          rule.test.toString().includes('scss')
      );

      if (scssRule && Array.isArray(scssRule.use)) {
        const sassLoader = scssRule.use.find(
          (use) =>
            typeof use === 'object' && use?.loader?.includes('sass-loader')
        );

        if (sassLoader && typeof sassLoader === 'object') {
          const currentOptions = (sassLoader.options ?? {}) as Record<
            string,
            unknown
          >;

          sassLoader.options = {
            ...currentOptions,
            additionalData: `@use "@/assets/styles/abstracts/variables" as *;`,
            sassOptions: {
              includePaths: [join(process.cwd(), 'src/assets/styles')],
            },
          };
        }
      }
    }
    // 경로 별칭
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '@': resolve(process.cwd(), 'src'),
      },
    };

    return config;
  },
};

export default config;
