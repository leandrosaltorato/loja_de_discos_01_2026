export const lerForm = (form) =>
  Object.fromEntries(new FormData(form).entries());

const inteiroNaoNegativo = (v) =>
  v !== "" && Number.isInteger(Number(v)) && Number(v) >= 0;

export function validarLogin(v) {
  const e = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v.email ?? "").trim()))
    e.email = "Informe um e-mail válido.";
  if (!v.senha) e.senha = "Informe a senha.";
  return e;
}

export function validarDisco(v) {
  const e = {};
  if (!v.titulo.trim()) e.titulo = "Informe o título.";
  if (!v.artista.trim()) e.artista = "Informe o artista ou a banda.";
  if (
    v.precoCusto === "" ||
    Number.isNaN(Number(v.precoCusto)) ||
    Number(v.precoCusto) < 0
  )
    e.precoCusto = "Informe um preço válido.";
  if (!inteiroNaoNegativo(v.estoque))
    e.estoque = "Use um número inteiro, 0 ou mais.";
  if (!inteiroNaoNegativo(v.estoqueMinimo))
    e.estoqueMinimo = "Use um número inteiro, 0 ou mais.";
  return e;
}

export const paraDisco = (v) => ({
  titulo: v.titulo.trim(),
  artista: v.artista.trim(),
  genero: v.genero.trim(),
  precoCusto: Number(v.precoCusto),
  estoque: Number(v.estoque),
  estoqueMinimo: Number(v.estoqueMinimo),
});

export function limparErros(form) {
  form.querySelectorAll(".field-error").forEach((el) => el.remove());
  form.querySelectorAll("[aria-invalid]").forEach((el) => {
    el.removeAttribute("aria-invalid");
    el.removeAttribute("aria-describedby");
  });
  const geral = form.querySelector("[data-erro]");
  if (geral) geral.hidden = true;
}

export function mostrarErros(form, erros = {}) {
  limparErros(form);
  let primeiro = null;
  for (const [nome, mensagem] of Object.entries(erros)) {
    const campo = form.elements[nome];
    const caixa = campo?.closest?.(".field");
    if (!caixa) continue;
    const aviso = document.createElement("small");
    aviso.className = "field-error";
    aviso.id = `erro-${nome}`;
    aviso.textContent = mensagem;
    caixa.append(aviso);
    campo.setAttribute("aria-invalid", "true");
    campo.setAttribute("aria-describedby", aviso.id);
    primeiro ??= campo;
  }
  primeiro?.focus();
}

export function mostrarErroGeral(form, mensagem) {
  const geral = form.querySelector("[data-erro]");
  if (!geral) return;
  geral.textContent = mensagem;
  geral.hidden = !mensagem;
}

export function erroDeFormulario(form, erro) {
  mostrarErros(form, erro.campos ?? {});
  mostrarErroGeral(form, erro.message);
}
