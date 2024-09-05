import { Processo } from './Processo';

export interface Tabela {
  tabela: HTMLTableElement;
  tbody: HTMLTableSectionElement;
  cabecalho: HTMLTableRowElement;
  cabecalhoCells: Array<HTMLTableCellElement> & Record<'0' | '1', HTMLTableCellElement>;
  processos: Processo[];
}
