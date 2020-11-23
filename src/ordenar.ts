import { altOrdering, Compare, compareUsing, Ordering } from './Ordering';
import { Processo } from './Processo';

export function gerarFuncaoOrdenarPorMarcador(
  fnOrdenacao: Compare<Processo>,
  inverter: boolean,
): Compare<Processo> {
  return (a, b) => {
    let textoA = a.marcador === '' ? 'zz' : a.marcador;
    let textoB = b.marcador === '' ? 'zz' : b.marcador;
    if (inverter) {
      [textoB, textoA] = [textoA, textoB];
    }
    return textoA < textoB ? Ordering.LT : textoA > textoB ? Ordering.GT : fnOrdenacao(a, b);
  };
}

export const ordenarPorOrdemPadrao: Compare<Processo> = compareUsing(x => x.ordemOriginal);

export const ordenarPorAnotacao: Compare<Processo> = altOrdering(
  compareUsing(x => (x.anotacao === '' ? 'zz' : x.anotacao)),
  ordenarPorOrdemPadrao,
);

export const ordenarPorAnotacaoPrioritariosPrimeiro: Compare<Processo> = altOrdering(
  compareUsing(
    x => `${x.prioridade === '' ? 'zz' : x.prioridade}${x.anotacao === '' ? 'zz' : x.anotacao}`,
  ),
  ordenarPorOrdemPadrao,
);

export const ordenarPorNumero: Compare<Processo> = compareUsing(x => x.numero);

export const ordenarPorTipoEspecificacaoAnotacao: Compare<Processo> = altOrdering(
  compareUsing(({ tipo, especificacao, anotacao }) => `${tipo}${especificacao}${anotacao}`),
  ordenarPorOrdemPadrao,
);
