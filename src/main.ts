import { pipe } from '@nadameu/pipe';
import { Acao } from './Acao';
import { analisarPagina } from './analisar';
import { getSetBoolean, getSetOrdenacao, obterPreferencias } from './preferenciasUsuario';
import { renderizarPagina } from './renderizar';
import * as M from './M';

export function main() {
  const params = new URL(document.location.href).searchParams;
  if (params.get('acao') === 'procedimento_controlar') {
    if (document.querySelector<HTMLInputElement>('input#hdnTipoVisualizacao')?.value !== 'R') {
      return M.ok(undefined);
    }
    const pagina = analisarPagina();
    const preferencias = obterPreferencias();
    return pipe(
      pagina,
      M.map(pagina => {
        const atualizar = renderizarPagina(pagina, preferencias, dispatch);

        function dispatch(acao: Acao) {
          switch (acao.tipo) {
            case 'setBool':
              getSetBoolean(acao.nome, acao.valor);
              break;

            case 'setOrdenacao':
              getSetOrdenacao('ordemTabelas', acao.valor);
              break;
          }
          atualizar(obterPreferencias());
        }
      }),
    );
  } else {
    return M.ok(undefined);
  }
}
