import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';
import browserslist from 'browserslist';

const browsersRE = /^(chrome|firefox) (\d+)$/;
const browserVersions = browserslist().reduce(
  (prev: { chrome: number; firefox: number }, x) => {
    const res = x.match(browsersRE);
    if (!res) {
      throw new Error('Browserslist retornou valores desconhecidos.');
    }
    const [, browser, versionString] = res as [string, 'chrome' | 'firefox', string];
    const version = Number(versionString);
    if (Number.isNaN(version)) throw new Error(`Versão inválida: ${versionString}.`);
    if (version < prev[browser]) {
      return { ...prev, [browser]: version };
    } else {
      return prev;
    }
  },
  { chrome: Number.POSITIVE_INFINITY, firefox: Number.POSITIVE_INFINITY },
);
if (!Number.isFinite(browserVersions.chrome) || !Number.isFinite(browserVersions.firefox)) {
  throw new Error('Um ou mais navegadores não tem versão mínima definida.');
}
console.debug(browserVersions);
import legacy from '@vitejs/plugin-legacy';
// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: './',
    emptyOutDir: false,
    target: [`chrome${browserVersions.chrome}`, `firefox${browserVersions.firefox}`],
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
