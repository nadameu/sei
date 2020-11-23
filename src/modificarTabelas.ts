import { analisarTabela } from './analisar';

export function modificarTabelas() {
  const tabelas = document.querySelectorAll<HTMLTableElement>('table.tabelaControle');
  if (tabelas.length !== 2) throw new Error(`Número inesperado de tabelas: ${tabelas.length}.`);
  const [recebidos, gerados] = tabelas;
  const info = {
    recebidos: analisarTabela(recebidos),
    gerados: analisarTabela(gerados),
  };
  console.log(info);
}
