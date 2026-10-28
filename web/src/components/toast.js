let regiao;

export function toast(mensagem, tipo = 'ok') {
  if (!regiao) {
    regiao = document.createElement('div');
    regiao.className = 'toasts';
    regiao.setAttribute('aria-live', 'polite');
    document.body.append(regiao);
  }
  const el = document.createElement('div');
  el.className = `toast toast-${tipo}`;
  el.textContent = mensagem;
  regiao.append(el);
  setTimeout(() => el.remove(), 4500);
}
