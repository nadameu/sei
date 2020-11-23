import { modificarTelaProcessos } from './modificarTelaProcessos';

export async function main() {
  const params = new URL(document.location.href).searchParams;
  if (params.get('acao') === 'procedimento_controlar') {
    await modificarTelaProcessos();
  }
}
