import { api } from '../api/index.js';
import { html, $ } from '../utils/dom.js';
import { brl } from '../utils/format.js';
import { comSituacao } from '../utils/estoque.js';
import { lerForm, validarDisco, paraDisco, mostrarErros, limparErros, erroDeFormulario } from '../utils/validate.js';
import { pageHeader, statusBadge, carregando, erroEstado, vazio, comCarregando } from '../components/ui.js';
import { confirmar, fecharAoClicarFora } from '../components/dialog.js';
import { toast } from '../components/toast.js';

const GENEROS_BASE = ['Rock', 'MPB', 'Jazz', 'Pop', 'Reggae', 'Soul', 'Blues', 'Clássica'];
const CAMPOS = ['titulo', 'artista', 'genero', 'precoCusto', 'estoque', 'estoqueMinimo'];

export async function montarDiscos(el) {
  let discos = [];
  let busca = '';
  let pedido = 0;
  let editandoId = null;
  const generos = new Set(GENEROS_BASE);

  el.innerHTML = String(html`
    ${pageHeader({
      titulo: 'Discos',
      subtitulo: 'Cadastro do acervo.',
      acoes: html`<button class="btn btn-primary" type="button" data-novo>Adicionar disco</button>`,
    })}

    <section class="painel">
      <div class="toolbar">
        <label class="sr-only" for="busca">Buscar por título ou artista</label>
        <input id="busca" type="search" placeholder="Buscar por título ou artista" autocomplete="off" />
        <span class="muted small" data-contagem></span>
      </div>
      <div id="lista" aria-live="polite">${carregando()}</div>
    </section>

    <dialog class="modal" id="modal-disco" aria-labelledby="modal-titulo">
      <form class="form" id="form-disco" novalidate>
        <header class="modal-head">
          <h2 id="modal-titulo">Novo disco</h2>
          <button class="btn-link" type="button" data-fechar>Fechar</button>
        </header>

        <div class="alert alert-danger" data-erro role="alert" hidden></div>

        <div class="form-grid">
          <label class="field span-2"><span>Título</span><input type="text" name="titulo" autocomplete="off" /></label>
          <label class="field"><span>Artista / banda</span><input type="text" name="artista" autocomplete="off" /></label>
          <label class="field"><span>Gênero</span><input type="text" name="genero" list="lista-generos" autocomplete="off" /></label>
          <label class="field"><span>Preço de custo (R$)</span><input type="number" name="precoCusto" step="0.01" min="0" inputmode="decimal" /></label>
          <label class="field"><span>Em estoque</span><input type="number" name="estoque" step="1" min="0" inputmode="numeric" /></label>
          <label class="field span-2"><span>Estoque mínimo</span><input type="number" name="estoqueMinimo" step="1" min="0" inputmode="numeric" /></label>
        </div>
        <datalist id="lista-generos"></datalist>

        <footer class="modal-foot">
          <button class="btn btn-ghost" type="button" data-fechar>Cancelar</button>
          <button class="btn btn-primary" type="submit">Salvar</button>
        </footer>
      </form>
    </dialog>`);

  const lista = $('#lista', el);
  const modal = $('#modal-disco', el);
  const form = $('#form-disco', el);
  fecharAoClicarFora(modal);

  function desenhar() {
    discos.forEach((d) => d.genero && generos.add(d.genero));
    $('#lista-generos', el).innerHTML = String(html`${[...generos].sort().map((g) => html`<option value="${g}"></option>`)}`);
    $('[data-contagem]', el).textContent = `${discos.length} ${discos.length === 1 ? 'título' : 'títulos'}`;

    if (!discos.length) {
      lista.innerHTML = String(vazio(busca ? `Nenhum disco encontrado para “${busca}”.` : 'Nenhum disco cadastrado ainda.'));
      return;
    }
    lista.innerHTML = String(html`
      <div class="table-wrap">
        <table class="table table-stack">
          <thead>
            <tr>
              <th>Título</th><th>Artista / banda</th><th>Gênero</th><th class="num">Custo</th>
              <th class="num">Estoque</th><th class="num">Mín.</th><th>Situação</th><th class="actions"><span class="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody>
            ${discos.map(
              (d) => html`
                <tr>
                  <td data-label="Título"><strong>${d.titulo}</strong></td>
                  <td data-label="Artista / banda">${d.artista}</td>
                  <td data-label="Gênero" class="muted">${d.genero || '—'}</td>
                  <td data-label="Custo" class="num">${brl(d.precoCusto)}</td>
                  <td data-label="Estoque" class="num">${d.estoque}</td>
                  <td data-label="Mín." class="num">${d.estoqueMinimo}</td>
                  <td data-label="Situação">${statusBadge(d.status)}</td>
                  <td class="actions">
                    <button class="btn-link" type="button" data-editar data-id="${d.id}" aria-label="Editar ${d.titulo}">Editar</button>
                    <button class="btn-link perigo" type="button" data-excluir data-id="${d.id}" aria-label="Excluir ${d.titulo}">Excluir</button>
                  </td>
                </tr>`,
            )}
          </tbody>
        </table>
      </div>`);
  }

  async function carregar() {
    const meu = ++pedido;
    try {
      const resultado = (await api.discos.listar({ q: busca })).map(comSituacao);
      if (meu !== pedido) return; // chegou uma busca mais nova; ignora esta
      discos = resultado;
      desenhar();
    } catch (erro) {
      if (meu !== pedido) return;
      lista.innerHTML = String(erroEstado(erro.message));
      $('[data-tentar]', lista).addEventListener('click', () => {
        lista.innerHTML = String(carregando());
        carregar();
      });
    }
  }

  function abrirForm(disco) {
    editandoId = disco ? disco.id : null;
    form.reset();
    limparErros(form);
    if (disco) CAMPOS.forEach((c) => (form.elements[c].value = disco[c] ?? ''));
    $('#modal-titulo', el).textContent = disco ? 'Editar disco' : 'Novo disco';
    modal.showModal();
    form.elements.titulo.focus();
  }

  // ---- eventos ----
  $('[data-novo]', el).addEventListener('click', () => abrirForm(null));
  el.querySelectorAll('[data-fechar]').forEach((b) => b.addEventListener('click', () => modal.close()));

  let atraso;
  $('#busca', el).addEventListener('input', (ev) => {
    clearTimeout(atraso);
    atraso = setTimeout(() => {
      busca = ev.target.value.trim();
      carregar();
    }, 250);
  });

  lista.addEventListener('click', async (ev) => {
    const botao = ev.target.closest('[data-editar], [data-excluir]');
    if (!botao) return;
    const disco = discos.find((d) => String(d.id) === botao.dataset.id);
    if (!disco) return;

    if (botao.hasAttribute('data-editar')) return abrirForm(disco);

    const confirmado = await confirmar({
      titulo: 'Excluir disco',
      mensagem: `Excluir “${disco.titulo}” do acervo? Esta ação não pode ser desfeita.`,
      rotulo: 'Excluir',
      perigo: true,
    });
    if (!confirmado) return;
    try {
      await api.discos.excluir(disco.id);
      toast('Disco excluído.');
      await carregar();
    } catch (erro) {
      toast(erro.message, 'erro');
    }
  });

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const valores = lerForm(form);
    const erros = validarDisco(valores);
    mostrarErros(form, erros);
    if (Object.keys(erros).length) return;

    await comCarregando($('[type=submit]', form), async () => {
      try {
        const dados = paraDisco(valores);
        const edicao = editandoId !== null;
        if (edicao) await api.discos.atualizar(editandoId, dados);
        else await api.discos.criar(dados);
        modal.close();
        toast(edicao ? 'Disco atualizado.' : 'Disco cadastrado.');
        await carregar();
      } catch (erro) {
        erroDeFormulario(form, erro); // 422 do backend cai direto nos campos
      }
    });
  });

  await carregar();
}
