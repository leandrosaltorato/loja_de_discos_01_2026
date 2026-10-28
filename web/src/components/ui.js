import { html } from '../utils/dom.js';

const rotulosStatus = {
  ok: ['Em estoque', 'badge-ok'],
  baixo: ['Estoque baixo', 'badge-warn'],
  zerado: ['Sem estoque', 'badge-danger'],
};

export function statusBadge(status) {
  const [rotulo, classe] = rotulosStatus[status] ?? rotulosStatus.ok;
  return html`<span class="badge ${classe}">${rotulo}</span>`;
}

export function tipoBadge(tipo) {
  return tipo === 'entrada'
    ? html`<span class="badge badge-ok">Reposição</span>`
    : html`<span class="badge badge-neutral">Venda</span>`;
}

export function pageHeader({ titulo, subtitulo = '', acoes = null }) {
  return html`
    <header class="page-header">
      <div>
        <h1>${titulo}</h1>
        ${subtitulo ? html`<p class="muted">${subtitulo}</p>` : ''}
      </div>
      ${acoes ? html`<div class="page-actions">${acoes}</div>` : ''}
    </header>`;
}

export const carregando = (texto = 'Carregando…') => html`<p class="estado" role="status">${texto}</p>`;

export const vazio = (texto) => html`<p class="estado">${texto}</p>`;

export const erroEstado = (mensagem) => html`
  <div class="estado estado-erro" role="alert">
    <p>${mensagem}</p>
    <button class="btn btn-secondary" type="button" data-tentar>Tentar de novo</button>
  </div>`;

// Desabilita o botão enquanto a requisição roda (evita clique duplo).
export async function comCarregando(botao, fn) {
  if (botao.disabled) return undefined;
  botao.disabled = true;
  botao.setAttribute('aria-busy', 'true');
  try {
    return await fn();
  } finally {
    botao.disabled = false;
    botao.removeAttribute('aria-busy');
  }
}
