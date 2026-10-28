import { html } from '../utils/dom.js';

const navegacao = [
  { rota: '/dashboard', rotulo: 'Painel' },
  { rota: '/discos', rotulo: 'Discos' },
  { rota: '/estoque', rotulo: 'Estoque e vendas' },
];

export const logoDisco = html`<span class="logo-disc" aria-hidden="true"></span>`;

export function shell(usuario) {
  return html`
    <div class="app">
      <header class="topbar">
        <a class="brand" href="#/dashboard">${logoDisco}<span>Vinyl Control</span></a>
        <nav class="nav" aria-label="Principal">
          ${navegacao.map((i) => html`<a class="nav-link" href="#${i.rota}" data-rota="${i.rota}">${i.rotulo}</a>`)}
        </nav>
        <div class="topbar-user">
          <span class="user-name">${usuario.nome}<small>${usuario.perfil}</small></span>
          <button class="btn-link" type="button" data-sair>Sair</button>
        </div>
      </header>
      <main class="content" id="conteudo" tabindex="-1"></main>
    </div>`;
}

export function marcarAtivo(rota) {
  document.querySelectorAll('.nav-link').forEach((a) => {
    const ativo = a.dataset.rota === rota;
    a.classList.toggle('is-active', ativo);
    if (ativo) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}
