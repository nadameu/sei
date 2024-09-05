import { Anotacao } from './Anotacao';
import { CoresMarcadores } from './CoresMarcadores';
import { Marcador } from './Marcador';
import { Pagina } from './Pagina';
import { Processo } from './Processo';
import { Tabela } from './Tabela';
import * as M from './M';
import { pipe } from '@nadameu/pipe';
import { ParseError } from './ParseError';

export function analisarPagina(): M.Result<Pagina, ParseError> {
  const tabelas = document.querySelectorAll<HTMLTableElement>('table.tabelaControle');
  if (tabelas.length < 1 || tabelas.length > 2)
    return M.err(new ParseError(`Número inesperado de tabelas: ${tabelas.length}.`));
  const infoTabelas = M.all(Array.from(tabelas, analisarTabela));
  const divRecebidos = document.querySelector<HTMLDivElement>('div#divRecebidos, div#divGerados');
  if (!divRecebidos)
    return M.err(new ParseError('Elemento não encontrado: "#divRecebidos" | "#divGerados.'));

  return pipe(
    infoTabelas,
    M.map(infoTabelas => ({ divRecebidos, tabelas: infoTabelas })),
  );
}

function analisarTabela(tabela: HTMLTableElement) {
  return pipe(
    M.tryCatch(
      (): M.Result<Tabela, ParseError> => {
        if (!M.hasLength(tabela.tBodies, 1)) throw new ParseError('Erro ao analisar tabela.');
        const tbody = tabela.tBodies[0];
        const cabecalho = tabela.rows[0];
        function assertCabecalho(condition: boolean): asserts condition {
          if (!condition) throw new ParseError('Erro ao analisar cabeçalho.');
        }
        assertCabecalho(cabecalho !== undefined);
        const celulasCabecalho = Array.from(cabecalho.cells);
        assertCabecalho(celulasCabecalho.every(x => x.matches('th')));
        assertCabecalho(M.hasLength(celulasCabecalho, 2));
        assertCabecalho(celulasCabecalho[1].colSpan === 3);
        const linhasProcessos = Array.from(tabela.rows).slice(1);
        return pipe(
          M.all(linhasProcessos.map(analisarLinha)),
          M.map(processos => ({
            tabela,
            tbody,
            cabecalho,
            cabecalhoCells: celulasCabecalho,
            processos,
          })),
        );
      },
      e => {
        if (e instanceof ParseError) return M.err(e);
        throw e;
      },
    ),
    M.chain(x => x),
  );
}

function analisarTooltipLinkComMouseover(link: HTMLAnchorElement): M.Result<
  {
    titulo: string;
    texto?: string;
  },
  ParseError
> {
  const match = link
    .getAttribute('onmouseover')!
    .match(/^return infraTooltipMostrar\('(.*)','(.+)'\);$/);
  if (!match || !M.hasLength(match, 3)) return M.err(new ParseError('Erro ao analisar tooltip.'));
  const [, texto, titulo] = match;
  return M.ok({ titulo, texto: texto || undefined });
}

function analisarLinha(linha: HTMLTableRowElement, ordemOriginal: number) {
  const cells = linha.cells;
  if (!M.hasLength(cells, 4))
    return M.err(new ParseError(`Número inesperado de células: ${cells.length}.`));

  const linkProcesso = cells[2].querySelector<HTMLAnchorElement>(
    'a[href^="controlador.php?acao=procedimento_trabalhar&"][onmouseover]',
  );
  if (!linkProcesso) return M.err(new ParseError('Link do processo não encontrado.'));

  const numeroFormatado = linkProcesso.textContent;
  if (!numeroFormatado) return M.err(new ParseError('Número do processo não encontrado.'));
  const numero = analisarNumeroFormatado(numeroFormatado);

  const imgAnotacao = cells[1].querySelector<HTMLImageElement>(
    [1, 2].map(n => `a[href][onmouseover] > img[src^="svg/anotacao${n}\.svg"]`).join(', '),
  );
  const anotacao = imgAnotacao ? analisarAnotacao(imgAnotacao) : M.ok(undefined);

  const imgMarcador = cells[1].querySelector<HTMLImageElement>(
    CoresMarcadores.map(
      ({ cor }) => `a[href][onmouseover] > img[src^="svg/marcador_${cor}.svg"]`,
    ).join(', '),
  );
  const marcador = imgMarcador ? analisarMarcador(imgMarcador) : M.ok(undefined);

  return pipe(
    M.all([analisarTooltipLinkComMouseover(linkProcesso), numero, anotacao, marcador]),
    M.map(
      ([{ titulo: tipo, texto: especificacao }, numero, anotacao, marcador]): Processo => ({
        linha,
        cells,
        link: linkProcesso,
        ordemOriginal,
        numero,
        tipo,
        especificacao,
        anotacao,
        marcador,
      }),
    ),
  );
}

function analisarNumeroFormatado(numeroFormatado: string): M.Result<number, ParseError> {
  const textoNumero = numeroFormatado.replace(/[.\-\/]/g, '');
  let ano, ordinal, local;
  if (textoNumero.length === 20) {
    ano = Number(textoNumero.slice(9, 13));
    ordinal = Number(textoNumero.slice(0, 7));
    local = Number(textoNumero.slice(16, 20));
  } else if (textoNumero.length === 13) {
    ano = 2000 + Number(textoNumero.slice(0, 2));
    ordinal = Number(textoNumero.slice(3, 12));
    local = Number(textoNumero.slice(2, 3));
  } else if (textoNumero.length === 10) {
    ano = Number(textoNumero.slice(6, 10));
    ordinal = Number(textoNumero.slice(0, 6));
    local = 0;
  } else {
    return M.err(new ParseError(`Tipo de número desconhecido: ${numeroFormatado}.`));
  }
  return M.ok(ano * 1000000000 + ordinal + local / 10000);
}

function analisarAnotacao(imgAnotacao: HTMLImageElement) {
  const link = imgAnotacao.parentElement as HTMLAnchorElement;
  return pipe(
    analisarTooltipLinkComMouseover(link),
    M.chain(({ titulo: usuario, texto }) => {
      if (!texto) return M.err(new ParseError('Erro ao analisar tooltip.'));
      const prioridade = /^svg\/anotacao2\.svg/.test(imgAnotacao.getAttribute('src')!);
      return M.ok<Anotacao>({
        texto,
        usuario,
        prioridade,
        imagem: imgAnotacao,
        src: imgAnotacao.src,
        url: link.href,
      });
    }),
  );
}

function analisarMarcador(imgMarcador: HTMLImageElement) {
  return pipe(
    imgMarcador.parentElement as HTMLAnchorElement,
    analisarTooltipLinkComMouseover,
    M.map(
      ({ titulo: nome, texto }): Marcador => ({
        imagem: imgMarcador,
        nome,
        cor: imgMarcador.getAttribute('src')!.match(/^svg\/marcador_(.*)\.svg/)![1]!,
        texto,
      }),
    ),
  );
}
