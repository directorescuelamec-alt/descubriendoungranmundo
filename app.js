const SAMPLE_CONFIG = [
  {
    id: "water",
    label: "💧 Agua",
    fact: "Se observan micro-burbujas y partículas suspendidas en movimiento browniano.",
    focalPlane: 48,
    background: "#8fcdf0",
    particles: { count: 180, minR: 1.5, maxR: 8, palette: ["#dff7ff", "#9ed5ef", "#68b8e4"] },
    drift: 0.9,
  },
  {
    id: "strawberry",
    label: "🍓 Fresa",
    fact: "A mayor aumento se distinguen estructuras granulares y poros de la superficie.",
    focalPlane: 56,
    background: "#d0425f",
    particles: { count: 220, minR: 2, maxR: 10, palette: ["#ffb657", "#fef3c7", "#b91c1c"] },
    drift: 0.15,
  },
  {
    id: "soil",
    label: "🌱 Tierra",
    fact: "Se identifican granos irregulares de distinto tamaño con alto contraste de borde.",
    focalPlane: 42,
    background: "#9a704a",
    particles: { count: 260, minR: 1.5, maxR: 12, palette: ["#dbba8f", "#7f5539", "#4e342e"] },
    drift: 0.25,
  },
  {
    id: "leaf",
    label: "🍃 Hoja",
    fact: "Las nervaduras se comportan como líneas de conducción de agua y nutrientes.",
    focalPlane: 62,
    background: "#4e9e47",
    particles: { count: 140, minR: 2, maxR: 7, palette: ["#a4df8a", "#5ab85a", "#2f6e35"] },
    drift: 0.08,
    veins: true,
  },
  {
    id: "bread",
    label: "🍞 Pan",
    fact: "La miga muestra cavidades por gas liberado durante la fermentación y cocción.",
    focalPlane: 52,
    background: "#d6b78b",
    particles: { count: 170, minR: 6, maxR: 20, palette: ["#f1d8a9", "#c89d66", "#a8743f"] },
    drift: 0.02,
  },
];

const objectiveSpec = {
  4: { zoom: 1.1, dof: 28, detail: 0.65 },
  10: { zoom: 1.8, dof: 16, detail: 0.85 },
  40: { zoom: 3.1, dof: 7, detail: 1.1 },
  100: { zoom: 4.2, dof: 3.8, detail: 1.3 },
};

const els = {
  canvas: document.getElementById("microCanvas"),
  viewer: document.getElementById("viewer"),
  focusState: document.getElementById("focusState"),
  samples: document.getElementById("samples"),
  objectiveButtons: document.getElementById("objectiveButtons"),
  coarse: document.getElementById("coarseFocus"),
  fine: document.getElementById("fineFocus"),
  light: document.getElementById("lightControl"),
  iris: document.getElementById("irisControl"),
  stageX: document.getElementById("stageX"),
  stageY: document.getElementById("stageY"),
  coarseVal: document.getElementById("coarseVal"),
  fineVal: document.getElementById("fineVal"),
  lightVal: document.getElementById("lightVal"),
  irisVal: document.getElementById("irisVal"),
  xVal: document.getElementById("xVal"),
  yVal: document.getElementById("yVal"),
  fact: document.getElementById("factText"),
};

const ctx = els.canvas.getContext("2d");
let activeSample = SAMPLE_CONFIG[0];
let objective = 10;
let stageOffset = { x: 0, y: 0 };
let drag = null;
let t = 0;

function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function buildTexture(sample) {
  const rnd = seededRandom(sample.id.length * 1337);
  const particles = [];
  for (let i = 0; i < sample.particles.count; i += 1) {
    particles.push({
      x: rnd() * 2000 - 1000,
      y: rnd() * 2000 - 1000,
      r: sample.particles.minR + rnd() * (sample.particles.maxR - sample.particles.minR),
      depth: rnd() * 100,
      tone: sample.particles.palette[Math.floor(rnd() * sample.particles.palette.length)],
      jitter: rnd() * Math.PI * 2,
    });
  }

  return particles;
}

const sampleTextureMap = new Map(SAMPLE_CONFIG.map((s) => [s.id, buildTexture(s)]));

function focusQuality() {
  const focusPos = Number(els.coarse.value) + Number(els.fine.value) / 2;
  const diff = Math.abs(focusPos - activeSample.focalPlane);
  const dof = objectiveSpec[objective].dof;
  return Math.max(0, 1 - diff / dof);
}

function describeFocus(q) {
  if (q > 0.82) return "Enfoque óptimo: imagen nítida.";
  if (q > 0.45) return "Enfoque parcial: mejora con enfoque fino.";
  return "Fuera de foco: ajusta enfoque grueso y fino.";
}

function drawVeins(scale, driftX, driftY) {
  ctx.save();
  ctx.translate(driftX, driftY);
  ctx.scale(scale, scale);
  ctx.strokeStyle = "rgba(210, 255, 210, 0.30)";
  ctx.lineWidth = 5;
  for (let i = -4; i <= 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-1100, i * 110 + Math.sin(t * 0.01 + i) * 35);
    ctx.quadraticCurveTo(-100, i * 120, 1100, i * 80 + Math.cos(t * 0.015 + i) * 40);
    ctx.stroke();
  }
  ctx.restore();
}

