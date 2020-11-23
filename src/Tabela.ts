import { Processo } from './Processo';

export interface Tabela {
  cabecalho: HTMLTableRowElement;
  processos: Processo[];
}
