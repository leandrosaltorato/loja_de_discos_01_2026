import { ApiError } from './http.js';

const espera = (ms = 300) => new Promise((r) => setTimeout(r, ms));
const dois = (n) => String(n).padStart(2, '0');
const diasAtras = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
};
const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const mesmoId = (a, b) => String(a) === String(b);

const USUARIO = { nome: 'Ana Souza', perfil: 'Administradora' };
const DEMO = { email: 'demo@vinylcontrol.com', senha: 'demo123' };

let proximoId = 100;
let discos = [
  { id: 1, titulo: 'Abbey Road', artista: 'The Beatles', genero: 'Rock', precoCusto: 189.9, estoque: 6, estoqueMinimo: 3 },
  { id: 2, titulo: 'Kind of Blue', artista: 'Miles Davis', genero: 'Jazz', precoCusto: 159.0, estoque: 2, estoqueMinimo: 3 },
  { id: 3, titulo: 'Clube da Esquina', artista: 'Milton Nascimento e Lô Borges', genero: 'MPB', precoCusto: 139.9, estoque: 4, estoqueMinimo: 2 },
  { id: 4, titulo: 'Rumours', artista: 'Fleetwood Mac', genero: 'Rock', precoCusto: 169.9, estoque: 0, estoqueMinimo: 2 },
  { id: 5, titulo: 'Construção', artista: 'Chico Buarque', genero: 'MPB', precoCusto: 119.9, estoque: 5, estoqueMinimo: 2 },
  { id: 6, titulo: 'Thriller', artista: 'Michael Jackson', genero: 'Pop', precoCusto: 149.9, estoque: 1, estoqueMinimo: 3 },
  { id: 7, titulo: 'A Love Supreme', artista: 'John Coltrane', genero: 'Jazz', precoCusto: 174.0, estoque: 3, estoqueMinimo: 2 },
  { id: 8, titulo: 'Nevermind', artista: 'Nirvana', genero: 'Rock', precoCusto: 164.9, estoque: 7, estoqueMinimo: 3 },
  { id: 9, titulo: 'Acabou Chorare', artista: 'Novos Baianos', genero: 'MPB', precoCusto: 129.9, estoque: 3, estoqueMinimo: 2 },
  { id: 10, titulo: 'Legend', artista: 'Bob Marley & The Wailers', genero: 'Reggae', precoCusto: 144.9, estoque: 4, estoqueMinimo: 2 },
];

const nomeDoDisco = (id) => discos.find((d) => mesmoId(d.id, id))?.titulo ?? '—';
const mov = (id, dias, discoId, tipo, quantidade) => ({
  id, data: diasAtras(dias), discoId, disco: nomeDoDisco(discoId), tipo, quantidade, usuario: USUARIO.nome,
});
let movs = [
  mov(1, 0, 2, 'saida', 1),
  mov(2, 1, 4, 'saida', 2),
  mov(3, 2, 8, 'entrada', 5),
  mov(4, 3, 6, 'saida', 2),
  mov(5, 5, 1, 'saida', 1),
  mov(6, 6, 3, 'entrada', 4),
  mov(7, 9, 7, 'saida', 1),
  mov(8, 12, 10, 'entrada', 3),
];

function validarDisco(d) {
  const campos = {};
  if (!d.titulo?.trim()) campos.titulo = 'Informe o título.';
  if (!d.artista?.trim()) campos.artista = 'Informe o artista ou a banda.';
  if (!(d.precoCusto >= 0)) campos.precoCusto = 'Informe um preço válido.';
  if (!Number.isInteger(d.estoque) || d.estoque < 0) campos.estoque = 'Use um número inteiro, 0 ou mais.';
  if (!Number.isInteger(d.estoqueMinimo) || d.estoqueMinimo < 0) campos.estoqueMinimo = 'Use um número inteiro, 0 ou mais.';
  if (Object.keys(campos).length) throw new ApiError('Dados inválidos.', { status: 422, campos });
}

const copia = (v) => structuredClone(v);

export const mock = {
  auth: {
    async login({ email, senha }) {
      await espera();
      if (email.toLowerCase() !== DEMO.email || senha !== DEMO.senha)
        throw new ApiError('E-mail ou senha incorretos. Verifique os dados e tente novamente.', { status: 401 });
      return { token: 'mock-token', usuario: copia(USUARIO) };
    },
    async me() {
      await espera(100);
      return copia(USUARIO);
    },
  },

  discos: {
    async listar({ q } = {}) {
      await espera();
      const termo = q ? norm(q) : '';
      return copia(discos.filter((d) => !termo || norm(`${d.titulo} ${d.artista}`).includes(termo)));
    },
    async criar(dados) {
      await espera();
      validarDisco(dados);
      const novo = { ...dados, id: proximoId++ };
      discos.push(novo);
      return copia(novo);
    },
    async atualizar(id, dados) {
      await espera();
      validarDisco(dados);
      const i = discos.findIndex((d) => mesmoId(d.id, id));
      if (i < 0) throw new ApiError('Disco não encontrado.', { status: 404 });
      discos[i] = { ...dados, id: discos[i].id };
      return copia(discos[i]);
    },
    async excluir(id) {
      await espera();
      discos = discos.filter((d) => !mesmoId(d.id, id));
      return null;
    },
  },

  movimentacoes: {
    async listar({ de, limite } = {}) {
      await espera();
      let lista = [...movs].sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id);
      if (de) lista = lista.filter((m) => m.data >= de);
      if (limite) lista = lista.slice(0, Number(limite));
      return copia(lista);
    },
    async registrar({ discoId, tipo, data, quantidade }) {
      await espera();
      const disco = discos.find((d) => mesmoId(d.id, discoId));
      const campos = {};
      if (!disco) campos.disco = 'Disco não encontrado.';
      if (!data) campos.data = 'Informe a data.';
      if (!Number.isInteger(quantidade) || quantidade < 1) campos.quantidade = 'Informe uma quantidade inteira maior que zero.';
      else if (disco && tipo === 'saida' && quantidade > disco.estoque)
        campos.quantidade = `Estoque insuficiente (disponível: ${disco.estoque}).`;
      if (Object.keys(campos).length)
        throw new ApiError('Não foi possível registrar a movimentação.', { status: 422, campos });

      disco.estoque += tipo === 'entrada' ? quantidade : -quantidade;
      const nova = { id: proximoId++, data, discoId: disco.id, disco: disco.titulo, tipo, quantidade, usuario: USUARIO.nome };
      movs.push(nova);
      return copia(nova);
    },
  },
};
