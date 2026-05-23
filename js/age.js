 function clearErrors() {
    ['day','month','year'].forEach(id => {
      document.getElementById(id).classList.remove('error');
    });
    ['hint-day','hint-month','hint-year'].forEach(id => {
      const el = document.getElementById(id);
      el.classList.remove('err');
    });
    document.getElementById('hint-day').textContent   = '1 – 31';
    document.getElementById('hint-month').textContent = '1 – 12';
    document.getElementById('hint-year').textContent  = '≤ 2026';
    const banner = document.getElementById('error-banner');
    banner.textContent = '';
    banner.classList.remove('visible');
    document.getElementById('result').classList.remove('visible');
  }

  function showError(field, msg, banner) {
    document.getElementById(field).classList.add('error');
    const hint = document.getElementById('hint-' + field);
    hint.textContent = msg;
    hint.classList.add('err');
    if (banner) {
      const b = document.getElementById('error-banner');
      b.textContent = banner;
      b.classList.add('visible');
    }
  }

  function daysInMonth(m, y) {
    return new Date(y, m, 0).getDate();
  }

  function calculate() {
    clearErrors();

    const dayVal   = parseInt(document.getElementById('day').value);
    const monthVal = parseInt(document.getElementById('month').value);
    const yearVal  = parseInt(document.getElementById('year').value);

    let valid = true;

    if (isNaN(yearVal) || yearVal < 1900 || yearVal > 2026) {
      showError('year', 'Invalid year', valid ? '! Enter a valid year (1900–2026).' : null);
      valid = false;
    }

    if (isNaN(monthVal) || monthVal < 1 || monthVal > 12) {
      showError('month', 'Invalid month', valid ? '! Month must be 1–12.' : null);
      valid = false;
    }

    const maxDay = (!isNaN(monthVal) && !isNaN(yearVal)) ? daysInMonth(monthVal, yearVal) : 31;
    if (isNaN(dayVal) || dayVal < 1 || dayVal > maxDay) {
      showError('day', `Max ${maxDay} days`, valid ? `! Day must be 1–${maxDay} for this month.` : null);
      valid = false;
    }

    if (!valid) return;

    const today = new Date();
    const birth = new Date(yearVal, monthVal - 1, dayVal);

    if (birth > today) {
      showError('year', 'Future date', null);
      const b = document.getElementById('error-banner');
      b.textContent = '! Date of birth cannot be in the future.';
      b.classList.add('visible');
      return;
    }

    let years  = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth()    - birth.getMonth();
    let days   = today.getDate()     - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Total days lived
    const msPerDay = 1000 * 60 * 60 * 24;
    const totalDays = Math.floor((today - birth) / msPerDay);
    const totalWeeks = Math.floor(totalDays / 7);

    document.getElementById('r-years').textContent  = years;
    document.getElementById('r-months').textContent = months;
    document.getElementById('r-days').textContent   = days;

    const bDay = birth.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    document.getElementById('result-sub').innerHTML =
      `Born <span>${bDay}</span><br>` +
      `<span>${totalDays.toLocaleString()}</span> days lived &nbsp;·&nbsp; ` +
      `<span>${totalWeeks.toLocaleString()}</span> weeks`;

    document.getElementById('result').classList.add('visible');
  }

  // Allow Enter key
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') calculate();
  });