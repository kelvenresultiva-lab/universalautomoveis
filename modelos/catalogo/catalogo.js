// Catálogo: filtros, ordenação e paginação do estoque (window.ESTOQUE, em estoque.js).
(function () {
  const POR_PAGINA = 18;
  const CIDADE = "Contagem (MG)"; // cidade da loja
  const CIDADE_TITULO = "Contagem/MG"; // usado no título da página
  const novo = (v) => v.km !== null && v.km < 1000; // 0 Km (novo); km null = não informado

  const $ = (id) => document.getElementById(id);
  const estoque = window.ESTOQUE || [];
  const reais = (v) => (v == null ? "Consulte o preço" : "R$ " + v.toLocaleString("pt-BR"));
  const anoModelo = (v) => parseInt(v.ano.split("/")[1] || v.ano, 10);
  const titulo = (t) => t.charAt(0) + t.slice(1).toLowerCase();

  // ---------- Estado (espelhado na URL, para os links da home funcionarem: ?tipo=carro&marca=FIAT) ----------
  const CAMPOS = ["tipo", "marca", "modelo", "anoMin", "anoMax", "condicao", "preco", "km", "ordem", "pagina"];
  const estado = {};
  const url = new URLSearchParams(location.search);
  CAMPOS.forEach((c) => (estado[c] = url.get(c) || ""));
  estado.pagina = parseInt(estado.pagina, 10) || 1;
  estado.ordem = estado.ordem || "relevantes";

  function salvarNaUrl() {
    const p = new URLSearchParams();
    CAMPOS.forEach((c) => {
      const v = estado[c];
      if (v && !(c === "ordem" && v === "relevantes") && !(c === "pagina" && v === 1)) p.set(c, v);
    });
    history.replaceState(null, "", p.toString() ? "?" + p : location.pathname);
  }

  // ---------- Opções dos filtros ----------
  const opcoes = (sel, lista, todos) => {
    sel.innerHTML = `<option value="">${todos}</option>` + lista.map((v) => `<option value="${v}">${v}</option>`).join("");
  };

  function preencherOpcoes() {
    const base = estoque.filter((v) => !estado.tipo || v.tipo === estado.tipo);
    const marcas = [...new Set(base.map((v) => v.marca))].sort();
    if (estado.marca && !marcas.includes(estado.marca)) estado.marca = "";
    opcoes($("f-marca"), marcas, "Todas as marcas");
    $("f-marca").value = estado.marca;

    const modelos = [...new Set(base.filter((v) => v.marca === estado.marca).map((v) => v.modelo))].sort();
    if (estado.modelo && !modelos.includes(estado.modelo)) estado.modelo = "";
    opcoes($("f-modelo"), modelos, "Todos os modelos");
    $("f-modelo").disabled = !estado.marca;
    $("f-modelo").value = estado.modelo;

    const anos = [...new Set(estoque.map(anoModelo))].sort((a, b) => b - a);
    opcoes($("f-ano-min"), anos, "Qualquer");
    opcoes($("f-ano-max"), anos, "Qualquer");
    $("anos").innerHTML = anos
      .map((a) => {
        const ativo = estado.anoMin === String(a) && estado.anoMax === String(a);
        return `<button type="button" class="ano" data-ano="${a}" aria-pressed="${ativo}">${a}</button>`;
      })
      .join("");
    document.querySelectorAll('input[name="condicao"]').forEach((r) => (r.checked = r.value === estado.condicao));
    $("f-ano-min").value = estado.anoMin;
    $("f-ano-max").value = estado.anoMax;
    $("f-preco").value = estado.preco;
    $("f-km").value = estado.km;
    $("f-ordem").value = estado.ordem;

    document.querySelectorAll(".alternador__opcao").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.tipo === estado.tipo));
    });
  }

  // ---------- Filtrar e ordenar ----------
  // ignorar: nome de um filtro que não entra na conta (para mostrar as quantidades de Usado / 0 Km)
  const passa = (v, ignorar) =>
    (!estado.tipo || v.tipo === estado.tipo) &&
    (!estado.marca || v.marca === estado.marca) &&
    (!estado.modelo || v.modelo === estado.modelo) &&
    (!estado.anoMin || anoModelo(v) >= +estado.anoMin) &&
    (!estado.anoMax || anoModelo(v) <= +estado.anoMax) &&
    (ignorar === "condicao" || !estado.condicao || (estado.condicao === "novo") === novo(v)) &&
    (!estado.preco || (!v.vendido && v.preco != null && v.preco <= +estado.preco)) &&
    (estado.km === "" || (v.km !== null && v.km <= +estado.km));

  function quantidades() {
    const base = estoque.filter((v) => passa(v, "condicao"));
    document.querySelector('[data-qtd="usado"]').textContent = `(${base.filter((v) => !novo(v) && !v.vendido).length})`;
    document.querySelector('[data-qtd="novo"]').textContent = `(${base.filter(novo).length})`;
  }

  function filtrar() {
    let lista = estoque.filter((v) => passa(v));
    // sem preço ou sem km vão para o fim nessas ordens
    const num = (x, fim) => (x == null ? fim : x);
    const ordens = {
      "menor-preco": (a, b) => num(a.preco, Infinity) - num(b.preco, Infinity),
      "maior-preco": (a, b) => num(b.preco, -Infinity) - num(a.preco, -Infinity),
      "mais-novos": (a, b) => anoModelo(b) - anoModelo(a) || num(a.km, Infinity) - num(b.km, Infinity),
      "menor-km": (a, b) => num(a.km, Infinity) - num(b.km, Infinity),
    };
    if (ordens[estado.ordem]) lista = [...lista].sort(ordens[estado.ordem]);
    // vendidos sempre no fim (estão no site só como histórico da loja)
    return [...lista.filter((v) => !v.vendido), ...lista.filter((v) => v.vendido)];
  }

  // ---------- Card ----------
  const icone = {
    ano: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    km: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17a8 8 0 1 1 16 0z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M12 17l3.5-4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    local: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="10" r="2.3" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
    coracao: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  };

  function card(v) {
    const nome = `${v.marca} ${v.modelo}`;
    const foto = v.foto
      ? `<img src="/modelos/catalogo/fotos/${v.foto}" alt="${nome} ${v.ano}" loading="lazy">`
      : `<div class="card__sem-foto">Fotos em breve</div>`;
    const km = v.km === null ? "" : v.km === 0 ? "0 Km" : v.km.toLocaleString("pt-BR") + " Km";
    return `
      <article class="card${v.vendido ? " card--vendido" : ""}">
        <a class="card__foto" href="${v.link}">${foto}${v.vendido ? '<span class="faixa-vendido">Vendido</span>' : ""}</a>
        <button type="button" class="card__favorito" aria-label="Favoritar ${nome}">${icone.coracao}</button>
        <a class="card__corpo" href="${v.link}">
          ${(() => {
            const selos = v.vendido ? ['<span class="selo selo--vendido">VENDIDO</span>']
              : [novo(v) && '<span class="selo selo--verde">0 KM</span>', v.abaixoFipe && '<span class="selo selo--verde">ABAIXO DA FIPE</span>'].filter(Boolean);
            return selos.length ? `<div class="card__selos">${selos.join("")}</div>` : "";
          })()}
          <h2 class="card__nome">${nome}</h2>
          <p class="card__versao">${v.versao ? titulo(v.versao) : "&nbsp;"}</p>
          <ul class="card__dados">
            <li>${icone.ano}${v.ano}</li>
            ${km ? `<li>${icone.km}${km}</li>` : ""}
          </ul>
          <p class="card__local">${icone.local}${CIDADE}</p>
          <strong class="card__preco">${v.vendido ? "Vendido" : reais(v.preco)}</strong>
          <span class="botao-escuro card__botao">Ver detalhes</span>
        </a>
      </article>`;
  }

  // ---------- Chips de filtros aplicados ----------
  function chips() {
    const lista = [];
    if (estado.tipo) lista.push(["tipo", estado.tipo === "carro" ? "Carros" : "Motos"]);
    if (estado.marca) lista.push(["marca", titulo(estado.marca)]);
    if (estado.modelo) lista.push(["modelo", estado.modelo]);
    if (estado.anoMin && estado.anoMin === estado.anoMax) lista.push(["ano", "Ano " + estado.anoMin]);
    else {
      if (estado.anoMin) lista.push(["anoMin", "Ano mínimo " + estado.anoMin]);
      if (estado.anoMax) lista.push(["anoMax", "Ano máximo " + estado.anoMax]);
    }
    if (estado.condicao) lista.push(["condicao", estado.condicao === "novo" ? "0 Km (Novo)" : "Usado"]);
    if (estado.preco) lista.push(["preco", "Até " + reais(+estado.preco)]);
    if (estado.km !== "") lista.push(["km", estado.km === "0" ? "0 km" : "Até " + (+estado.km).toLocaleString("pt-BR") + " km"]);

    $("chips").innerHTML = lista
      .map(([c, t]) => `<button type="button" class="chip" data-campo="${c}">${t}<span aria-hidden="true">✕</span><span class="sr">Remover filtro</span></button>`)
      .join("");
    $("bloco-aplicados").hidden = !lista.length;
    $("contador-filtros").textContent = lista.length;
    $("contador-mobile").textContent = lista.length;
    $("contador-mobile").hidden = !lista.length;
  }

  // ---------- Título, trilha e paginação ----------
  function cabecalho(total) {
    const tipo = estado.tipo === "moto" ? "Motos" : estado.tipo === "carro" ? "Carros" : "Carros e motos";
    const nome = [estado.marca && titulo(estado.marca), estado.modelo].filter(Boolean).join(" ");
    const ano = estado.anoMin && estado.anoMin === estado.anoMax ? " " + estado.anoMin
      : estado.anoMin ? ` a partir de ${estado.anoMin}` : estado.anoMax ? ` até ${estado.anoMax}` : "";
    const condicao = estado.condicao === "novo" ? "novos 0km" : estado.condicao === "usado" ? "usados e seminovos" : "usados, seminovos e novos 0km";
    $("titulo").textContent = `${tipo}${nome ? " " + nome : ""}${ano} ${condicao} à venda em ${CIDADE_TITULO}`;
    const vendidos = filtrar().filter((v) => v.vendido).length;
    const aVenda = total - vendidos;
    $("total").textContent = (aVenda === 1 ? "1 veículo à venda" : `${aVenda} veículos à venda`) + (vendidos ? ` · ${vendidos} já vendido${vendidos > 1 ? "s" : ""}` : "");
    const anoTrilha = estado.anoMin && estado.anoMin === estado.anoMax ? estado.anoMin : "";
    $("trilha-extra").innerHTML = [estado.tipo === "moto" ? "Motos" : estado.tipo === "carro" ? "Carros" : "Veículos", estado.marca && titulo(estado.marca), estado.modelo, anoTrilha]
      .filter(Boolean)
      .map((t) => `<span class="trilha__sep" aria-hidden="true">›</span><span>${t}</span>`)
      .join("");
  }

  function paginacao(paginas) {
    const nav = $("paginacao");
    if (paginas <= 1) return (nav.innerHTML = "");
    const p = estado.pagina;
    let html = `<button type="button" data-pag="${p - 1}" ${p === 1 ? "disabled" : ""} aria-label="Página anterior">‹</button>`;
    for (let i = 1; i <= paginas; i++) {
      html += `<button type="button" data-pag="${i}" ${i === p ? 'aria-current="page"' : ""}>${i}</button>`;
    }
    html += `<button type="button" data-pag="${p + 1}" ${p === paginas ? "disabled" : ""} aria-label="Próxima página">›</button>`;
    nav.innerHTML = html;
  }

  // ---------- Desenhar ----------
  function desenhar() {
    const lista = filtrar();
    const paginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
    estado.pagina = Math.min(Math.max(1, estado.pagina), paginas);
    const pedaco = lista.slice((estado.pagina - 1) * POR_PAGINA, estado.pagina * POR_PAGINA);

    $("grade").innerHTML = pedaco.map(card).join("");
    $("vazio").hidden = lista.length > 0;
    cabecalho(lista.length);
    chips();
    quantidades();
    paginacao(lista.length ? paginas : 0);
    salvarNaUrl();
  }

  function mudar(campo, valor) {
    estado[campo] = valor;
    if (campo !== "pagina") estado.pagina = 1;
    if (campo === "tipo" || campo === "marca") preencherOpcoes();
    desenhar();
  }

  function limparTudo() {
    ["tipo", "marca", "modelo", "anoMin", "anoMax", "condicao", "preco", "km"].forEach((c) => (estado[c] = ""));
    estado.pagina = 1;
    preencherOpcoes();
    desenhar();
  }

  // ---------- Eventos ----------
  document.querySelectorAll(".alternador__opcao").forEach((b) =>
    b.addEventListener("click", () => mudar("tipo", estado.tipo === b.dataset.tipo ? "" : b.dataset.tipo))
  );
  $("f-marca").addEventListener("change", (e) => { estado.modelo = ""; mudar("marca", e.target.value); });
  $("f-modelo").addEventListener("change", (e) => mudar("modelo", e.target.value));
  $("f-ano-min").addEventListener("change", (e) => { mudar("anoMin", e.target.value); preencherOpcoes(); });
  $("f-ano-max").addEventListener("change", (e) => { mudar("anoMax", e.target.value); preencherOpcoes(); });
  $("f-preco").addEventListener("change", (e) => mudar("preco", e.target.value));
  $("f-km").addEventListener("change", (e) => mudar("km", e.target.value));
  $("f-ordem").addEventListener("change", (e) => mudar("ordem", e.target.value));
  $("anos").addEventListener("click", (e) => {
    const b = e.target.closest(".ano");
    if (!b) return;
    const a = b.dataset.ano;
    const ativo = estado.anoMin === a && estado.anoMax === a;
    estado.anoMin = ativo ? "" : a;
    estado.anoMax = ativo ? "" : a;
    estado.pagina = 1;
    preencherOpcoes();
    desenhar();
  });
  $("condicao").addEventListener("change", (e) => mudar("condicao", e.target.value));
  // clicar de novo no rádio já marcado desmarca
  $("condicao").addEventListener("click", (e) => {
    const r = e.target.closest('input[name="condicao"]');
    if (r && r.value === estado.condicao && r.dataset.estava === "1") { r.checked = false; mudar("condicao", ""); }
    document.querySelectorAll('input[name="condicao"]').forEach((x) => (x.dataset.estava = x.checked ? "1" : ""));
  });
  $("limpar-todos").addEventListener("click", limparTudo);
  $("limpar-vazio").addEventListener("click", limparTudo);

  $("chips").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const campo = chip.dataset.campo;
    if (campo === "marca") estado.modelo = "";
    if (campo === "ano") { estado.anoMin = ""; estado.anoMax = ""; mudar("pagina", 1); }
    else mudar(campo, "");
    preencherOpcoes();
  });

  $("paginacao").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-pag]");
    if (!b || b.disabled) return;
    mudar("pagina", parseInt(b.dataset.pag, 10));
    document.querySelector(".resultados").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("grade").addEventListener("click", (e) => {
    const fav = e.target.closest(".card__favorito");
    if (fav) fav.classList.toggle("ativo");
  });

  // Filtros no celular: painel que abre por cima
  const abrir = (sim) => {
    $("filtros").classList.toggle("aberto", sim);
    document.body.classList.toggle("sem-rolagem", sim);
  };
  $("abrir-filtros").addEventListener("click", () => abrir(true));
  $("fechar-filtros").addEventListener("click", () => abrir(false));
  $("ver-resultados").addEventListener("click", () => abrir(false));

  preencherOpcoes();
  desenhar();
})();
