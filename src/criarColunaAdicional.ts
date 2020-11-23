const makeCriarColunaAdicional = (htmlCelulaCabecalho: string, htmlCelulaCorpo: string) => (
  tabela: HTMLTableElement,
) => {
  tabela.querySelectorAll('tr').forEach(linha => {
    const coluna = linha.querySelector<HTMLTableCellElement>('th:nth-child(2), td:nth-child(3)');
    if (!coluna) throw new Error('Linha não possui colunas suficientes.');

    if (coluna.matches('th')) {
      coluna.colSpan = 2;
      coluna.insertAdjacentHTML('afterend', '<th class="infraTh"></th>');
      coluna.insertAdjacentHTML('afterend', htmlCelulaCabecalho);
    } else {
      coluna.insertAdjacentHTML('afterend', htmlCelulaCorpo);
    }
  });
};

export const criarColunaAdicional = makeCriarColunaAdicional(
  '<th class="infraTh tituloControle colAdicional"><span class="tipo">Tipo / Especificação</span><span class="ambos"> / </span><span class="anotacao">Anotações</span></th>',
  '<td class="colAdicional"></td>',
);

export const criarColunaAdicionalMarcador = makeCriarColunaAdicional(
  '<th class="infraTh tituloControle colAdicionalMarcador">Marcador</th>',
  '<td class="colAdicionalMarcador"></td>',
);
