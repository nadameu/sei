import pkg from './package.json' assert { type: 'json' };
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import ts from 'typescript';

/** @type {import('rollup').RollupOptions} */
const options = {
  input: 'src/index.ts',
  output: {
    format: 'es',
    file: 'sei.user.js',
    banner: `// ==UserScript==
// @name        SEI!
// @namespace   http://nadameu.com.br/sei
// @include     https://sei.trf4.jus.br/sei/controlador.php?*
// @include     https://sei.trf4.jus.br/controlador.php?*
// @run-at      document-end
// @version     ${pkg.version}
// ==/UserScript==
    `,
  },
  plugins: [resolve(), typescript({ target: ts.ScriptTarget.ES2018 })],
};
export default options;
