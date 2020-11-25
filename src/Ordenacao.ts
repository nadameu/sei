export const Ordenacao = {
  PADRAO: 0,
  NUMERO: 1,
  TIPO: 2,
  ANOTACAO: 3,
  INVERTER: 4,
  PRIORITARIOS: 8,
} as const;
export type Ordenacao = typeof Ordenacao[keyof typeof Ordenacao];
