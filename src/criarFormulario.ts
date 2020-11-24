import { Acao } from './Acao';
import { Ordenacao } from './Ordenacao';
import { Preferencias } from './Preferencias';

type PreferenciasBoolean = {
  [k in keyof Preferencias]: Preferencias[k] extends boolean ? k : never;
}[keyof Preferencias];

export function criarFormulario({
  divRecebidos,
  preferencias,
  dispatch,
}: {
  divRecebidos: HTMLDivElement;
  preferencias: Preferencias;
  dispatch: (acao: Acao) => void;
}) {
  const legend = document.createElement('legend');
  legend.style.fontSize = '1em';
  legend.appendChild(criarCheckbox('Ocultar preferências', 'ocultarFieldset'));
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'infraFieldset ml-0  pl-0 d-none  d-md-block  col-12 col-md-12';
  fieldset.append(
    legend,
    criarCheckbox('Mostrar tipo e especificação dos processos', 'mostrarTipo'),
    document.createElement('br'),
    criarCheckbox('Mostrar anotações dos processos', 'mostrarAnotacoes'),
    document.createElement('br'),
    criarCheckbox('Mostrar cores conforme tipo de processo', 'mostrarCores'),
    document.createElement('br'),
    criarCheckbox('Mostrar texto dos marcadores dos processos', 'mostrarMarcadores'),
    document.createElement('br'),
    criarCheckbox('Agrupar processos por marcador', 'agruparMarcadores'),
    document.createElement('br'),
    criarSelectOrdenacao(preferencias.ordemTabelas, dispatch),
  );

  divRecebidos.insertAdjacentElement('beforebegin', fieldset);

  function criarCheckbox(texto: string, preferencia: PreferenciasBoolean) {
    const id = `gmSeiChkBox${preferencia}`;

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'infraCheckbox';
    input.id = id;
    input.checked = preferencias[preferencia];
    input.addEventListener('change', () => dispatch(Acao.setBool(preferencia, input.checked)));

    const label = document.createElement('label');
    label.className = 'infraLabelOpcional';
    label.htmlFor = id;
    label.textContent = ` ${texto}`;

    const fragmento = document.createDocumentFragment();
    fragmento.append(input, label);

    return fragmento;
  }
}

function criarSelectOrdenacao(valor: number, dispatch: (acao: Acao) => void) {
  const select = document.createElement('select');
  select.style.display = 'inline-block';
  select.style.fontSize = '1em';
  const campos = [
    { valor: Ordenacao.PADRAO, nome: 'Padrão' },
    { valor: Ordenacao.NUMERO, nome: 'Ano e número (antigos primeiro)' },
    { valor: Ordenacao.NUMERO | Ordenacao.INVERTER, nome: 'Ano e número (novos primeiro)' },
    { valor: Ordenacao.TIPO, nome: 'Tipo, especificação e anotação' },
    { valor: Ordenacao.ANOTACAO, nome: 'Anotação (somente texto)' },
    {
      valor: Ordenacao.ANOTACAO | Ordenacao.PRIORITARIOS,
      nome: 'Anotação (prioritários primeiro)',
    },
  ];
  const options = campos.map(({ nome, valor }) => `<option value="${valor}">${nome}</option>`);
  select.insertAdjacentHTML('beforeend', options.join(''));
  select.value = String(valor);
  const label = document.createElement('label');
  label.className = 'infraLabelOpcional';
  label.append('Ordenação dos processos: ', select);
  select.addEventListener('change', () => {
    const valor = Number(select.value);
    dispatch(Acao.setOrdenacao(valor));
  });
  return label;
}
