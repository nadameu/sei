import browserslist from 'browserslist';
import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

const browsersRE = /^(chrome|firefox) (\d+)$/;
let min: { chrome: number; firefox: number } = {
  chrome: Number.POSITIVE_INFINITY,
  firefox: Number.POSITIVE_INFINITY,
};
for (const x of browserslist()) {
  const res = x.match(browsersRE);
  if (!res) {
    throw new Error('Browserslist retornou valores desconhecidos.');
  }
  const [, browser, versionString] = res as [string, 'chrome' | 'firefox', string];
  const version = Number(versionString);
  if (Number.isNaN(version)) throw new Error(`Versão inválida: ${versionString}.`);
  if (version < min[browser]) {
    min[browser] = version;
  }
}
if (!Number.isFinite(min.chrome) || !Number.isFinite(min.firefox)) {
  throw new Error('Um ou mais navegadores não tem versão mínima definida.');
}

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: './',
    emptyOutDir: false,
    target: [`chrome${min.chrome}`, `firefox${min.firefox}`],
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
