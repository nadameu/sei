import { adicionarEstilos } from './adicionarEstilos';
import {
  alternarExibicaoAnotacoes,
  alternarExibicaoCores,
  alternarExibicaoMarcadores,
  alternarExibicaoTipo,
  alternarOcultacaoFieldset,
} from './alternarExibicao';
import { criarFormulario } from './criarFormulario';
import { definirOrdenacaoTabelas } from './definirOrdenacaoTabelas';
import { modificarTabelas } from './modificarTabelas';
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
  adicionarEstilos();
  const divRecebidos = await query<HTMLDivElement>('div#divRecebidos');
  criarFormulario({ divRecebidos });
  modificarTabelas();
  alternarExibicaoTipo(usuarioDesejaMostrarTipo());
  alternarExibicaoAnotacoes(usuarioDesejaMostrarAnotacoes());
  alternarExibicaoMarcadores(usuarioDesejaMostrarMarcadores());
  alternarExibicaoCores(usuarioDesejaMostrarCores());
  definirOrdenacaoTabelas(usuarioDesejaOrdenarTabelas(), usuarioDesejaAgruparMarcadores());
  alternarOcultacaoFieldset(usuarioDesejaOcultarFieldset());
}
