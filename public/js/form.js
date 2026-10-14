(function () {
  var form = document.getElementById('aanvraag');
  if (!form) return;
  var roomsEl = document.getElementById('rooms');
  var MAX_ROOMS = 4;

  function renderAges(room) {
    var n = room.getAttribute('data-room');
    var count = parseInt(room.querySelector('.kids-count').value, 10) || 0;
    var box = room.querySelector('.kid-ages');
    var existing = box.querySelectorAll('select');
    var keep = [];
    existing.forEach(function (s) { keep.push(s.value); });
    box.innerHTML = '';
    for (var i = 1; i <= count; i++) {
      var label = document.createElement('label');
      label.className = 'field';
      var span = document.createElement('span');
      span.textContent = 'Leeftijd kind ' + i;
      var sel = document.createElement('select');
      sel.name = 'kamer-' + n + '-kind-' + i + '-leeftijd';
      sel.required = true;
      var ph = document.createElement('option'); ph.value = ''; ph.textContent = 'Kies'; sel.appendChild(ph);
      for (var a = 0; a <= 17; a++) {
        var o = document.createElement('option'); o.value = String(a); o.textContent = a === 0 ? '0 (baby)' : a + ' jaar'; sel.appendChild(o);
      }
      if (keep[i - 1] !== undefined) sel.value = keep[i - 1];
      label.appendChild(span); label.appendChild(sel); box.appendChild(label);
    }
  }

  function wire(room) {
    room.querySelector('.kids-count').addEventListener('change', function () { renderAges(room); });
    var rm = room.querySelector('.remove-room');
    if (rm) rm.addEventListener('click', function () { room.remove(); renumber(); });
  }

  function renumber() {
    var rooms = roomsEl.querySelectorAll('.room');
    rooms.forEach(function (room, idx) {
      var n = idx + 1;
      room.setAttribute('data-room', String(n));
      room.querySelector('.room-head strong').textContent = 'Kamer ' + n;
      room.querySelectorAll('[name]').forEach(function (el) { el.name = el.name.replace(/^kamer-\d+-/, 'kamer-' + n + '-'); });
    });
    form.kamers.value = String(rooms.length);
    document.getElementById('add-room').hidden = rooms.length >= MAX_ROOMS;
  }

  document.getElementById('add-room').addEventListener('click', function () {
    var first = roomsEl.querySelector('.room');
    var clone = first.cloneNode(true);
    clone.querySelector('.kid-ages').innerHTML = '';
    clone.querySelector('.kids-count').value = '0';
    clone.querySelector('[name$="volwassenen"]').value = '2';
    var head = clone.querySelector('.room-head');
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'remove-room'; btn.textContent = 'Verwijder';
    head.appendChild(btn);
    roomsEl.appendChild(clone);
    wire(clone); renumber();
  });

  wire(roomsEl.querySelector('.room'));

  // Prefill vanuit resortkaart (?resort=... of klik op knop)
  function prefill(name) {
    form.bestemming.value = name;
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(function () { form.aankomst.focus({ preventScroll: true }); }, 400);
  }
  var q = new URLSearchParams(location.search).get('resort');
  if (q) form.bestemming.value = q.slice(0, 200);
  document.querySelectorAll('a.prefill').forEach(function (a) {
    if (location.pathname !== '/') return; // op andere pagina's gewoon naar / navigeren
    a.addEventListener('click', function (e) { e.preventDefault(); prefill(a.getAttribute('data-resort')); history.replaceState(null, '', '/?resort=' + encodeURIComponent(a.getAttribute('data-resort')) + '#aanvraag'); });
  });

  // Min-datum
  var today = new Date().toISOString().slice(0, 10);
  form.aankomst.min = today; form.vertrek.min = today;
  form.aankomst.addEventListener('change', function () { form.vertrek.min = form.aankomst.value || today; });

  var status = form.querySelector('.form-status');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.className = 'form-status';
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (form.vertrek.value <= form.aankomst.value) { status.textContent = 'De vertrekdatum moet na de aankomstdatum liggen.'; status.classList.add('err'); return; }
    var btn = form.querySelector('button[type=submit]');
    btn.disabled = true; status.textContent = 'Versturen…';
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }).then(function (j) { return { r: r, j: j }; }); })
      .then(function (res) {
        if (res.r.ok && res.j.ok) { location.href = '/bedankt/'; return; }
        status.textContent = (res.j && res.j.error) || 'Er ging iets mis. Probeer het opnieuw of mail naar travel@wabokkio.nl.';
        status.classList.add('err'); btn.disabled = false;
      })
      .catch(function () { status.textContent = 'Geen verbinding. Probeer het opnieuw of mail naar travel@wabokkio.nl.'; status.classList.add('err'); btn.disabled = false; });
  });
})();
