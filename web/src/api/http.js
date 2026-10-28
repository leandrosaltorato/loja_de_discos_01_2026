import { getToken, getUsuario, usuarioSalvo } from '../state/session.js';
import {
  comoLista,
  comoObjeto,
  discoDaApi,
  discoParaApi,
  movimentacaoDaApi,
  movimentacaoParaApi,
  usuarioDaApi,
} from './mapeamento.js';

const BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');

// Caminhos no backend (prefixo em que cada router foi montado no app.use).
const ROTAS = {
  login: '/auth/login',
  discos: '/disco',
  movimentacoes: '/movimentacaoestoque',
  usuarios: '/usuario',
};

export class ApiError extends Error {
  constructor(mensagem, { status = 0, campos = null } = {}) {
    super(mensagem);
    this.name = 'ApiError';
    this.status = status;
    this.campos = campos;
  }
}

const mensagemPadrao = (status) =>
  ({
    400: 'Requisição inválida.',
    403: 'Você não tem permissão para fazer isso.',
    404: 'Registro não encontrado.',
    409: 'Esta operação conflita com o estado atual dos dados.',
    422: 'Alguns dados estão inválidos.',
  })[status] ?? (status >= 500 ? 'O servidor teve um problema. Tente novamente.' : 'Algo deu errado.');

async function requisitar(metodo, caminho, { corpo } = {}) {
  const url = new URL(BASE + caminho, location.origin);

  const headers = { Accept: 'application/json' };
  if (corpo !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let resposta;
  try {
    resposta = await fetch(url, {
      method: metodo,
      headers,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor. Verifique sua conexão.');
  }

  if (resposta.status === 204) return null;

  let dados = null;
  try {
    dados = await resposta.json();
  } catch {
    /* corpo vazio ou não-JSON */
  }

  if (!resposta.ok) {
    if (resposta.status === 401 && caminho !== ROTAS.login) {
      window.dispatchEvent(new CustomEvent('auth:expirou'));
    }
    throw new ApiError(dados?.mensagem ?? dados?.erro ?? dados?.message ?? mensagemPadrao(resposta.status), {
      status: resposta.status,
      campos: dados?.campos ?? null,
    });
  }
  return dados;
}

const id = (valor) => encodeURIComponent(valor);
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const listarDiscos = async () => comoLista(await requisitar('GET', `${ROTAS.discos}/listar`)).map(discoDaApi);

export const http = {
  auth: {
    async login(credenciais) {
      const dados = await requisitar('POST', ROTAS.login, { corpo: credenciais });
      return { token: dados?.token ?? null, usuario: usuarioDaApi(dados?.usuario ?? {}) };
    },
    // O backend não tem /auth/me: o usuário fica guardado no navegador desde o login.
    async me() {
      const u = getUsuario() ?? usuarioSalvo();
      if (!u) throw new ApiError('Sessão não encontrada.', { status: 401 });
      return u;
    },
  },

  discos: {
    // O backend não filtra por busca; o filtro é feito aqui.
    async listar({ q } = {}) {
      const lista = await listarDiscos();
      const termo = q ? norm(q) : '';
      return lista.filter((d) => !termo || norm(`${d.titulo} ${d.artista}`).includes(termo));
    },
    async criar(dados) {
      const r = await requisitar('POST', `${ROTAS.discos}/cadastrar`, { corpo: discoParaApi(dados) });
      return discoDaApi(comoObjeto(r, 'disco'));
    },
    async atualizar(discoId, dados) {
      const r = await requisitar('PUT', `${ROTAS.discos}/atualizar/${id(discoId)}`, { corpo: discoParaApi(dados) });
      return discoDaApi(comoObjeto(r, 'disco'));
    },
    excluir: (discoId) => requisitar('DELETE', `${ROTAS.discos}/excluir/${id(discoId)}`),
  },

  movimentacoes: {
    async listar({ de, limite } = {}) {
      const [brutas, discos, usuarios] = await Promise.all([
        requisitar('GET', `${ROTAS.movimentacoes}/listar`),
        listarDiscos(),
        requisitar('GET', `${ROTAS.usuarios}/listar`).then(comoLista, () => []),
      ]);
      let lista = comoLista(brutas)
        .map((m) => movimentacaoDaApi(m, { discos, usuarios }))
        .sort((a, b) => b.data.localeCompare(a.data) || String(b.id).localeCompare(String(a.id), 'pt', { numeric: true }));
      if (de) lista = lista.filter((m) => m.data >= de);
      if (limite) lista = lista.slice(0, Number(limite));
      return lista;
    },
    async registrar(dados) {
      const usuarioId = (getUsuario() ?? usuarioSalvo())?.id;
      const r = await requisitar('POST', `${ROTAS.movimentacoes}/cadastrar`, {
        corpo: movimentacaoParaApi(dados, usuarioId),
      });
      return movimentacaoDaApi(comoObjeto(r, 'movimentacao'));
    },
  },
};
