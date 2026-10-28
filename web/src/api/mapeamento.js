// Tradução entre o que o front usa e o que o backend envia/recebe.
// Se algum campo do seu backend tiver outro nome, troque APENAS o valor
// (lado direito) aqui. O restante do front não precisa mudar.

export const CAMPOS_DISCO = {
  id: 'id',
  titulo: 'titulo',
  artista: 'artista',
  genero: 'genero',
  precoCusto: 'precoCusto',
  estoque: 'estoque',
  estoqueMinimo: 'estoqueMinimo',
};

export const CAMPOS_MOVIMENTACAO = {
  id: 'id',
  data: 'data',
  discoId: 'discoId',
  tipo: 'tipo',
  quantidade: 'quantidade',
  usuarioId: 'usuarioId',
};

// Valores de "tipo" no backend (ex.: troque para 'ENTRADA' / 'SAIDA' se for o caso).
export const TIPOS = { entrada: 'entrada', saida: 'saida' };

const num = (v) => (v === null || v === undefined || v === '' ? v : Number(v));
const idParaApi = (v) => (v !== '' && !Number.isNaN(Number(v)) ? Number(v) : v);

export function discoDaApi(d) {
  const c = CAMPOS_DISCO;
  return {
    id: d[c.id],
    titulo: d[c.titulo],
    artista: d[c.artista],
    genero: d[c.genero] ?? '',
    precoCusto: num(d[c.precoCusto]),
    estoque: num(d[c.estoque]),
    estoqueMinimo: num(d[c.estoqueMinimo]),
  };
}

export function discoParaApi(d) {
  const c = CAMPOS_DISCO;
  return {
    [c.titulo]: d.titulo,
    [c.artista]: d.artista,
    [c.genero]: d.genero,
    [c.precoCusto]: d.precoCusto,
    [c.estoque]: d.estoque,
    [c.estoqueMinimo]: d.estoqueMinimo,
  };
}

const tipoDaApi = (t) => (String(t).toLowerCase() === String(TIPOS.entrada).toLowerCase() ? 'entrada' : 'saida');

// discos/usuarios: listas já carregadas, usadas quando o backend devolve só os ids.
export function movimentacaoDaApi(m, { discos = [], usuarios = [] } = {}) {
  const c = CAMPOS_MOVIMENTACAO;
  const discoId = m[c.discoId] ?? m.disco?.id;
  const usuarioId = m[c.usuarioId] ?? m.usuario?.id;
  const disco = m.disco?.titulo ?? discos.find((d) => String(d.id) === String(discoId))?.titulo;
  const usuario = m.usuario?.nome ?? usuarios.find((u) => String(u.id) === String(usuarioId))?.nome;
  return {
    id: m[c.id],
    data: String(m[c.data] ?? '').slice(0, 10),
    discoId,
    disco: disco ?? '—',
    tipo: tipoDaApi(m[c.tipo]),
    quantidade: num(m[c.quantidade]),
    usuario: usuario ?? '—',
  };
}

export function movimentacaoParaApi({ discoId, tipo, data, quantidade }, usuarioId) {
  const c = CAMPOS_MOVIMENTACAO;
  const corpo = {
    [c.discoId]: idParaApi(discoId),
    [c.tipo]: TIPOS[tipo] ?? tipo,
    [c.data]: `${data}T00:00:00.000Z`,
    [c.quantidade]: quantidade,
  };
  if (usuarioId !== undefined && usuarioId !== null) corpo[c.usuarioId] = usuarioId;
  return corpo;
}

export function usuarioDaApi(u) {
  return { id: u.id, nome: u.nome ?? u.email ?? 'Usuário', perfil: u.perfil ?? u.cargo ?? u.tipo ?? '' };
}

// Aceita tanto [ ... ] quanto { dados: [ ... ] } / { discos: [ ... ] } etc.
export function comoLista(resposta) {
  if (Array.isArray(resposta)) return resposta;
  if (resposta && typeof resposta === 'object') {
    const primeira = Object.values(resposta).find(Array.isArray);
    if (primeira) return primeira;
  }
  return [];
}

// Aceita o objeto direto ou embrulhado ({ disco: {...} }).
export function comoObjeto(resposta, chave) {
  return resposta?.[chave] ?? resposta;
}
