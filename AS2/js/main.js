/* js/main.js
   Centralised client-side logic for Aotearoa Adventure Gear
   - Carousel (home)
   - Floating anchor (all pages)
   - Cart quantity recalculation (cart.html)
   - Free shipping logic + shipping totals (shipping.html)
   - Shipping form validation (shipping.html)
   - Payment form validation + demo handlers (payment.html)
   - Discount/gift demo (payment.html)
   - Confirmation flow (confirmation.html reads localStorage)
*/

document.addEventListener('DOMContentLoaded', () => {
  /* -------------------------
     Floating anchor (scroll to top)
     ------------------------- */
  (function floatingAnchor() {
    const fab = document.createElement('button');
    fab.className = 'btn btn-warning position-fixed';
    fab.style.bottom = '20px';
    fab.style.right = '20px';
    fab.style.zIndex = '1200';
    fab.style.display = 'none';
    fab.setAttribute('aria-label', 'Scroll to top');
    fab.textContent = '↑';
    document.body.appendChild(fab);

    fab.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    const toggle = () => { fab.style.display = window.scrollY > 300 ? 'block' : 'none'; };
    toggle();
    window.addEventListener('scroll', toggle);
  })();

  /* -------------------------
     Simple carousel for .product-card on home
     ------------------------- */
  (function simpleCarousel() {
    const container = document.querySelector('.product-carousel') || document.querySelector('.featured-products');
    if (!container) return;
    const items = Array.from(container.querySelectorAll('.product-card'));
    if (!items.length) return;
    let idx = 0;
    // show only first initially
    items.forEach((it, i) => it.style.display = i === 0 ? '' : 'none');
    setInterval(() => {
      items.forEach((it, i) => it.style.display = i === idx ? '' : 'none');
      idx = (idx + 1) % items.length;
    }, 4000);
  })();

  /* -------------------------
     Cart quantity recalculation (cart.html)
     - expects inputs with data-price attribute or row price cell
     ------------------------- */
  (function cartRecalc() {
    const qtyInputs = document.querySelectorAll('input[type="number"].cart-qty, input[data-qty-input]');
    if (!qtyInputs.length) return;
    const subtotalDisplay = document.querySelector('[data-subtotal]') || document.querySelector('.cart-subtotal');
    const shippingDisplay = document.querySelector('[data-shipping]');
    const taxesDisplay = document.querySelector('[data-taxes]');
    const totalDisplay = document.querySelector('[data-total]') || document.querySelector('.cart-total');

    function recalc() {
      let subtotal = 0;
      qtyInputs.forEach(input => {
        const row = input.closest('tr') || input.closest('.card');
        const priceAttr = input.dataset.price;
        let price = priceAttr ? parseFloat(priceAttr) : null;
        if (price === null && row) {
          // try to read price from a cell with $ sign
          const priceCell = row.querySelector('td:nth-child(2), .price');
          if (priceCell) price = parseFloat((priceCell.textContent || '').replace(/[^0-9.-]+/g, '')) || 0;
        }
        const qty = Math.max(0, parseInt(input.value || '0', 10));
        const rowSubtotal = price * qty;
        // update row subtotal cell if present
        const rowSubtotalCell = row.querySelector('td:last-child, .row-subtotal');
        if (rowSubtotalCell) rowSubtotalCell.textContent = `$${rowSubtotal.toFixed(2)}`;
        subtotal += rowSubtotal;
      });
      if (subtotalDisplay) {
        subtotalDisplay.dataset.subtotal = subtotal.toFixed(2);
        subtotalDisplay.textContent = `$${subtotal.toFixed(2)}`;
      }
      // recalc totals using shipping and taxes if present
      const taxes = taxesDisplay ? parseFloat(taxesDisplay.dataset.taxes || taxesDisplay.textContent.replace(/[^0-9.-]+/g, '')) || 0 : 0;
      let shippingCost = 0;
      if (shippingDisplay) {
        const shipText = shippingDisplay.textContent || '';
        if (shipText.toLowerCase().includes('free')) shippingCost = 0;
        else shippingCost = parseFloat((shipText || '').replace(/[^0-9.-]+/g, '')) || 0;
      }
      const total = subtotal + shippingCost + taxes;
      if (totalDisplay) totalDisplay.textContent = `$${total.toFixed(2)}`;
    }

    qtyInputs.forEach(i => i.addEventListener('input', recalc));
    recalc();
  })();

  /* -------------------------
     Shipping page logic (shipping.html)
     - auto-apply free shipping if subtotal > 600
     - update totals when shipping option changes
     - validate form on submit (HTML5 + extra checks)
     ------------------------- */
  (function shippingPage() {
    const form = document.getElementById('shippingForm');
    if (!form) return;

    const subtotalEl = document.getElementById('subtotalDisplay');
    const shippingEl = document.getElementById('shippingDisplay');
    const totalEl = document.getElementById('totalDisplay');
    const shipFree = document.getElementById('ship-free');
    const shipNext = document.getElementById('ship-next');

    const subtotal = parseFloat(subtotalEl ? (subtotalEl.dataset.subtotal || subtotalEl.textContent.replace(/[^0-9.-]+/g, '')) : '0') || 0;
    const taxes = parseFloat(totalEl ? (totalEl.dataset.taxes || '0') : '0') || 0;
    const FREE_THRESHOLD = 600;

    function updateTotals() {
      let shippingCost = 0;
      if (subtotal > FREE_THRESHOLD) {
        shippingCost = 0;
        if (shipFree && !shipFree.checked) shipFree.checked = true;
      } else {
        shippingCost = (shipNext && shipNext.checked) ? parseFloat(shipNext.value || '20') : 0;
      }
      if (shippingEl) shippingEl.textContent = shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`;
      if (totalEl) totalEl.textContent = `$${(subtotal + shippingCost + taxes).toFixed(2)}`;
    }

    updateTotals();
    if (shipFree) shipFree.addEventListener('change', updateTotals);
    if (shipNext) shipNext.addEventListener('change', updateTotals);

    // Bootstrap + HTML5 validation + extra checks
    form.addEventListener('submit', (e) => {
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
      }

      // Extra JS postal code check (NZ 4 digits)
      const postal = form.querySelector('#postal');
      if (postal && !/^\d{4}$/.test(postal.value.trim())) {
        e.preventDefault();
        e.stopPropagation();
        postal.classList.add('is-invalid');
        postal.nextElementSibling && (postal.nextElementSibling.textContent = 'Enter a 4-digit NZ postal code.');
        form.classList.add('was-validated');
        return;
      }

      // Save order summary to localStorage for demo flow
      const selectedShipping = form.querySelector('input[name="shipping"]:checked')?.value || '0';
      localStorage.setItem('aag_subtotal', subtotal.toFixed(2));
      localStorage.setItem('aag_shipping', selectedShipping);
      localStorage.setItem('aag_total', (subtotal + parseFloat(selectedShipping || 0) + taxes).toFixed(2));
      // proceed to payment (static demo)
      e.preventDefault();
      window.location.href = 'payment.html';
    });
  })();

  /* -------------------------
     Payment page logic (payment.html)
     - discount/gift demo
     - payment form validation (HTML5 + JS)
     ------------------------- */
  (function paymentPage() {
    const applyDiscount = document.getElementById('applyDiscount');
    const discountMsg = document.getElementById('discountMsg');
    if (applyDiscount) {
      applyDiscount.addEventListener('click', () => {
        discountMsg.style.display = 'block';
        discountMsg.textContent = 'Discount applied (demo).';
        setTimeout(() => discountMsg.style.display = 'none', 3000);
      });
    }

    const redeemGift = document.getElementById('redeemGift');
    const giftMsg = document.getElementById('giftMsg');
    if (redeemGift) {
      redeemGift.addEventListener('click', () => {
        giftMsg.style.display = 'block';
        giftMsg.textContent = 'Gift card redeemed (demo).';
        setTimeout(() => giftMsg.style.display = 'none', 3000);
      });
    }

    const paymentForm = document.getElementById('paymentForm');
    if (!paymentForm) return;

    function expiryValid(mmYY) {
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(mmYY)) return false;
      const [mmStr, yyStr] = mmYY.split('/');
      const mm = parseInt(mmStr, 10);
      const yy = parseInt(yyStr, 10);
      const fullYear = 2000 + yy;
      // expiry at end of month
      const expiryDate = new Date(fullYear, mm, 0, 23, 59, 59);
      const now = new Date();
      // consider valid if expiry month >= current month
      return expiryDate >= new Date(now.getFullYear(), now.getMonth(), 1);
    }

    paymentForm.addEventListener('submit', (e) => {
      if (!paymentForm.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
        paymentForm.classList.add('was-validated');
        return;
      }

      const cardNumber = (document.getElementById('cardNumber')?.value || '').replace(/\s+/g, '');
      const exp = document.getElementById('exp')?.value || '';
      const cvv = document.getElementById('cvv')?.value || '';
      const holder = (document.getElementById('holder')?.value || '').trim();

      const errors = [];
      if (!/^\d{13,19}$/.test(cardNumber)) errors.push('Invalid card number (13–19 digits).');
      if (!expiryValid(exp)) errors.push('Invalid or expired expiry date (MM/YY).');
      if (!/^\d{3,4}$/.test(cvv)) errors.push('Invalid CVV (3–4 digits).');
      if (holder.length === 0) errors.push('Cardholder name is required.');

      if (errors.length) {
        e.preventDefault();
        e.stopPropagation();
        paymentForm.classList.add('was-validated');
        alert('Payment form errors:\n' + errors.join('\n'));
        return;
      }

      // Demo: store payment info summary and redirect to confirmation
      e.preventDefault();
      localStorage.setItem('aag_payment_method', 'card');
      localStorage.setItem('aag_cardholder', holder);
      window.location.href = 'confirmation.html';
    });
  })();

  /* -------------------------
     Confirmation page: populate if present
     ------------------------- */
  (function confirmationPage() {
    const conf = document.getElementById('orderConfirmation');
    if (!conf) return;
    const subtotal = localStorage.getItem('aag_subtotal') || '0.00';
    const shipping = localStorage.getItem('aag_shipping') || '0.00';
    const total = localStorage.getItem('aag_total') || subtotal;
    const method = localStorage.getItem('aag_payment_method') || 'N/A';
    const holder = localStorage.getItem('aag_cardholder') || '';

    conf.querySelector('#conf-subtotal') && (conf.querySelector('#conf-subtotal').textContent = `$${parseFloat(subtotal).toFixed(2)}`);
    conf.querySelector('#conf-shipping') && (conf.querySelector('#conf-shipping').textContent = (parseFloat(shipping) === 0 ? 'FREE' : `$${parseFloat(shipping).toFixed(2)}`));
    conf.querySelector('#conf-total') && (conf.querySelector('#conf-total').textContent = `$${parseFloat(total).toFixed(2)}`);
    conf.querySelector('#conf-method') && (conf.querySelector('#conf-method').textContent = method === 'card' ? `Card (${holder})` : method);
  })();

});
