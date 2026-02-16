const samples = [
  {
    id: "agua",
    emoji: "💧",
    name: "Agua",
    subtitle: "Gota limpia",
    description: "Pequeñas burbujas y ondas brillantes como un mini océano.",
    fact: "En gotas de agua pueden vivir microorganismos muy pequeños.",
    hotspot: "¡Mira! Ese brillo se produce por cómo la luz atraviesa la gota.",
    texture:
      "radial-gradient(circle at 28% 32%, rgba(255,255,255,0.85), transparent 24%), radial-gradient(circle at 70% 58%, rgba(255,255,255,0.5), transparent 18%), repeating-radial-gradient(circle, #98dcff 0 10px, #6ec6f1 10px 20px, #4eaed8 20px 30px)",
  },
  {
    id: "fresa",
    emoji: "🍓",
    name: "Fresa",
    subtitle: "Fruta roja",
    description: "Montes rojitos con semillas amarillas en relieve.",
    fact: "Las semillas de la fresa están por fuera de la fruta.",
    hotspot: "Las bolitas amarillas son semillas; cada una puede crecer en una planta.",
    texture:
      "radial-gradient(circle at 22% 32%, #ffe088 0 10px, transparent 12px), radial-gradient(circle at 65% 55%, #ffe088 0 9px, transparent 11px), radial-gradient(circle at 75% 25%, #ffe088 0 8px, transparent 10px), repeating-radial-gradient(circle, #ff6784 0 10px, #ff4f73 10px 19px, #d63459 19px 30px)",
  },
  {
    id: "tierra",
    emoji: "🌱",
    name: "Tierra",
    subtitle: "Suelo fértil",
    description: "Granitos, minerales y pequeñas fibras orgánicas.",
    fact: "La tierra guarda minerales que ayudan a crecer a las plantas.",
    hotspot: "Ese tono diferente indica que hay piedras y restos de hojas mezclados.",
    texture:
      "radial-gradient(circle at 30% 25%, #9b7b53 0 12px, transparent 13px), radial-gradient(circle at 60% 45%, #7a5d3f 0 10px, transparent 12px), radial-gradient(circle at 75% 70%, #5f472f 0 13px, transparent 15px), repeating-radial-gradient(circle, #cca77f 0 12px, #b68e63 12px 23px, #9f784f 23px 35px)",
  },
  {
    id: "hoja",
    emoji: "🍃",
    name: "Hoja",
    subtitle: "Verde viva",
    description: "Canales verdes por donde viajan agua y nutrientes.",
    fact: "Las venitas de la hoja son como carreteras internas.",
    hotspot: "Las líneas claras son venas que transportan agua dentro de la hoja.",
    texture:
      "linear-gradient(20deg, rgba(255,255,255,0.35) 2px, transparent 2px) 0 0 / 36px 36px, linear-gradient(160deg, rgba(255,255,255,0.24) 2px, transparent 2px) 0 0 / 42px 42px, repeating-linear-gradient(45deg, #6fd46a 0 12px, #52be55 12px 23px, #38a849 23px 35px)",
  },
  {
    id: "pan",
    emoji: "🍞",
    name: "Pan",
    subtitle: "Miga",
    description: "Cavidades esponjosas de aire atrapado.",
    fact: "La levadura crea gas y por eso aparecen agujeritos en el pan.",
    hotspot: "Ese huequito se formó por burbujas de gas durante el horneado.",
    texture:
      "radial-gradient(circle at 15% 20%, #f9dfb2 0 16px, transparent 17px), radial-gradient(circle at 55% 65%, #f4d29b 0 14px, transparent 15px), radial-gradient(circle at 78% 40%, #f2c98c 0 12px, transparent 14px), repeating-radial-gradient(circle, #ffddb0 0 14px, #efc88d 14px 28px, #d8ad72 28px 42px)",
  },
];

const elements = {
  samples: document.getElementById("samples"),
  microscopeView: document.getElementById("microscopeView"),
  factText: document.getElementById("factText"),
  slide: document.getElementById("slide"),
  slideLabel: document.getElementById("slideLabel"),
  zoomControl: document.getElementById("zoomControl"),
  lightControl: document.getElementById("lightControl"),
  focusControl: document.getElementById("focusControl"),
  zoomValue: document.getElementById("zoomValue"),
  lightValue: document.getElementById("lightValue"),
  focusValue: document.getElementById("focusValue"),
  randomBtn: document.getElementById("randomBtn"),
  turret: document.getElementById("turret"),
  hotspotBtn: document.getElementById("hotspotBtn"),
  hotspotInfo: document.getElementById("hotspotInfo"),
};

