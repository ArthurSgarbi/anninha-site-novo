const startDate = new Date(2023, 3, 10, 0, 0, 0);
const timeFields = Object.fromEntries(
    [...document.querySelectorAll("[data-time]")].map((element) => [element.dataset.time, element])
);

function calculateElapsed(from, to) {
    if (to < from) {
        return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    let years = to.getFullYear() - from.getFullYear();
    let cursor = new Date(from);
    cursor.setFullYear(from.getFullYear() + years);

    if (cursor > to) {
        years -= 1;
        cursor = new Date(from);
        cursor.setFullYear(from.getFullYear() + years);
    }

    let months = (to.getFullYear() - cursor.getFullYear()) * 12 + to.getMonth() - cursor.getMonth();
    let monthCursor = new Date(cursor);
    monthCursor.setMonth(cursor.getMonth() + months);

    if (monthCursor > to) {
        months -= 1;
        monthCursor = new Date(cursor);
        monthCursor.setMonth(cursor.getMonth() + months);
    }

    let remainder = to - monthCursor;
    const days = Math.floor(remainder / 86_400_000);
    remainder -= days * 86_400_000;
    const hours = Math.floor(remainder / 3_600_000);
    remainder -= hours * 3_600_000;
    const minutes = Math.floor(remainder / 60_000);
    remainder -= minutes * 60_000;
    const seconds = Math.floor(remainder / 1_000);

    return { years, months, days, hours, minutes, seconds };
}

function updateCounter() {
    const elapsed = calculateElapsed(startDate, new Date());
    Object.entries(elapsed).forEach(([unit, value]) => {
        if (timeFields[unit]) timeFields[unit].textContent = String(value).padStart(2, "0");
    });
}

updateCounter();
setInterval(updateCounter, 1_000);
document.querySelector("#current-year").textContent = new Date().getFullYear();

const header = document.querySelector(".site-header");
function updateHeader() {
    header.classList.toggle("scrolled", window.scrollY > 28);
}
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const revealElements = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px" });

    revealElements.forEach((element) => revealObserver.observe(element));
} else {
    revealElements.forEach((element) => element.classList.add("visible"));
}

const filters = [...document.querySelectorAll(".filter")];
const galleryCards = [...document.querySelectorAll(".gallery-card")];

filters.forEach((filterButton) => {
    filterButton.addEventListener("click", () => {
        const selectedYear = filterButton.dataset.filter;

        filters.forEach((button) => {
            const isActive = button === filterButton;
            button.classList.toggle("active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });

        galleryCards.forEach((card) => {
            const shouldShow = selectedYear === "all" || card.dataset.year === selectedYear;
            card.classList.toggle("is-hidden", !shouldShow);
        });
    });
});

const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");
const lightboxCount = document.querySelector("#lightbox-count");
const closeButton = lightbox.querySelector(".lightbox-close");
let activeCard = null;

function visibleCards() {
    return galleryCards.filter((card) => !card.classList.contains("is-hidden"));
}

function showCard(card) {
    const cards = visibleCards();
    const image = card.querySelector("img");
    const title = card.querySelector(".photo-label strong").textContent;
    const position = cards.indexOf(card);

    activeCard = card;
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = `${title} · ${card.dataset.date}`;
    lightboxCount.textContent = `${position + 1} / ${cards.length}`;
}

function openLightbox(card) {
    showCard(card);
    lightbox.hidden = false;
    document.body.classList.add("modal-open");
    closeButton.focus();
}

function closeLightbox() {
    lightbox.hidden = true;
    document.body.classList.remove("modal-open");
    lightboxImage.src = "";
    activeCard?.focus();
}

function moveLightbox(direction) {
    const cards = visibleCards();
    const currentIndex = cards.indexOf(activeCard);
    const nextIndex = (currentIndex + direction + cards.length) % cards.length;
    showCard(cards[nextIndex]);
}

galleryCards.forEach((card) => card.addEventListener("click", () => openLightbox(card)));
closeButton.addEventListener("click", closeLightbox);
lightbox.querySelector(".lightbox-prev").addEventListener("click", () => moveLightbox(-1));
lightbox.querySelector(".lightbox-next").addEventListener("click", () => moveLightbox(1));

lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") moveLightbox(-1);
    if (event.key === "ArrowRight") moveLightbox(1);
});

const loveButton = document.querySelector("#love-button");
const heartBurst = document.querySelector("#heart-burst");

loveButton.addEventListener("click", () => {
    const totalHearts = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 6 : 24;

    for (let index = 0; index < totalHearts; index += 1) {
        const heart = document.createElement("span");
        heart.className = "floating-heart";
        heart.textContent = Math.random() > 0.32 ? "♥" : "♡";
        heart.style.left = `${Math.random() * 96 + 2}%`;
        heart.style.setProperty("--heart-size", `${0.9 + Math.random() * 1.7}rem`);
        heart.style.setProperty("--heart-duration", `${2.5 + Math.random() * 2.3}s`);
        heart.style.setProperty("--heart-rotate", `${Math.random() * 80 - 40}deg`);
        heart.style.animationDelay = `${Math.random() * 0.7}s`;
        heartBurst.appendChild(heart);
        heart.addEventListener("animationend", () => heart.remove());
    }
});
