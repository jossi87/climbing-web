import { defineConfig } from 'eslint/config';
import js from '@eslint/js'; 
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint'; 
import react from 'eslint-plugin-react'; 
import prettierConfig from 'eslint-config-prettier';

export default defineConfig([
  { ignores: ['dist', 'build', 'node_modules', 'coverage'] },
  js.configs.recommended, 
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic, 
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser, 
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node, 
      },
    },
    plugins: {
      react: react,
      'react-hooks': reactHooks, 
      'react-refresh': reactRefresh,
      '@typescript-eslint': tseslint.plugin,
    },

    settings: {
      react: { version: 'detect' },
    },
    
    rules: {
      'react/jsx-uses-react': 'off', 
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/set-state-in-effect': 'warn',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/consistent-type-definitions': ['warn', 'type'],
      '@typescript-eslint/prefer-for-of': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-param-reassign': 'warn',
        'react-refresh/only-export-components': [
          'error',
        { allowConstantExport: true },
      ],
    },
  },
  {
    ...prettierConfig,
  }
]);