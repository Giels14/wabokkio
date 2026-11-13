(function () {
  var form = document.getElementById('aanvraag');
  if (!form) return;
  var T = JSON.parse(form.getAttribute('data-i18n') || '{}');
  var ages = document.getElementById('kid-ages');
  var kids = form.querySelector('.kids-count');

  function renderAges() {
    var count = parseInt(kids.value, 10) || 0;
    var keep = [];
    ages.querySelectorAll('select').forEach(function (s) { keep.push(s.value); });
    ages.innerHTML = '';
    for (var i = 1; i <= count; i++) {
      var label = document.createElement('label');
      label.className = 'field';
      var span = document.createElement('span');
      span.textContent = T.childAge + ' ' + i;
      var sel = document.createElement('select');
      sel.name = 'kind-' + i + '-leeftijd';
      sel.required = true;
      var ph = document.createElement('option');
      ph.value = '';
      ph.textContent = T.choose;
      sel.appendChild(ph);
      for (var a = 0; a <= 17; a++) {
        var o = document.createElement('option');
        o.value = String(a);
        o.textContent = a === 0 ? T.baby : a + ' ' + T.years;
        sel.appendChild(o);
      }
      if (keep[i - 1]) sel.value = keep[i - 1];
      label.appendChild(span);
      label.appendChild(sel);
      ages.appendChild(label);
    }
  }

  kids.addEventListener('change', renderAges);

  var params = new URLSearchParams(location.search);
  var preset = params.get('hotel') || params.get('resort');
  if (preset) form.bestemming.value = preset.slice(0, 200);

  function onHome() {
    var path = location.pathname.replace(/\/$/, '') || '/';
    var home = (T.home || '/').replace(/\/$/, '') || '/';
    return path === home;
  }

  document.querySelectorAll('a.prefill').forEach(function (a) {
    if (!onHome()) return;
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var name = a.getAttribute('data-resort') || '';
      form.bestemming.value = name;
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(function () { form.aankomst.focus({ preventScroll: true }); }, 400);
      history.replaceState(null, '', T.home + '?resort=' + encodeURIComponent(name) + '#aanvraag');
    });
  });

  var today = new Date().toISOString().slice(0, 10);
  form.aankomst.min = today;
  form.vertrek.min = today;
  form.aankomst.addEventListener('change', function () { form.vertrek.min = form.aankomst.value || today; });

  var status = form.querySelector('.form-status');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.className = 'form-status';
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (form.vertrek.value <= form.aankomst.value) { status.textContent = T.errDates; status.classList.add('err'); return; }
    var btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    status.textContent = T.sending;
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }).then(function (j) { return { r: r, j: j }; }); })
      .then(function (res) {
        if (res.r.ok && res.j.ok) { location.href = T.thanks; return; }
        status.textContent = (res.j && res.j.error) || T.errGeneric;
        status.classList.add('err');
        btn.disabled = false;
      })
      .catch(function () { status.textContent = T.errNetwork; status.classList.add('err'); btn.disabled = false; });
  });
})();
