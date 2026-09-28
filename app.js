const defaults = { spend: 100000, revenue: 450000, margin: 40, leads: 800, customers: 120 };
const ids = Object.keys(defaults);
const inputs = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));

const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function value(id) {
  return Math.max(0, Number(inputs[id].value) || 0);
}

function safeDivide(a, b) {
  return b > 0 ? a / b : null;
}

function money(value) {
  return value === null || !Number.isFinite(value) ? '—' : `${number.format(value)} ₽`;
}

function percent(value) {
  return value === null || !Number.isFinite(value) ? '—' : `${number.format(value)}%`;
}

function calculate() {
  const spend = value('spend');
  const revenue = value('revenue');
  const margin = Math.min(value('margin'), 100) / 100;
  const leads = value('leads');
  const customers = value('customers');

  const grossProfit = revenue * margin;
  const profit = grossProfit - spend;
  const roas = safeDivide(revenue, spend);
  const romi = safeDivide(profit, spend);
  const cac = safeDivide(spend, customers);
  const cpl = safeDivide(spend, leads);
  const conversion = safeDivide(customers * 100, leads);
  const aov = safeDivide(revenue, customers);
  const breakeven = safeDivide(spend, margin);
  const warning = document.getElementById('form-warning');

  if (customers > leads && leads > 0) {
    warning.textContent = 'Клиентов не может быть больше, чем лидов. Проверьте значения воронки.';
    warning.hidden = false;
  } else if (margin === 0) {
    warning.textContent = 'При нулевой маржинальности реклама не может окупиться.';
    warning.hidden = false;
  } else {
    warning.hidden = true;
  }

  document.getElementById('roas').textContent = roas === null ? '—' : `${decimal.format(roas)}×`;
  document.getElementById('romi').textContent = romi === null ? '—' : percent(romi * 100);
  document.getElementById('profit').textContent = money(profit);
  document.getElementById('cac').textContent = money(cac);
  document.getElementById('cpl').textContent = money(cpl);
  document.getElementById('conversion').textContent = percent(conversion);
  document.getElementById('aov').textContent = money(aov);
  document.getElementById('breakeven').textContent = money(breakeven);
  document.getElementById('funnel-label').textContent = `${number.format(leads)} лидов → ${number.format(customers)} клиентов`;
  document.getElementById('funnel-bar').style.width = `${Math.min(conversion || 0, 100)}%`;

  const status = document.getElementById('status');
  status.textContent = profit >= 0 ? 'Окупаемая' : 'Убыточная';
  status.classList.toggle('negative', profit < 0);

  const caption = document.getElementById('romi-caption');
  if (romi === null) {
    caption.textContent = 'Укажите рекламные расходы, чтобы рассчитать окупаемость';
  } else if (romi >= 0) {
    caption.textContent = `Каждый вложенный рубль принёс ${decimal.format(romi)} ₽ прибыли`;
  } else {
    caption.textContent = `Каждый вложенный рубль принёс ${decimal.format(Math.abs(romi))} ₽ убытка`;
  }
}

async function copyResult() {
  const summary = [
    'Результат маркетингового расчёта',
    `ROAS: ${document.getElementById('roas').textContent}`,
    `ROMI: ${document.getElementById('romi').textContent}`,
    `Прибыль: ${document.getElementById('profit').textContent}`,
    `CAC: ${document.getElementById('cac').textContent}`,
    `CPL: ${document.getElementById('cpl').textContent}`,
    `Конверсия: ${document.getElementById('conversion').textContent}`
  ].join('\n');
  const button = document.getElementById('copy-result');
  try {
    await navigator.clipboard.writeText(summary);
    button.querySelector('span').textContent = 'Результат скопирован';
  } catch {
    button.querySelector('span').textContent = 'Не удалось скопировать';
  }
  window.setTimeout(() => { button.querySelector('span').textContent = 'Скопировать результат'; }, 1800);
}

ids.forEach((id) => inputs[id].addEventListener('input', calculate));
document.getElementById('reset').addEventListener('click', () => {
  ids.forEach((id) => { inputs[id].value = defaults[id]; });
  calculate();
});
document.getElementById('copy-result').addEventListener('click', copyResult);

calculate();
