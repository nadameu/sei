export function corrigirHTML(texto: string) {
  return texto
    .replace(/\\r/g, '\r')
    .replace(/\\n/g, '\n')
    .replace(/\\&/g, '&')
    .replace(/\r\n/g, '<br/>');
}
