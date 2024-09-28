import { Acao } from './Acao';
import { analisarPagina } from './analisar';
import { Err } from './Err';
import { getSetBoolean, getSetOrdenacao, obterPreferencias } from './preferenciasUsuario';
import { renderizarPagina } from './renderizar';

export function main() {
  const params = new URL(document.location.href).searchParams;
  if (params.get('acao') === 'procedimento_controlar') {
    if (document.querySelector<HTMLInputElement>('input#hdnTipoVisualizacao')?.value !== 'R') {
      return undefined;
    }
    const pagina = analisarPagina();
    if (pagina instanceof Err) return pagina;
    const preferencias = obterPreferencias();

    const atualizar = renderizarPagina(pagina, preferencias, dispatch);

    return undefined;

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
  } else {
    return undefined;
  }
}
