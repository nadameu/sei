export function obterCor(texto: string) {
  const STEPS_H = 10;
  const MULTI_H = 240 / STEPS_H;
  let h = 0;
  for (let i = 0, len = texto.length; i < len; i++) {
    h = (h + texto.charCodeAt(i)) % STEPS_H;
  }
  h = Math.floor(h * MULTI_H);
  return `hsl(${h}, 60%, 85%)`;
}
