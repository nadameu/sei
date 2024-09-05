import { Anotacao } from './Anotacao';
import { Marcador } from './Marcador';

export interface Processo {
  linha: HTMLTableRowElement;
  cells: HTMLCollectionOf<HTMLTableCellElement> & Record<'0' | '1' | '2', HTMLTableCellElement>;
  link: HTMLAnchorElement;
  ordemOriginal: number;
  numero: number;
  tipo: string;
  especificacao?: string;
  anotacao?: Anotacao;
  marcador?: Marcador;
}
