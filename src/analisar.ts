import { CoresMarcadores } from './CoresMarcadores';
import { Err, isErr, traverseErr } from './Err';
import * as M from './hasLength';
import { Marcador } from './Marcador';
import { Pagina } from './Pagina';
import { Processo } from './Processo';
import { Tabela } from './Tabela';


export function analisarPagina(): Pagina | Err {
  const eltTabelas = document.querySelectorAll<HTMLTableElement>('table.tabelaControle');
  if (eltTabelas.length < 1 || eltTabelas.length > 2) {
    return new Err(`Número inesperado de tabelas: ${eltTabelas.length}.`);
  }

  const tabelas = traverseErr(eltTabelas, analisarTabela);
  if (isErr(tabelas)) return tabelas;

  const divRecebidos = document.querySelector<HTMLDivElement>('div#divRecebidos, div#divGerados');
  if (!divRecebidos) {
    return new Err('Elemento não encontrado: "#divRecebidos" | "#divGerados.');
  }

  return { divRecebidos, tabelas };
}

function analisarTabela(tabela: HTMLTableElement): Tabela | Err {
  const tbody = tabela.tBodies[0];
  if (!tbody) {
    return new Err('Erro ao analisar tabela.');
  }

  const cabecalho = tabela.rows[0];
  if (!cabecalho) {
    return new Err('Erro ao analisar cabecalho.');
  }

  const cabecalhoCells = Array.from(cabecalho.cells);
  if (
    !cabecalhoCells.every(x => x.matches('th')) ||
    !M.hasLength(cabecalhoCells, 2) ||
    cabecalhoCells[1].colSpan !== 3
  ) {
    return new Err('Erro ao analisar cabecalho.');
  }

  const linhasProcessos = Array.from(tabela.rows).slice(1);
  const processos = traverseErr(linhasProcessos, analisarLinha);
  if (isErr(processos)) return processos;

  return ({ tabela, tbody, cabecalho, cabecalhoCells, processos });
}

function analisarTooltipLinkComMouseover(link: HTMLAnchorElement): {
  titulo: string;
  texto?: string;
} |
  Err {
  const match = link
    .getAttribute('onmouseover')!
    .match(/^return infraTooltipMostrar\('(.*)','(.+)'\);$/);
  if (!match || !M.hasLength(match, 3)) return new Err('Erro ao analisar tooltip.');
  const [, texto, titulo] = match;
  return { titulo, texto: texto || undefined };
}

function analisarLinha(
  linha: HTMLTableRowElement,
  ordemOriginal: number,
): Processo | Err {
  const cells = linha.cells;
  if (!M.hasLength(cells, 4)) {
    return new Err(`Número inesperado de células: ${cells.length}.`);
  }

  const link = cells[2].querySelector<HTMLAnchorElement>(
    'a[href^="controlador.php?acao=procedimento_trabalhar&"][onmouseover]',
  );
  if (!link) {
    return new Err('Link do processo não encontrado.');
  }

  const numeroFormatado = link.textContent;
  if (!numeroFormatado) {
    return new Err('Número do processo não encontrado.');
  }
  const numero = analisarNumeroFormatado(numeroFormatado);
  if (isErr(numero)) return numero;

  const imgAnotacao = cells[1].querySelector<HTMLImageElement>(
    [1, 2].map(n => `a[href][onmouseover] > img[src^="svg/anotacao${n}\.svg"]`).join(', '),
  );
  const anotacao = imgAnotacao ? analisarAnotacao(imgAnotacao) : undefined;
  if (isErr(anotacao)) return anotacao;

  const imgMarcador = cells[1].querySelector<HTMLImageElement>(
    CoresMarcadores.map(
      ({ cor }) => `a[href][onmouseover] > img[src^="svg/marcador_${cor}.svg"]`,
    ).join(', '),
  );
  const marcador = imgMarcador ? analisarMarcador(imgMarcador) : undefined;
  if (isErr(marcador)) return marcador;

  const tituloTexto = analisarTooltipLinkComMouseover(link);
  if (isErr(tituloTexto)) return tituloTexto;
  const { titulo: tipo, texto: especificacao } = tituloTexto;

  return {
    linha,
    cells,
    link,
    ordemOriginal,
    numero,
    tipo,
    especificacao,
    anotacao,
    marcador,
  };
}

function analisarNumeroFormatado(numeroFormatado: string): number | Err {
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
    return new Err(`Tipo de número desconhecido: ${numeroFormatado}.`);
  }
  return ano * 1000000000 + ordinal + local / 10000;
}

function analisarAnotacao(imgAnotacao: HTMLImageElement) {
  const link = imgAnotacao.parentElement;
  if (!(link instanceof HTMLAnchorElement)) {
    return new Err('Não foi possível analisar anotação.');
  }

  const tituloTexto = analisarTooltipLinkComMouseover(link);
  if (isErr(tituloTexto)) return tituloTexto;
  const { titulo: usuario, texto } = tituloTexto;

  if (!texto) {
    return new Err('Erro ao analisar tooltip.');
  }

  const prioridade = /^svg\/anotacao2\.svg/.test(imgAnotacao.getAttribute('src')!);

  return {
    texto,
    usuario,
    prioridade,
    imagem: imgAnotacao,
    src: imgAnotacao.src,
    url: link.href,
  };
}

function analisarMarcador(imgMarcador: HTMLImageElement): Marcador | Err {
  const parent = imgMarcador.parentElement;
  if (!(parent instanceof HTMLAnchorElement)) {
    return new Err('Não foi possível analisar marcador.');
  }

  const tituloTexto = analisarTooltipLinkComMouseover(parent);
  if (isErr(tituloTexto)) return tituloTexto;

  const { titulo: nome, texto } = tituloTexto;

  const cor = imgMarcador.getAttribute('src')!.match(/^svg\/marcador_(.*)\.svg/)![1]!;

  return { imagem: imgMarcador, nome, cor, texto };
}
