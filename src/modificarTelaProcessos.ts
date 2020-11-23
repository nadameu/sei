import { adicionarEstilos } from './adicionarEstilos';
import {
  alternarExibicaoAnotacoes,
  alternarExibicaoCores,
  alternarExibicaoMarcadores,
  alternarExibicaoTipo,
  alternarOcultacaoFieldset,
} from './alternarExibicao';
import { analisarPagina } from './analisar';
import { criarFormulario } from './criarFormulario';
import { definirOrdenacaoTabelas } from './definirOrdenacaoTabelas';
import {
  usuarioDesejaAgruparMarcadores,
  usuarioDesejaMostrarAnotacoes,
  usuarioDesejaMostrarCores,
  usuarioDesejaMostrarMarcadores,
  usuarioDesejaMostrarTipo,
  usuarioDesejaOcultarFieldset,
  usuarioDesejaOrdenarTabelas,
} from './preferencias';
import { query } from './query';

export async function modificarTelaProcessos() {
  const pagina = analisarPagina();
  adicionarEstilos();
  const divRecebidos = await query<HTMLDivElement>('div#divRecebidos');
  criarFormulario({ divRecebidos });
  alternarExibicaoTipo(usuarioDesejaMostrarTipo());
  alternarExibicaoAnotacoes(usuarioDesejaMostrarAnotacoes());
  alternarExibicaoMarcadores(usuarioDesejaMostrarMarcadores());
  alternarExibicaoCores(usuarioDesejaMostrarCores());
  definirOrdenacaoTabelas(usuarioDesejaOrdenarTabelas(), usuarioDesejaAgruparMarcadores());
  alternarOcultacaoFieldset(usuarioDesejaOcultarFieldset());
}
