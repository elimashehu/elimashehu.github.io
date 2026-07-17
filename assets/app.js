/* =========================================================================
   Elima Shehu — interactions
   - geometric "point–line incidence" backdrops (nod to multiview geometry)
   - scroll reveals, sticky-nav state, dark-mode toggle
   ========================================================================= */
(function () {
  "use strict";
  const SVGNS = "http://www.w3.org/2000/svg";

  /* ---- Geometric backdrop: an arrangement of lines meeting at points ---- */
  function drawArrangement(svg, opts) {
    if (!svg) return;
    const vb = svg.viewBox.baseVal;
    const W = vb.width, H = vb.height;
    const o = Object.assign({ points: 6, connect: 0.45, lineOpacity: 0.14, base: 0.05, stroke: "var(--accent)", nodes: true }, opts);

    // scatter a few "world points"
    const pts = [];
    for (let i = 0; i < o.points; i++) {
      pts.push([
        W * (0.08 + 0.84 * Math.random()),
        H * (0.12 + 0.76 * Math.random())
      ]);
    }
    // connect points with straight lines (incidences) — a sparse arrangement
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        if (Math.random() > o.connect) continue;
        const [x1, y1] = pts[i], [x2, y2] = pts[j];
        // extend the segment to a full line across the frame
        const dx = x2 - x1, dy = y2 - y1;
        const t = 1.8;
        const ln = document.createElementNS(SVGNS, "line");
        ln.setAttribute("x1", x1 - dx * t); ln.setAttribute("y1", y1 - dy * t);
        ln.setAttribute("x2", x2 + dx * t); ln.setAttribute("y2", y2 + dy * t);
        ln.setAttribute("stroke", o.stroke);
        ln.setAttribute("stroke-width", 0.9);
        ln.setAttribute("opacity", (o.base + Math.random() * o.lineOpacity).toFixed(2));
        svg.appendChild(ln);
      }
    }
    if (o.nodes) {
      pts.forEach(([x, y]) => {
        const c = document.createElementNS(SVGNS, "circle");
        c.setAttribute("cx", x); c.setAttribute("cy", y);
        c.setAttribute("r", 2.8 + Math.random() * 1.8);
        c.setAttribute("fill", o.stroke);
        c.setAttribute("opacity", "0.4");
        svg.appendChild(c);
        const ring = document.createElementNS(SVGNS, "circle");
        ring.setAttribute("cx", x); ring.setAttribute("cy", y);
        ring.setAttribute("r", 8 + Math.random() * 5);
        ring.setAttribute("fill", "none");
        ring.setAttribute("stroke", o.stroke);
        ring.setAttribute("stroke-width", "0.9");
        ring.setAttribute("opacity", "0.16");
        svg.appendChild(ring);
      });
    }
  }

  drawArrangement(document.getElementById("heroBg"), { points: 5, connect: 0.35, lineOpacity: 0.08, base: 0.03 });
  drawArrangement(document.getElementById("contactBg"), {
    points: 7, connect: 0.5, lineOpacity: 0.3, base: 0.06, stroke: "rgba(255,255,255,0.9)"
  });

  /* ---- Scroll reveal (in-view elements show immediately; rest on scroll) ---- */
  const reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (!("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });
    reveals.forEach((el, i) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
        el.classList.add("in"); // already on screen at load — no hidden flash
      } else {
        el.style.transitionDelay = (Math.min(i, 3) * 50) + "ms";
        io.observe(el);
      }
    });
    // safety net: never leave anything hidden
    window.addEventListener("load", function () {
      setTimeout(function () {
        reveals.forEach(function (el) {
          if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("in");
        });
      }, 400);
    });
  }

  /* ---- Sticky nav shadow ---- */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Theme toggle (persisted, honours system default) ---- */
  const root = document.documentElement;
  const stored = localStorage.getItem("es-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.setAttribute("data-theme", stored || (prefersDark ? "dark" : "light"));
  document.getElementById("themeToggle").addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("es-theme", next);
  });

  /* ---- Year ---- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
