export function situacao(disco) {
  if (disco.estoque <= 0) return 'zerado';
  if (disco.estoque < disco.estoqueMinimo) return 'baixo';
  return 'ok';
}

export const comSituacao = (disco) => ({ ...disco, status: situacao(disco) });

export function resumir(discos, totalMovimentacoesMes) {
  const porGenero = new Map();
  let unidades = 0;
  let valorEstoque = 0;

  for (const d of discos) {
    unidades += d.estoque;
    valorEstoque += d.estoque * d.precoCusto;
    const genero = d.genero?.trim() || 'Sem gênero';
    porGenero.set(genero, (porGenero.get(genero) ?? 0) + 1);
  }

  return {
    titulos: discos.length,
    unidades,
    valorEstoque,
    movimentacoesMes: totalMovimentacoesMes,
    porGenero: [...porGenero]
      .map(([genero, total]) => ({ genero, total }))
      .sort((a, b) => b.total - a.total),
  };
}
