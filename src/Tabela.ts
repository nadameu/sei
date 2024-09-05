import { Processo } from './Processo';

export interface Tabela {
  elemento: HTMLTableElement & { tBodies: { 0: HTMLTableSectionElement } };
  cabecalho: HTMLTableRowElement & { cells: { 0: HTMLTableCellElement; 1: HTMLTableCellElement } };
  processos: Processo[];
}
