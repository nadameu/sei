import { Anotacao } from './Anotacao';
import { Marcador } from './Marcador';

export interface Processo {
  linha: HTMLTableRowElement;
  numero: number;
  tipo: string;
  especificacao: string;
  anotacao?: Anotacao;
  marcador?: Marcador;
}
