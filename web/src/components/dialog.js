import { html } from '../utils/dom.js';

export function fecharAoClicarFora(dialog) {
  dialog.addEventListener('click', (ev) => {
    if (ev.target === dialog) dialog.close();
  });
}

export function confirmar({ titulo, mensagem, rotulo = 'Confirmar', perigo = false }) {
  return new Promise((resolve) => {
    const d = document.createElement('dialog');
    d.className = 'modal modal-sm';
    d.innerHTML = String(html`
      <form method="dialog">
        <header class="modal-head"><h2>${titulo}</h2></header>
        <p class="muted">${mensagem}</p>
        <footer class="modal-foot">
          <button class="btn btn-ghost" value="nao">Cancelar</button>
          <button class="btn ${perigo ? 'btn-danger' : 'btn-primary'}" value="sim" autofocus>${rotulo}</button>
        </footer>
      </form>`);
    d.addEventListener('close', () => {
      resolve(d.returnValue === 'sim');
      d.remove();
    });
    fecharAoClicarFora(d);
    document.body.append(d);
    d.showModal();
  });
}
