import { api } from '../api/index.js';
import { html, $ } from '../utils/dom.js';
import { hojeISO } from '../utils/format.js';
import { comSituacao } from '../utils/estoque.js';
import { lerForm, mostrarErros, erroDeFormulario } from '../utils/validate.js';
import { pageHeader, statusBadge, carregando, erroEstado, comCarregando } from '../components/ui.js';
import { toast } from '../components/toast.js';

export async function montarEstoque(el) {
  let discos = [];

  el.innerHTML = String(html`
    ${pageHeader({
      titulo: 'Estoque e vendas',
      subtitulo: 'Registre vendas e reposições e acompanhe o acervo em ordem alfabética.',
    })}

    <div id="alerta"></div>

    <div class="split">
      <section class="painel">
        <h2>Nova movimentação</h2>
        <form class="form" id="form-mov" novalidate>
          <div class="alert alert-danger" data-erro role="alert" hidden></div>

          <label class="field">
            <span>Disco</span>
            <select name="disco" disabled><option value="">Carregando…</option></select>
            <small class="hint" data-hint></small>
          </label>

          <fieldset class="field">
            <legend>Tipo</legend>
            <div class="segmented">
              <label><input type="radio" name="tipo" value="saida" checked /><span>Venda</span></label>
              <label><input type="radio" name="tipo" value="entrada" /><span>Reposição</span></label>
            </div>
          </fieldset>

          <div class="form-grid">
            <label class="field"><span>Data</span><input type="date" name="data" value="${hojeISO()}" /></label>
            <label class="field"><span>Quantidade</span><input type="number" name="quantidade" min="1" step="1" value="1" inputmode="numeric" /></label>
          </div>

          <button class="btn btn-primary btn-block" type="submit">Registrar movimentação</button>
        </form>
      </section>

      <section class="painel">
        <div class="painel-head">
          <h2>Acervo</h2>
          <span class="muted small" data-contagem></span>
        </div>
        <div id="acervo">${carregando()}</div>
      </section>
    </div>`);

  const form = $('#form-mov', el);
  const select = form.elements.disco;
  const dica = $('[data-hint]', el);
  const discoSelecionado = () => discos.find((d) => String(d.id) === select.value);

  function atualizarDica() {
    const d = discoSelecionado();
    dica.textContent = d ? `Em estoque: ${d.estoque} · mínimo: ${d.estoqueMinimo}` : '';
  }

  function desenhar() {
    const ordenados = [...discos].sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));
    const alertas = ordenados.filter((d) => d.status !== 'ok');
    const anterior = select.value;

    $('#alerta', el).innerHTML = alertas.length
      ? String(html`
          <div class="alert alert-warn" role="alert">
            <strong>Estoque abaixo do mínimo</strong>
            ${alertas.map((d) => html`<span class="alerta-item">${d.titulo} (${d.estoque}/${d.estoqueMinimo})</span>`)}
          </div>`)
      : '';

    select.disabled = false;
    select.innerHTML = String(html`
      <option value="" disabled>Selecione um disco…</option>
      ${ordenados.map((d) => html`<option value="${d.id}">${d.titulo} — ${d.artista}</option>`)}`);
    select.value = ordenados.some((d) => String(d.id) === anterior) ? anterior : '';
    atualizarDica();

    $('[data-contagem]', el).textContent = `${ordenados.length} títulos`;
    $('#acervo', el).innerHTML = String(html`
      <div class="table-wrap">
        <table class="table table-stack">
          <thead>
            <tr><th>Título</th><th>Artista / banda</th><th class="num">Estoque</th><th class="num">Mín.</th><th>Situação</th></tr>
          </thead>
          <tbody>
            ${ordenados.map(
              (d) => html`
                <tr>
                  <td data-label="Título"><strong>${d.titulo}</strong></td>
                  <td data-label="Artista / banda">${d.artista}</td>
                  <td data-label="Estoque" class="num">${d.estoque}</td>
                  <td data-label="Mín." class="num">${d.estoqueMinimo}</td>
                  <td data-label="Situação">${statusBadge(d.status)}</td>
                </tr>`,
            )}
          </tbody>
        </table>
      </div>`);
  }

  async function carregar() {
    try {
      discos = (await api.discos.listar()).map(comSituacao);
      desenhar();
    } catch (erro) {
      const alvo = $('#acervo', el);
      alvo.innerHTML = String(erroEstado(erro.message));
      $('[data-tentar]', alvo).addEventListener('click', () => {
        alvo.innerHTML = String(carregando());
        carregar();
      });
    }
  }

  select.addEventListener('change', atualizarDica);

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const v = lerForm(form);
    const quantidade = Number(v.quantidade);
    const disco = discoSelecionado();
    const erros = {};

    if (!v.disco) erros.disco = 'Selecione um disco.';
    if (!v.data) erros.data = 'Informe a data.';
    if (!Number.isInteger(quantidade) || quantidade < 1) erros.quantidade = 'Informe uma quantidade inteira maior que zero.';
    else if (disco && v.tipo === 'saida' && quantidade > disco.estoque)
      erros.quantidade = `Estoque insuficiente (disponível: ${disco.estoque}).`;

    mostrarErros(form, erros);
    if (Object.keys(erros).length) return;

    await comCarregando($('[type=submit]', form), async () => {
      try {
        await api.movimentacoes.registrar({ discoId: v.disco, tipo: v.tipo, data: v.data, quantidade });
        toast(v.tipo === 'saida' ? 'Venda registrada.' : 'Reposição registrada.');
        form.elements.quantidade.value = 1;
        await carregar();
      } catch (erro) {
        erroDeFormulario(form, erro);
      }
    });
  });

  await carregar();
}
