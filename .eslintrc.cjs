const fs = require('fs');

const prettierOptions = JSON.parse(fs.readFileSync(`${__dirname}/.prettierrc`, 'utf8'));

module.exports = {
  root: true,
  extends: ['airbnb-base', 'prettier', 'plugin:jest/recommended', "airbnb-typescript/base"],
  plugins: ['prettier', 'jest', 'import'],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: './tsconfig.json'
  },
  env: {
    jest: true,
    node: true,
  },
  rules: {
    'prettier/prettier': ['error', prettierOptions],
    'jest/no-try-expect': 0,
    'jest/no-test-callback': 0,
    'jest/expect-expect': 0,
    'consistent-return': 0,
    'max-classes-per-file': 0,
    'padding-line-between-statements': ['error', { blankLine: 'always', prev: 'if', next: '*' }],
    'nonblock-statement-body-position': ['error', 'beside', { overrides: { while: 'below' } }],
    'class-methods-use-this': 'off',
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        "js": "never",
        "jsx": "never",
        "ts": "never",
        "tsx": "never"
      }
   ]
  },
  ignorePatterns: [".eslintrc.cjs", "build/*", "dist/*", "coverage/*", "**/testutils/*"]
};
