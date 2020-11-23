import typescript from '@rollup/plugin-typescript';
import ts from 'typescript';

/** @type {import('rollup').RollupOptions} */
const options = {
  output: {
    format: 'es',
    file: 'sei.user.js',
    banner: `// ==UserScript==
// @name        SEI!
// @namespace   http://nadameu.com.br/sei
// @include     https://sei.trf4.jus.br/sei/controlador.php?*
// @include     https://sei.trf4.jus.br/controlador.php?*
// @version     12.1.0
// ==/UserScript==
    `,
  },
  plugins: [typescript({ target: ts.ScriptTarget.ES2015 })],
};
export default options;
