module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  // extends: ['react-app', 'prettier', 'standard-with-typescript'],
  extends: [
    'react-app',
    'prettier',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
  plugins: ['react'],
  rules: {
    semi: [2, 'always'],
  },
};
