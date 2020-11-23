const toggleBodyClass = (className: string) => (active: boolean) => {
  document.body.classList.toggle(className, active);
};

export const alternarOcultacaoFieldset = toggleBodyClass('ocultarFieldset');

export function alternarExibicaoTipo(exibir: boolean) {
  toggleBodyClass('mostrarTipo')(exibir);
  document
    .querySelectorAll<HTMLAnchorElement>('a[href^="controlador.php?acao=procedimento_trabalhar"]')
    .forEach(
      exibir
        ? link => {
            link.setAttribute('onmouseover', `return; ${link.getAttribute('onmouseover') || ''}`);
          }
        : link => {
            link.setAttribute(
              'onmouseover',
              (link.getAttribute('onmouseover') || '').replace(/^return; /, ''),
            );
          },
    );
}

export const alternarExibicaoAnotacoes = toggleBodyClass('mostrarAnotacoes');

export const alternarExibicaoMarcadores = toggleBodyClass('mostrarMarcadores');

export function alternarExibicaoCores(exibir: boolean) {
  toggleBodyClass('ocultarCores')(!exibir);
}
