const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.primary-nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    nav.classList.toggle('is-open', !isOpen);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
      nav.classList.remove('is-open');
    });
  });
}

const tabs = document.querySelector('#sample-tabs');
const panel = document.querySelector('#sample-panel');

if (tabs && panel) {
  const money = (value) => `KES ${Math.round(value).toLocaleString('en-KE')}`;
  const number = (value) => Math.max(0, Number(value) || 0);
  const table = (headings, rows, foot = '') => `<div class="sheet-scroll"><table class="sheet-table"><thead><tr>${headings.map((item) => `<th>${item}</th>`).join('')}</tr></thead><tbody>${rows}</tbody>${foot ? `<tfoot>${foot}</tfoot>` : ''}</table></div>`;
  const input = (id, value, label) => `<input class="sheet-input" id="${id}" type="number" min="0" step="100" value="${value}" aria-label="${label}">`;
  const metric = (label, id, value = '—') => `<div class="sheet-metric"><span>${label}</span><strong id="${id}">${value}</strong></div>`;
  const intro = (title, copy) => `<div class="sheet-heading"><div><h3>${title}</h3><p>${copy}</p></div><span class="sheet-label">FICTIONAL SAMPLE</span></div>`;

  const projects = [
    { id: 'sales', icon: '↗', name: 'Sales & expenses', sub: 'Weekly performance', render: sales },
    { id: 'cashbook', icon: '⇅', name: 'Cashbook', sub: 'Receipts & payments', render: cashbook },
    { id: 'bank', icon: '↔', name: 'Bank reconciliation', sub: 'Match both balances', render: reconciliation },
    { id: 'stock', icon: '▤', name: 'Inventory tracker', sub: 'Stock & reorder levels', render: inventory },
    { id: 'payroll', icon: '%', name: 'Payroll calculator', sub: 'Illustrative deductions', render: payroll },
    { id: 'trial', icon: '✓', name: 'Trial balance', sub: 'Debit & credit check', render: trialBalance }
  ];

  tabs.innerHTML = projects.map((project, index) => `<button class="sample-tab" id="sample-tab-${project.id}" type="button" role="tab" aria-selected="false" aria-controls="sample-panel" tabindex="-1" data-index="${index}"><span class="sample-tab-icon" aria-hidden="true">${project.icon}</span><span><strong>${project.name}</strong><small>${project.sub}</small></span></button>`).join('');

  let active = 0;
  function show(index) {
    active = (index + projects.length) % projects.length;
    const project = projects[active];
    tabs.querySelectorAll('.sample-tab').forEach((tab, tabIndex) => {
      tab.setAttribute('aria-selected', String(tabIndex === active));
      tab.tabIndex = tabIndex === active ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', `sample-tab-${project.id}`);
    panel.innerHTML = '';
    const content = project.render();
    if (content !== undefined) panel.innerHTML = content;
  }

  tabs.addEventListener('click', (event) => {
    const tab = event.target.closest('.sample-tab');
    if (tab) show(Number(tab.dataset.index));
  });
  tabs.addEventListener('keydown', (event) => {
    if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? projects.length - 1 : active + (['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1);
    show(next);
    tabs.querySelector(`[data-index="${active}"]`).focus();
  });

  function sales() {
    const days = [['Mon', 18400, 7200], ['Tue', 15900, 6100], ['Wed', 21300, 8450], ['Thu', 19750, 7900], ['Fri', 28600, 11300], ['Sat', 41200, 15800], ['Sun', 36500, 13900]];
    const rows = days.map(([day, sold, cost], i) => `<tr><td>${day}</td><td>${input(`sale-${i}`, sold, `${day} sales`)}</td><td>${input(`cost-${i}`, cost, `${day} expenses`)}</td><td class="num" id="profit-${i}"></td></tr>`).join('');
    panel.innerHTML = intro('Sales & expense tracker', 'Change any sample figure. Daily profit, totals, margin, and the chart update as you type.') + table(['Day', 'Sales (KES)', 'Expenses (KES)', 'Profit (KES)'], rows, '<tr><td>Week total</td><td id="sales-total"></td><td id="cost-total"></td><td id="profit-total"></td></tr>') + `<div class="sheet-metrics">${metric('Profit margin', 'sales-margin')}${metric('Best day', 'sales-best')}${metric('Average daily sales', 'sales-average')}</div><div class="sample-bars" id="sales-chart" role="img" aria-label="Profit by day"></div>`;
    const calculate = () => {
      let totalSales = 0; let totalCosts = 0; const profits = [];
      days.forEach(([day], i) => {
        const sold = number(panel.querySelector(`#sale-${i}`).value);
        const cost = number(panel.querySelector(`#cost-${i}`).value);
        const profit = sold - cost;
        totalSales += sold; totalCosts += cost; profits.push(profit);
        panel.querySelector(`#profit-${i}`).textContent = money(profit);
      });
      const max = Math.max(...profits);
      panel.querySelector('#sales-total').textContent = money(totalSales);
      panel.querySelector('#cost-total').textContent = money(totalCosts);
      panel.querySelector('#profit-total').textContent = money(totalSales - totalCosts);
      panel.querySelector('#sales-margin').textContent = `${totalSales ? ((totalSales - totalCosts) / totalSales * 100).toFixed(1) : '0.0'}%`;
      panel.querySelector('#sales-best').textContent = `${days[profits.indexOf(max)][0]} · ${money(max)}`;
      panel.querySelector('#sales-average').textContent = money(totalSales / 7);
      panel.querySelector('#sales-chart').innerHTML = profits.map((profit, i) => `<div class="sample-bar"><span>${days[i][0]}</span><i style="height:${Math.max(3, Math.max(0, profit) / (max || 1) * 70)}px"></i></div>`).join('');
      panel.querySelector('#sales-chart').setAttribute('aria-label', `Daily profit: ${profits.map((profit, i) => `${days[i][0]} ${money(profit)}`).join('; ')}.`);
    };
    panel.querySelectorAll('input').forEach((field) => field.addEventListener('input', calculate));
    calculate();
  }

  function cashbook() {
    const entries = [['01 Mar', 'Opening balance', 120000, 0], ['02 Mar', 'Cash sales', 18400, 0], ['02 Mar', 'Gas refill', 0, 3200], ['03 Mar', 'M-Pesa sales', 15900, 0], ['03 Mar', 'Supplier payment', 0, 22000], ['04 Mar', 'Cash sales', 21300, 0], ['04 Mar', 'Wages', 0, 9600], ['05 Mar', 'M-Pesa sales', 19750, 0], ['05 Mar', 'Electricity', 0, 4350]];
    let balance = 0; let received = 0; let paid = 0;
    const rows = entries.map(([date, detail, receipt, payment]) => {
      balance += receipt - payment; received += receipt; paid += payment;
      return `<tr><td>${date}</td><td>${detail}</td><td class="num">${receipt ? money(receipt) : '—'}</td><td class="num">${payment ? money(payment) : '—'}</td><td class="num">${money(balance)}</td></tr>`;
    }).join('');
    return intro('Cashbook system', 'A sample record of receipts and payments with a running balance carried forward.') + table(['Date', 'Details', 'Receipts', 'Payments', 'Balance'], rows, `<tr><td colspan="2">Totals</td><td>${money(received)}</td><td>${money(paid)}</td><td>${money(balance)}</td></tr>`) + `<div class="sheet-metrics">${metric('Opening balance', 'cash-opening', money(120000))}${metric('Closing balance', 'cash-closing', money(balance))}${metric('Net movement', 'cash-net', money(received - 120000 - paid))}</div>`;
  }

  function reconciliation() {
    const bankItems = [{ name: 'Deposit in transit', note: 'Banked 05 Mar, not yet on statement', amount: 18000 }, { name: 'Unpresented cheque 00417', note: 'Supplier payment, 03 Mar', amount: -24500 }, { name: 'Unpresented cheque 00418', note: 'Supplier payment, 04 Mar', amount: -8200 }];
    const bookItems = [{ name: 'Bank charges', note: 'On statement, not in cashbook', amount: -1500 }, { name: 'Direct customer deposit', note: 'On statement, not in cashbook', amount: 4000 }];
    panel.innerHTML = intro('Bank reconciliation', 'Tick each sample difference to apply it to the correct side and compare adjusted balances.') + `<div class="sheet-metrics">${metric('Balance per bank', 'bank-start', money(201450))}${metric('Balance per cashbook', 'book-start', money(184250))}</div><p><strong>Timing differences — adjust bank</strong></p>${reconciliationRows(bankItems, 'bank-item')}<p><strong>Items not yet in cashbook — adjust cashbook</strong></p>${reconciliationRows(bookItems, 'book-item')}<div class="sheet-metrics">${metric('Adjusted bank', 'bank-adjusted')}${metric('Adjusted cashbook', 'book-adjusted')}${metric('Difference', 'bank-difference')}</div><p class="sheet-note" id="bank-message" aria-live="polite"></p>`;
    const calculate = () => {
      let bank = 201450; let book = 184250;
      panel.querySelectorAll('[data-bucket]:checked').forEach((item) => {
        if (item.dataset.bucket === 'bank') bank += Number(item.dataset.amount);
        else book += Number(item.dataset.amount);
      });
      const difference = bank - book;
      panel.querySelector('#bank-adjusted').textContent = money(bank);
      panel.querySelector('#book-adjusted').textContent = money(book);
      panel.querySelector('#bank-difference').textContent = money(Math.abs(difference));
      panel.querySelector('#bank-message').textContent = difference === 0 ? 'Reconciled: the adjusted balances agree.' : 'Select the remaining explained items until the adjusted balances agree.';
    };
    panel.querySelectorAll('[data-bucket]').forEach((check) => check.addEventListener('change', calculate));
    calculate();
  }

  function reconciliationRows(items, bucket) {
    return `<div class="sheet-scroll"><table class="sheet-table"><tbody>${items.map((item) => `<tr><td><label><input type="checkbox" data-bucket="${bucket === 'bank-item' ? 'bank' : 'book'}" data-amount="${item.amount}"> ${item.name}<br><small>${item.note}</small></label></td><td class="num">${item.amount < 0 ? '−' : '+'}${money(Math.abs(item.amount))}</td></tr>`).join('')}</tbody></table></div>`;
  }

  function inventory() {
    const stock = [['Bottled water 500ml', 120, 240, 310, 60], ['Soda 300ml', 96, 192, 205, 50], ['Firewood bundles', 40, 60, 78, 15], ['Charcoal 2kg', 30, 40, 61, 12], ['Tilapia (kg)', 25, 80, 96, 10]];
    const rows = stock.map(([name, opening, bought, sold, reorder], i) => `<tr><td>${name}</td><td class="num">${opening}</td><td class="num">${bought}</td><td>${input(`units-sold-${i}`, sold, `${name} units sold`)}</td><td class="num" id="closing-${i}"></td><td class="num">${reorder}</td><td id="stock-status-${i}"></td></tr>`).join('');
    panel.innerHTML = intro('Inventory tracker', 'Edit units sold to calculate closing stock and flag products at or below their reorder level.') + table(['Item', 'Opening', 'Bought', 'Sold', 'Closing', 'Reorder at', 'Status'], rows) + `<div class="sheet-metrics">${metric('Items at reorder level', 'reorder-count')}${metric('Formula', 'stock-formula', 'Opening + bought − sold')}</div>`;
    const calculate = () => {
      let low = 0;
      stock.forEach(([name, opening, bought, , reorder], i) => {
        const closing = opening + bought - number(panel.querySelector(`#units-sold-${i}`).value);
        const status = closing < 0 ? 'Check count' : closing <= reorder ? 'Reorder' : 'OK';
        if (closing <= reorder) low += 1;
        panel.querySelector(`#closing-${i}`).textContent = closing;
        panel.querySelector(`#stock-status-${i}`).textContent = status;
        panel.querySelector(`#stock-status-${i}`).className = closing <= reorder ? 'sheet-status is-alert' : 'sheet-status';
      });
      panel.querySelector('#reorder-count').textContent = `${low} of ${stock.length}`;
    };
    panel.querySelectorAll('input').forEach((field) => field.addEventListener('input', calculate));
    calculate();
  }

  function payroll() {
    panel.innerHTML = intro('Payroll calculator', 'Enter a sample monthly gross amount to see an illustrative gross-to-net breakdown.') + `<label for="gross-pay"><strong>Monthly gross salary (KES)</strong></label><p>${input('gross-pay', 55000, 'Monthly gross salary in Kenya shillings')}</p>${table(['Line item', 'Sample amount (KES)'], '<tr><td>Gross pay</td><td class="num" id="pay-gross"></td></tr><tr><td>NSSF (illustrative 6%)</td><td class="num" id="pay-nssf"></td></tr><tr><td>SHIF (illustrative 2.75%)</td><td class="num" id="pay-shif"></td></tr><tr><td>Housing levy (illustrative 1.5%)</td><td class="num" id="pay-housing"></td></tr><tr><td>PAYE after sample relief</td><td class="num" id="pay-paye"></td></tr>', '<tr><td>Estimated net pay</td><td class="num" id="pay-net"></td></tr>')}<p class="sheet-note">This is a learning example, not a current payroll tool or tax advice. The deductions and rates shown are assumptions from a sample workbook. Confirm current rules with the relevant authorities before real use.</p>`;
    const calculate = () => {
      const gross = number(panel.querySelector('#gross-pay').value);
      const nssf = Math.min(gross, 108000) * 0.06;
      const shif = gross ? Math.max(300, gross * 0.0275) : 0;
      const housing = gross * 0.015;
      const taxable = Math.max(0, gross - nssf - shif - housing);
      let remaining = taxable; let tax = 0;
      [[24000, .10], [8333, .25], [467667, .30], [300000, .325], [Infinity, .35]].forEach(([limit, rate]) => {
        const portion = Math.min(remaining, limit); tax += portion * rate; remaining -= portion;
      });
      const formatDeduction = (amount) => `−${money(amount)}`;
      panel.querySelector('#pay-gross').textContent = money(gross);
      panel.querySelector('#pay-nssf').textContent = formatDeduction(nssf);
      panel.querySelector('#pay-shif').textContent = formatDeduction(shif);
      panel.querySelector('#pay-housing').textContent = formatDeduction(housing);
      panel.querySelector('#pay-paye').textContent = formatDeduction(Math.max(0, tax - 2400));
      panel.querySelector('#pay-net').textContent = money(gross - nssf - shif - housing - Math.max(0, tax - 2400));
    };
    panel.querySelector('#gross-pay').addEventListener('input', calculate);
    calculate();
  }

  function trialBalance() {
    const accounts = [['Cash at hand', 42300, 0], ['Cash at bank', 186750, 0], ['Trade debtors', 64000, 0], ['Stock', 128500, 0], ['Equipment', 250000, 0], ['Trade creditors', 0, 71200], ['Bank loan', 0, 150000], ['Capital', 0, 400000], ['Sales', 0, 612400], ['Purchases', 398000, 0], ['Wages', 96000, 0], ['Rent', 60000, 0], ['Utilities', 18750, 0], ['Accrued expenses', 0, 10700]];
    let hasError = false;
    function render() {
      let debit = 0; let credit = 0;
      const rows = accounts.map(([name, dr, cr]) => {
        if (hasError && name === 'Utilities') dr = 17850;
        debit += dr; credit += cr;
        return `<tr><td>${name}</td><td class="num">${dr ? money(dr) : '—'}</td><td class="num">${cr ? money(cr) : '—'}</td></tr>`;
      }).join('');
      panel.innerHTML = intro('Trial balance', 'Compare debit and credit totals. The button introduces a small sample posting error so the difference is visible.') + table(['Account', 'Debit (KES)', 'Credit (KES)'], rows, `<tr><td>Totals</td><td class="num">${money(debit)}</td><td class="num">${money(credit)}</td></tr>`) + `<div class="sheet-metrics"><div class="sheet-metric"><span>Status</span><strong class="${debit === credit ? 'sheet-status' : 'sheet-status is-alert'}">${debit === credit ? 'Balanced ✓' : `Out by ${money(Math.abs(debit - credit))}`}</strong></div></div><button class="sheet-button" type="button" id="trial-toggle">${hasError ? 'Correct the sample error' : 'Introduce a sample posting error'}</button>`;
      panel.querySelector('#trial-toggle').addEventListener('click', () => { hasError = !hasError; render(); });
    }
    render();
  }

  show(0);
}

