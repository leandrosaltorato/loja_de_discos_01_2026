import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/layout.css";
import "./styles/pages.css";

import { api } from "./api/index.js";
import {
  autenticado,
  encerrar,
  getUsuario,
  setUsuario,
} from "./state/session.js";
import { shell, marcarAtivo } from "./components/layout.js";
import { erroEstado } from "./components/ui.js";
import { toast } from "./components/toast.js";
import { montarLogin } from "./pages/login.js";
import { montarDashboard } from "./pages/dashboard.js";
import { montarDiscos } from "./pages/discos.js";
import { montarEstoque } from "./pages/estoque.js";

const rotas = {
  "/login": { publica: true, titulo: "Entrar", montar: montarLogin },
  "/dashboard": { titulo: "Painel", montar: montarDashboard },
  "/discos": { titulo: "Discos", montar: montarDiscos },
  "/estoque": { titulo: "Estoque e vendas", montar: montarEstoque },
};

const app = document.getElementById("app");
let versao = 0;

async function render() {
  const minha = ++versao;
  const caminho = location.hash.slice(1) || "/dashboard";
  const rota = rotas[caminho];

  if (!rota) {
    location.replace("#/dashboard");
    return;
  }

  if (!rota.publica && !autenticado()) {
    location.replace("#/login");
    return;
  }
  if (rota.publica && autenticado()) {
    location.replace("#/dashboard");
    return;
  }

  document.title = `${rota.titulo} · Vinyl Control`;

  if (rota.publica) {
    rota.montar(app);
    return;
  }

  if (!getUsuario()) {
    try {
      setUsuario(await api.auth.me());
    } catch (erro) {
      if (minha !== versao) return;
      if (erro.status === 401) {
        encerrar();
        location.replace("#/login");
      } else {
        app.innerHTML = String(erroEstado(erro.message));
        app.querySelector("[data-tentar]").addEventListener("click", render);
      }
      return;
    }
  }
  if (minha !== versao) return;

  if (!document.getElementById("conteudo"))
    app.innerHTML = String(shell(getUsuario()));
  marcarAtivo(caminho);
  const conteudo = document.getElementById("conteudo");
  conteudo.innerHTML = "";
  window.scrollTo(0, 0);
  await rota.montar(conteudo);
  conteudo.focus({ preventScroll: true });
}

app.addEventListener("click", (ev) => {
  if (ev.target.closest("[data-sair]")) {
    encerrar();
    location.hash = "/login";
  }
});

window.addEventListener("auth:expirou", () => {
  encerrar();
  location.hash = "/login";
  toast("Sua sessão expirou. Entre novamente.", "erro");
});

window.addEventListener("hashchange", render);
render();