function render() {
  t += 1;
  const W = els.canvas.width;
  const H = els.canvas.height;
  const centerX = W / 2;
  const centerY = H / 2;

  const light = Number(els.light.value) / 100;
  const iris = Number(els.iris.value) / 100;
  const quality = focusQuality();
  const blur = (1 - quality) * (objective / 8);
  const spec = objectiveSpec[objective];

  ctx.clearRect(0, 0, W, H);

  ctx.save();
  ctx.translate(centerX, centerY);

  const vignette = ctx.createRadialGradient(0, 0, H * 0.12, 0, 0, H * 0.56);
  vignette.addColorStop(0, `rgba(255,255,255,${0.14 + light * 0.35})`);
  vignette.addColorStop(1, "rgba(10, 18, 30, 0.92)");

  const bg = activeSample.background;
  ctx.fillStyle = bg;
  ctx.fillRect(-W, -H, W * 2, H * 2);

  if (activeSample.veins) {
    drawVeins(spec.zoom, stageOffset.x * 0.8, stageOffset.y * 0.8);
  }

  const particles = sampleTextureMap.get(activeSample.id) || [];
  for (const p of particles) {
    const zRatio = 1 + (p.depth / 100) * 0.55 * spec.detail;
    const px = (p.x + stageOffset.x * 4 + Math.sin(t * 0.01 + p.jitter) * activeSample.drift * 7) * spec.zoom * zRatio;
    const py = (p.y + stageOffset.y * 4 + Math.cos(t * 0.01 + p.jitter) * activeSample.drift * 7) * spec.zoom * zRatio;

    if (Math.abs(px) > W || Math.abs(py) > H) continue;

    const depthDefocus = Math.abs((Number(els.coarse.value) + Number(els.fine.value) / 2) - p.depth) / objectiveSpec[objective].dof;
    const alpha = Math.max(0.05, (1 - depthDefocus * 0.6) * iris);
    const r = p.r * spec.zoom * (1 + (1 - quality) * 0.12);

    ctx.beginPath();
    ctx.fillStyle = p.tone;
    ctx.globalAlpha = alpha;
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // optical blur approximation by repeated translucent overlay
  if (blur > 0.2) {
    ctx.globalAlpha = Math.min(0.36, blur * 0.12);
    for (let i = 0; i < Math.ceil(blur * 2); i += 1) {
      ctx.drawImage(els.canvas, -1 - i * 0.15, -1 + i * 0.15, W, H, -W / 2, -H / 2, W, H);
    }
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = vignette;
  ctx.fillRect(-W / 2, -H / 2, W, H);

  const irisMask = ctx.createRadialGradient(0, 0, H * 0.35 * iris, 0, 0, H * 0.55);
  irisMask.addColorStop(0, "rgba(255,255,255,0)");
  irisMask.addColorStop(1, `rgba(0,0,0,${0.55 - iris * 0.35})`);
  ctx.fillStyle = irisMask;
  ctx.fillRect(-W / 2, -H / 2, W, H);

  ctx.restore();

  els.focusState.textContent = `${describeFocus(quality)} Objetivo ${objective}x.`;
  requestAnimationFrame(render);
}

function refreshLabels() {
  els.coarseVal.textContent = els.coarse.value;
  els.fineVal.textContent = els.fine.value;
  els.lightVal.textContent = `${els.light.value}%`;
  els.irisVal.textContent = `${els.iris.value}%`;
  els.xVal.textContent = els.stageX.value;
  els.yVal.textContent = els.stageY.value;
}

function setSample(sample) {
  activeSample = sample;
  els.fact.textContent = sample.fact;
  document.querySelectorAll("#samples button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.id === sample.id);
  });
}

function initSamples() {
  SAMPLE_CONFIG.forEach((sample, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.id = sample.id;
    btn.textContent = sample.label;
    if (index === 0) btn.classList.add("active");
    btn.addEventListener("click", () => setSample(sample));
    els.samples.appendChild(btn);
  });
  setSample(SAMPLE_CONFIG[0]);
}

function initObjectives() {
  els.objectiveButtons.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      objective = Number(btn.dataset.objective);
      els.objectiveButtons.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

function initStageControl() {
  const syncStage = () => {
    stageOffset.x = Number(els.stageX.value);
    stageOffset.y = Number(els.stageY.value);
    refreshLabels();
  };

  [els.coarse, els.fine, els.light, els.iris, els.stageX, els.stageY].forEach((input) => {
    input.addEventListener("input", syncStage);
    input.addEventListener("change", syncStage);
  });

  els.canvas.addEventListener("pointerdown", (e) => {
    drag = { x: e.clientX, y: e.clientY, sx: stageOffset.x, sy: stageOffset.y };
    els.canvas.classList.add("dragging");
    els.canvas.setPointerCapture(e.pointerId);
  });

  els.canvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = (e.clientX - drag.x) * 0.35;
    const dy = (e.clientY - drag.y) * 0.35;
    stageOffset.x = Math.max(-100, Math.min(100, drag.sx - dx));
    stageOffset.y = Math.max(-100, Math.min(100, drag.sy - dy));
    els.stageX.value = String(Math.round(stageOffset.x));
    els.stageY.value = String(Math.round(stageOffset.y));
    refreshLabels();
  });

  const endDrag = () => {
    drag = null;
    els.canvas.classList.remove("dragging");
  };

  els.canvas.addEventListener("pointerup", endDrag);
  els.canvas.addEventListener("pointercancel", endDrag);

  syncStage();
}

initSamples();
initObjectives();
initStageControl();
refreshLabels();
render();
