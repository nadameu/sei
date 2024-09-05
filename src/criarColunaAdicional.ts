import { Anotacao } from './Anotacao';
import { corrigirHTML } from './corrigirHTML';
import { Marcador } from './Marcador';
import { Processo } from './Processo';
import { Tabela } from './Tabela';

export function criarColunasAdicionaisCabecalho(cabecalhoCells: Tabela['cabecalhoCells']) {
  const coluna = cabecalhoCells[1];
  coluna.colSpan = 2;
  coluna.insertAdjacentHTML(
    'afterend',
    [
      '<th class="infraTh tituloControle colAdicionalMarcador">Marcador</th>',
      '<th class="infraTh tituloControle colAdicional"><span class="tipo">Tipo / Especificação</span><span class="ambos"> / </span><span class="anotacao">Anotações</span></th>',
      '<th class="infraTh"></th>',
    ].join(''),
  );
}

export function criarColunasAdicionaisProcesso({
  cells,
  marcador,
  tipo,
  especificacao,
  anotacao,
}: Processo) {
  const coluna = cells[2];
  coluna.insertAdjacentHTML(
    'afterend',
    [
      criarColunaAdicionalMarcador(marcador),
      '<td class="colAdicional">',
      criarDivTipo(tipo),
      criarDivEspecificacao(especificacao),
      criarDivAnotacao(anotacao),
      '</td>',
    ].join(''),
  );
}

function criarColunaAdicionalMarcador(marcador?: Marcador) {
  return [
    '<td class="colAdicionalMarcador">',
    marcador
      ? `<div class="marcador" data-cor="${marcador.cor}">${corrigirHTML(marcador.nome)}</div>${
          marcador.texto ? `<div class="marcadorTexto">${corrigirHTML(marcador.texto)}</div>` : ''
        }`
      : '',
    '</td>',
  ].join('');
}

function criarDivTipo(tipo: string) {
  return `<div class="tipo">${corrigirHTML(tipo)}</div>`;
}

function criarDivEspecificacao(especificacao?: string) {
  return especificacao ? `<div class="especificacao">${corrigirHTML(especificacao)}</div>` : '';
}

function criarDivAnotacao(anotacao?: Anotacao) {
  if (!anotacao) return '';
  const classes = ['anotacao'].concat(anotacao.prioridade ? ['prioridade'] : []);
  return `<div class="${classes.join(' ')}"><a href="${anotacao.url}"><img src="${
    anotacao.src
  }"></a> ${corrigirHTML(anotacao.texto)} (${corrigirHTML(anotacao.usuario)})</div>`;
}
