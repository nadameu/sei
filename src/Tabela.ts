import { Processo } from './Processo';

export interface Tabela {
  elemento: HTMLTableElement;
  cabecalho: HTMLTableRowElement;
  processos: Processo[];
}
