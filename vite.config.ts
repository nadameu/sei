import browserslist from 'browserslist';
import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

const browsers = ['chrome', 'edge', 'firefox', 'safari', 'opera'] as const;
const browsersRE = new RegExp(`^(${browsers.join('|')}) (\\d+(?:\\.\\d+)*)$`);
const list = browserslist(browsers.map(browser => `${browser} > 0 and last 2.5 years`))
  .map(x => x.match(browsersRE))
  .filter((x): x is [string, (typeof browsers)[number], string] => x !== null)
  .map(([, browser, ver]) => ({ browser, version: Number(ver) }))
  .reduce(
    (map: Map<(typeof browsers)[number], number>, { browser, version }) =>
      map.set(browser, map.has(browser) ? Math.min(map.get(browser)!, version) : version),
    new Map(),
  );
const target = Array.from(list.entries()).map(([browser, version]) => `${browser}${version}`);
if (target.length !== browsers.length) {
  throw new Error('Lista de navegadores não suportada.');
}

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: './',
    emptyOutDir: false,
    target,
  },
  plugins: [
    monkey({
      entry: 'src/index.ts',
      userscript: {
        name: 'SEI!',
        namespace: 'http://nadameu.com.br/sei',
        include: [
          'https://sei.trf4.jus.br/sei/controlador.php?*',
          'https://sei.trf4.jus.br/controlador.php?*',
        ],
        'run-at': 'document-end',
      },
    }),
  ],
});
