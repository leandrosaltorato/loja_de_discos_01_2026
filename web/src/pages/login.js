import { api } from '../api/index.js';
import { html, $ } from '../utils/dom.js';
import { iniciar } from '../state/session.js';
import { lerForm, validarLogin, mostrarErros, mostrarErroGeral } from '../utils/validate.js';
import { comCarregando } from '../components/ui.js';
import { logoDisco } from '../components/layout.js';

export function montarLogin(app) {
  const demo = import.meta.env.VITE_USE_MOCK === 'true';

  app.innerHTML = String(html`
    <div class="login">
      <aside class="login-side">
        <div class="brand">${logoDisco}<span>Vinyl Control</span></div>
        <p>Acervo, estoque<br />e vendas da loja.</p>
      </aside>

      <section class="login-main">
        <form class="login-card form" id="form-login" novalidate>
          <div>
            <h1>Entrar</h1>
            <p class="muted">Use o e-mail e a senha da sua conta.</p>
          </div>

          <div class="alert alert-danger" data-erro role="alert" hidden></div>

          <label class="field">
            <span>E-mail</span>
            <input type="email" name="email" autocomplete="username" placeholder="voce@loja.com" />
          </label>
          <label class="field">
            <span>Senha</span>
            <input type="password" name="senha" autocomplete="current-password" />
          </label>

          <button class="btn btn-primary btn-block" type="submit">Entrar</button>
          ${demo ? html`<p class="muted small">Modo demonstração: demo@vinylcontrol.com / demo123</p>` : ''}
        </form>
      </section>
    </div>`);

  const form = $('#form-login', app);
  form.elements.email.focus();

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const valores = lerForm(form);
    const erros = validarLogin(valores);
    mostrarErros(form, erros);
    if (Object.keys(erros).length) return;

    await comCarregando($('[type=submit]', form), async () => {
      try {
        const sessao = await api.auth.login({ email: valores.email.trim(), senha: valores.senha });
        iniciar(sessao); // { token, usuario }
        location.hash = '/dashboard';
      } catch (erro) {
        mostrarErroGeral(form, erro.message);
      }
    });
  });
}
