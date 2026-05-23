  // ── STATE ──────────────────────────────────────────────
  let tasks  = JSON.parse(localStorage.getItem('ca_tasks') || '[]');
  let filter = 'all';
  let editId = null;

  // ── PERSIST ────────────────────────────────────────────
  function save() {
    localStorage.setItem('ca_tasks', JSON.stringify(tasks));
  }

  // ── ID ─────────────────────────────────────────────────
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  // ── ADD ────────────────────────────────────────────────
  function addTask() {
    const inp = document.getElementById('task-input');
    const text = inp.value.trim();
    if (!text) { inp.focus(); return; }
    tasks.unshift({ id: uid(), text, done: false, created: Date.now() });
    inp.value = '';
    save();
    render();
    inp.focus();
  }

  // ── TOGGLE DONE ────────────────────────────────────────
  function toggleDone(id) {
    const t = tasks.find(t => t.id === id);
    if (t) { t.done = !t.done; save(); render(); }
  }

  // ── DELETE ─────────────────────────────────────────────
  function deleteTask(id) {
    const li = document.querySelector(`[data-id="${id}"]`);
    if (li) {
      li.classList.add('removing');
      li.addEventListener('animationend', () => {
        tasks = tasks.filter(t => t.id !== id);
        save();
        render();
      }, { once: true });
    }
  }

  // ── EDIT ───────────────────────────────────────────────
  function startEdit(id) {
    if (editId && editId !== id) cancelEdit();
    editId = id;
    const li  = document.querySelector(`[data-id="${id}"]`);
    const inp = li.querySelector('.edit-input');
    const t   = tasks.find(t => t.id === id);
    inp.value = t.text;
    li.classList.add('editing');
    inp.focus();
    inp.setSelectionRange(inp.value.length, inp.value.length);
  }

  function saveEdit(id) {
    const li  = document.querySelector(`[data-id="${id}"]`);
    const inp = li.querySelector('.edit-input');
    const text = inp.value.trim();
    if (!text) { inp.focus(); return; }
    const t = tasks.find(t => t.id === id);
    if (t) { t.text = text; save(); }
    editId = null;
    render();
  }

  function cancelEdit() {
    if (!editId) return;
    const li = document.querySelector(`[data-id="${editId}"]`);
    if (li) li.classList.remove('editing');
    editId = null;
  }

  // ── CLEAR COMPLETED ────────────────────────────────────
  function clearCompleted() {
    tasks = tasks.filter(t => !t.done);
    save();
    render();
  }

  // ── FILTER ─────────────────────────────────────────────
  function setFilter(f, btn) {
    filter = f;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  }

  // ── RENDER ─────────────────────────────────────────────
  function render() {
    const list  = document.getElementById('task-list');
    const empty = document.getElementById('empty-state');

    const visible = tasks.filter(t =>
      filter === 'all'       ? true :
      filter === 'active'    ? !t.done :
      /* completed */           t.done
    );

    const remaining = tasks.filter(t => !t.done).length;
    const done      = tasks.filter(t =>  t.done).length;

    document.getElementById('count-left').textContent  = remaining;
    document.getElementById('count-total').textContent = tasks.length;
    document.getElementById('count-done').textContent  = done;

    list.innerHTML = '';

    if (visible.length === 0) {
      empty.classList.add('visible');
    } else {
      empty.classList.remove('visible');
      visible.forEach(t => {
        const li = document.createElement('li');
        li.className = 'task-item' + (t.done ? ' done' : '');
        li.dataset.id = t.id;

        li.innerHTML = `
          <div class="check-col" onclick="toggleDone('${t.id}')">
            <div class="checkbox">
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.8 7L9 1" stroke="#0e0e0e" stroke-width="2" stroke-linecap="square"/>
              </svg>
            </div>
          </div>
          <div class="task-text" ondblclick="startEdit('${t.id}')">${escHtml(t.text)}</div>
          <input class="edit-input" type="text" maxlength="120"
            onkeydown="handleEditKey(event,'${t.id}')"
            onblur="cancelEdit()">
          <div class="action-col">
            <button class="act-btn save-btn" title="Save" onmousedown="event.preventDefault()" onclick="saveEdit('${t.id}')">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7.5L5.5 11L12 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="square"/>
              </svg>
            </button>
            <button class="act-btn edit-btn" title="Edit" onclick="startEdit('${t.id}')">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M2 9.5L9 2.5L11 4.5L4 11.5L1.5 12L2 9.5Z" stroke="currentColor" stroke-width="1.4" stroke-linecap="square" stroke-linejoin="miter"/>
              </svg>
            </button>
            <button class="act-btn del-btn" title="Delete" onclick="deleteTask('${t.id}')">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"/>
              </svg>
            </button>
          </div>
        `;
        list.appendChild(li);
      });
    }
  }

  function handleEditKey(e, id) {
    if (e.key === 'Enter')  { e.preventDefault(); saveEdit(id); }
    if (e.key === 'Escape') { cancelEdit(); }
  }

  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── INPUT ENTER KEY ────────────────────────────────────
  document.getElementById('task-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
  });

  // ── INIT ───────────────────────────────────────────────
  render();