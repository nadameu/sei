import { Acao } from './Acao';
import { adicionarEstilos } from './adicionarEstilos';
import {
  criarColunasAdicionaisCabecalho,
  criarColunasAdicionaisProcesso,
} from './criarColunaAdicional';
import { criarFormulario } from './criarFormulario';
import { definirOrdenacaoProcessos } from './definirOrdenacaoTabelas';
import { obterCor } from './obterCor';
import { Ordenacao } from './Ordenacao';
import { Pagina } from './Pagina';
import { Preferencias } from './Preferencias';

declare function infraTooltipMostrar(texto: string, titulo: string): boolean;

export function renderizarPagina(
  pagina: Pagina,
  preferencias: Preferencias,
  dispatch: (acao: Acao) => void,
) {
  let mostrarTooltip = !preferencias.mostrarTipo;
  adicionarEstilos();
  criarFormulario({ divRecebidos: pagina.divRecebidos, preferencias, dispatch });
  for (const { cabecalhoCells, processos } of pagina.tabelas) {
    for (const celula of cabecalhoCells) celula.removeAttribute('width');
    criarColunasAdicionaisCabecalho(cabecalhoCells);
    for (const processo of processos) {
      processo.linha.style.backgroundColor = obterCor(processo.tipo);
      for (const celula of processo.cells) celula.removeAttribute('width');
      criarColunasAdicionaisProcesso(processo);
      processo.link.removeAttribute('onmouseover');
      processo.link.addEventListener('mouseover', () => {
        if (mostrarTooltip) infraTooltipMostrar(processo.especificacao ?? '', processo.tipo);
      });
      if (processo.anotacao) processo.anotacao.imagem.classList.add('iconeAnotacao');
      if (processo.marcador) processo.marcador.imagem.classList.add('iconeMarcador');
    }
  }

  let agruparAtual: boolean = undefined as any;
  let ordemAtual: Ordenacao = undefined as any;

  atualizar(preferencias);
  return atualizar;

  function atualizar(preferencias: Preferencias) {
    mostrarTooltip = !preferencias.mostrarTipo;
    const campos = [
      'ocultarFieldset',
      'mostrarTipo',
      'mostrarAnotacoes',
      'mostrarMarcadores',
    ] as const;
    for (const campo of campos) {
      document.body.classList.toggle(campo, preferencias[campo]);
    }
    document.body.classList.toggle('ocultarCores', !preferencias.mostrarCores);
    if (
      preferencias.agruparMarcadores !== agruparAtual ||
      preferencias.ordemTabelas !== ordemAtual
    ) {
      agruparAtual = preferencias.agruparMarcadores;
      ordemAtual = preferencias.ordemTabelas;
      for (const tabela of pagina.tabelas)
        definirOrdenacaoProcessos(tabela, ordemAtual, agruparAtual);
    }
  }
}
