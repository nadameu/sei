const getSetBoolean = (name: string) => (value?: boolean) => {
  if (typeof value === 'boolean') setValue(name, value ? 'S' : 'N');
  return getValue(name, 'N') === 'S';
};

const getSetInt = (name: string) => (value?: number) => {
  if (typeof value === 'number' && Number.isInteger(value)) setValue(name, value.toString());
  else if (value !== undefined) throw new Error(`Valor inválido para "${name}": "${value}"`);
  return Number(getValue(name, '0'));
};

export const usuarioDesejaMostrarTipo = getSetBoolean('mostrarTipo');

export const usuarioDesejaMostrarAnotacoes = getSetBoolean('mostrarAnotacoes');

export const usuarioDesejaMostrarCores = getSetBoolean('mostrarCores');

export const usuarioDesejaMostrarMarcadores = getSetBoolean('mostrarMarcadores');

export const usuarioDesejaOrdenarTabelas = getSetInt('ordenarTabelas');

export const usuarioDesejaAgruparMarcadores = getSetBoolean('agruparMarcadores');

export const usuarioDesejaOcultarFieldset = getSetBoolean('ocultarFieldset');

function getValue(name: string, defaultValue: string) {
  const value = localStorage.getItem(name);
  return value ?? defaultValue;
}

function setValue(name: string, value: string) {
  localStorage.setItem(name, value);
}
