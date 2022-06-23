const fs = require('fs');

module.exports = {
  root: true,
  extends: ['airbnb-base', 'prettier', 'plugin:jest/recommended', 'plugin:import/typescript', 'airbnb-typescript/base'],
  plugins: [
    "@typescript-eslint",
    "prettier",
    "import",
    "prefer-arrow",
    "jest-dom",
    "jest",
    "jest-formatting",
    "no-only-tests"],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  env: {
    jest: true,
    node: true,
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx", ".js"]
    },
    "import/resolver": {
      "typescript": {
        "alwaysTryTypes": true
      }
    }
  },
  rules: {
    "no-tabs": ["error", { "allowIndentationTabs": true }],
    "@typescript-eslint/indent": ["off"],
    "quotes": [
      "error",
      "single",
      { "avoidEscape": true, "allowTemplateLiterals": true }
    ],
    "@typescript-eslint/quotes": [
      "error",
      "single",
      { "avoidEscape": true, "allowTemplateLiterals": true }
    ],
    "semi": ["error", "never"],
    "space-before-blocks": 2,
    "space-before-function-paren": 2,
    "no-multi-spaces": 2,
    "@typescript-eslint/semi": "off",
    "no-unexpected-multiline": "error",
    "@typescript-eslint/comma-dangle": ["off"],
    "comma-dangle": ["off"],
    "no-console": 2,
    "class-methods-use-this": 0,
    "no-only-tests/no-only-tests": 2,
    "no-warning-comments": 2,
    "import/no-unresolved": 2,
    "import/named": 2,
    "import/no-relative-packages": 2,
    "import/no-cycle": 2,
    "import/newline-after-import": 2,
    "import/no-namespace": 2,
    "import/no-duplicates": 2,
    "import/first": 2,
    "import/exports-last": 2,
    "import/no-absolute-path": 2,
    "import/no-dynamic-require": 2,
    "import/no-self-import": 2,
    "import/no-useless-path-segments": 2,
    "import/no-extraneous-dependencies": [
      2,
      {
        "devDependencies": [
          "!./src/**/*"
        ]
      }
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
  },
  ignorePatterns: ['.eslintrc.cjs', 'build/*', 'dist/*', 'coverage/*', '**/testutils/*'],
};
