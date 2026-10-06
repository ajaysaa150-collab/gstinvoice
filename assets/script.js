/**
 * GST Invoice Pro - Core JavaScript Engine
 * Handles: Theme Toggle, Mobile Menu, Live Calculations, Dynamic Items,
 * Indian Currency Formatting, Indian Words Conversion, LocalStorage Drafts,
 * Print/PDF Generation, and Toast Notifications.
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. Theme Management (Light / Dark Mode with LocalStorage)
  // =========================================================================
  const THEME_STORAGE_KEY = 'gst_invoice_pro_theme';

  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

    applyTheme(initialTheme);

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
      });
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`);
      // Update icon: Sun for dark mode (to turn light), Moon for light mode (to turn dark)
      toggleBtn.innerHTML = theme === 'dark'
        ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    }
  }

  // =========================================================================
  // 2. Mobile Navigation Toggle
  // =========================================================================
  function initMobileMenu() {
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');

    if (mobileBtn && navMenu) {
      mobileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navMenu.classList.toggle('open');
        mobileBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !mobileBtn.contains(e.target)) {
          navMenu.classList.remove('open');
          mobileBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  // =========================================================================
  // 3. Lightweight Toast Notification Engine
  // =========================================================================
  function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${escapeHtml(message)}</span>
      <button type="button" aria-label="Close Notification" style="color: inherit; opacity: 0.7; font-size: 1.1rem; line-height: 1;">&times;</button>
    `;

    const closeBtn = toast.querySelector('button');
    closeBtn.addEventListener('click', () => {
      removeToast(toast);
    });

    container.appendChild(toast);

    setTimeout(() => {
      removeToast(toast);
    }, 3800);
  }

  function removeToast(toast) {
    if (toast && toast.parentNode) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 200);
    }
  }

  // =========================================================================
  // 4. Utility Functions: Indian Number Formatting & Words Conversion
  // =========================================================================
  function formatINR(val) {
    const num = parseFloat(val) || 0;
    return '₹' + num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Convert Number to Indian Rupee Words (Supporting Crores, Lakhs, Thousands, Hundreds, Paise)
   * Example: 12500 -> "Rupees Twelve Thousand Five Hundred Only"
   */
  function numberToIndianWords(amount) {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return 'Rupees Zero Only';

    const ones = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
      'Seventeen', 'Eighteen', 'Nineteen'
    ];

    const tens = [
      '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];

    function convertGroup(n) {
      let str = '';
      if (n >= 100) {
        str += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 20) {
        str += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      }
      if (n > 0) {
        str += ones[n] + ' ';
      }
      return str.trim();
    }

    const wholePart = Math.floor(num);
    const decimalPart = Math.round((num - wholePart) * 100);

    let result = '';

    const crore = Math.floor(wholePart / 10000000);
    let remainder = wholePart % 10000000;

    const lakh = Math.floor(remainder / 100000);
    remainder = remainder % 100000;

    const thousand = Math.floor(remainder / 1000);
    remainder = remainder % 1000;

    const hundredAndRest = remainder;

    if (crore > 0) {
      result += convertGroup(crore) + ' Crore ';
    }
    if (lakh > 0) {
      result += convertGroup(lakh) + ' Lakh ';
    }
    if (thousand > 0) {
      result += convertGroup(thousand) + ' Thousand ';
    }
    if (hundredAndRest > 0) {
      result += convertGroup(hundredAndRest) + ' ';
    }

    result = result.trim();
    if (!result) result = 'Zero';

    let finalWords = 'Rupees ' + result;

    if (decimalPart > 0) {
      finalWords += ' and ' + convertGroup(decimalPart) + ' Paise';
    }

    finalWords += ' Only';
    return finalWords.replace(/\s+/g, ' ');
  }

  // =========================================================================
  // 5. Invoice Generator Engine (Form, Dynamic Items, Live Sync, Print)
  // =========================================================================
  const DRAFT_STORAGE_KEY = 'gst_invoice_pro_draft_v1';

  function initInvoiceGenerator() {
    const invoiceForm = document.getElementById('gst-invoice-form');
    if (!invoiceForm) return; // Not on generator page

    // Set default invoice date to today
    const dateInput = document.getElementById('inv-date');
    if (dateInput && !dateInput.value) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.value = today;
    }

    // Set default invoice number if empty
    const invNumberInput = document.getElementById('inv-number');
    if (invNumberInput && !invNumberInput.value) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      invNumberInput.value = `INV-${new Date().getFullYear()}-${randomNum}`;
    }

    // Dynamic Items management
    const addItemBtn = document.getElementById('btn-add-item');
    if (addItemBtn) {
      addItemBtn.addEventListener('click', () => {
        addItemRow();
        recalculateAndRender();
      });
    }

    const itemsContainer = document.getElementById('items-tbody');
    if (itemsContainer) {
      itemsContainer.addEventListener('click', (e) => {
        const delBtn = e.target.closest('.btn-delete-row');
        if (delBtn) {
          const rows = itemsContainer.querySelectorAll('tr');
          if (rows.length <= 1) {
            showToast('Invoice must contain at least one product or service.', 'error');
            return;
          }
          delBtn.closest('tr').remove();
          recalculateAndRender();
        }
      });

      itemsContainer.addEventListener('input', (e) => {
        if (e.target.matches('.item-qty, .item-rate, .item-discount, .item-desc')) {
          recalculateAndRender();
        }
      });
    }

    // Listen to changes on all form inputs for live sync
    invoiceForm.addEventListener('input', () => {
      recalculateAndRender();
    });

    invoiceForm.addEventListener('change', () => {
      recalculateAndRender();
    });

    // Tax type radio listeners
    const taxRadios = document.querySelectorAll('input[name="tax_type"]');
    taxRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        recalculateAndRender();
      });
    });

    // GST rate select listener
    const gstRateSelect = document.getElementById('gst-rate-select');
    if (gstRateSelect) {
      gstRateSelect.addEventListener('change', () => {
        recalculateAndRender();
      });
    }

    // Action Buttons
    const printBtn = document.getElementById('btn-print-invoice');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        handlePrintOrPdf();
      });
    }

    const pdfBtn = document.getElementById('btn-save-pdf');
    if (pdfBtn) {
      pdfBtn.addEventListener('click', () => {
        handlePrintOrPdf(true);
      });
    }

    const saveDraftBtn = document.getElementById('btn-save-draft');
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', saveDraftToLocalStorage);
    }

    const loadDraftBtn = document.getElementById('btn-load-draft');
    if (loadDraftBtn) {
      loadDraftBtn.addEventListener('click', loadDraftFromLocalStorage);
    }

    const clearBtn = document.getElementById('btn-clear-form');
    if (clearBtn) {
      clearBtn.addEventListener('click', clearInvoiceForm);
    }

    // Sample data button
    const fillSampleBtn = document.getElementById('btn-sample-data');
    if (fillSampleBtn) {
      fillSampleBtn.addEventListener('click', fillSampleData);
    }

    // Initial calculation and preview rendering
    recalculateAndRender();
  }

  /**
   * Add a new dynamic item row to the table
   */
  function addItemRow(desc = '', qty = 1, rate = 0, discount = 0) {
    const tbody = document.getElementById('items-tbody');
    if (!tbody) return;

    const tr = document.createElement('tr');
    tr.className = 'item-row';
    tr.innerHTML = `
      <td>
        <input type="text" class="form-input item-desc" placeholder="Product or service description" value="${escapeHtml(desc)}" required>
      </td>
      <td style="width: 85px;">
        <input type="number" class="form-input item-qty" min="1" step="any" value="${qty}" required>
      </td>
      <td style="width: 120px;">
        <input type="number" class="form-input item-rate" min="0" step="any" value="${rate}" required>
      </td>
      <td style="width: 95px;">
        <input type="number" class="form-input item-discount" min="0" max="100" step="any" value="${discount}">
      </td>
      <td class="item-row-amount">₹0.00</td>
      <td style="width: 45px; text-align: center;">
        <button type="button" class="item-delete-btn btn-delete-row" title="Delete item" aria-label="Delete item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  /**
   * Main calculation and preview synchronization routine
   */
  function recalculateAndRender() {
    // 1. Gather Items Data
    const itemRows = document.querySelectorAll('#items-tbody .item-row');
    const items = [];
    let subtotal = 0;
    let totalDiscount = 0;

    itemRows.forEach(row => {
      const desc = row.querySelector('.item-desc').value.trim();
      const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
      const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
      const discPercent = parseFloat(row.querySelector('.item-discount').value) || 0;

      const gross = qty * rate;
      const discAmount = gross * (Math.min(discPercent, 100) / 100);
      const netAmount = Math.max(0, gross - discAmount);

      subtotal += gross;
      totalDiscount += discAmount;

      // Update row amount in table
      const amountCell = row.querySelector('.item-row-amount');
      if (amountCell) {
        amountCell.textContent = formatINR(netAmount);
      }

      items.push({
        desc: desc || 'Untitled Item',
        qty,
        rate,
        discPercent,
        discAmount,
        netAmount
      });
    });

    // 2. Tax Calculations
    const taxableAmount = Math.max(0, subtotal - totalDiscount);
    const gstRateSelect = document.getElementById('gst-rate-select');
    const gstRate = gstRateSelect ? parseFloat(gstRateSelect.value) || 0 : 18;

    const taxTypeRadio = document.querySelector('input[name="tax_type"]:checked');
    const taxType = taxTypeRadio ? taxTypeRadio.value : 'cgst_sgst';

    let cgstRate = 0;
    let cgstAmount = 0;
    let sgstRate = 0;
    let sgstAmount = 0;
    let igstRate = 0;
    let igstAmount = 0;
    let totalTax = 0;

    if (taxType === 'cgst_sgst') {
      cgstRate = gstRate / 2;
      sgstRate = gstRate / 2;
      cgstAmount = (taxableAmount * cgstRate) / 100;
      sgstAmount = (taxableAmount * sgstRate) / 100;
      totalTax = cgstAmount + sgstAmount;
    } else {
      igstRate = gstRate;
      igstAmount = (taxableAmount * igstRate) / 100;
      totalTax = igstAmount;
    }

    const grandTotal = Math.round((taxableAmount + totalTax) * 100) / 100;
    const words = numberToIndianWords(grandTotal);

    // 3. Update Form Summary
    updateFormSummary({
      subtotal,
      totalDiscount,
      taxableAmount,
      taxType,
      cgstRate,
      cgstAmount,
      sgstRate,
      sgstAmount,
      igstRate,
      igstAmount,
      totalTax,
      grandTotal,
      words
    });

    // 4. Update Live A4 Preview
    updateLivePreview({
      items,
      subtotal,
      totalDiscount,
      taxableAmount,
      taxType,
      cgstRate,
      cgstAmount,
      sgstRate,
      sgstAmount,
      igstRate,
      igstAmount,
      totalTax,
      grandTotal,
      words
    });
  }

  function updateFormSummary(calc) {
    const elSubtotal = document.getElementById('summary-subtotal');
    const elDiscount = document.getElementById('summary-discount');
    const elTaxable = document.getElementById('summary-taxable');
    const elTaxBreakdown = document.getElementById('summary-tax-breakdown');
    const elGrandTotal = document.getElementById('summary-grand-total');
    const elWords = document.getElementById('summary-words');

    if (elSubtotal) elSubtotal.textContent = formatINR(calc.subtotal);
    if (elDiscount) elDiscount.textContent = formatINR(calc.totalDiscount);
    if (elTaxable) elTaxable.textContent = formatINR(calc.taxableAmount);
    if (elGrandTotal) elGrandTotal.textContent = formatINR(calc.grandTotal);
    if (elWords) elWords.textContent = calc.words;

    if (elTaxBreakdown) {
      if (calc.taxType === 'cgst_sgst') {
        elTaxBreakdown.innerHTML = `
          <div class="calc-row">
            <span>CGST (${calc.cgstRate}%):</span>
            <span>${formatINR(calc.cgstAmount)}</span>
          </div>
          <div class="calc-row">
            <span>SGST (${calc.sgstRate}%):</span>
            <span>${formatINR(calc.sgstAmount)}</span>
          </div>
        `;
      } else {
        elTaxBreakdown.innerHTML = `
          <div class="calc-row">
            <span>IGST (${calc.igstRate}%):</span>
            <span>${formatINR(calc.igstAmount)}</span>
          </div>
        `;
      }
    }
  }

  function updateLivePreview(calc) {
    // Seller Info
    const sellerName = document.getElementById('seller-name')?.value.trim() || 'Your Business Name';
    const sellerGstin = document.getElementById('seller-gstin')?.value.trim() || '27AAAAA0000A1Z5';
    const sellerAddress = document.getElementById('seller-address')?.value.trim() || 'Business Address, City, State - PIN';
    const sellerPhone = document.getElementById('seller-phone')?.value.trim() || '+91 98765 43210';
    const sellerEmail = document.getElementById('seller-email')?.value.trim() || 'business@example.com';

    // Buyer Info
    const buyerName = document.getElementById('buyer-name')?.value.trim() || 'Customer / Client Name';
    const buyerGstin = document.getElementById('buyer-gstin')?.value.trim() || 'Not Provided / Unregistered';
    const buyerAddress = document.getElementById('buyer-address')?.value.trim() || 'Customer Address, City, State - PIN';
    const buyerPhone = document.getElementById('buyer-phone')?.value.trim() || '';
    const buyerEmail = document.getElementById('buyer-email')?.value.trim() || '';

    // Invoice Meta
    const invNumber = document.getElementById('inv-number')?.value.trim() || 'INV-2026-001';
    const invDate = document.getElementById('inv-date')?.value || new Date().toISOString().split('T')[0];
    const notes = document.getElementById('inv-notes')?.value.trim() || 'Payment is due within 15 days of invoice date. Thank you for your business.';
    const bankDetails = document.getElementById('inv-bank')?.value.trim() || 'Bank: State Bank of India\nA/C: 1234567890\nIFSC: SBIN0001234';

    // Render in Preview
    const pSellerName = document.getElementById('prev-seller-name');
    const pSellerGstin = document.getElementById('prev-seller-gstin');
    const pSellerAddr = document.getElementById('prev-seller-address');
    const pSellerContact = document.getElementById('prev-seller-contact');

    if (pSellerName) pSellerName.textContent = sellerName;
    if (pSellerGstin) pSellerGstin.textContent = `GSTIN: ${sellerGstin}`;
    if (pSellerAddr) pSellerAddr.textContent = sellerAddress;
    if (pSellerContact) pSellerContact.textContent = `Phone: ${sellerPhone} | Email: ${sellerEmail}`;

    const pInvNo = document.getElementById('prev-inv-number');
    const pInvDate = document.getElementById('prev-inv-date');
    if (pInvNo) pInvNo.textContent = invNumber;
    if (pInvDate) pInvDate.textContent = invDate;

    const pBuyerName = document.getElementById('prev-buyer-name');
    const pBuyerGstin = document.getElementById('prev-buyer-gstin');
    const pBuyerAddr = document.getElementById('prev-buyer-address');
    const pBuyerContact = document.getElementById('prev-buyer-contact');

    if (pBuyerName) pBuyerName.textContent = buyerName;
    if (pBuyerGstin) pBuyerGstin.textContent = `GSTIN: ${buyerGstin}`;
    if (pBuyerAddr) pBuyerAddr.textContent = buyerAddress;
    if (pBuyerContact) {
      const contactParts = [];
      if (buyerPhone) contactParts.push(`Phone: ${buyerPhone}`);
      if (buyerEmail) contactParts.push(`Email: ${buyerEmail}`);
      pBuyerContact.textContent = contactParts.join(' | ');
      pBuyerContact.style.display = contactParts.length ? 'block' : 'none';
    }

    // Render Preview Items Table
    const pTableBody = document.getElementById('prev-items-tbody');
    if (pTableBody) {
      if (calc.items.length === 0) {
        pTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 1.5rem;">No items added yet</td></tr>`;
      } else {
        pTableBody.innerHTML = calc.items.map(item => `
          <tr>
            <td><strong>${escapeHtml(item.desc)}</strong></td>
            <td style="text-align: right;">${item.qty}</td>
            <td style="text-align: right;">${formatINR(item.rate)}</td>
            <td style="text-align: right;">${item.discPercent > 0 ? item.discPercent + '%' : '-'}</td>
            <td style="text-align: right; font-weight: 600;">${formatINR(item.netAmount)}</td>
          </tr>
        `).join('');
      }
    }

    // Preview Totals
    const pSubtotal = document.getElementById('prev-subtotal');
    const pDiscount = document.getElementById('prev-discount');
    const pTaxable = document.getElementById('prev-taxable');
    const pTaxRows = document.getElementById('prev-tax-rows');
    const pGrandTotal = document.getElementById('prev-grand-total');
    const pWords = document.getElementById('prev-words');
    const pBank = document.getElementById('prev-bank');
    const pTerms = document.getElementById('prev-terms');

    if (pSubtotal) pSubtotal.textContent = formatINR(calc.subtotal);
    if (pDiscount) pDiscount.textContent = formatINR(calc.totalDiscount);
    if (pTaxable) pTaxable.textContent = formatINR(calc.taxableAmount);
    if (pGrandTotal) pGrandTotal.textContent = formatINR(calc.grandTotal);
    if (pWords) pWords.textContent = calc.words;
    if (pBank) pBank.textContent = bankDetails;
    if (pTerms) pTerms.textContent = notes;

    if (pTaxRows) {
      if (calc.taxType === 'cgst_sgst') {
        pTaxRows.innerHTML = `
          <div class="inv-t-row">
            <span>CGST (${calc.cgstRate}%):</span>
            <span>${formatINR(calc.cgstAmount)}</span>
          </div>
          <div class="inv-t-row">
            <span>SGST (${calc.sgstRate}%):</span>
            <span>${formatINR(calc.sgstAmount)}</span>
          </div>
        `;
      } else {
        pTaxRows.innerHTML = `
          <div class="inv-t-row">
            <span>IGST (${calc.igstRate}%):</span>
            <span>${formatINR(calc.igstAmount)}</span>
          </div>
        `;
      }
    }
  }

  /**
   * Client-side validation prior to printing/saving
   */
  function validateForm() {
    const sellerName = document.getElementById('seller-name')?.value.trim();
    const invNumber = document.getElementById('inv-number')?.value.trim();
    const buyerName = document.getElementById('buyer-name')?.value.trim();
    const itemRows = document.querySelectorAll('#items-tbody .item-row');

    if (!sellerName) {
      showToast('Please enter your Business / Seller Name.', 'error');
      document.getElementById('seller-name')?.focus();
      return false;
    }
    if (!invNumber) {
      showToast('Please specify an Invoice Number.', 'error');
      document.getElementById('inv-number')?.focus();
      return false;
    }
    if (!buyerName) {
      showToast('Please enter Buyer / Customer Name.', 'error');
      document.getElementById('buyer-name')?.focus();
      return false;
    }
    if (itemRows.length === 0) {
      showToast('Please add at least one product or service.', 'error');
      return false;
    }

    let itemsValid = true;
    itemRows.forEach(row => {
      const desc = row.querySelector('.item-desc').value.trim();
      const qty = parseFloat(row.querySelector('.item-qty').value);
      const rate = parseFloat(row.querySelector('.item-rate').value);

      if (!desc || isNaN(qty) || qty <= 0 || isNaN(rate) || rate < 0) {
        itemsValid = false;
      }
    });

    if (!itemsValid) {
      showToast('Please ensure all items have valid descriptions, quantities (>0), and rates.', 'error');
      return false;
    }

    return true;
  }

  /**
   * Trigger Browser Print Dialog / Save as PDF
   */
  function handlePrintOrPdf(isPdf = false) {
    if (!validateForm()) return;

    if (isPdf) {
      showToast('Opening print dialog. Select "Save as PDF" as your printer destination.', 'info');
    }

    setTimeout(() => {
      window.print();
    }, 250);
  }

  /**
   * Save Draft in LocalStorage
   */
  function saveDraftToLocalStorage() {
    const sellerName = document.getElementById('seller-name')?.value;
    const sellerGstin = document.getElementById('seller-gstin')?.value;
    const sellerAddress = document.getElementById('seller-address')?.value;
    const sellerPhone = document.getElementById('seller-phone')?.value;
    const sellerEmail = document.getElementById('seller-email')?.value;

    const buyerName = document.getElementById('buyer-name')?.value;
    const buyerGstin = document.getElementById('buyer-gstin')?.value;
    const buyerAddress = document.getElementById('buyer-address')?.value;
    const buyerPhone = document.getElementById('buyer-phone')?.value;
    const buyerEmail = document.getElementById('buyer-email')?.value;

    const invNumber = document.getElementById('inv-number')?.value;
    const invDate = document.getElementById('inv-date')?.value;
    const gstRate = document.getElementById('gst-rate-select')?.value;
    const taxType = document.querySelector('input[name="tax_type"]:checked')?.value;
    const notes = document.getElementById('inv-notes')?.value;
    const bank = document.getElementById('inv-bank')?.value;

    const itemRows = document.querySelectorAll('#items-tbody .item-row');
    const items = [];
    itemRows.forEach(row => {
      items.push({
        desc: row.querySelector('.item-desc').value,
        qty: row.querySelector('.item-qty').value,
        rate: row.querySelector('.item-rate').value,
        discount: row.querySelector('.item-discount').value
      });
    });

    const draft = {
      sellerName, sellerGstin, sellerAddress, sellerPhone, sellerEmail,
      buyerName, buyerGstin, buyerAddress, buyerPhone, buyerEmail,
      invNumber, invDate, gstRate, taxType, notes, bank,
      items,
      savedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      showToast('Invoice draft saved locally in your browser!', 'success');
    } catch (err) {
      showToast('Failed to save draft locally. Storage might be full.', 'error');
    }
  }

  /**
   * Load Draft from LocalStorage
   */
  function loadDraftFromLocalStorage() {
    try {
      const dataStr = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!dataStr) {
        showToast('No saved draft found in this browser.', 'error');
        return;
      }
      const draft = JSON.parse(dataStr);

      if (document.getElementById('seller-name')) document.getElementById('seller-name').value = draft.sellerName || '';
      if (document.getElementById('seller-gstin')) document.getElementById('seller-gstin').value = draft.sellerGstin || '';
      if (document.getElementById('seller-address')) document.getElementById('seller-address').value = draft.sellerAddress || '';
      if (document.getElementById('seller-phone')) document.getElementById('seller-phone').value = draft.sellerPhone || '';
      if (document.getElementById('seller-email')) document.getElementById('seller-email').value = draft.sellerEmail || '';

      if (document.getElementById('buyer-name')) document.getElementById('buyer-name').value = draft.buyerName || '';
      if (document.getElementById('buyer-gstin')) document.getElementById('buyer-gstin').value = draft.buyerGstin || '';
      if (document.getElementById('buyer-address')) document.getElementById('buyer-address').value = draft.buyerAddress || '';
      if (document.getElementById('buyer-phone')) document.getElementById('buyer-phone').value = draft.buyerPhone || '';
      if (document.getElementById('buyer-email')) document.getElementById('buyer-email').value = draft.buyerEmail || '';

      if (document.getElementById('inv-number')) document.getElementById('inv-number').value = draft.invNumber || '';
      if (document.getElementById('inv-date')) document.getElementById('inv-date').value = draft.invDate || '';
      if (document.getElementById('gst-rate-select')) document.getElementById('gst-rate-select').value = draft.gstRate || '18';
      if (document.getElementById('inv-notes')) document.getElementById('inv-notes').value = draft.notes || '';
      if (document.getElementById('inv-bank')) document.getElementById('inv-bank').value = draft.bank || '';

      if (draft.taxType) {
        const radio = document.querySelector(`input[name="tax_type"][value="${draft.taxType}"]`);
        if (radio) radio.checked = true;
      }

      // Restore items
      const tbody = document.getElementById('items-tbody');
      if (tbody && Array.isArray(draft.items) && draft.items.length > 0) {
        tbody.innerHTML = '';
        draft.items.forEach(it => {
          addItemRow(it.desc, it.qty, it.rate, it.discount);
        });
      }

      recalculateAndRender();
      showToast('Saved draft loaded successfully!', 'success');
    } catch (err) {
      showToast('Error parsing saved draft data.', 'error');
    }
  }

  /**
   * Reset Form to Clean Initial State
   */
  function clearInvoiceForm() {
    if (!confirm('Are you sure you want to clear the entire form? Unsaved changes will be lost.')) {
      return;
    }

    const form = document.getElementById('gst-invoice-form');
    if (form) form.reset();

    const tbody = document.getElementById('items-tbody');
    if (tbody) {
      tbody.innerHTML = '';
      addItemRow('', 1, 0, 0);
    }

    const dateInput = document.getElementById('inv-date');
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    const invNumberInput = document.getElementById('inv-number');
    if (invNumberInput) {
      invNumberInput.value = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    recalculateAndRender();
    showToast('Invoice form has been reset.', 'info');
  }

  /**
   * Fill Sample Data for Quick Preview
   */
  function fillSampleData() {
    document.getElementById('seller-name').value = 'TechCraft Digital Solutions LLP';
    document.getElementById('seller-gstin').value = '07AAAAA0000A1Z5';
    document.getElementById('seller-address').value = '402, Pinnacle Business Park, Connaught Place, New Delhi, Delhi - 110001';
    document.getElementById('seller-phone').value = '+91 98112 34567';
    document.getElementById('seller-email').value = 'billing@techcraftdigital.in';

    document.getElementById('buyer-name').value = 'Aura Retail Enterprises Pvt Ltd';
    document.getElementById('buyer-gstin').value = '07BBBBA1111B2Z8';
    document.getElementById('buyer-address').value = 'Plot 18, Okhla Phase III, Industrial Area, New Delhi - 110020';
    document.getElementById('buyer-phone').value = '+91 98711 98765';
    document.getElementById('buyer-email').value = 'accounts@auraretail.com';

    document.getElementById('inv-number').value = `INV-${new Date().getFullYear()}-1042`;
    document.getElementById('gst-rate-select').value = '18';
    document.querySelector('input[name="tax_type"][value="cgst_sgst"]').checked = true;

    const tbody = document.getElementById('items-tbody');
    tbody.innerHTML = '';
    addItemRow('Custom Cloud Software Architecture & Consulting', 1, 45000, 5);
    addItemRow('API Integration & GST Portal Sync Module', 2, 18500, 0);
    addItemRow('Annual Maintenance & Technical Support', 1, 15000, 10);

    document.getElementById('inv-bank').value = 'Bank: HDFC Bank Ltd\nA/C No: 50200012345678\nIFSC: HDFC0000123\nBranch: CP, New Delhi';
    document.getElementById('inv-notes').value = '1. Payment due within 15 days of invoice date.\n2. Invoices not paid on time are subject to 1.5% interest per month.';

    recalculateAndRender();
    showToast('Sample invoice data loaded!', 'success');
  }

  // =========================================================================
  // 6. Contact Form Frontend Handler (No Backend / Demo Notice)
  // =========================================================================
  function initContactForm() {
    const contactForm = document.getElementById('contact-us-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name')?.value.trim();
      const email = document.getElementById('contact-email')?.value.trim();
      const subject = document.getElementById('contact-subject')?.value.trim();
      const message = document.getElementById('contact-message')?.value.trim();

      if (!name || !email || !subject || !message) {
        showToast('Please fill out all required contact fields.', 'error');
        return;
      }

      showToast(`Thank you, ${name}! Your demonstration message was captured locally. This frontend demo does not send external emails.`, 'success');
      contactForm.reset();
    });
  }

  // =========================================================================
  // 7. Initialize Everything on DOMContentLoaded
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileMenu();
    initInvoiceGenerator();
    initContactForm();
  });

})();
