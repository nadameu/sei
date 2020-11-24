import { Ordenacao } from './Ordenacao';
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

export function definirOrdenacaoProcessos(tabela: Tabela, ordenacao: number, agrupar: boolean) {
  let funcaoOrdenacao: Compare<Processo>;
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
  if (agrupar)
    funcaoOrdenacao = gerarFuncaoOrdenarPorMarcador(
      funcaoOrdenacao,
      (ordenacao & Ordenacao.INVERTER) > 0,
    );
  const linhas = tabela.processos
    .slice()
    .sort(funcaoOrdenacao)
    .map(x => x.linha);
  const linhasOrdenadas = (ordenacao & Ordenacao.INVERTER) > 0 ? linhas.reverse() : linhas;
  tabela.elemento.tBodies[0].append(...linhasOrdenadas);
}
