import { Ordenacao } from './Ordenacao';

export interface Preferencias {
  ocultarFieldset: boolean;
  mostrarTipo: boolean;
  mostrarAnotacoes: boolean;
  mostrarCores: boolean;
  mostrarMarcadores: boolean;
  agruparMarcadores: boolean;
  ordemTabelas: Ordenacao;
}
