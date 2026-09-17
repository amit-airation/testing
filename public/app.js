const STORAGE = {
  adminKey: 'hirance.adminKey',
  webhookSecret: 'hirance.webhookSecret',
  roundId: 'hirance.roundId',
};

function $(id) {
  return document.getElementById(id);
}

function loadKeys() {
  if ($('adminKey')) $('adminKey').value = localStorage.getItem(STORAGE.adminKey) || '';
  if ($('webhookSecret')) $('webhookSecret').value = localStorage.getItem(STORAGE.webhookSecret) || '';
}

function saveKeys() {
  localStorage.setItem(STORAGE.adminKey, $('adminKey')?.value.trim() || '');
  localStorage.setItem(STORAGE.webhookSecret, $('webhookSecret')?.value.trim() || '');
}

function adminHeaders() {
  saveKeys();
  const key = localStorage.getItem(STORAGE.adminKey) || '';
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}

function webhookHeaders() {
  saveKeys();
  const key = localStorage.getItem(STORAGE.webhookSecret) || '';
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}

function showLog(title, data) {
  const logTitle = $('logTitle');
  const logBody = $('logBody');
  if (logTitle) logTitle.textContent = title;
  if (logBody) logBody.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  showLog(`${options.method || 'GET'} ${url} → ${response.status}`, body);
  if (!response.ok) {
    const message = body?.message || body?.error || response.statusText;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }
  return body;
}

function adminGet(path) {
  return request(path, { headers: adminHeaders() });
}

function adminSend(method, path, body) {
  return request(path, {
    method,
    headers: adminHeaders(),
    body: body == null ? undefined : JSON.stringify(body),
  });
}

function formatMs(ms) {
  if (ms == null) return '—';
  const total = Math.max(0, Math.floor(Number(ms) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h) return `${h}h ${m}m ${s}s`;
  if (m) return `${m}m ${s}s`;
  return `${s}s`;
}

function badge(status) {
  return `<span class="badge ${status || ''}">${status || 'n/a'}</span>`;
}

function currentRoundId() {
  return localStorage.getItem(STORAGE.roundId) || $('roundId')?.value || '';
}

function setRoundId(id) {
  if (id == null || id === '') return;
  localStorage.setItem(STORAGE.roundId, String(id));
  document.querySelectorAll('[data-round-id]').forEach((el) => {
    el.value = String(id);
  });
}

function renderNav(active) {
  const nav = $('nav');
  if (!nav) return;
  const links = [
    ['index.html', 'Keys & rounds'],
    ['details.html', 'Round details'],
    ['participants.html', 'Participants'],
    ['webhook.html', 'Webhook'],
    ['events.html', 'Events'],
  ];
  nav.innerHTML = links
    .map(
      ([href, label]) =>
        `<a class="${active === href ? 'active' : ''}" href="${href}">${label}</a>`,
    )
    .join('');
}

async function loadRoundsInto(selectId) {
  const select = $(selectId);
  if (!select) return [];
  const rounds = await adminGet('/admin/rounds');
  const list = Array.isArray(rounds) ? rounds : [];
  const selected = currentRoundId();
  select.innerHTML = list
    .map(
      (round) =>
        `<option value="${round.id}" ${String(round.id) === String(selected) ? 'selected' : ''}>#${round.id} ${round.name} (${round.status})</option>`,
    )
    .join('');
  if (select.value) setRoundId(select.value);
  return list;
}

window.HiranceTest = {
  $,
  loadKeys,
  saveKeys,
  adminGet,
  adminSend,
  request,
  webhookHeaders,
  formatMs,
  badge,
  currentRoundId,
  setRoundId,
  renderNav,
  loadRoundsInto,
  showLog,
};
