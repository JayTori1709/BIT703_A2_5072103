// js/main.js

// Floating anchor: scroll to top
document.addEventListener('DOMContentLoaded', () => {
  const fab = document.querySelector('.fab');
  if (fab) {
    fab.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    const toggleFab = () => {
      if (window.scrollY > 300) fab.style.display = 'grid';
      else fab.style.display = 'none';
    };
    toggleFab();
    window.addEventListener('scroll', toggleFab);
  }

  // Free shipping logic on Shipping Details and Payment pages
  const subtotalEl = document.querySelector('[data-subtotal]');
  const shippingEl = document.querySelector('[data-shipping]');
  const totalEl = document.querySelector('[data-total]');
  if (subtotalEl && shippingEl && totalEl) {
    const subtotal = parseFloat(subtotalEl.dataset.subtotal || '0');
    const taxes = parseFloat(totalEl.dataset.taxes || '0');
    const freeThreshold = 600;
    let shippingCost = 0;

    // If "Next Day" radio exists, hook into it
    const shipFree = document.querySelector('#ship-free');
    const shipNext = document.querySelector('#ship-next');
    const updateShipping = () => {
      if (subtotal > freeThreshold) {
        shippingCost = 0;
        if (shipNext && shipNext.checked) shipNext.checked = false; // force free
        if (shipFree) shipFree.checked = true;
      } else {
        shippingCost = shipNext && shipNext.checked ? 20 : 0;
      }
      shippingEl.textContent = shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(0)}`;
      const total = subtotal + shippingCost + taxes;
      totalEl.textContent = `$${total.toFixed(0)}`;
    };
    updateShipping();
    if (shipFree) shipFree.addEventListener('change', updateShipping);
    if (shipNext) shipNext.addEventListener('change', updateShipping);
  }

  // Live search filter on Shop page
  const shopSearch = document.querySelector('#shop-search');
  if (shopSearch) {
    const cards = Array.from(document.querySelectorAll('[data-product-card]'));
    shopSearch.addEventListener('input', () => {
      const q = shopSearch.value.trim().toLowerCase();
      cards.forEach(card => {
        const name = (card.dataset.name || '').toLowerCase();
        card.style.display = name.includes(q) ? '' : 'none';
      });
    });
  }

  // Quantity update in Cart page
  const qtyInputs = document.querySelectorAll('[data-qty-input]');
  if (qtyInputs.length) {
    const subtotalEl = document.querySelector('[data-subtotal]');
    const shippingEl = document.querySelector('[data-shipping]');
    const taxesEl = document.querySelector('[data-taxes]');
    const totalEl = document.querySelector('[data-total]');
    const recalc = () => {
      let subtotal = 0;
      qtyInputs.forEach(input => {
        const price = parseFloat(input.dataset.price || '0');
        const qty = Math.max(0, parseInt(input.value || '0', 10));
        subtotal += price * qty;
      });
      if (subtotalEl) {
        subtotalEl.dataset.subtotal = subtotal.toFixed(0);
        subtotalEl.textContent = `$${subtotal.toFixed(0)}`;
      }
      const taxes = taxesEl ? parseFloat(taxesEl.dataset.taxes || '0') : 0;
      let shippingCost = 0;
      if (subtotal > 600) shippingCost = 0;
      else {
        const shipNext = document.querySelector('#ship-next');
        shippingCost = shipNext && shipNext.checked ? 20 : 0;
      }
      if (shippingEl) shippingEl.textContent = shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(0)}`;
      if (totalEl) totalEl.textContent = `$${(subtotal + shippingCost + taxes).toFixed(0)}`;
    };
    qtyInputs.forEach(i => i.addEventListener('input', recalc));
    recalc();
  }
});
