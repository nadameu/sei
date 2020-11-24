import { getLineAndCharacterOfPosition } from 'typescript';
import { Acao } from './Acao';
import { adicionarEstilos } from './adicionarEstilos';
import {
  criarColunasAdicionaisCabecalho,
  criarColunasAdicionaisProcesso,
} from './criarColunaAdicional';
import { criarFormulario } from './criarFormulario';
import { obterCor } from './obterCor';
import { Pagina } from './Pagina';
import { Preferencias } from './Preferencias';

export function renderizarPagina(
  pagina: Pagina,
  preferencias: Preferencias,
  dispatch: (acao: Acao) => void,
) {
  adicionarEstilos();
  criarFormulario({ divRecebidos: pagina.divRecebidos, preferencias, dispatch });
  for (const { cabecalho, processos } of pagina.tabelas) {
    for (const celula of cabecalho.cells) celula.removeAttribute('width');
    criarColunasAdicionaisCabecalho(cabecalho);
    for (const processo of processos) {
      processo.linha.style.backgroundColor = obterCor(processo.tipo);
      for (const celula of processo.linha.cells) celula.removeAttribute('width');
      criarColunasAdicionaisProcesso(processo.linha, processo);
      if (processo.anotacao) processo.anotacao.imagem.classList.add('iconeAnotacao');
      if (processo.marcador) processo.marcador.imagem.classList.add('iconeMarcador');
    }
  }

  atualizar(preferencias);
  return atualizar;

  function atualizar(preferencias: Preferencias) {
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
  }
}
