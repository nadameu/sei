import { Acao } from './Acao';
import { analisarPagina } from './analisar';
import { getSetBoolean, getSetInt, obterPreferencias } from './preferenciasUsuario';
import { renderizarPagina } from './renderizar';

export function main() {
  const params = new URL(document.location.href).searchParams;
  if (params.get('acao') === 'procedimento_controlar') {
    const pagina = analisarPagina();
    const preferencias = obterPreferencias();
    const atualizar = renderizarPagina(pagina, preferencias, dispatch);

    function dispatch(acao: Acao) {
      switch (acao.tipo) {
        case 'setBool':
          getSetBoolean(acao.nome, acao.valor);
          break;

        case 'setOrdenacao':
          getSetInt('ordemTabelas', acao.valor);
          break;
      }
      atualizar(obterPreferencias());
    }
  }
}
