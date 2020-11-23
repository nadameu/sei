import { criarColunaAdicional, criarColunaAdicionalMarcador } from './criarColunaAdicional';

const obterColunaAdicional = (className: string, fnCriarColunas: () => void) => (
  elemento: HTMLElement,
) => {
  const linha = elemento.closest('tr');
  if (!linha) throw new Error('Elemento não está contido em uma linha.');
  const go = (criadas = false): HTMLTableDataCellElement => {
    const colunas = linha.querySelectorAll<HTMLTableDataCellElement>(`td.${className}`);
    if (colunas.length > 0) return colunas[0];
    else if (!criadas) {
      fnCriarColunas();
      return go(true);
    } else throw new Error('Erro ao criar colunas adicionais.');
  };
  return go();
};

const makeCriarColunasAdicionais = (fn: (_: HTMLTableElement) => void) => () =>
  document.querySelectorAll<HTMLTableElement>('table.tabelaControle').forEach(fn);

const criarColunasAdicionais = makeCriarColunasAdicionais(criarColunaAdicional);

const criarColunasAdicionaisMarcador = makeCriarColunasAdicionais(criarColunaAdicionalMarcador);

export const obterColuna = obterColunaAdicional('colAdicional', criarColunasAdicionais);

export const obterColunaMarcador = obterColunaAdicional(
  'colAdicionalMarcador',
  criarColunasAdicionaisMarcador,
);
