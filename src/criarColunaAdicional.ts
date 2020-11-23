const makeCriarColunaAdicional = (htmlCelulaCabecalho: string, htmlCelulaCorpo: string) => (
  tabela: HTMLTableElement,
) => {
  tabela.querySelectorAll('tr').forEach(linha => {
    const terceiro = linha.querySelector('th:nth-child(3), td:nth-child(3)');
    if (!terceiro) throw new Error('Linha não possui colunas suficientes.');

    if (terceiro.matches('th')) {
      terceiro.insertAdjacentHTML('afterend', htmlCelulaCabecalho);
    } else {
      terceiro.insertAdjacentHTML('afterend', htmlCelulaCorpo);
    }
  });
};

export const criarColunaAdicional = makeCriarColunaAdicional(
  '<th class="tituloControle colAdicional"><span class="tipo">Tipo / Especificação</span><span class="ambos"> / </span><span class="anotacao">Anotações</span></th>',
  '<td class="colAdicional"></td>',
);

export const criarColunaAdicionalMarcador = makeCriarColunaAdicional(
  '<th class="tituloControle colAdicionalMarcador">Marcador</th>',
  '<td class="colAdicionalMarcador"></td>',
);
