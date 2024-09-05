import { Criterio, Ordenacao } from './Ordenacao';
import {
  gerarFuncaoOrdenarPorMarcador,
  ordenarPorAnotacao,
  ordenarPorAnotacaoPrioritariosPrimeiro,
  ordenarPorNumero,
  ordenarPorOrdemPadrao,
  ordenarPorTipoEspecificacaoAnotacao,
} from './ordenar';
import { Compare } from './Ordering';
import { Processo } from './Processo';
import { Tabela } from './Tabela';

export function definirOrdenacaoProcessos(tabela: Tabela, ordenacao: Ordenacao, agrupar: boolean) {
  let funcaoOrdenacao: Compare<Processo>;
  switch (ordenacao.criterio) {
    case Criterio.ANOTACAO:
      if (ordenacao.prioritarios) {
        funcaoOrdenacao = ordenarPorAnotacaoPrioritariosPrimeiro;
      } else {
        funcaoOrdenacao = ordenarPorAnotacao;
      }
      break;

    case Criterio.TIPO:
      funcaoOrdenacao = ordenarPorTipoEspecificacaoAnotacao;
      break;

    case Criterio.NUMERO:
      funcaoOrdenacao = ordenarPorNumero;
      break;

    case Criterio.PADRAO:
    default:
      funcaoOrdenacao = ordenarPorOrdemPadrao;
      break;
  }
  if (agrupar) funcaoOrdenacao = gerarFuncaoOrdenarPorMarcador(funcaoOrdenacao, ordenacao.inverter);
  const linhas = tabela.processos
    .slice()
    .sort(funcaoOrdenacao)
    .map(x => x.linha);
  const linhasOrdenadas = ordenacao.inverter ? linhas.reverse() : linhas;
  tabela.elemento.tBodies[0].append(...linhasOrdenadas);
}
