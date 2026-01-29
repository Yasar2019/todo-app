/* Pro Todo — interaction + logic */
(function () {
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');
  const empty = document.getElementById('empty');
  const card = document.getElementById('card');
  const glare = document.getElementById('glare');

  // State
  let todos = loadTodos();
  let filter = loadFilter();
  let theme = loadTheme();
  applyTheme(theme);

  // Initial render
  render();

  // Add todo
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) {
      input.classList.add('invalid');
      setTimeout(() => input.classList.remove('invalid'), 320);
      return;
    }
    addTodo(text);
    input.value = '';
    input.focus();
  });

  // Delegation: delete and toggle
  list.addEventListener('click', (e) => {
    const del = e.target.closest('.delete');
    const tog = e.target.closest('.toggle');
    const li = (del || tog)?.closest('.todo-item');
    const id = li?.dataset?.id;
    if (!li || !id) return;

    if (del) {
      todos = todos.filter(t => String(t.id) !== String(id));
      saveTodos();
      // Enhanced slide-out animation
      li.style.opacity = '0';
      li.style.transform = 'translateX(-30px) scale(0.9)';
      li.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 1, 1)';
      setTimeout(render, 320);
      return;
    }

    if (tog) {
      todos = todos.map(t => String(t.id) === String(id) ? { ...t, done: !t.done } : t);
      saveTodos();
      // micro transition
      li.classList.toggle('done');
      const icon = tog.querySelector('.icon');
      tog.classList.toggle('active');
      if (icon) icon.style.opacity = tog.classList.contains('active') ? '1' : '0';
      // re-filter view
      setTimeout(render, 80);
    }
  });

  // Filter controls
  const filterBar = document.querySelector('.filters');
  const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
  if (filterBar) {
    filterBtns.forEach(btn => {
      if (btn.dataset.filter === filter) btn.classList.add('is-active');
      btn.setAttribute('aria-selected', btn.classList.contains('is-active') ? 'true' : 'false');
    });

    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filter = btn.dataset.filter || 'all';
      saveFilter();
      filterBtns.forEach(b => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
      });
      render();
    });
  }

  // 3D tilt effect
  let bounds = card.getBoundingClientRect();
  const maxTilt = 10; // degrees

  function setTilt(e) {
    const x = (e.clientX - bounds.left) / bounds.width; // 0..1
    const y = (e.clientY - bounds.top) / bounds.height; // 0..1
    const rx = (0.5 - y) * maxTilt * 2; // invert for natural feel
    const ry = (x - 0.5) * maxTilt * 2;
    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    // move glare with enhanced gradient
    glare.style.background = `radial-gradient(400px 250px at ${x*100}% ${y*100}%, rgba(255,255,255,0.16), rgba(79,127,255,0.06) 50%, rgba(167,139,250,0.04) 65%, rgba(255,255,255,0) 75%)`;
  }
  function resetTilt() {
    card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    glare.style.background = 'radial-gradient(400px 250px at 50% 50%, rgba(255,255,255,0.14), rgba(79,127,255,0.05) 50%, rgba(167,139,250,0.03) 65%, rgba(255,255,255,0) 75%)';
  }

  // Update bounds on resize
  window.addEventListener('resize', () => {
    bounds = card.getBoundingClientRect();
  });

  card.addEventListener('mousemove', setTilt);
  card.addEventListener('mouseleave', resetTilt);

  // Theme handling
  function loadTheme() {
    try { return localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'); } catch { return 'dark'; }
  }
  function saveTheme(t) { try { localStorage.setItem('theme', t); } catch {} }
  function applyTheme(t) {
    const root = document.documentElement;
    if (t === 'light') root.classList.add('light'); else root.classList.remove('light');
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false');
      btn.textContent = t === 'light' ? '🌙' : '☀️';
    }
  }
  // inject toggle into header
  (function addThemeToggle() {
    const header = document.querySelector('.header');
    if (!header) return;
    const btn = document.createElement('button');
    btn.id = 'theme-toggle';
    btn.className = 'icon-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Toggle theme');
    btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    btn.textContent = theme === 'light' ? '🌙' : '☀️';
    btn.style.marginLeft = '12px';
    btn.addEventListener('click', () => {
      theme = theme === 'light' ? 'dark' : 'light';
      saveTheme(theme);
      applyTheme(theme);
    });
    header.appendChild(btn);
  })();

  // Helpers
  function addTodo(text) {
    const t = { id: Date.now(), text, done: false };
    todos.push(t);
    saveTodos();
    render();
  }

  function render() {
    list.innerHTML = '';
    const visible = todos.filter(t => {
      if (filter === 'active') return !t.done;
      if (filter === 'completed') return !!t.done;
      return true;
    });
    if (!visible.length) {
      empty.style.display = 'block';
      empty.textContent = filter === 'active'
        ? 'No active todos — add something above.'
        : filter === 'completed'
          ? 'No completed todos yet.'
          : 'No todos yet — add your first one above.';
      return;
    }
    empty.style.display = 'none';
    const frag = document.createDocumentFragment();
    visible.forEach(t => frag.appendChild(todoItem(t)));
    list.appendChild(frag);
  }

  function todoItem(t) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = t.id;
    if (t.done) li.classList.add('done');

    const toggle = document.createElement('button');
    toggle.className = 'toggle';
    toggle.setAttribute('aria-label', t.done ? `Mark ${t.text} as active` : `Mark ${t.text} as completed`);
    if (t.done) toggle.classList.add('active');
    toggle.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 7l-10 10-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>`;

    const span = document.createElement('span');
    span.className = 'text';
    span.textContent = t.text;

    const btn = document.createElement('button');
    btn.className = 'icon-btn delete';
    btn.setAttribute('aria-label', `Delete ${t.text}`);
    btn.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>`;

    li.appendChild(toggle);
    li.appendChild(span);
    li.appendChild(btn);
    return li;
  }

  function loadTodos() {
    try {
      const raw = localStorage.getItem('todos');
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(x => x && typeof x.text === 'string')
        .map(x => ({ id: x.id ?? Date.now(), text: x.text, done: !!x.done }));
    } catch { return []; }
  }
  function saveTodos() {
    try { localStorage.setItem('todos', JSON.stringify(todos)); } catch {}
  }

  function loadFilter() {
    try { return localStorage.getItem('filter') || 'all'; } catch { return 'all'; }
  }
  function saveFilter() {
    try { localStorage.setItem('filter', filter); } catch {}
  }
})();
