(() => {
  const form = document.getElementById('utm-form');
  const keys = ['website', 'source', 'medium', 'campaign'];
  const fields = Object.fromEntries(keys.map((key) => [key, document.getElementById(key)]));
  const output = document.getElementById('result-url');
  const copyButton = document.getElementById('copy-link');
  const feedback = document.getElementById('copy-feedback');
  const touched = new Set();
  let currentUrl = '';
  let revision = 0;

  function render() {
    revision += 1;
    feedback.textContent = '';
    const result = buildUtmUrl(Object.fromEntries(keys.map((key) => [key, fields[key].value])));
    currentUrl = result.url;
    output.value = currentUrl;
    copyButton.disabled = !currentUrl;
    const filled = keys.filter((key) => result.values[key] && !result.errors[key]).length;
    document.getElementById('link-status').textContent = currentUrl ? 'Готово' : `${filled} из 4`;
    document.getElementById('result-hint').textContent = currentUrl
      ? 'Скопируйте полную ссылку — она готова к размещению.'
      : 'Введите адрес сайта, источник, канал и название кампании.';
    for (const key of keys) {
      const visibleError = touched.has(key) && result.errors[key];
      const errorNode = document.getElementById(`${key}-error`);
      errorNode.textContent = visibleError || '';
      errorNode.hidden = !visibleError;
      fields[key].setAttribute('aria-invalid', visibleError ? 'true' : 'false');
      if (key !== 'website') document.getElementById(`preview-${key}`).textContent = result.values[key] || '—';
    }
    return result;
  }

  for (const key of keys) {
    fields[key].addEventListener('input', render);
    fields[key].addEventListener('blur', () => { touched.add(key); render(); });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    keys.forEach((key) => touched.add(key));
    const result = render();
    const invalid = keys.find((key) => result.errors[key]);
    if (invalid) fields[invalid].focus();
    else { output.focus(); output.select(); }
  });

  form.addEventListener('reset', (event) => {
    event.preventDefault();
    keys.forEach((key) => { fields[key].value = ''; });
    touched.clear();
    render();
    fields.website.focus();
  });

  document.getElementById('fill-example').addEventListener('click', () => {
    const example = { website: 'https://example.com/catalog', source: 'yandex', medium: 'cpc', campaign: 'autumn_sale' };
    keys.forEach((key) => { fields[key].value = example[key]; });
    touched.clear();
    render();
  });

  copyButton.addEventListener('click', async () => {
    if (!currentUrl) return;
    const copiedUrl = currentUrl;
    const copyRevision = revision;
    try {
      await navigator.clipboard.writeText(copiedUrl);
      if (copyRevision === revision) feedback.textContent = 'Ссылка скопирована';
    } catch {
      if (copyRevision !== revision) return;
      output.focus();
      output.select();
      feedback.textContent = 'Ссылка выделена. Нажмите Ctrl+C или ⌘C, чтобы скопировать её.';
    }
  });

  render();
})();
