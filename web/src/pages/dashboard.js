import { api } from '../api/index.js';
import { html, $ } from '../utils/dom.js';
import { brl, dataBR, dataExtenso, inicioDoMesISO, porcentagem } from '../utils/format.js';
import { comSituacao, resumir } from '../utils/estoque.js';
import { pageHeader, tipoBadge, carregando, erroEstado, vazio } from '../components/ui.js';

const capitalizar = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const figura = ({ rotulo, valor, detalhe = '', tom = '' }) => html`
  <div class="figura ${tom}">
    <p class="figura-valor">${valor}</p>
    <p class="figura-rotulo">${rotulo}</p>
    ${detalhe ? html`<p class="figura-detalhe">${detalhe}</p>` : ''}
  </div>`;

function corpo(discosBrutos, movsMes, recentes) {
  const discos = discosBrutos.map(comSituacao);
  const resumo = resumir(discos, movsMes.length);
  const alertas = discos
    .filter((d) => d.status !== 'ok')
    .sort((a, b) => a.estoque - a.estoqueMinimo - (b.estoque - b.estoqueMinimo));
  const maxGenero = Math.max(1, ...resumo.porGenero.map((g) => g.total));

  return html`
    <section class="figuras" aria-label="Resumo do acervo">
      ${figura({ rotulo: 'Títulos no acervo', valor: resumo.titulos })}
      ${figura({ rotulo: 'Unidades em estoque', valor: resumo.unidades, detalhe: `${brl(resumo.valorEstoque)} a preço de custo` })}
      ${figura({ rotulo: 'Abaixo do mínimo', valor: alertas.length, tom: alertas.length ? 'figura-alerta' : '' })}
      ${figura({ rotulo: 'Movimentações no mês', valor: resumo.movimentacoesMes })}
    </section>

    <div class="dois">
      <section class="secao">
        <div class="secao-head">
          <h2>Repor</h2>
          <a href="#/estoque">Registrar reposição</a>
        </div>
        ${alertas.length
          ? html`<ul class="lista-reposicao">
              ${alertas.map(
                (d) => html`
                  <li>
                    <div class="rep-linha">
                      <span><strong>${d.titulo}</strong> <span class="muted">${d.artista}</span></span>
                      <span class="num ${d.status === 'zerado' ? 'texto-perigo' : ''}">${d.estoque} de ${d.estoqueMinimo}</span>
                    </div>
                    <div class="progress"><span class="${d.status === 'zerado' ? 'is-danger' : ''}" style="width:${porcentagem(d.estoque, d.estoqueMinimo)}%"></span></div>
                  </li>`,
              )}
            </ul>`
          : vazio('Nenhum disco abaixo do estoque mínimo.')}
      </section>

      <section class="secao">
        <div class="secao-head"><h2>Acervo por gênero</h2></div>
        <ul class="barras">
          ${resumo.porGenero.map(
            (g) => html`
              <li>
                <span>${g.genero}</span>
                <div class="progress neutral"><span style="width:${porcentagem(g.total, maxGenero)}%"></span></div>
                <span class="num">${g.total}</span>
              </li>`,
          )}
        </ul>
      </section>
    </div>

    <section class="secao">
      <div class="secao-head">
        <h2>Últimas movimentações</h2>
        <a href="#/estoque">Ver estoque</a>
      </div>
      ${recentes.length
        ? html`<div class="table-wrap">
            <table class="table table-stack">
              <thead>
                <tr><th>Data</th><th>Disco</th><th>Tipo</th><th class="num">Qtd.</th><th>Usuário</th></tr>
              </thead>
              <tbody>
                ${recentes.map(
                  (m) => html`
                    <tr>
                      <td data-label="Data">${dataBR(m.data)}</td>
                      <td data-label="Disco"><strong>${m.disco}</strong></td>
                      <td data-label="Tipo">${tipoBadge(m.tipo)}</td>
                      <td data-label="Qtd." class="num qtd-${m.tipo}">${m.tipo === 'entrada' ? '+' : '−'}${m.quantidade}</td>
                      <td data-label="Usuário" class="muted">${m.usuario}</td>
                    </tr>`,
                )}
              </tbody>
            </table>
          </div>`
        : vazio('Ainda não há movimentações.')}
    </section>`;
}

export async function montarDashboard(el) {
  el.innerHTML = String(html`
    ${pageHeader({ titulo: 'Painel', subtitulo: capitalizar(dataExtenso()) })}
    <div id="corpo" class="dash">${carregando()}</div>`);
  const alvo = $('#corpo', el);

  async function carregar() {
    alvo.innerHTML = String(carregando());
    try {
      const [discos, movsMes, recentes] = await Promise.all([
        api.discos.listar(),
        api.movimentacoes.listar({ de: inicioDoMesISO() }),
        api.movimentacoes.listar({ limite: 6 }),
      ]);
      alvo.innerHTML = String(corpo(discos, movsMes, recentes));
    } catch (erro) {
      alvo.innerHTML = String(erroEstado(erro.message));
      $('[data-tentar]', alvo).addEventListener('click', carregar);
    }
  }
  await carregar();
}
