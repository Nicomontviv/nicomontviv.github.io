// ============================================================
// NAV MÓVIL
// ============================================================
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ============================================================
// ACORDEÓN FAQ
// ============================================================
document.querySelectorAll('.accordion__trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const panel = trigger.nextElementSibling;
    const isOpen = trigger.getAttribute('aria-expanded') === 'true';

    // cierra los demás
    document.querySelectorAll('.accordion__trigger').forEach(t => {
      t.setAttribute('aria-expanded', 'false');
      t.nextElementSibling.style.maxHeight = null;
    });

    if (!isOpen) {
      trigger.setAttribute('aria-expanded', 'true');
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
  });
});

// ============================================================
// RELOJ DEL PANEL DE SALIDAS
// ============================================================
const boardClock = document.getElementById('boardClock');

function updateClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  boardClock.textContent = `${hh}:${mm}`;
}
updateClock();
setInterval(updateClock, 1000 * 30);

// ============================================================
// DESTINO ANIMADO (flip board)
// ============================================================
const destinos = ['ESTADOS UNIDOS', 'ALEMANIA', 'REINO UNIDO', 'REMOTO · GLOBAL', 'CANADÁ'];
const flipDestino = document.getElementById('flipDestino');
let destinoIndex = 0;

function cycleDestino() {
  flipDestino.classList.add('is-flipping');
  setTimeout(() => {
    destinoIndex = (destinoIndex + 1) % destinos.length;
    flipDestino.textContent = destinos[destinoIndex];
  }, 250);
  setTimeout(() => {
    flipDestino.classList.remove('is-flipping');
  }, 500);
}
setInterval(cycleDestino, 3200);

// ============================================================
// HORARIOS DISPONIBLES
// Editá este array para reflejar tu disponibilidad real.
// "free: true" = tiene lugar / "free: false" = reservado.
// ============================================================
const horarios = [
  { day: 'LUN', time: '18:00', free: false },
  { day: 'LUN', time: '19:30', free: false },
  { day: 'LUN', time: '20:30', free: true },
  { day: 'MAR', time: '19:00', free: false },
  { day: 'MAR', time: '22:00', free: true },
  { day: 'MIÉ', time: '08:00', free: true },
  { day: 'MIÉ', time: '18:00', free: false },
  { day: 'MIÉ', time: '19:00', free: false },
  { day: 'MIE', time: '20:00', free: false },
  { day: 'MIE', time: '22:00', free: true },
  { day: 'JUE', time: '08:00', free: false },
  { day: 'JUE', time: '18:00', free: true },
  { day: 'VIE', time: '08:00', free: true },
  { day: 'VIE', time: '19:00', free: false },
];

const slotsContainer = document.getElementById('slots');

horarios.forEach(slot => {
  const el = document.createElement(slot.free ? 'a' : 'div');
  el.className = `slot ${slot.free ? 'slot--free' : 'slot--taken'}`;

  if (slot.free) {
    const msg = encodeURIComponent(
      `Hola Nico, quiero reservar la clase del ${slot.day} a las ${slot.time}hs.`
    );
    el.href = `https://wa.me/5491141619459?text=${msg}`;
    el.target = '_blank';
    el.rel = 'noopener';
  }

  el.innerHTML = `
    <span class="slot__day">${slot.day}</span>
    <span class="slot__time">${slot.time}hs</span>
    <span class="slot__status">${slot.free ? 'Disponible' : 'Reservado'}</span>
  `;
  slotsContainer.appendChild(el);
});

// ============================================================
// NOTIFICACIÓN "PERSONAS VIENDO ESTA PÁGINA"
// Aparece cada ~20s con un número aleatorio realista (3–11),
// evitando repetir el mismo número dos veces seguidas.
// ============================================================
const viewerToast = document.getElementById('viewerToast');
const viewerToastText = document.getElementById('viewerToastText');

const MIN_VIEWERS = 3;
const MAX_VIEWERS = 11;
let lastCount = 7; // valor inicial mostrado en el HTML

function nextViewerCount() {
  let count;
  do {
    count = Math.floor(Math.random() * (MAX_VIEWERS - MIN_VIEWERS + 1)) + MIN_VIEWERS;
  } while (count === lastCount);
  lastCount = count;
  return count;
}

function showViewerToast() {
  const count = nextViewerCount();
  viewerToastText.textContent = `${count} persona${count === 1 ? '' : 's'} está${count === 1 ? '' : 'n'} viendo esta página.`;
  viewerToast.classList.add('is-visible');

  // se oculta sola a los 5s
  setTimeout(() => {
    viewerToast.classList.remove('is-visible');
  }, 5000);
}

// primera aparición a los 4s, luego cada 20s
setTimeout(showViewerToast, 4000);
setInterval(showViewerToast, 20000);