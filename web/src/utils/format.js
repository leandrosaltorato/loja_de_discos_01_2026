export const brl = (valor) =>
  Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const dataBR = (iso) =>
  iso ? iso.slice(0, 10).split("-").reverse().join("/") : "";

const dois = (n) => String(n).padStart(2, "0");

export function hojeISO() {
  const d = new Date();
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
}

export const inicioDoMesISO = () => `${hojeISO().slice(0, 8)}01`;

export const dataExtenso = (d = new Date()) =>
  d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

export const porcentagem = (atual, total) =>
  total > 0 ? Math.max(4, Math.min(100, Math.round((atual / total) * 100))) : 4;
