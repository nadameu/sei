import {
  alternarExibicaoAnotacoes,
  alternarExibicaoCores,
  alternarExibicaoMarcadores,
  alternarExibicaoTipo,
  alternarOcultacaoFieldset,
} from './alternarExibicao';
import { Ordenacao } from './Ordenacao';
import {
  usuarioDesejaAgruparMarcadores,
  usuarioDesejaMostrarAnotacoes,
  usuarioDesejaMostrarCores,
  usuarioDesejaMostrarMarcadores,
  usuarioDesejaMostrarTipo,
  usuarioDesejaOcultarFieldset,
  usuarioDesejaOrdenarTabelas,
} from './preferencias';
import { definirOrdenacaoTabelas } from './definirOrdenacaoTabelas';

const criarCheckboxBoolean = (
  texto: string,
  fnPreferencia: (value?: boolean) => boolean,
  fnAlternarExibicao: (checked: boolean) => void,
) => () =>
  criarCheckbox(texto, fnPreferencia(), chkbox => {
    fnPreferencia(chkbox.checked);
    fnAlternarExibicao(chkbox.checked);
  });
const criarCheckboxTipo = criarCheckboxBoolean(
  'Mostrar tipo e especificação dos processos',
  usuarioDesejaMostrarTipo,
  alternarExibicaoTipo,
);
const criarCheckboxAnotacoes = criarCheckboxBoolean(
  'Mostrar anotações dos processos',
  usuarioDesejaMostrarAnotacoes,
  alternarExibicaoAnotacoes,
);
const criarCheckboxMarcadores = criarCheckboxBoolean(
  'Mostrar texto dos marcadores dos processos',
  usuarioDesejaMostrarMarcadores,
  alternarExibicaoMarcadores,
);
const criarCheckboxCor = criarCheckboxBoolean(
  'Mostrar cores conforme tipo de processo',
  usuarioDesejaMostrarCores,
  alternarExibicaoCores,
);
function criarSelectOrdenacao() {
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
  select.value = String(usuarioDesejaOrdenarTabelas());
  const label = document.createElement('label');
  label.className = 'infraLabelOpcional';
  label.append('Ordenação dos processos: ', select);
  select.addEventListener('change', () => {
    const valor = Number(select.value);
    usuarioDesejaOrdenarTabelas(valor);
    definirOrdenacaoTabelas(valor, usuarioDesejaAgruparMarcadores());
  });
  return label;
}
function criarCheckboxAgruparMarcadores() {
  return criarCheckbox(
    'Agrupar processos por marcador',
    usuarioDesejaAgruparMarcadores(),
    chkbox => {
      usuarioDesejaAgruparMarcadores(chkbox.checked);
      definirOrdenacaoTabelas(usuarioDesejaOrdenarTabelas(), chkbox.checked);
    },
  );
}
export function criarFormulario({ divRecebidos }: { divRecebidos: HTMLDivElement }) {
  const legend = document.createElement('legend');
  legend.style.fontSize = '1em';
  legend.appendChild(
    criarCheckbox('Ocultar preferências', usuarioDesejaOcultarFieldset(), chkbox => {
      usuarioDesejaOcultarFieldset(chkbox.checked);
      alternarOcultacaoFieldset(chkbox.checked);
    }),
  );
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'infraFieldset';
  fieldset.append(
    legend,
    criarCheckboxTipo(),
    document.createElement('br'),
    criarCheckboxAnotacoes(),
    document.createElement('br'),
    criarCheckboxCor(),
    document.createElement('br'),
    criarCheckboxMarcadores(),
    document.createElement('br'),
    criarCheckboxAgruparMarcadores(),
    document.createElement('br'),
    criarSelectOrdenacao(),
  );
  divRecebidos.insertAdjacentElement('beforebegin', fieldset);
}
function criarCheckbox(
  texto: string,
  checked: boolean,
  handler: (target: HTMLInputElement) => void,
) {
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.className = 'infraCheckbox';
  input.checked = checked;
  const label = document.createElement('label');
  label.className = 'infraLabelOpcional';
  label.append(input, ` ${texto}`);
  input.addEventListener('change', () => handler(input));
  return label;
}
