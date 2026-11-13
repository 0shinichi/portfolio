(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const W = window.WORKS, C = window.CONTACTS;

  const grid = $('#grid');
  grid.innerHTML = W.map(w => `
    <button class="card ${w.side}" data-id="${w.id}" data-side="${w.side}">
      <div class="ph"><img src="img/${w.cover}.jpg" style="${w.fit ? 'object-fit:' + w.fit + ';' : ''}${w.pos ? 'object-position:' + w.pos : ''}" alt="${esc(w.title)} — ${esc(w.kind)}" loading="lazy"></div>
      <div class="meta"><div><h3>${esc(w.title)}</h3><p class="kind">${esc(w.kind)}</p></div><span class="tg">${esc(w.tag)}</span></div>
    </button>`).join('');

  const setFilter = f => {
    $$('.filters button').forEach(b => b.classList.toggle('on', b.dataset.f === f));
    $$('.card').forEach(c => { c.hidden = f !== 'all' && c.dataset.side !== f; });
  };
  $$('.filters button').forEach(b => b.addEventListener('click', () => setFilter(b.dataset.f)));
  $$('[data-filter]').forEach(a => a.addEventListener('click', () => setFilter(a.dataset.filter)));

  const modal = $('#modal');
  let last = null;
  const open = id => {
    const w = W.find(x => x.id === id); if (!w) return;
    $('#mTag').textContent = w.tag;
    $('#mTitle').textContent = w.title;
    $('#mKind').textContent = w.kind;
    const cs = (window.CASES || {})[w.id]; if (cs) { $('#mText').innerHTML = `<b class="m-head">${esc(cs.head)}</b>` + CASE_LABELS.map(([k, l]) => `<span class="m-row"><i>${l}</i>${esc(cs[k])}</span>`).join(''); } else { $('#mText').textContent = w.text; }
    $('#mLink').innerHTML = w.link ? `<a href="${w.link}" target="_blank" rel="noopener">Открыть живой сайт ↗</a>` : '';
    const vid = w.video ? `<video src="video/${w.video}.mp4" autoplay muted loop playsinline></video>` : '';
    $('#mMedia').innerHTML = (w.id === 'shini' ? vid : '') + w.imgs.map(i => `<img src="img/${i}.jpg" alt="${esc(w.title)}" loading="lazy">`).join('') + (w.id !== 'shini' ? vid : '');
    modal.hidden = false; document.body.classList.add('lock');
    $('#mClose').focus();
    history.replaceState(null, '', '#' + id);
  };
  const close = () => {
    modal.hidden = true; document.body.classList.remove('lock');
    $('#mMedia').innerHTML = '';
    history.replaceState(null, '', location.pathname);
    if (last) last.focus();
  };
  grid.addEventListener('click', e => { const c = e.target.closest('.card'); if (c) { last = c; open(c.dataset.id); } });
  $('#mClose').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) close(); });
  if (location.hash && W.some(w => '#' + w.id === location.hash)) open(location.hash.slice(1));

  const links = [];
  if (C.telegram) links.push(`<a href="https://t.me/${C.telegram}" target="_blank" rel="noopener">Telegram</a>`);
  if (C.channel) links.push(`<a href="https://t.me/${C.channel}" target="_blank" rel="noopener">Канал</a>`);
  if (C.instagram) links.push(`<a href="https://instagram.com/${C.instagram}" target="_blank" rel="noopener">Instagram</a>`);
  if (C.email) links.push(`<a href="mailto:${C.email}">${C.email}</a>`);
  $('#contacts').innerHTML = links.length ? links.join('') : '<span>Контакты появятся здесь совсем скоро</span>';

  const form = $('#bf');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(form);
    if (!d.get('name').trim() || !d.get('contact').trim()) { $('#err').hidden = false; return; }
    $('#err').hidden = true;
    const rows = [
      ['Имя', d.get('name')], ['Связь', d.get('contact')], ['Задача', d.getAll('task').join(', ')],
      ['О бизнесе', d.get('about')], ['Что должно получиться', d.get('goal')], ['Примеры', d.get('refs')],
      ['Срок', d.get('deadline')], ['Бюджет', d.get('budget')]
    ].filter(r => String(r[1]).trim());
    const text = 'Бриф для Дарьи Поливкиной\n\n' + rows.map(r => `${r[0]}: ${r[1]}`).join('\n');
    $('#outText').value = text;
    const send = [];
    if (C.telegram) send.push(`<a href="https://t.me/${C.telegram}" target="_blank" rel="noopener">Написать в Telegram</a>`);
    if (C.email) send.push(`<a href="mailto:${C.email}?subject=${encodeURIComponent('Бриф')}&body=${encodeURIComponent(text)}">Отправить на почту</a>`);
    $('#sendLinks').innerHTML = send.join(' · ');
    $('#out').hidden = false;
    $('#out').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  $('#copy').addEventListener('click', async () => {
    const t = $('#outText');
    try { await navigator.clipboard.writeText(t.value); } catch (_) { t.select(); document.execCommand('copy'); }
    $('#copy').textContent = 'Скопировано';
    setTimeout(() => { $('#copy').textContent = 'Скопировать'; }, 2000);
  });
})();
