class Seguro {
  constructor(texto) {
    this.texto = texto;
  }
  toString() {
    return this.texto;
  }
}

const mapa = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (valor) => String(valor).replace(/[&<>"']/g, (c) => mapa[c]);
export const raw = (texto) => new Seguro(texto);

function converter(valor) {
  if (valor == null || valor === false) return '';
  if (valor instanceof Seguro) return valor.texto;
  if (Array.isArray(valor)) return valor.map(converter).join('');
  return esc(valor);
}

export function html(partes, ...valores) {
  let saida = '';
  partes.forEach((parte, i) => {
    saida += parte;
    if (i < valores.length) saida += converter(valores[i]);
  });
  return new Seguro(saida);
}

export const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
export const $$ = (seletor, raiz = document) => [...raiz.querySelectorAll(seletor)];
