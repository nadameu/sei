export function query<T extends Element>(
  selector: string,
  parentNode: ParentNode = document,
): Promise<T> {
  const element = parentNode.querySelector<T>(selector);
  return element === null
    ? Promise.reject(new Error(`Elemento não encontrado: \`${selector}\`.`))
    : Promise.resolve(element);
}
