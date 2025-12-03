// js/carousel.js
document.addEventListener('DOMContentLoaded', () => {

  const track = document.querySelector('[data-carousel-track]');
  if (!track) return;

  const slides = Array.from(track.children);
  const nextBtn = document.querySelector('[data-carousel-next]');
  const prevBtn = document.querySelector('[data-carousel-prev]');
  let index = 0;

  const update = () => {
    slides.forEach((slide, i) => {
      slide.style.display = i === index ? '' : 'none';
    });
  };

  const next = () => {
    index = (index + 1) % slides.length;
    update();
  };

  const prev = () => {
    index = (index - 1 + slides.length) % slides.length;
    update();
  };

  update();

  if (nextBtn) nextBtn.addEventListener('click', next);
  if (prevBtn) prevBtn.addEventListener('click', prev);
  setInterval(next, 4000);

});
