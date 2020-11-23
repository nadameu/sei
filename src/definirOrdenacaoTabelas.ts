import { Ordenacao } from './Ordenacao';
import {
  gerarFuncaoOrdenarPorMarcador,
  ordenarPorAnotacao,
  ordenarPorAnotacaoPrioritariosPrimeiro,
  ordenarPorNumero,
  ordenarPorOrdemPadrao,
  ordenarPorTipoEspecificacaoAnotacao,
} from './ordenar';
import { Processo } from './Processo';

export function definirOrdenacaoTabelas(ordenacao: number, agrupar: boolean) {
  document.querySelectorAll<HTMLTableElement>('table.tabelaControle').forEach(tabela => {
    const linhas = tabela.querySelectorAll<HTMLTableRowElement>('tr[id]');
    const informacoes: Processo[] = [];

    linhas.forEach((linha, l) => {
      const links = linha.querySelectorAll<HTMLAnchorElement>(
        'a[href^="controlador.php?acao=procedimento_trabalhar&"]',
      );
      links.forEach(link => {
        if (!link.getAttribute('data-ordem-original')) {
          link.setAttribute('data-ordem-original', String(l));
        }
      });
      const linksAlterados = linha.querySelectorAll('a[data-ordem-original]');
      if (linksAlterados.length === 0) throw new Error('Link do processo não encontrado.');
      const link = linksAlterados[0];
      const numeroFormatado = link.textContent;
      if (!numeroFormatado) throw new Error('Número do processo não encontrado.');
      const textoNumero = numeroFormatado.replace(/[\.-]/g, '');
      let ano, ordinal, local;
      if (textoNumero.length === 20) {
        ano = Number(textoNumero.substr(9, 4));
        ordinal = Number(textoNumero.substr(0, 7));
        local = Number(textoNumero.substr(16, 4));
      } else if (textoNumero.length === 13) {
        ano = 2000 + Number(textoNumero.substr(0, 2));
        ordinal = Number(textoNumero.substr(3, 9));
        local = Number(textoNumero.substr(2, 1));
      } else {
        throw new Error(`Tipo de número desconhecido: ${numeroFormatado}.`);
      }
      const numero = ano * 1000000000 + ordinal + local / 10000;
      const campos = ['tipo', 'especificacao', 'anotacao', 'prioridade', 'marcador'] as const;
      const informacao = campos.reduce(
        (obj, dado) => {
          const texto = linha.querySelectorAll(`.${dado}`)[0]?.textContent ?? '';
          return { ...obj, [dado]: texto.toLocaleLowerCase() };
        },
        {
          elemento: linha,
          numero,
          ordemOriginal: Number(link.getAttribute('data-ordem-original')!),
        } as Partial<Processo>,
      ) as Processo;
      informacoes.push(informacao);
    });

    let funcaoOrdenacao;
    switch (ordenacao & 3) {
      case Ordenacao.ANOTACAO:
        if (ordenacao & Ordenacao.PRIORITARIOS) {
          funcaoOrdenacao = ordenarPorAnotacaoPrioritariosPrimeiro;
        } else {
          funcaoOrdenacao = ordenarPorAnotacao;
        }
        break;

      case Ordenacao.TIPO:
        funcaoOrdenacao = ordenarPorTipoEspecificacaoAnotacao;
        break;

      case Ordenacao.NUMERO:
        funcaoOrdenacao = ordenarPorNumero;
        break;

      case Ordenacao.PADRAO:
      default:
        funcaoOrdenacao = ordenarPorOrdemPadrao;
        break;
    }
    if (agrupar) {
      informacoes.sort(
        gerarFuncaoOrdenarPorMarcador(funcaoOrdenacao, (ordenacao & Ordenacao.INVERTER) > 0),
      );
    } else {
      informacoes.sort(funcaoOrdenacao);
    }
    if (ordenacao & Ordenacao.INVERTER) {
      informacoes.reverse();
    }

    tabela.tBodies[0].append(...informacoes.map(x => x.elemento));
  });
}