let activeSample = samples[0];
let offsetX = 0;
let offsetY = 0;
let dragState = null;

function renderSampleButtons() {
  elements.samples.innerHTML = "";

  samples.forEach((sample) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "sample-btn";
    button.dataset.id = sample.id;
    button.innerHTML = `${sample.emoji} ${sample.name}<span>${sample.subtitle}</span>`;
    button.addEventListener("click", () => {
      activeSample = sample;
      playSlideInsertion();
      refreshView();
    });

    elements.samples.appendChild(button);
  });
}

function updateTurret(zoom) {
  const angle = (zoom - 1) * 3;
  elements.turret.style.transform = `rotate(${angle}deg)`;

  const objectives = document.querySelectorAll(".objective");
  objectives.forEach((obj) => obj.classList.remove("active"));

  if (zoom <= 3) {
    document.querySelector(".objective-left")?.classList.add("active");
  } else if (zoom <= 7) {
    document.querySelector(".objective-center")?.classList.add("active");
  } else {
    document.querySelector(".objective-right")?.classList.add("active");
  }
}

function playSlideInsertion() {
  elements.slide.classList.remove("insertion");
  void elements.slide.offsetWidth;
  elements.slide.classList.add("insertion");
  elements.slideLabel.textContent = activeSample.name;
}

function refreshView() {
  document.querySelectorAll(".sample-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.id === activeSample.id);
  });

  const zoom = Number(elements.zoomControl.value);
  const light = Number(elements.lightControl.value);
  const focus = Number(elements.focusControl.value);

  const scale = 1 + zoom * 0.2;
  const blur = ((100 - focus) / 55).toFixed(2);

  elements.microscopeView.style.background = activeSample.texture;
  elements.microscopeView.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
  elements.microscopeView.style.filter = `brightness(${light / 100}) blur(${blur}px)`;

  const knobRotation = (focus - 35) * 4;
  document.querySelectorAll(".focus-knob").forEach((knob) => {
    knob.style.transform = `rotate(${knobRotation}deg)`;
  });

  elements.zoomValue.textContent = `${zoom}x`;
  elements.lightValue.textContent = `${light}%`;
  elements.focusValue.textContent = `${focus}%`;
  elements.factText.textContent = activeSample.fact;

  updateTurret(zoom);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setupDragPan() {
  elements.microscopeView.addEventListener("pointerdown", (event) => {
    dragState = {
      startX: event.clientX,
      startY: event.clientY,
      baseX: offsetX,
      baseY: offsetY,
    };

    elements.microscopeView.classList.add("dragging");
    elements.microscopeView.setPointerCapture(event.pointerId);
  });

  elements.microscopeView.addEventListener("pointermove", (event) => {
    if (!dragState) return;

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    offsetX = clamp(dragState.baseX + deltaX * 0.7, -55, 55);
    offsetY = clamp(dragState.baseY + deltaY * 0.7, -55, 55);
    refreshView();
  });

  elements.microscopeView.addEventListener("pointerup", () => {
    dragState = null;
    elements.microscopeView.classList.remove("dragging");
  });
}

function setupHotspot() {
  elements.hotspotBtn.addEventListener("click", () => {
    elements.hotspotInfo.textContent = activeSample.hotspot;
    elements.hotspotInfo.classList.add("show");

    window.clearTimeout(setupHotspot.timer);
    setupHotspot.timer = window.setTimeout(() => {
      elements.hotspotInfo.classList.remove("show");
    }, 3200);
  });
}

["input", "change"].forEach((eventName) => {
  elements.zoomControl.addEventListener(eventName, refreshView);
  elements.lightControl.addEventListener(eventName, refreshView);
  elements.focusControl.addEventListener(eventName, refreshView);
});

elements.randomBtn.addEventListener("click", () => {
  activeSample = samples[Math.floor(Math.random() * samples.length)];
  elements.zoomControl.value = String(Math.floor(Math.random() * 10) + 1);
  elements.lightControl.value = String(Math.floor(Math.random() * 71) + 30);
  elements.focusControl.value = String(Math.floor(Math.random() * 66) + 35);
  offsetX = Math.floor(Math.random() * 80) - 40;
  offsetY = Math.floor(Math.random() * 80) - 40;

  playSlideInsertion();
  refreshView();
});

renderSampleButtons();
setupDragPan();
setupHotspot();
playSlideInsertion();
refreshView();
