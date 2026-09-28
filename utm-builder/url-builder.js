// Kept independent of the page so URL edge cases can be checked with Node.js.
function buildUtmUrl(fields) {
  const values = Object.fromEntries(['website', 'source', 'medium', 'campaign'].map((key) => [key, String(fields[key] ?? '').trim()]));
  const errors = {};
  const messages = { website: 'Введите адрес сайта.', source: 'Укажите источник трафика.', medium: 'Укажите канал трафика.', campaign: 'Укажите название кампании.' };
  for (const key of Object.keys(values)) {
    if (!values[key]) errors[key] = messages[key];
    else if (/[\u0000-\u001f\u007f]/.test(values[key])) errors[key] = 'Уберите переносы строк и управляющие символы.';
  }

  let target;
  if (values.website && !errors.website) {
    try {
      let address = values.website;
      const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(address);
      const isHostWithPort = /^[^/?#:]+:\d+(?:[/?#]|$)/.test(address);
      if (!hasScheme || isHostWithPort) address = `https://${address.replace(/^\/\//, '')}`;
      if (!/^https?:\/\//i.test(address) || /\\/.test(address)) throw new Error('invalid address');
      target = new URL(address);
      const hostname = target.hostname;
      const isHostname = hostname === 'localhost' || hostname.startsWith('[') || (hostname.includes('.') && hostname.split('.').every((label) => /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label)));
      if (!isHostname || target.username || target.password) throw new Error('invalid host');
    } catch {
      errors.website = 'Введите корректный http:// или https:// адрес, например example.com.';
    }
  }
  if (Object.keys(errors).length) return { url: '', values, errors };

  const tags = { utm_source: values.source, utm_medium: values.medium, utm_campaign: values.campaign };
  // Preserve unrelated query values exactly (including their existing encoding).
  const parts = target.search.slice(1).split('&').filter((part) => part && !Object.keys(tags).some((key) => new URLSearchParams(part).has(key)));
  parts.push(new URLSearchParams(tags).toString());
  target.search = parts.join('&');
  return { url: target.href, values, errors };
}

if (typeof module !== 'undefined' && module.exports) module.exports = { buildUtmUrl };
