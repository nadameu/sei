// https://www.w3.org/TR/WCAG20-TECHS/G18.html#G18-tests
const luminance = (hex: string) => {
  const [r, g, b] = hex
    .match(/^([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/)!
    .slice(1)
    .map(x => parseInt(x, 16))
    .map(x => x / 255)
    .map(x => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const whiteLuminance = 1;
const contrastRatio = (hex: string) => (whiteLuminance + 0.05) / (luminance(hex) + 0.05);
const isContrastEnough = (hex: string) => contrastRatio(hex) >= 4.5;

export const CoresMarcadores = [
  { cor: 'amarelo', hex: 'fff200' },
  { cor: 'amarelo_claro', hex: 'dde134' },
  { cor: 'amarelo_ouro', hex: 'f7b431' },
  { cor: 'azul', hex: '4285f4' },
  { cor: 'azul_ceu', hex: '009df2' },
  { cor: 'azul_marinho', hex: '002d9e' },
  { cor: 'azul_riviera', hex: '205d8c' },
  { cor: 'bege', hex: 'f8d396' },
  { cor: 'branco', hex: 'ffffff' },
  { cor: 'bronze', hex: 'a56738' },
  { cor: 'champagne', hex: 'e0a076' },
  { cor: 'ciano', hex: '00ffff' },
  { cor: 'cinza', hex: 'c0c0c0' },
  { cor: 'cinza_escuro', hex: '527b79' },
  { cor: 'laranja', hex: 'ff5f00' },
  { cor: 'lilas', hex: 'c892d8' },
  { cor: 'marrom', hex: '61280a' },
  { cor: 'ouro', hex: 'a7790b' },
  { cor: 'prata', hex: '81979d' },
  { cor: 'preto', hex: '000000' },
  { cor: 'rosa', hex: 'ff1cae' },
  { cor: 'rosa_claro', hex: 'ffa7dc' },
  { cor: 'roxo', hex: '68339b' },
  { cor: 'tijolo', hex: 'c35107' },
  { cor: 'verde', hex: '00ff00' },
  { cor: 'verde_abacate', hex: '57b952' },
  { cor: 'verde_agua', hex: '00c4ba' },
  { cor: 'verde_amazonas', hex: '007725' },
  { cor: 'verde_escuro', hex: '004225' },
  { cor: 'verde_turquesa', hex: '00858a' },
  { cor: 'vermelho', hex: 'ed1c24' },
  { cor: 'vinho', hex: '633039' },
].map(({ cor, hex }) => ({ cor, hex, inverterTexto: !isContrastEnough(hex) }));
