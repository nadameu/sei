import { Criterio, Ordenacao, sord } from './Ordenacao';
import { Preferencias } from './Preferencias';
import { Serializable } from './Serializable';

const sbool: Serializable<boolean> = {
  parse(representation) {
    if (representation === 'S') return { valid: true, value: true };
    if (representation === 'N') return { valid: true, value: false };
    return { valid: false };
  },
  serialize(value) {
    return value ? 'S' : 'N';
  },
};

export function getSetBoolean(name: string, value?: boolean) {
  if (typeof value === 'boolean') setValue(name, sbool, value);
  return getValue(name, sbool, false);
}

export function getSetOrdenacao(name: string, value?: Ordenacao): Ordenacao {
  if (typeof value !== 'undefined') setValue(name, sord, value);
  return getValue(name, sord, { criterio: Criterio.PADRAO, inverter: false, prioritarios: false });
}

function getValue<T>(name: string, serializable: Serializable<T>, defaultValue: T): T {
  const str = localStorage.getItem(name);
  if (str) {
    const result = serializable.parse(str);
    if (result.valid) {
      return result.value;
    }
    localStorage.removeItem(name);
  }
  return defaultValue;
}

function setValue<T>(name: string, serializable: Serializable<T>, value: T) {
  localStorage.setItem(name, serializable.serialize(value));
}

export function obterPreferencias(): Preferencias {
  return {
    ocultarFieldset: getSetBoolean('ocultarFieldset'),
    mostrarTipo: getSetBoolean('mostrarTipo'),
    mostrarAnotacoes: getSetBoolean('mostrarAnotacoes'),
    mostrarCores: getSetBoolean('mostrarCores'),
    mostrarMarcadores: getSetBoolean('mostrarMarcadores'),
    agruparMarcadores: getSetBoolean('agruparMarcadores'),
    ordemTabelas: getSetOrdenacao('ordemTabelas'),
  };
}
