import { Anotacao } from './Anotacao';
import { Marcador } from './Marcador';

export interface Processo {
  linha: HTMLTableRowElement;
  link: HTMLAnchorElement;
  ordemOriginal: number;
  numero: number;
  tipo: string;
  especificacao?: string;
  anotacao?: Anotacao;
  marcador?: Marcador;
}
