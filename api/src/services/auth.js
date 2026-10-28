import bcrypt from 'bcryptjs';

export async function verificarLogin(prisma, { email, senha }) {
  if (!email || !senha) return { autenticado: false };

  const usuario = await prisma.usuario.findUnique({
    where: { email },
    select: { idUsuario: true, nome: true, email: true, senha: true },
  });

  if (!usuario) return { autenticado: false };
  const hashBcrypt = /^\$2[aby]\$/.test(usuario.senha);
  const senhaValida = hashBcrypt
    ? await bcrypt.compare(senha, usuario.senha)
    : senha === usuario.senha;

  if (!senhaValida) return { autenticado: false };

  const { senha: _senha, ...dadosUsuario } = usuario;
  return { autenticado: true, usuario: dadosUsuario };
}
