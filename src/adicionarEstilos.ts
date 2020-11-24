import { CoresMarcadores } from './CoresMarcadores';

function criarElementoEstilo(text: string) {
  const style = document.createElement('style');
  style.textContent = text;
  document.head.appendChild(style);
}

export function adicionarEstilos() {
  const styles = `
table.tabelaControle { border-collapse: collapse; }
table.tabelaControle td:nth-child(3) { white-space: nowrap; }
.mostrarTipo table.tabelaControle td { border: 0 solid black; border-width: 1px 0; }
table.tabelaControle td.colAdicional, table.tabelaControle td.colAdicionalMarcador { padding: 0.5em 0.3em; }
div.anotacao { background-color: #ffa; }
div.anotacao.prioridade { background-color: #faa; font-weight: bold; }
div.tipo { font-weight: bold; }
div.marcador { text-align: center; font-weight: bold; }
td.colAdicionalMarcador img { float: left; padding-right: 1ex; }

th.colAdicional, td.colAdicional, th.colAdicionalMarcador, td.colAdicionalMarcador, .anotacao, .tipo, .especificacao, .ambos { display: none; }
.mostrarAnotacoes .colAdicional, .mostrarTipo .colAdicional { display: table-cell; }
.mostrarAnotacoes .anotacao { display: block; }
.mostrarAnotacoes .iconeAnotacao { display: none; }
.mostrarTipo .tipo, .mostrarTipo .especificacao { display: block; }
.mostrarTipo th .tipo, .mostrarAnotacoes th .anotacao, .mostrarTipo.mostrarAnotacoes th .ambos { display: inline; font-weight: bold; }
.mostrarMarcadores .iconeMarcador { display: none; }
.mostrarMarcadores .colAdicionalMarcador { display: table-cell; }
.ocultarCores tr { background: none !important; }
.ocultarFieldset fieldset > div { display: none; }
/* .ocultarFieldset fieldset legend { display: inherit; } */

div.marcador, tr.infraTrAcessada div.marcador { padding: 1px; border: 1px solid black; border-radius: 4px; color: white; }
`;
  const cores = CoresMarcadores.map(
    ({ cor, hex, inverterTexto }) => `
div.marcador[data-cor="${cor}"], tr.infraTrAcessada div.marcador[data-cor="${cor}"] {
  border-color: #${hex};
  background-color: #${hex};
  ${inverterTexto ? 'color: black;' : ''}
}`,
  );
  criarElementoEstilo([styles].concat(cores).join('\n'));
}
