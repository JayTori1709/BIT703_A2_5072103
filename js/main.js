// js/main.js
document.addEventListener('DOMContentLoaded', () => {

  // ---------------------------
  // Scroll To Top Button (FAB)
  // ---------------------------
  let fab = document.querySelector('.fab');
  if (!fab) {
    fab = document.createElement('button');
    fab.className = 'fab btn btn-warning';
    fab.textContent = '↑';
    document.body.appendChild(fab);
  }

  fab.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  const toggleFab = () => fab.style.display = window.scrollY > 300 ? 'grid' : 'none';
  toggleFab();
  window.addEventListener('scroll', toggleFab);


  // ---------------------------
  // Price slider mirror (Shop)
  // ---------------------------
  const priceRange = document.querySelector('#priceRange');
  const priceVal = document.querySelector('#priceVal');
  if (priceRange && priceVal) {
    const update = () => priceVal.textContent = priceRange.value;
    update();
    priceRange.addEventListener('input', update);
  }


  // ---------------------------
  // Live product search (Shop)
  // ---------------------------
  const shopSearch = document.querySelector('#shop-search');
  if (shopSearch) {
    const cards = Array.from(document.querySelectorAll('[data-product-card]'));
    shopSearch.addEventListener('input', () => {
      const q = shopSearch.value.toLowerCase();
      cards.forEach(card => {
        const name = card.dataset.name.toLowerCase();
        card.style.display = name.includes(q) ? '' : 'none';
      });
    });
  }


  // ---------------------------
  // Cart subtotal calculation
  // ---------------------------
  const qtyInputs = document.querySelectorAll('[data-qty-input]');
  if (qtyInputs.length) {
    const subtotalEl = document.querySelector('[data-subtotal]');
    const shippingEl = document.querySelector('[data-shipping]');
    const taxesEl = document.querySelector('[data-taxes]');
    const totalEl = document.querySelector('[data-total]');
    const shipNext = document.querySelector('#ship-next');

    const recalc = () => {
      let subtotal = 0;

      qtyInputs.forEach(input => {
        const price = parseFloat(input.dataset.price || '0');
        const qty = Math.max(0, parseInt(input.value || '0', 10));
        const rowSubtotal = input.closest('tr').querySelector('td:last-child');
        const line = (price * qty);
        rowSubtotal.textContent = `$${line.toFixed(0)}`;
        subtotal += line;
      });

      if (subtotalEl) {
        subtotalEl.dataset.subtotal = subtotal;
        subtotalEl.textContent = `$${subtotal.toFixed(0)}`;
      }

      const taxes = taxesEl ? parseFloat(taxesEl.dataset.taxes || '0') : 0;
      let shippingCost = 0;

      if (shipNext && shipNext.checked && subtotal <= 600) {
        shippingCost = 20;
      }

      if (shippingEl) shippingEl.textContent = shippingCost === 0 ? 'FREE' : `$${shippingCost}`;
      if (totalEl) totalEl.textContent = `$${(subtotal + shippingCost + taxes).toFixed(0)}`;
    };

    qtyInputs.forEach(i => i.addEventListener('input', recalc));
    if (shipNext) shipNext.addEventListener('change', recalc);
    recalc();
  }


  // ---------------------------
  // Shipping page recalculation
  // ---------------------------
  const subtotalEl = document.querySelector('[data-subtotal]');
  const shippingEl = document.querySelector('[data-shipping]');
  const totalEl = document.querySelector('[data-total]');
  const shipFree = document.querySelector('#ship-free');
  const shipNext = document.querySelector('#ship-next');

  if (subtotalEl && shippingEl && totalEl) {
    const subtotal = parseFloat(subtotalEl.dataset.subtotal || '0');
    const taxes = parseFloat(totalEl.dataset.taxes || '0');

    const updateShipping = () => {
      let shippingCost = 0;
      if (shipNext && shipNext.checked && subtotal <= 600) shippingCost = 20;
      shippingEl.textContent = shippingCost === 0 ? 'FREE' : `$${shippingCost}`;
      totalEl.textContent = `$${(subtotal + shippingCost + taxes).toFixed(0)}`;
    };

    if (shipFree) shipFree.addEventListener('change', updateShipping);
    if (shipNext) shipNext.addEventListener('change', updateShipping);
    updateShipping();
  }


  // ---------------------------
  // Demo payment confirmation
  // ---------------------------
  const confirmBtn = document.querySelector('[data-confirm-order]');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', e => {
      e.preventDefault();
      alert('Order confirmed (demo only)');
      window.location.href = 'confirmation.html';
    });
  }

});
