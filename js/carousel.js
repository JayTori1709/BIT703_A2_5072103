// js/carousel.js
document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('[data-carousel-track]');
  const slides = track ? Array.from(track.children) : [];
  const nextBtn = document.querySelector('[data-carousel-next]');
  const prevBtn = document.querySelector('[data-carousel-prev]');
  let index = 0;

  const update = () => {
    slides.forEach((s, i) => s.style.display = i === index ? '' : 'none');
  };
  const next = () => { index = (index + 1) % slides.length; update(); };
  const prev = () => { index = (index - 1 + slides.length) % slides.length; update(); };

  if (slides.length) {
    update();
    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);
    // auto-play
    setInterval(next, 4000);
  }
});
