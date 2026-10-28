import bcrypt from 'bcryptjs';

/** Verifica credenciais já cadastradas. Não cria usuário nem emite token. */
export async function verificarLogin(prisma, { email, senha }) {
  if (!email || !senha) return { autenticado: false };

  const usuario = await prisma.usuario.findUnique({
    where: { email },
    select: { idUsuario: true, nome: true, email: true, senha: true },
  });

  if (!usuario) return { autenticado: false };

  // O DER só define o tipo da coluna, não o formato do segredo.
  // Senhas guardadas como hash bcrypt são comparadas com segurança.
  const hashBcrypt = /^\$2[aby]\$/.test(usuario.senha);
  const senhaValida = hashBcrypt
    ? await bcrypt.compare(senha, usuario.senha)
    : senha === usuario.senha;

  if (!senhaValida) return { autenticado: false };

  const { senha: _senha, ...dadosUsuario } = usuario;
  return { autenticado: true, usuario: dadosUsuario };
}
