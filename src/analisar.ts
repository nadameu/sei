import { Anotacao } from './Anotacao';
import { CoresMarcadores } from './CoresMarcadores';
import * as M from './M';
import { Marcador } from './Marcador';
import { Pagina } from './Pagina';
import { ParseError } from './ParseError';
import { Processo } from './Processo';
import { Tabela } from './Tabela';

function parseError(msg: string) {
  return M.err(new ParseError(msg));
}

export function analisarPagina(): M.Result<Pagina, ParseError> {
  const tabelas = document.querySelectorAll<HTMLTableElement>('table.tabelaControle');
  if (tabelas.length < 1 || tabelas.length > 2) {
    return parseError(`Número inesperado de tabelas: ${tabelas.length}.`);
  }

  const resInfoTabelas = M.traverse(tabelas, analisarTabela);
  if (M.isErr(resInfoTabelas)) {
    return resInfoTabelas;
  }
  const infoTabelas = resInfoTabelas.value;

  const divRecebidos = document.querySelector<HTMLDivElement>('div#divRecebidos, div#divGerados');
  if (!divRecebidos) {
    return parseError('Elemento não encontrado: "#divRecebidos" | "#divGerados.');
  }

  return M.ok({ divRecebidos, tabelas: infoTabelas });
}

function analisarTabela(tabela: HTMLTableElement): M.Result<Tabela, ParseError> {
  if (!M.hasLength(tabela.tBodies, 1)) {
    return parseError('Erro ao analisar tabela.');
  }

  const tbody = tabela.tBodies[0];

  const cabecalho = tabela.rows[0];
  if (!cabecalho) {
    return parseError('Erro ao analisar cabecalho.');
  }

  const cabecalhoCells = Array.from(cabecalho.cells);
  if (
    !cabecalhoCells.every(x => x.matches('th')) ||
    !M.hasLength(cabecalhoCells, 2) ||
    cabecalhoCells[1].colSpan !== 3
  ) {
    return parseError('Erro ao analisar cabecalho.');
  }

  const linhasProcessos = Array.from(tabela.rows).slice(1);
  const resProcessos = M.traverse(linhasProcessos, analisarLinha);
  if (M.isErr(resProcessos)) {
    return resProcessos;
  }
  const processos = resProcessos.value;

  return M.ok({ tabela, tbody, cabecalho, cabecalhoCells, processos });
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
  if (!match || !M.hasLength(match, 3)) return parseError('Erro ao analisar tooltip.');
  const [, texto, titulo] = match;
  return M.ok({ titulo, texto: texto || undefined });
}

function analisarLinha(
  linha: HTMLTableRowElement,
  ordemOriginal: number,
): M.Result<Processo, ParseError> {
  const cells = linha.cells;
  if (!M.hasLength(cells, 4)) {
    return parseError(`Número inesperado de células: ${cells.length}.`);
  }

  const link = cells[2].querySelector<HTMLAnchorElement>(
    'a[href^="controlador.php?acao=procedimento_trabalhar&"][onmouseover]',
  );
  if (!link) {
    return parseError('Link do processo não encontrado.');
  }

  const numeroFormatado = link.textContent;
  if (!numeroFormatado) {
    return M.err<ParseError, never>(new ParseError('Número do processo não encontrado.'));
  }
  const resNumero = analisarNumeroFormatado(numeroFormatado);
  if (M.isErr(resNumero)) {
    return resNumero;
  }
  const numero = resNumero.value;

  const imgAnotacao = cells[1].querySelector<HTMLImageElement>(
    [1, 2].map(n => `a[href][onmouseover] > img[src^="svg/anotacao${n}\.svg"]`).join(', '),
  );
  const resAnotacao = imgAnotacao ? analisarAnotacao(imgAnotacao) : M.ok(undefined);
  if (M.isErr(resAnotacao)) {
    return resAnotacao;
  }
  const anotacao = resAnotacao.value;

  const imgMarcador = cells[1].querySelector<HTMLImageElement>(
    CoresMarcadores.map(
      ({ cor }) => `a[href][onmouseover] > img[src^="svg/marcador_${cor}.svg"]`,
    ).join(', '),
  );
  const resMarcador = imgMarcador ? analisarMarcador(imgMarcador) : M.ok(undefined);
  if (M.isErr(resMarcador)) {
    return resMarcador;
  }
  const marcador = resMarcador.value;

  const resTituloTexto = analisarTooltipLinkComMouseover(link);
  if (M.isErr(resTituloTexto)) {
    return resTituloTexto;
  }
  const { titulo: tipo, texto: especificacao } = resTituloTexto.value;

  return M.ok({
    linha,
    cells,
    link,
    ordemOriginal,
    numero,
    tipo,
    especificacao,
    anotacao,
    marcador,
  });
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
    return parseError(`Tipo de número desconhecido: ${numeroFormatado}.`);
  }
  return M.ok(ano * 1000000000 + ordinal + local / 10000);
}

function analisarAnotacao(imgAnotacao: HTMLImageElement) {
  const link = imgAnotacao.parentElement;
  if (!(link instanceof HTMLAnchorElement)) {
    return parseError('Não foi possível analisar anotação.');
  }

  const result = analisarTooltipLinkComMouseover(link);
  if (M.isErr(result)) {
    return result;
  }
  const { titulo: usuario, texto } = result.value;

  if (!texto) {
    return parseError('Erro ao analisar tooltip.');
  }

  const prioridade = /^svg\/anotacao2\.svg/.test(imgAnotacao.getAttribute('src')!);

  return M.ok<Anotacao>({
    texto,
    usuario,
    prioridade,
    imagem: imgAnotacao,
    src: imgAnotacao.src,
    url: link.href,
  });
}

function analisarMarcador(imgMarcador: HTMLImageElement) {
  const parent = imgMarcador.parentElement;
  if (!(parent instanceof HTMLAnchorElement)) {
    return parseError('Não foi possível analisar marcador.');
  }

  const result = analisarTooltipLinkComMouseover(parent);
  if (M.isErr(result)) {
    return result;
  }
  const { titulo: nome, texto } = result.value;

  const cor = imgMarcador.getAttribute('src')!.match(/^svg\/marcador_(.*)\.svg/)![1]!;

  return M.ok<Marcador>({ imagem: imgMarcador, nome, cor, texto });
}
