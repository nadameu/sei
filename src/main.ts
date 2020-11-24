import { modificarTelaProcessos } from './modificarTelaProcessos';

export function main() {
  const params = new URL(document.location.href).searchParams;
  if (params.get('acao') === 'procedimento_controlar') {
    modificarTelaProcessos();
  }
}
