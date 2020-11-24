import productionOptions from './rollup.config';
import serve from 'rollup-plugin-serve';

/** @type {import('rollup').RollupOptions} */
const options = {
  ...productionOptions,
  plugins: [
    ...productionOptions.plugins,
    serve({
      open: true,
      openPage: '/sei.user.js',
    }),
  ],
};

export default options;
