import { corrigirHTML } from './corrigirHTML';
import {
  escreverColunaAdicional,
  escreverColunaAdicionalAnotacao,
  escreverColunaAdicionalMarcador,
} from './escreverColunaAdicional';
import { obterCor } from './obterCor';

export function analisarTipo() {
  document
    .querySelectorAll<HTMLAnchorElement>(
      'tr a[href^="controlador.php?acao=procedimento_trabalhar"][onmouseover]',
    )
    .forEach(link => {
      const mouseover = link.getAttribute('onmouseover')!;
      const match = /^return infraTooltipMostrar\('(.*)','(.+)'\);$/.exec(mouseover);
      if (!match) throw new Error();
      const [, text, title] = match;
      escreverColunaAdicional(link, `<div class="tipo">${corrigirHTML(title)}</div>`);
      if (text !== '') {
        escreverColunaAdicional(link, `<div class="especificacao">${corrigirHTML(text)}</div>`);
      }
      const cor = obterCor(title);
      link.closest('tr')!.style.background = cor;
    });
}
export function analisarAnotacoes() {
  const analisarAnotacao = (prioridade: boolean) => (img: HTMLElement) => {
    const link = img.parentElement as HTMLAnchorElement;
    const mouseover = link.getAttribute('onmouseover')!;
    const match = /^return infraTooltipMostrar\('(.*)','(.*)'\);$/.exec(mouseover);
    if (!match) throw new Error();
    const [, text, user] = match;
    escreverColunaAdicionalAnotacao(
      img,
      `${corrigirHTML(text)} (${corrigirHTML(user)})`,
      link.getAttribute('href')!,
      prioridade,
    );
    img.classList.add('iconeAnotacao');
  };

  document
    .querySelectorAll<HTMLImageElement>(
      'a[href][onmouseover] > img[src="imagens/sei_anotacao_prioridade_pequeno.gif"]',
    )
    .forEach(analisarAnotacao(true));

  document
    .querySelectorAll<HTMLImageElement>(
      'a[href][onmouseover] > img[src="imagens/sei_anotacao_pequeno.gif"]',
    )
    .forEach(analisarAnotacao(false));
}
export function analisarMarcadores() {
  document
    .querySelectorAll<HTMLImageElement>('table a[onmouseover] > img[src^="imagens/marcador_"]')
    .forEach(img => {
      const match = /^imagens\/marcador_(.*)\.png$/.exec(img.getAttribute('src')!);
      if (!match) throw new Error();
      const [, cor] = match;
      const mouseover = img.parentElement!.getAttribute('onmouseover')!;
      const match2 = /^return infraTooltipMostrar\('(.*)','(.+)'\);$/.exec(mouseover);
      if (!match2) throw new Error();
      const [, text, title] = match2;
      escreverColunaAdicionalMarcador(
        img,
        `<div class="marcador" data-cor="${cor}">${corrigirHTML(title)}</div>`,
      );
      if (text !== '') {
        escreverColunaAdicionalMarcador(
          img,
          `<div class="marcadorTexto">${corrigirHTML(text)}</div>`,
        );
      }
      img.classList.add('iconeMarcador');
    });
}
