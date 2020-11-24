import { altOrdering, Compare, compareUsing, Ordering } from './Ordering';
import { Processo } from './Processo';

export function gerarFuncaoOrdenarPorMarcador(
  fnOrdenacao: Compare<Processo>,
  inverter: boolean,
): Compare<Processo> {
  return (a, b) => {
    let textoA = a.marcador?.nome ?? 'zz';
    let textoB = b.marcador?.nome ?? 'zz';
    if (inverter) {
      [textoB, textoA] = [textoA, textoB];
    }
    return textoA < textoB ? Ordering.LT : textoA > textoB ? Ordering.GT : fnOrdenacao(a, b);
  };
}

export const ordenarPorOrdemPadrao: Compare<Processo> = compareUsing(x => x.ordemOriginal);

export const ordenarPorAnotacao: Compare<Processo> = altOrdering(
  compareUsing(x => x.anotacao?.texto ?? 'zz'),
  ordenarPorOrdemPadrao,
);

export const ordenarPorAnotacaoPrioritariosPrimeiro: Compare<Processo> = altOrdering(
  compareUsing(x => (x.anotacao?.prioridade ?? false ? 'A' : 'B')),
  compareUsing(x => x.anotacao?.texto ?? 'zz'),
  ordenarPorOrdemPadrao,
);

export const ordenarPorNumero: Compare<Processo> = compareUsing(x => x.numero);

export const ordenarPorTipoEspecificacaoAnotacao: Compare<Processo> = altOrdering(
  compareUsing(
    ({ tipo, especificacao, anotacao }) => `${tipo}${especificacao}${anotacao?.texto ?? ''}`,
  ),
  ordenarPorOrdemPadrao,
);
