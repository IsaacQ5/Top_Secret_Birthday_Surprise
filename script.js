const heroCard = document.querySelector(".hero-card");
const flameWrap = document.getElementById("flame-wrap");
const meterFill = document.getElementById("meter-fill");
const statusText = document.getElementById("status-text");
const celebrateButton = document.getElementById("celebrate-button");
const confettiLayer = document.getElementById("confetti-layer");

const flameTarget = {
  charge: 0,
  extinguished: false,
  lastX: null,
  lastY: null,
  lastMoveTime: 0,
  streak: 0,
};

const confettiPalette = [
  "#ff6f91",
  "#ffd166",
  "#7bdff2",
  "#b8f2a1",
  "#cdb4ff",
  "#ff9f68",
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateMeter() {
  meterFill.style.width = `${clamp(flameTarget.charge, 0, 100)}%`;
}

function extinguishFlame() {
  if (flameTarget.extinguished) {
    return;
  }

  flameTarget.extinguished = true;
  flameTarget.charge = 100;
  updateMeter();

  heroCard.classList.add("is-extinguished");
  statusText.textContent = "You blew out the candle! Now tap the secret surprise button...";

  window.setTimeout(() => {
    heroCard.classList.add("is-ready");
  }, 220);
}

function handleFlameBreeze(event) {
  if (flameTarget.extinguished) {
    return;
  }

  const flameBounds = flameWrap.getBoundingClientRect();
  const centerX = flameBounds.left + flameBounds.width / 2;
  const centerY = flameBounds.top + flameBounds.height / 2;
  const dx = event.clientX - centerX;
  const dy = event.clientY - centerY;
  const distance = Math.hypot(dx, dy);

  const now = performance.now();
  const dt = flameTarget.lastMoveTime ? Math.max(now - flameTarget.lastMoveTime, 16) : 16;
  const moveDistance = flameTarget.lastX === null
    ? 0
    : Math.hypot(event.clientX - flameTarget.lastX, event.clientY - flameTarget.lastY);
  const speed = moveDistance / dt;

  flameTarget.lastX = event.clientX;
  flameTarget.lastY = event.clientY;
  flameTarget.lastMoveTime = now;

  if (distance < 118) {
    const closeness = 1 - distance / 118;
    const fastEnough = speed > 0.22 && moveDistance > 8;

    if (fastEnough) {
      const streakBonus = clamp(flameTarget.streak / 18, 0, 1.4);
      const breezeStrength = ((speed - 0.22) * 2.8 + moveDistance * 0.018) * (0.45 + closeness) * (1 + streakBonus);
      flameTarget.streak = clamp(flameTarget.streak + 1.15, 0, 30);
      flameTarget.charge = clamp(flameTarget.charge + breezeStrength, 0, 100);
      statusText.textContent = "Blow the candle bruh.";
    } else {
      flameTarget.streak = clamp(flameTarget.streak - 1.8, 0, 30);
      flameTarget.charge = clamp(flameTarget.charge - 0.75, 0, 100);
    }
  } else {
    flameTarget.streak = clamp(flameTarget.streak - 2.4, 0, 30);
    flameTarget.charge = clamp(flameTarget.charge - 1.65, 0, 100);
  }

  updateMeter();

  if (flameTarget.charge >= 100) {
    extinguishFlame();
  }
}

function createConfettiPiece() {
  const piece = document.createElement("span");
  piece.className = "confetti-piece";
  piece.style.setProperty("--start-x", `${Math.random() * 100}vw`);
  piece.style.setProperty("--drift-x", `${(Math.random() * 28 - 14).toFixed(2)}vw`);
  piece.style.setProperty("--spin", `${Math.random() * 1080 - 540}deg`);
  piece.style.setProperty("--fall-duration", `${(Math.random() * 1.9 + 2.4).toFixed(2)}s`);
  piece.style.setProperty("--confetti-color", confettiPalette[Math.floor(Math.random() * confettiPalette.length)]);
  piece.style.transform = `rotate(${Math.random() * 360}deg)`;
  piece.style.width = `${(Math.random() * 0.45 + 0.5).toFixed(2)}rem`;
  piece.style.height = `${(Math.random() * 0.6 + 0.75).toFixed(2)}rem`;
  piece.addEventListener("animationend", () => piece.remove(), { once: true });
  confettiLayer.appendChild(piece);
}

function launchConfetti() {
  let bursts = 0;

  const intervalId = window.setInterval(() => {
    for (let i = 0; i < 14; i += 1) {
      createConfettiPiece();
    }

    bursts += 1;
    if (bursts >= 12) {
      window.clearInterval(intervalId);
    }
  }, 180);
}

window.addEventListener("pointermove", handleFlameBreeze);

celebrateButton.addEventListener("click", () => {
  heroCard.classList.add("is-celebrating");
  celebrateButton.textContent = "Happy Birthday, Arin!";
  celebrateButton.disabled = true;
  launchConfetti();
  statusText.textContent = "Super Amazing and Cool Birthday confetti incoming!";
});
