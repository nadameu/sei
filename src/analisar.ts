import { Anotacao } from './Anotacao';
import { CoresMarcadores } from './CoresMarcadores';
import { corrigirHTML } from './corrigirHTML';
import {
  escreverColunaAdicional,
  escreverColunaAdicionalAnotacao,
  escreverColunaAdicionalMarcador,
} from './escreverColunaAdicional';
import { Marcador } from './Marcador';
import { obterCor } from './obterCor';
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

export function analisarTabela(tabela: HTMLTableElement): Tabela {
  const cabecalho = tabela.rows[0];
  if (!cabecalho) throw new Error('Tabela não possui cabeçalho.');
  const celulasCabecalho = Array.from(cabecalho.cells);
  if (!celulasCabecalho.every(x => x.matches('th'))) throw new Error('Cabeçalho não encontrado.');
  if (cabecalho.cells.length !== 2) throw new Error('Cabeçalho não possui duas células.');
  if (cabecalho.cells[1].colSpan !== 3)
    throw new Error('Segunda célula do cabeçalho não possui "colSpan" igual a 3.');
  const linhasProcessos = Array.from(tabela.rows).slice(1);
  return { cabecalho, processos: linhasProcessos.map(analisarLinha) };
}

function analisarLinha(linha: HTMLTableRowElement): Processo {
  if (linha.cells.length !== 4)
    throw new Error(`Número inesperado de células: ${linha.cells.length}.`);

  const linkProcesso = linha.cells[2].querySelector(
    'a[href^="controlador.php?acao=procedimento_trabalhar&"][onmouseover]',
  );
  if (!linkProcesso) throw new Error('Link do processo não encontrado.');

  const numeroFormatado = linkProcesso.textContent;
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

  const onmouseover = linkProcesso.getAttribute('onmouseover')!;
  const match = /^return infraTooltipMostrar\('(.*)','(.+)'\);$/.exec(onmouseover);
  if (!match) throw new Error('Link do processo não possui tipo e especificação.');
  const [, especificacao, tipo] = match;

  const imgAnotacao = linha.cells[1].querySelector(
    [1, 2].map(n => `a[href][onmouseover] > img[src^="svg/anotacao${n}\.svg"]`).join(', '),
  );

  let anotacao: Anotacao | undefined = undefined;
  if (imgAnotacao) {
    const link = imgAnotacao.parentElement as HTMLAnchorElement;
    const mouseover = link.getAttribute('onmouseover')!;
    const match = /^return infraTooltipMostrar\('(.+)','(.+)'\);$/.exec(mouseover);
    if (!match) throw new Error('Imagem de anotação não possui os dados necessários');
    const [, texto, usuario] = match;
    const prioridade = /^svg\/anotacao2\.svg/.test(imgAnotacao.getAttribute('src')!);
    anotacao = { texto, usuario, prioridade };
  }

  const imgMarcador = linha.cells[1].querySelector(
    CoresMarcadores.map(
      ({ cor }) => `a[href][onmouseover] > img[src^="svg/marcador_${cor}.svg"]`,
    ).join(', '),
  );

  let marcador: Marcador | undefined = undefined;
  if (imgMarcador) {
    const link = imgMarcador.parentElement as HTMLAnchorElement;
    const mouseover = link.getAttribute('onmouseover')!;
    const match = /^return infraTooltipMostrar\('(.*)','(.+)'\);$/.exec(mouseover);
    if (!match) throw new Error('Imagem de marcador não possui os dados necessários');
    const [, texto, nome] = match;
    const cor = imgMarcador.getAttribute('src')!.match(/^svg\/marcador_(.*)\.svg/)![1];
    marcador = { nome, cor, texto: texto || undefined };
  }

  return { linha, numero, tipo, especificacao, anotacao, marcador };
}
export function analisarTipo(linha: HTMLTableRowElement) {
  document
    .querySelectorAll<HTMLAnchorElement>(
      'tr a[href^="controlador.php?acao=procedimento_trabalhar"][onmouseover]',
    )
    .forEach(link => {
      const mouseover = link.getAttribute('onmouseover')!;
      const match = /^return infraTooltipMostrar\('(.*)','(.+)'\);$/.exec(mouseover);
      if (!match) throw new Error();
      const [, text, title] = match;
      escreverColunaAdicional(link, `<div class="tipo">${corrigirHTML(title)}</div>`);
      if (text !== '') {
        escreverColunaAdicional(link, `<div class="especificacao">${corrigirHTML(text)}</div>`);
      }
      const cor = obterCor(title);
      link.closest('tr')!.style.background = cor;
    });
}
export function analisarAnotacoes(linha: HTMLTableRowElement) {
  const analisarAnotacao = (prioridade: boolean) => (img: HTMLElement) => {
    const link = img.parentElement as HTMLAnchorElement;
    const mouseover = link.getAttribute('onmouseover')!;
    const match = /^return infraTooltipMostrar\('(.*)','(.*)'\);$/.exec(mouseover);
    if (!match) throw new Error();
    const [, text, user] = match;
    escreverColunaAdicionalAnotacao(
      img,
      `${corrigirHTML(text)} (${corrigirHTML(user)})`,
      link.getAttribute('href')!,
      prioridade,
    );
    img.classList.add('iconeAnotacao');
  };

  document
    .querySelectorAll<HTMLImageElement>(
      'a[href][onmouseover] > img[src="imagens/sei_anotacao_prioridade_pequeno.gif"]',
    )
    .forEach(analisarAnotacao(true));

  document
    .querySelectorAll<HTMLImageElement>(
      'a[href][onmouseover] > img[src="imagens/sei_anotacao_pequeno.gif"]',
    )
    .forEach(analisarAnotacao(false));
}
export function analisarMarcadores(linha: HTMLTableRowElement) {
  document
    .querySelectorAll<HTMLImageElement>('table a[onmouseover] > img[src^="imagens/marcador_"]')
    .forEach(img => {
      const match = /^imagens\/marcador_(.*)\.png$/.exec(img.getAttribute('src')!);
      if (!match) throw new Error();
      const [, cor] = match;
      const mouseover = img.parentElement!.getAttribute('onmouseover')!;
      const match2 = /^return infraTooltipMostrar\('(.*)','(.+)'\);$/.exec(mouseover);
      if (!match2) throw new Error();
      const [, text, title] = match2;
      escreverColunaAdicionalMarcador(
        img,
        `<div class="marcador" data-cor="${cor}">${corrigirHTML(title)}</div>`,
      );
      if (text !== '') {
        escreverColunaAdicionalMarcador(
          img,
          `<div class="marcadorTexto">${corrigirHTML(text)}</div>`,
        );
      }
      img.classList.add('iconeMarcador');
    });
}
