/* ==========================================================
   Semáforo de transparencia · UEB
   ========================================================== */
(() => {
  "use strict";
  if (window.__semaforoListo) return; // evita ejecutarse dos veces
  window.__semaforoListo = true;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ---------- Logo: oficial (web) -> assets/logo-ueb.png -> SVG provisional ---------- */
  const logo = $("#logo");
  if (logo) {
    const respaldo = ["assets/logo-ueb.png", "assets/logo.svg"];
    logo.addEventListener("error", function alFallar() {
      const siguiente = respaldo.shift();
      if (siguiente) logo.src = siguiente;
      else logo.removeEventListener("error", alFallar);
    });
  }

  /* ---------- Barra de progreso de scroll ---------- */
  const progress = $("#progress");
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Aparición de elementos al hacer scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- Navegación: resalta la sección visible ---------- */
  const links = $$(".nav a");
  const secciones = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  secciones.forEach((s) => navIO.observe(s));

  /* ---------- Spotlight que sigue el cursor en las tarjetas ---------- */
  $$(".spot").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  /* ---------- Semáforo ---------- */
  const criterios = $$(".criterio");
  const lamparaGeneral = $("#tlResultado");
  const veredicto = $("#veredicto");
  const nums = { verde: $("#nVerde"), amarillo: $("#nAmarillo"), rojo: $("#nRojo") };
  const puntos = { verde: 2, amarillo: 1, rojo: 0 };
  const textoCriterio = {
    "": "Selecciona un color",
    verde: "Fácil de encontrar",
    amarillo: "Con esfuerzo",
    rojo: "Difícil o no está",
  };
  const textoGeneral = {
    "": "Pendiente",
    verde: "Transparente",
    amarillo: "Mejorable",
    rojo: "Poco transparente",
  };

  function actualizarResultado() {
    const conteo = { verde: 0, amarillo: 0, rojo: 0 };
    criterios.forEach((c) => { if (c.dataset.estado) conteo[c.dataset.estado]++; });
    Object.entries(nums).forEach(([k, el]) => { el.textContent = conteo[k]; });

    const total = conteo.verde + conteo.amarillo + conteo.rojo;
    let estado = "";
    if (total > 0) {
      const promedio = (conteo.verde * puntos.verde + conteo.amarillo * puntos.amarillo) / total;
      estado = promedio >= 1.5 ? "verde" : promedio >= 0.75 ? "amarillo" : "rojo";
    }
    lamparaGeneral.dataset.estado = estado;
    veredicto.dataset.estado = estado;
    veredicto.textContent = total > 0 && total < criterios.length
      ? `${textoGeneral[estado]} (${total}/${criterios.length})`
      : textoGeneral[estado];
  }

  function marcar(criterio, color) {
    const nuevo = puntos[color] === undefined ? "" : color;
    criterio.dataset.estado = nuevo;
    const picker = $(".tl--pick", criterio);
    picker.dataset.estado = nuevo;
    $$("button", picker).forEach((b) => b.setAttribute("aria-checked", b.dataset.color === nuevo));
    $(".estado-txt", criterio).textContent = textoCriterio[nuevo];
  }

  criterios.forEach((c) => {
    // Estado inicial: el que pongas en data-estado dentro del HTML
    marcar(c, c.dataset.estado);
    $$(".tl--pick button", c).forEach((b) => {
      b.addEventListener("click", () => {
        // Segundo clic sobre el mismo color = quitar selección
        marcar(c, c.dataset.estado === b.dataset.color ? "" : b.dataset.color);
        actualizarResultado();
      });
    });
  });
  actualizarResultado();
})();
