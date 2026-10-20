// Preenche a página do carro com o veículo de ?carro=<slug> (dados em ../catalogo/estoque.js).
(function () {
  const estoque = window.ESTOQUE || [];
  if (!estoque.length) return;

  const CIDADE = "Contagem - MG";
  const WHATS = "5531989044592"; // WhatsApp da loja (Cauã), do perfil do Instagram
  const FOTOS = "../catalogo/fotos/";

  const slug = new URLSearchParams(location.search).get("carro");
  const v = estoque.find((c) => c.slug === slug) || estoque[0];

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reais = (n) => (n == null ? "Consulte o preço" : "R$ " + n.toLocaleString("pt-BR"));
  const ou = (t) => t || "Consulte";
  const km = (c) => (c.km === null ? "" : c.km.toLocaleString("pt-BR"));
  const nome = `${v.marca} ${v.modelo}`;

  // ---------- Título e topo ----------
  document.title = `${v.vendido ? "VENDIDO — " : ""}${nome} ${v.versao} ${v.ano} | Universal Automóveis`;
  if (v.vendido) document.body.classList.add("veiculo-vendido");
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute("content", `${v.vendido ? "Vendido: " : ""}${nome} ${v.versao} ${v.ano}${v.preco && !v.vendido ? " por " + reais(v.preco) : ""}. Universal Automóveis, Contagem/MG.`);
  const h1 = $("#VehicleBasicInformationTitle");
  if (h1) h1.innerHTML = `${esc(v.marca)} <strong>${esc(v.modelo)}</strong><span id="VehicleBasicInformationDescription" class="VehicleDetails__header__description">${esc(v.versao)}</span>`;

  // ---------- Fotos ----------
  const galeria = $(".DetailCarousel__container__animation");
  if (galeria) {
    galeria.innerHTML = Array.from({ length: v.fotos }, (_, i) => {
      const n = String(i + 1).padStart(2, "0");
      return `<div class="DetailCarousel__container__items" id="DetailCarouselContainerItems-${n}">
        <img class="DetailCarousel__container__items__photo" src="${FOTOS}${v.slug}/${n}.jpg" alt="${esc(nome)} ${v.ano} — foto ${i + 1}" ${i > 2 ? 'loading="lazy"' : ""}>
      </div>`;
    }).join("");
    // setas do carrossel: rolam uma foto por vez
    const passo = () => (galeria.firstElementChild ? galeria.firstElementChild.getBoundingClientRect().width : 300);
    const esq = $(".DetailCarousel__arrows__item--left");
    const dir = $(".DetailCarousel__arrows__item--right");
    if (esq) esq.addEventListener("click", () => galeria.scrollBy({ left: -passo(), behavior: "smooth" }));
    if (dir) dir.addEventListener("click", () => galeria.scrollBy({ left: passo(), behavior: "smooth" }));
  }

  // ---------- Ficha técnica ----------
  const ficha = $("#VehicleCharacteristic .VehicleDetails__list");
  if (ficha) {
    const itens = [
      ["Cidade", CIDADE, true],
      ["Ano", v.ano],
      ["KM", km(v) || "Consulte"],
      ["Câmbio", ou(v.cambio)],
      ["Carroceria", ou(v.carroceria)],
      ["Combustível", ou(v.combustivel)],
      v.vendido ? ["Situação", "Vendido"] : ["Aceita troca", "Sim"],
    ];
    ficha.innerHTML = itens
      .map(([t, val, cheio]) => `<li class="VehicleDetails__list__item${cheio ? " VehicleDetails__list__item__fullWidth" : ""}">
        <h2 class="VehicleDetails__list__item__title">${t}</h2>
        <strong class="VehicleDetails__list__item__value">${esc(val)}</strong></li>`)
      .join("");
  }

  // ---------- Diferenciais (selos com balão) e "Sobre o carro" ----------
  // Os selos saem do que a loja escreve nas legendas. "Super Preço" só aparece com abaixoFipe: true no estoque.
  const tudo = [...v.opcionais, ...v.observacoes].join(" | ").toLowerCase();
  const ICONES = {
    preco: '<svg viewBox="0 0 24 32" aria-hidden="true"><path d="M0 0h24v32l-12-6-12 6z" fill="#3fbf3f"/><text x="12" y="17" text-anchor="middle" font-size="15" font-weight="800" fill="#fff" font-family="Arial">$</text></svg>',
    revisado: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5z" fill="#2e2d37"/><path d="M8 12l3 3 5-6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    pneus: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#2e2d37"/><circle cx="12" cy="12" r="4.5" fill="none" stroke="#fff" stroke-width="2"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5" stroke="#fff" stroke-width="1.6"/></svg>',
    chave: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="1" y="1" width="22" height="22" rx="5" fill="#2e2d37"/><circle cx="9" cy="12" r="3.5" fill="none" stroke="#fff" stroke-width="2"/><path d="M12.5 12H19M16.5 12v3M19 12v2.5" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
    troca: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="1" y="1" width="22" height="22" rx="5" fill="#2e2d37"/><path d="M6 9h11l-3-3M18 15H7l3 3" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    financia: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="1" y="1" width="22" height="22" rx="5" fill="#2e2d37"/><rect x="5" y="8" width="14" height="9" rx="1.5" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M5 11h14" stroke="#fff" stroke-width="1.8"/></svg>',
  };
  const selos = [];
  if (!v.vendido && v.abaixoFipe) selos.push(["preco", "Super Preço", "Anúncio com preço <strong>abaixo da tabela FIPE.</strong><br>Aproveite e faça um ótimo negócio!"]);
  if (/revis/.test(tudo)) selos.push(["revisado", v.tipo === "moto" ? "Toda revisada" : "Todo revisado", "A loja informa que o veículo passou por revisão completa antes de ser anunciado."]);
  if (/pneus? nov/.test(tudo)) selos.push(["pneus", "Pneus novos", `${v.tipo === "moto" ? "Moto entregue" : "Veículo entregue"} com <strong>pneus novos</strong>.`]);
  if (/chave reserva/.test(tudo)) selos.push(["chave", "Manual e chave reserva", "Acompanha o <strong>manual do proprietário</strong> e a <strong>chave reserva</strong>."]);
  if (!v.vendido) {
    selos.push(["troca", "Aceita troca", "Seu usado entra como parte do pagamento. Mande os dados dele no WhatsApp e receba uma avaliação."]);
    selos.push(["financia", "Financiamento", "Financiamos em <strong>até 60x</strong> pelas financeiras ou dividimos em <strong>até 18x</strong> no cartão de crédito."]);
  }

  // Texto "Sobre o carro": usa v.descricao se existir; senão monta a partir da ficha (sem inventar nada)
  const MINUSC = new Set(["de", "da", "do", "das", "dos", "com", "e", "em", "a", "o"]);
  const SIGLAS = /^(srx|srv|sx|gls|ltz|ltd|lx|exl|ex|se|sel|gp|tsi|tfsi|msi|hpe|abs|ed|esd|cs|mi|xei|gli|t5|t8|v6|v8|4x4|4x2|ss|cvt|bmw|hb20|hr|cb|cbr|xre|ybr|xtz|gla|sw4|r)$/;
  const palavra = (orig, i) => {
    if (/[a-z]/.test(orig) && /\d/.test(orig)) return orig; // ex.: 320i, 28i
    const p = orig.toLowerCase();
    if (/\d/.test(p) || SIGLAS.test(p)) return p.toUpperCase();
    if (i > 0 && MINUSC.has(p)) return p;
    return p.charAt(0).toUpperCase() + p.slice(1);
  };
  // "MERCEDES-BENZ" -> "Mercedes-Benz", "R-DESIGN" -> "R-Design", "HR-V" fica "HR-V"
  const bonito = (t) => t.split(" ").map((p, i) => p.split("-").map((q, j) => palavra(q, i + j)).join("-")).join(" ");
  const lista2 = (arr) => (arr.length <= 1 ? arr.join("") : arr.slice(0, -1).join(", ") + " e " + arr[arr.length - 1]);
  const minusculo = (t) => t.replace(/^./, (c) => c.toLowerCase()).replace(/\b(Bluetooth|USB|ABS|GPS|LED)\b/gi, (m) => (m.toLowerCase() === "bluetooth" ? "Bluetooth" : m.toUpperCase()));
  function sobreOCarro() {
    if (v.descricao) return v.descricao;
    const titulo = `${bonito(v.marca)} ${bonito(v.modelo)} ${bonito(v.versao)}`.replace(/\s+—\s+/g, " — ").trim();
    const tipoTxt = v.tipo === "moto" ? "moto" : v.carroceria === "SUV" ? "SUV" : (v.carroceria || "veículo").toLowerCase();
    const partes = [];
    const tecnico = [v.cambio && `câmbio ${v.cambio.toLowerCase()}`, v.combustivel && `motor ${v.combustivel.toLowerCase()}`].filter(Boolean);
    partes.push(`${titulo}, ano ${v.ano}${v.km !== null ? `, com ${km(v)} km rodados` : ""}. ${tipoTxt.charAt(0).toUpperCase() + tipoTxt.slice(1)}${tecnico.length ? " com " + lista2(tecnico) : ""}.`);
    // medidas ("Altura: 2,10") e linhas longas não entram no texto corrido
    const destaques = v.opcionais.filter((o) => !/^(completo|completa)$/i.test(o) && !/:/.test(o) && o.length < 60).slice(0, 6).map(minusculo);
    if (destaques.length) partes.push(`Entre os itens estão ${lista2(destaques)}.`);
    // estado de conservação: "tem revisão completa e pneus novos, e acompanha manual e chave reserva"
    const tem = [], acompanha = [];
    let conservado = false;
    v.observacoes.forEach((o) => {
      const t = o.toLowerCase();
      if (/impec|conservad|bem cuidad/.test(t)) conservado = true;
      else if (/chave reserva/.test(t)) acompanha.push(/manual/.test(t) ? "manual e chave reserva" : "chave reserva");
      else if (/revis/.test(t)) tem.push("revisão completa");
      else if (/pneus? nov/.test(t)) tem.push("pneus novos");
      else tem.push(minusculo(o).replace(/[.!…]+$/, ""));
    });
    const fem = v.tipo === "moto";
    const sujeito = fem ? "A moto" : "O veículo";
    // "Muito bem conservado, o veículo tem..." (uma frase só em vez de duas começando igual)
    const quem = conservado ? `Muito bem conservad${fem ? "a" : "o"}, ${sujeito.toLowerCase()}` : sujeito;
    if (conservado && !tem.length && !acompanha.length) partes.push(`${sujeito} está muito bem conservad${fem ? "a" : "o"}.`);
    if (tem.length && acompanha.length) partes.push(`${quem} tem ${lista2(tem)}, e acompanha ${lista2(acompanha)}.`);
    else if (tem.length) partes.push(`${quem} tem ${lista2(tem)}.`);
    else if (acompanha.length) partes.push(`${quem} acompanha ${lista2(acompanha)}.`);
    partes.push(v.vendido
      ? "Este carro já foi vendido pela Universal Automóveis. Se você procura um parecido, fale com a gente no WhatsApp."
      : "Está à venda na Universal Automóveis, em Contagem/MG. Aceitamos seu usado na troca e financiamos em até 60x.");
    return partes.join(" ");
  }

  const fichaCard = $("#VehicleCharacteristic");
  if (fichaCard) {
    const htmlSelos = selos.length ? `
      <section class="diferenciais">
        <h4 class="diferenciais__titulo">Sobre os diferenciais do anúncio</h4>
        <ul class="diferenciais__lista">
          ${selos.map(([ic, t, d]) => `
            <li class="diferencial">
              <button type="button" class="diferencial__botao" aria-expanded="false">
                <span class="diferencial__icone">${ICONES[ic]}</span>
                <strong>${t}</strong>
                <svg class="diferencial__seta" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <div class="diferencial__balao" role="dialog" aria-label="${t}">
                <div class="diferencial__balao-topo">
                  <span class="diferencial__icone">${ICONES[ic]}</span>
                  <strong>${t}</strong>
                  <svg class="diferencial__seta diferencial__seta--cima" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
                <p>${d}</p>
              </div>
            </li>`).join("")}
        </ul>
      </section>` : "";
    fichaCard.insertAdjacentHTML("afterend", `${htmlSelos}
      <section class="sobre-carro">
        <h4 class="diferenciais__titulo">Sobre este carro</h4>
        <p>${esc(sobreOCarro())}</p>
      </section>`);

    // abre/fecha o balão; clicar fora ou apertar Esc fecha
    const fecharTodos = (exceto) => $$(".diferencial.aberto").forEach((li) => {
      if (li !== exceto) { li.classList.remove("aberto"); li.querySelector(".diferencial__botao").setAttribute("aria-expanded", "false"); }
    });
    $$(".diferencial").forEach((li) => {
      const abrirFechar = (e) => {
        e.stopPropagation();
        const abrir = !li.classList.contains("aberto");
        fecharTodos(li);
        li.classList.toggle("aberto", abrir);
        li.querySelector(".diferencial__botao").setAttribute("aria-expanded", String(abrir));
      };
      li.querySelector(".diferencial__botao").addEventListener("click", abrirFechar);
      li.querySelector(".diferencial__balao-topo").addEventListener("click", abrirFechar);
    });
    document.addEventListener("click", (e) => { if (!e.target.closest(".diferencial")) fecharTodos(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharTodos(); });
  }

  // ---------- Itens do veículo ----------
  const lista = $(".VehicleDetails__list--items");
  if (lista) {
    lista.innerHTML = [...v.opcionais, ...v.observacoes]
      .map((t) => `<li class="VehicleDetails__list__item"><h3 class="VehicleDetails__list__item__value">${esc(t)}</h3></li>`)
      .join("");
  }

  // ---------- Preço ----------
  const preco = $("#vehicleSendProposalPrice");
  if (preco) {
    preco.textContent = v.vendido ? "Vendido" : v.preco == null ? "Sob consulta" : reais(v.preco);
    if (!v.vendido && v.preco == null) preco.classList.add("preco-consulta");
  }
  // aviso de vendido acima do título
  const topoTitulo = document.querySelector(".VehicleDetails__header__top");
  if (v.vendido && topoTitulo) topoTitulo.insertAdjacentHTML("beforebegin", '<p class="aviso-vendido">Este veículo já foi vendido. Ele está aqui como parte do histórico da loja. Fale com a gente para encontrar um parecido.</p>');
  if (v.vendido) {
    const galeriaTopo = document.querySelector(".DetailCarousel");
    if (galeriaTopo) galeriaTopo.insertAdjacentHTML("afterbegin", '<span class="faixa-vendido faixa-vendido--galeria">Vendido</span>');
  }
  const anunciado = $(".VehicleDetailsFipe__price--announced .VehicleDetailsFipe__price__value");
  if (anunciado) anunciado.textContent = reais(v.preco);
  // a comparação com a FIPE só aparece quando o valor FIPE do carro estiver no estoque (campo fipe)
  const fipe = $(".VehicleDetails--fipe");
  if (fipe) {
    if (v.fipe) {
      $(".VehicleDetailsFipe__price--fipe .VehicleDetailsFipe__price__value").textContent = reais(v.fipe);
      const ref = $(".VehicleDetailsFipe__price__value-average");
      if (ref) ref.innerHTML = `Valor deste carro<br> na Tabela Fipe${v.fipeMes ? `<br><small class="fipe-ref">Referência: ${esc(v.fipeMes)} · ${esc(v.fipeModelo || "")}</small>` : ""}`;
    }
    else fipe.style.display = "none";
  }

  // ---------- WhatsApp com o nome do carro ----------
  const texto = encodeURIComponent(v.vendido
    ? `Olá! Vi no site que o ${nome} ${v.ano} já foi vendido. Vocês têm algum parecido?`
    : `Olá! Tenho interesse no ${nome} ${v.versao} ${v.ano}${v.preco ? ` (${reais(v.preco)})` : ""} que vi no site.`);
  if (v.vendido) $$(".botao-whatsapp--grande").forEach((a) => (a.textContent = "Quero um parecido"));
  const aviso = $(".painel-preco__aviso");
  if (aviso && v.vendido) aviso.textContent = "Este já foi vendido, mas a gente procura um igual ou parecido para você.";
  $$(".botao-whatsapp").forEach((a) => (a.href = `https://wa.me/${WHATS}?text=${texto}`));

  // ================= Layout do celular (igual ao app/site móvel da Webmotors) =================
  const LIGAR = "tel:+553133953117"; // fixo da loja, do perfil do Instagram
  const linkWhats = (msg) => `https://wa.me/${WHATS}?text=${encodeURIComponent(msg)}`;
  const msgParcelas = `Olá! Quero simular as parcelas do ${nome} ${v.versao} ${v.ano}${v.preco ? ` (${reais(v.preco)})` : ""}.`;

  // Fotos: pontinhos de navegação e coração por cima da foto
  const carrossel = $(".DetailCarousel");
  if (carrossel && galeria) {
    const pontos = v.fotos <= 15
      ? `<div class="galeria-pontos" aria-hidden="true">${Array.from({ length: v.fotos }, (_, i) => `<span${i === 0 ? ' class="ativo"' : ""}></span>`).join("")}</div>`
      : `<div class="galeria-contador" aria-hidden="true"><span>1</span>/${v.fotos}</div>`;
    carrossel.insertAdjacentHTML("beforeend", `${pontos}
      <button type="button" class="galeria-favorito" aria-label="Favoritar ${esc(nome)}" aria-pressed="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
      </button>`);
    const atual = () => Math.round(galeria.scrollLeft / Math.max(1, galeria.clientWidth));
    galeria.addEventListener("scroll", () => {
      const i = atual();
      $$(".galeria-pontos span").forEach((s, n) => s.classList.toggle("ativo", n === i));
      const c = $(".galeria-contador span");
      if (c) c.textContent = i + 1;
    }, { passive: true });
    const fav = $(".galeria-favorito");
    fav.addEventListener("click", () => fav.setAttribute("aria-pressed", String(fav.getAttribute("aria-pressed") !== "true")));
  }

  // Card: preço grande + botão de parcelas logo abaixo do título (só aparece no celular)
  const topoCard = $(".VehicleDetails__header__top");
  if (topoCard) {
    const valor = v.vendido ? "Vendido" : v.preco == null ? "Sob consulta" : reais(v.preco);
    topoCard.insertAdjacentHTML("afterend", `<div class="preco-mobile${v.vendido ? " preco-mobile--vendido" : ""}">
      <strong class="preco-mobile__valor${v.preco == null && !v.vendido ? " preco-mobile__valor--consulta" : ""}">${valor}</strong>
      ${v.vendido ? "" : `<a class="preco-mobile__parcelas" href="${linkWhats(msgParcelas)}" target="_blank" rel="noopener">Ver Parcelas
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 10h18M7 15h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></a>`}
    </div>`);
  }

  // Itens: no celular mostra os 6 primeiros e a seta abre o resto
  const cardItens = lista && lista.closest(".VehicleDetails");
  if (cardItens && lista.children.length > 6) {
    cardItens.classList.add("itens-recolhidos");
    const cab = cardItens.querySelector(".VehicleDetails__container__header") || cardItens.querySelector(".VehicleDetails__container");
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "itens-abrir";
    botao.setAttribute("aria-label", "Ver todos os itens");
    botao.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    botao.addEventListener("click", () => cardItens.classList.toggle("itens-recolhidos"));
    if (cab) cab.prepend(botao);
  }

  // Ficha técnica em sanfona, montada com o que se sabe do carro (grupo vazio não aparece)
  if (cardItens) {
    const todos = [...v.opcionais, ...v.observacoes];
    const grupo = (re) => todos.filter((t) => re.test(t.toLowerCase()));
    const motor = (v.versao.match(/\d[.,]\d/) || [""])[0];
    const g = [
      ["motor", "Motor / Desempenho / Consumo", [
        motor && `Motor ${motor.replace(",", ".")}${/turbo|tsi|tfsi|\btb\b/i.test(v.versao) ? " turbo" : ""}`,
        v.combustivel && `Combustível: ${v.combustivel}`,
        v.cambio && `Câmbio ${v.cambio.toLowerCase()}`,
        /4x4|awd|4wd|quattro|xdrive/i.test(v.versao + " " + todos.join(" ")) && "Tração 4x4",
        v.km !== null && `${km(v)} km rodados`,
        ...grupo(/v6|v8|cv\b|torque|hybrid|híbrid|paddle|peddle|borboleta/),
      ].filter(Boolean)],
      ["dimensoes", "Dimensões e Capacidades", [
        v.carroceria && `Carroceria: ${v.carroceria}`,
        ...grupo(/baú|bau|altura|largura|comprimento|lugares|porta-?mala|caçamba|carga|capacidade|refriger|temperatura|cortineira|tomada externa/),
      ].filter(Boolean)],
      ["seguranca", "Segurança", grupo(/abs|airbag|air bag|freio|sensor|câmera|camera|alarme|estabilidade|controle de tra|isofix|xen[oô]nio|led|farol|faróis|ponto cego|pressão|blind|engate|amortecedor/)],
      ["tecnologia", "Tecnologia / Conectividade", grupo(/multim[ií]dia|bluetooth|usb|gps|painel digital|computador|chave (inteligente|presencial)|start|carregador|espelhamento|tela|\bsom\b|android|carplay|suporte de celular|piloto autom/)],
      ["assentos", "Assentos", grupo(/banco|couro|assento|lugares|interior/)],
      ["conforto", "Conforto", grupo(/ar[- ]condicionado|ar quente|direção|vidros|travas|retrovisor|teto|volante|porta-?mala elétric|partida/)],
    ].filter(([, , itens]) => itens.length);
    const ICON_FICHA = {
      motor: '<path d="M4 17a8 8 0 1 1 16 0z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 17l3.5-4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
      dimensoes: '<path d="M3 6v12M21 6v12M6 12h12M8.5 9.5L6 12l2.5 2.5M15.5 9.5L18 12l-2.5 2.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
      seguranca: '<path d="M12 3l7 3v5c0 4.6-3 8.4-7 10-4-1.6-7-5.4-7-10V6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
      tecnologia: '<rect x="7" y="3" width="10" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M11.5 17.5h1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
      assentos: '<circle cx="8" cy="4.5" r="1.8" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 9v6a2 2 0 0 0 2 2h5l2 3M8 13h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
      conforto: '<path d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    };
    if (g.length) {
      cardItens.insertAdjacentHTML("afterend", `<section class="VehicleDetails ficha-tecnica">
        <h2 class="ficha-tecnica__titulo">Ficha Técnica</h2>
        ${g.map(([id, titulo, itens]) => `<details class="ficha-tecnica__grupo">
          <summary><svg class="ficha-tecnica__icone" viewBox="0 0 24 24" aria-hidden="true">${ICON_FICHA[id]}</svg><span>${titulo}</span>
            <svg class="ficha-tecnica__seta" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></summary>
          <ul>${itens.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        </details>`).join("")}
      </section>`);
    }
  }

  // Barra fixa do celular: Ver parcelas | ligar | Enviar mensagem
  document.body.insertAdjacentHTML("beforeend", `<nav class="barra-acoes" aria-label="Falar com a loja">
    ${v.vendido
      ? `<a class="barra-acoes__secundario" href="../catalogo/">Ver estoque</a>`
      : `<a class="barra-acoes__secundario" href="${linkWhats(msgParcelas)}" target="_blank" rel="noopener">Ver parcelas</a>`}
    <a class="barra-acoes__ligar" href="${LIGAR}" aria-label="Ligar para a loja: (31) 3395-3117">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.5l2.6 4-1.8 1.9a12 12 0 0 0 7.2 7.2l1.9-1.8 4 2.6-1.1 3.1c-.3.8-1.1 1.3-2 1.2C9.6 20.9 3.1 14.4 2.3 6.6c-.1-.9.4-1.7 1.2-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
    </a>
    <a class="barra-acoes__principal" href="https://wa.me/${WHATS}?text=${texto}" target="_blank" rel="noopener">${v.vendido ? "Quero um parecido" : "Enviar mensagem"}</a>
  </nav>`);

  // ---------- Mais carros no nosso estoque ----------
  const trilho = $(".RecommendedVehicles .slick-track");
  if (trilho) {
    // até 12 sugestões à venda: primeiro do mesmo tipo (carro/moto), depois os mais próximos no preço
    const perto = (c) => Math.abs((c.preco || 0) - (v.preco || 0));
    const outros = estoque
      .filter((c) => c.slug !== v.slug && !c.vendido)
      .sort((a, b) => (a.tipo !== v.tipo) - (b.tipo !== v.tipo) || (v.preco ? perto(a) - perto(b) : 0))
      .slice(0, 12);
    trilho.style.width = "auto";
    trilho.innerHTML = outros
      .map((c) => `<div class="slick-slide" style="width:254px">
        <div><div class="slick-padding">
          <a href="./?carro=${c.slug}" class="sc-jhAzac hwDIQl">
            <img src="${FOTOS}${c.foto}" alt="${esc(c.marca + " " + c.modelo)} ${c.ano}" class="sc-fBuWsC fZHYvh" loading="lazy">
            <div class="sc-cHGsZl bkaoLk">
              <div class="sc-eqIVtm cJiAfR">
                <h2 class="sc-fMiknA bwYKmi">${esc(c.marca + " " + c.modelo)}</h2>
                <h3 class="sc-dVhcbM gklesL">${esc(c.versao)}</h3>
              </div>
              <strong class="sc-fAjcbJ grmojk price">${reais(c.preco)}</strong>
              <div class="sc-caSCKo iFbWta">
                <div class="sc-gisBJw gUPayE">${c.ano}</div>
                <div class="sc-gisBJw gUPayE">${c.km === null ? "" : km(c) + " Km"}</div>
              </div>
            </div>
            <div class="sc-kjoXOD dixXeQ"><img src="./arquivos/icon-location.svg" class="sc-TOsTZ kQjUic" alt=""><span>${CIDADE}</span></div>
          </a>
        </div></div>
      </div>`)
      .join("");
  }
})();
