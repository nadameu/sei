// import { obterColuna, obterColunaMarcador } from './obterColunaAdicional';

// const makeEscreverColunaAdicional = (
//   fnObterColuna: (_: HTMLElement) => HTMLTableDataCellElement,
// ) => (elemento: HTMLElement, html: string) => {
//   const coluna = fnObterColuna(elemento);
//   coluna.insertAdjacentHTML('beforeend', html);
// };

// export const escreverColunaAdicional = makeEscreverColunaAdicional(obterColuna);

// export const escreverColunaAdicionalMarcador = makeEscreverColunaAdicional(obterColunaMarcador);

// export function escreverColunaAdicionalAnotacao(
//   elemento: HTMLElement,
//   html: string,
//   url: string,
//   prioridade: boolean,
// ) {
//   const classes = ['anotacao'];
//   if (prioridade) {
//     classes.push('prioridade');
//   }
//   const imagem = prioridade
//     ? 'imagens/sei_anotacao_prioridade_pequeno.gif'
//     : 'imagens/sei_anotacao_pequeno.gif';
//   escreverColunaAdicional(
//     elemento,
//     `<div class="${classes.join(' ')}"><a href="${url}"><img src="${imagem}"/></a> ${html}</div>`,
//   );
// }
