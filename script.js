const weddingDate = new Date("2026-05-07T10:30:00+05:30");

const preloader = document.getElementById("preloader");
const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const heroBackground = document.querySelector(".hero__background");
const form = document.getElementById("rsvp-form");
const successBanner = document.getElementById("success-banner");
const shareWhatsAppButton = document.getElementById("share-whatsapp");
const copyLinkButton = document.getElementById("copy-link");
const downloadRsvpsButton = document.getElementById("download-rsvps");
const countdownEls = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
};

const rsvpStorageKey = "wedding-rsvps";
const RSVP_CONFIG = {
  whatsappNumber: "919999999999",
  googleAppsScriptUrl: "",
};

window.addEventListener("load", () => {
  setTimeout(() => {
    preloader.classList.add("is-hidden");
  }, 1400);
});

menuToggle?.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.toggle("is-open");
  menuToggle.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".mobile-menu a, .nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("is-open");
    menuToggle.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("scroll", () => {
  const offset = Math.min(window.scrollY * 0.16, 120);
  if (heroBackground) {
    heroBackground.style.transform = `scale(1.08) translateY(${offset}px)`;
  }
}, { passive: true });

function updateCountdown() {
  const now = new Date().getTime();
  const distance = weddingDate.getTime() - now;

  if (distance <= 0) {
    Object.values(countdownEls).forEach((node) => {
      node.textContent = "0";
    });
    return;
  }

  const values = {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((distance / (1000 * 60)) % 60),
    seconds: Math.floor((distance / 1000) % 60),
  };

  Object.entries(values).forEach(([key, value]) => {
    countdownEls[key].textContent = String(value).padStart(2, "0");
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

function getSavedRsvps() {
  try {
    return JSON.parse(localStorage.getItem(rsvpStorageKey)) || [];
  } catch {
    return [];
  }
}

function saveRsvp(payload) {
  const allEntries = getSavedRsvps();
  allEntries.push(payload);
  localStorage.setItem(rsvpStorageKey, JSON.stringify(allEntries, null, 2));
}

function downloadJsonFile(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function sanitizePhoneNumber(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

function buildWhatsAppRsvpMessage(payload) {
  return [
    "Wedding RSVP",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `Guests: ${payload.guests}`,
    `Attending: ${payload.attending}`,
    `Message: ${payload.message || "-"}`,
    `Submitted At: ${payload.submittedAt}`,
  ].join("\n");
}

function openWhatsAppRsvp(payload) {
  const message = buildWhatsAppRsvpMessage(payload);
  const whatsappNumber = sanitizePhoneNumber(RSVP_CONFIG.whatsappNumber);
  const baseUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : "https://wa.me/";

  window.open(`${baseUrl}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
}

async function submitRsvpToGoogleSheets(payload) {
  const endpoint = RSVP_CONFIG.googleAppsScriptUrl.trim();
  if (!endpoint) {
    return false;
  }

  await fetch(endpoint, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  return true;
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  payload.submittedAt = new Date().toISOString();

  saveRsvp(payload);

  try {
    await submitRsvpToGoogleSheets(payload);
  } catch (error) {
    console.error("Google Sheets submission failed:", error);
  }

  openWhatsAppRsvp(payload);
  downloadJsonFile(`rsvp-${Date.now()}.json`, payload);
  form.reset();
  successBanner.classList.add("is-visible");
  launchConfetti();

  setTimeout(() => {
    successBanner.classList.remove("is-visible");
  }, 5000);
});

downloadRsvpsButton?.addEventListener("click", () => {
  const entries = getSavedRsvps();
  if (!entries.length) {
    alert("No RSVPs have been saved in this browser yet.");
    return;
  }

  downloadJsonFile("saved-rsvps.json", entries);
});

shareWhatsAppButton?.addEventListener("click", () => {
  const text = `Join us for the wedding celebration of D. Gayathri & D. Mano Vikas! ${window.location.href}`;
  const whatsappNumber = sanitizePhoneNumber(RSVP_CONFIG.whatsappNumber);
  const baseUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : "https://wa.me/";
  window.open(`${baseUrl}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
});

copyLinkButton?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    copyLinkButton.textContent = "Link Copied";
    setTimeout(() => {
      copyLinkButton.textContent = "Copy Link";
    }, 1800);
  } catch {
    alert("Could not copy the link automatically.");
  }
});

function launchConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  const colors = ["#b22222", "#ffb300", "#2e8b57", "#ffffff", "#f6d365"];
  const pieces = Array.from({ length: 140 }, () => ({
    x: width / 2 + (Math.random() - 0.5) * 80,
    y: height * 0.35,
    size: 5 + Math.random() * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * Math.PI * 2,
    speedX: (Math.random() - 0.5) * 8,
    speedY: -2 - Math.random() * 7,
    gravity: 0.12 + Math.random() * 0.08,
    alpha: 1,
  }));

  function animate() {
    context.clearRect(0, 0, width, height);

    pieces.forEach((piece) => {
      piece.x += piece.speedX;
      piece.y += piece.speedY;
      piece.speedY += piece.gravity;
      piece.rotation += 0.08;
      piece.alpha -= 0.008;

      context.save();
      context.globalAlpha = Math.max(piece.alpha, 0);
      context.translate(piece.x, piece.y);
      context.rotate(piece.rotation);
      context.fillStyle = piece.color;
      context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.65);
      context.restore();
    });

    if (pieces.some((piece) => piece.alpha > 0 && piece.y < height + 40)) {
      requestAnimationFrame(animate);
    } else {
      context.clearRect(0, 0, width, height);
    }
  }

  animate();
}
