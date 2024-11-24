import typescript from '@rollup/plugin-typescript';
import del from 'rollup-plugin-delete';
import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import fs from 'fs';
import define from 'rollup-plugin-define';

const packageJson = require('./package.json');

const plugins = [
  define({
    replacements: {
      BUILD_VERSION: JSON.stringify(require('./package.json').version),
    },
  }),
  typescript({
    tsconfig: './tsconfig.json',
  }),
  json(),
  commonjs(),
  resolve(),
  terser(),
];
const input = './lib/index.ts';
const external = (id) => !id.startsWith('\0') && !id.startsWith('.') && !id.startsWith('/');

export default [
  {
    input,
    output: {
      file: packageJson.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'auto',
    },
    plugins,
    external,
  },
  {
    input,
    output: {
      file: packageJson.module,
      format: 'esm',
      sourcemap: true,
    },
    plugins,
    external,
  },
  {
    input: './dist/lib/index.d.ts',
    output: [{ file: packageJson.types, format: 'esm' }],
    plugins: [
      dts(),
      del({ hook: 'buildEnd', targets: ['./dist/lib', './dist/cjs/lib'] }),
      cjsPackage(),
    ],
  },
];

function cjsPackage() {
  return {
    name: 'cjsPackage',
    buildEnd: () => {
      fs.writeFileSync('./dist/cjs/package.json', JSON.stringify({ type: 'commonjs' }));
    },
  };
}
