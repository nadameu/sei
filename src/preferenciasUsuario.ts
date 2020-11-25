import { Preferencias } from './Preferencias';

export function getSetBoolean(name: string, value?: boolean) {
  if (typeof value === 'boolean') setValue(name, value ? 'S' : 'N');
  return getValue(name, 'N') === 'S';
}

export function getSetInt(name: string, value?: number) {
  if (typeof value === 'number' && Number.isInteger(value)) setValue(name, value.toString());
  else if (value !== undefined) throw new Error(`Valor inválido para "${name}": "${value}"`);
  return Number(getValue(name, '0'));
}

function getValue(name: string, defaultValue: string) {
  const value = localStorage.getItem(name);
  return value ?? defaultValue;
}

function setValue(name: string, value: string) {
  localStorage.setItem(name, value);
}

export function obterPreferencias(): Preferencias {
  return {
    ocultarFieldset: getSetBoolean('ocultarFieldset'),
    mostrarTipo: getSetBoolean('mostrarTipo'),
    mostrarAnotacoes: getSetBoolean('mostrarAnotacoes'),
    mostrarCores: getSetBoolean('mostrarCores'),
    mostrarMarcadores: getSetBoolean('mostrarMarcadores'),
    agruparMarcadores: getSetBoolean('agruparMarcadores'),
    ordemTabelas: getSetInt('ordemTabelas'),
  };
}
