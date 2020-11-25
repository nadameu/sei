import { Anotacao } from './Anotacao';
import { CoresMarcadores } from './CoresMarcadores';
import { Marcador } from './Marcador';
import { Pagina } from './Pagina';
import { Processo } from './Processo';
import { Tabela } from './Tabela';

export function analisarPagina(): Pagina {
  const tabelas = document.querySelectorAll<HTMLTableElement>('table.tabelaControle');
  if (tabelas.length !== 2) throw new Error(`Número inesperado de tabelas: ${tabelas.length}.`);
  const infoTabelas = Array.from(tabelas, analisarTabela);
  const divRecebidos = document.querySelector<HTMLDivElement>('div#divRecebidos');
  if (!divRecebidos) throw new Error('Elemento não encontrado: "#divRecebidos".');

  return { divRecebidos, tabelas: infoTabelas };
}

function analisarTabela(tabela: HTMLTableElement): Tabela {
  if (tabela.tBodies.length !== 1) throw new Error('Erro ao analisar tabela.');
  const cabecalho = tabela.rows[0];
  const err = () => {
    throw new Error('Erro ao analisar cabeçalho.');
  };
  if (!cabecalho) err();
  const celulasCabecalho = Array.from(cabecalho.cells);
  if (!celulasCabecalho.every(x => x.matches('th'))) err();
  if (cabecalho.cells.length !== 2) err();
  if (cabecalho.cells[1].colSpan !== 3) err();
  const linhasProcessos = Array.from(tabela.rows).slice(1);
  return { elemento: tabela, cabecalho, processos: linhasProcessos.map(analisarLinha) };
}

function analisarTooltipLinkComMouseover(
  link: HTMLAnchorElement,
): { titulo: string; texto?: string } {
  const match = link
    .getAttribute('onmouseover')!
    .match(/^return infraTooltipMostrar\('(.*)','(.+)'\);$/);
  if (!match) throw new Error('Erro ao analisar tooltip.');
  const [, texto, titulo] = match;
  return { titulo, texto: texto || undefined };
}

function analisarLinha(linha: HTMLTableRowElement, ordemOriginal: number): Processo {
  if (linha.cells.length !== 4)
    throw new Error(`Número inesperado de células: ${linha.cells.length}.`);

  const linkProcesso = linha.cells[2].querySelector<HTMLAnchorElement>(
    'a[href^="controlador.php?acao=procedimento_trabalhar&"][onmouseover]',
  );
  if (!linkProcesso) throw new Error('Link do processo não encontrado.');

  const numeroFormatado = linkProcesso.textContent;
  if (!numeroFormatado) throw new Error('Número do processo não encontrado.');
  const numero = analisarNumeroFormatado(numeroFormatado);

  const { titulo: tipo, texto: especificacao } = analisarTooltipLinkComMouseover(linkProcesso);

  const imgAnotacao = linha.cells[1].querySelector<HTMLImageElement>(
    [1, 2].map(n => `a[href][onmouseover] > img[src^="svg/anotacao${n}\.svg"]`).join(', '),
  );
  const anotacao = imgAnotacao ? analisarAnotacao(imgAnotacao) : undefined;

  const imgMarcador = linha.cells[1].querySelector<HTMLImageElement>(
    CoresMarcadores.map(
      ({ cor }) => `a[href][onmouseover] > img[src^="svg/marcador_${cor}.svg"]`,
    ).join(', '),
  );
  const marcador = imgMarcador ? analisarMarcador(imgMarcador) : undefined;

  return {
    linha,
    link: linkProcesso,
    ordemOriginal,
    numero,
    tipo,
    especificacao,
    anotacao,
    marcador,
  };
}

function analisarNumeroFormatado(numeroFormatado: string) {
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
  return ano * 1000000000 + ordinal + local / 10000;
}

function analisarAnotacao(imgAnotacao: HTMLImageElement): Anotacao {
  const link = imgAnotacao.parentElement as HTMLAnchorElement;
  const { titulo: usuario, texto } = analisarTooltipLinkComMouseover(link);
  if (!texto) throw new Error('Erro ao analisar tooltip.');
  const prioridade = /^svg\/anotacao2\.svg/.test(imgAnotacao.getAttribute('src')!);
  return { texto, usuario, prioridade, imagem: imgAnotacao, src: imgAnotacao.src, url: link.href };
}

function analisarMarcador(imgMarcador: HTMLImageElement): Marcador {
  const link = imgMarcador.parentElement as HTMLAnchorElement;
  const { titulo: nome, texto } = analisarTooltipLinkComMouseover(link);
  const cor = imgMarcador.getAttribute('src')!.match(/^svg\/marcador_(.*)\.svg/)![1];
  return { imagem: imgMarcador, nome, cor, texto: texto || undefined };
}
