import { Serializable } from './Serializable';

export const Criterio = {
  PADRAO: 0,
  NUMERO: 1,
  TIPO: 2,
  ANOTACAO: 3,
} as const;
export type Criterio = (typeof Criterio)[keyof typeof Criterio];
export type Ordenacao = {
  criterio: Criterio;
  inverter: boolean;
  prioritarios: boolean;
};
export const sord: Serializable<Ordenacao> = {
  parse(representation) {
    const valor = Number(representation);
    if (!Number.isInteger(valor) || valor < 0 || valor > 15) return { valid: false };
    return {
      valid: true,
      value: {
        criterio: (valor & 3) as 0 | 1 | 2 | 3,
        inverter: (valor & 4) === 4,
        prioritarios: (valor & 8) === 8,
      },
    };
  },
  serialize(value) {
    return (value.criterio + (value.inverter ? 4 : 0) + (value.prioritarios ? 8 : 0)).toString();
  },
};
