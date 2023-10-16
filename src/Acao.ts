export const Acao = {
  setBool: (nome: string, valor: boolean) => ({ tipo: 'setBool' as const, nome, valor }),
  setOrdenacao: (valor: number) => ({ tipo: 'setOrdenacao' as const, valor }),
};
export type Acao = ReturnType<(typeof Acao)[keyof typeof Acao]>;
