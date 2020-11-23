import { analisarTipo, analisarAnotacoes, analisarMarcadores } from './analisar';

export function modificarTabelas() {
  analisarTipo();
  analisarAnotacoes();
  analisarMarcadores();
}
