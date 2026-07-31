const body = document.body;
const enterButton = document.querySelector(".enter-button");
const entry = document.querySelector(".entry");
const ambientField = document.querySelector(".ambient-field");

function enterSite() {
  body.classList.add("entered");
  window.setTimeout(() => {
    entry.setAttribute("aria-hidden", "true");
  }, 1100);
}

enterButton.addEventListener("click", enterSite);

window.addEventListener("keydown", (event) => {
  if ((event.key === "Enter" || event.key === " ") && !body.classList.contains("entered")) {
    event.preventDefault();
    enterSite();
  }
});

function createDust() {
  const fragment = document.createDocumentFragment();
  const count = window.matchMedia("(max-width: 680px)").matches ? 18 : 34;

  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    particle.className = "dust";
    particle.style.setProperty("--dust-x", `${Math.random() * 100}vw`);
    particle.style.setProperty("--dust-drift", `${Math.random() * 46 - 23}px`);
    particle.style.setProperty("--dust-duration", `${14 + Math.random() * 18}s`);
    particle.style.setProperty("--dust-delay", `${Math.random() * -24}s`);
    particle.style.setProperty("--dust-opacity", `${0.18 + Math.random() * 0.42}`);
    fragment.appendChild(particle);
  }

  ambientField.appendChild(fragment);
}

createDust();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entryItem) => {
    if (entryItem.isIntersecting) {
      entryItem.target.classList.add("visible");
      revealObserver.unobserve(entryItem.target);
    }
  });
}, {
  threshold: 0.14
});

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach((entryItem) => {
    if (!entryItem.isIntersecting) return;
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${entryItem.target.id}`);
    });
  });
}, {
  rootMargin: "-42% 0px -48% 0px",
  threshold: 0
});

sections.forEach((section) => navObserver.observe(section));

const parallaxItems = document.querySelectorAll("[data-parallax]");
const hero = document.querySelector(".hero");
let ticking = false;

function updateParallax() {
  const viewportMid = window.innerHeight / 2;

  parallaxItems.forEach((item) => {
    const speed = Number(item.dataset.parallax || 0.05);
    const rect = item.getBoundingClientRect();
    const offset = (rect.top + rect.height / 2 - viewportMid) * speed;
    item.style.setProperty("--parallax-y", `${offset}px`);
  });

  if (hero) {
    hero.style.setProperty("--hero-shift", `${window.scrollY * -0.035}px`);
  }

  ticking = false;
}

function requestParallax() {
  if (!ticking) {
    window.requestAnimationFrame(updateParallax);
    ticking = true;
  }
}

window.addEventListener("scroll", requestParallax, { passive: true });
window.addEventListener("resize", requestParallax);
updateParallax();
