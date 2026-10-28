const CHAVE_TOKEN = 'vc:token';
const CHAVE_USUARIO = 'vc:usuario';
let usuario = null;

export const getToken = () => localStorage.getItem(CHAVE_TOKEN);

export function usuarioSalvo() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_USUARIO));
  } catch {
    return null;
  }
}

// O backend atual devolve só o usuário no login (sem token), então a sessão
// é válida enquanto houver token OU usuário salvo.
export const autenticado = () => Boolean(getToken() || usuarioSalvo());
export const getUsuario = () => usuario;
export const setUsuario = (u) => {
  usuario = u;
};

export function iniciar({ token, usuario: u }) {
  if (token) localStorage.setItem(CHAVE_TOKEN, token);
  else localStorage.removeItem(CHAVE_TOKEN);
  localStorage.setItem(CHAVE_USUARIO, JSON.stringify(u));
  usuario = u;
}

export function encerrar() {
  localStorage.removeItem(CHAVE_TOKEN);
  localStorage.removeItem(CHAVE_USUARIO);
  usuario = null;
}
