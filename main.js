/* ═══════════════════════════════════════
   ВайбКод — интерактив и анимации
   ═══════════════════════════════════════ */

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

/* ─────────── ШАПКА + ПРОГРЕСС ─────────── */
const hdr = $('#hdr');
const scrollProgress = $('#scrollProgress');

const onScroll = () => {
  const y = window.scrollY;
  hdr.classList.toggle('is-stuck', y > 14);
  const h = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* ─────────── МОБИЛЬНОЕ МЕНЮ ─────────── */
const menu = $('#menu');
const burger = $('#burger');

burger.addEventListener('click', () => {
  const open = menu.classList.toggle('is-open');
  burger.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});

menu.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    menu.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});

/* ─────────── МАТРИЦА ─────────── */
(() => {
  const cv = $('#matrix');
  if (!cv) return;
  const ctx = cv.getContext('2d');

  let w = 0, h = 0, cols = 0, drops = [];
  const GLYPHS = '01ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉabcdefghijklmnopqrstuvwxyz{}[]<>/*+-=$#%&@';
  let fontSize = 17;

  const measure = () => {
    const rect = cv.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, Math.floor(rect.width));
    h = Math.max(1, Math.floor(rect.height));
    fontSize = w < 640 ? 14 : 17;
    cv.width = Math.floor(w * dpr);
    cv.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `${fontSize}px ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace`;
    cols = Math.ceil(w / fontSize);
    drops = Array.from({ length: cols }, () => Math.random() * -60);
  };

  const draw = () => {
    if (reduced) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(94,234,212,.12)';
      for (let i = 0; i < cols; i += 3) {
        ctx.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], i * fontSize, ((i * 37) % h));
      }
      return;
    }

    ctx.fillStyle = 'rgba(7,7,14,.09)';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < cols; i++) {
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      ctx.fillStyle = 'rgba(94,234,212,.85)';
      ctx.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], x, y);

      ctx.fillStyle = 'rgba(168,85,247,.42)';
      ctx.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], x, y - fontSize);

      ctx.fillStyle = 'rgba(59,130,246,.18)';
      ctx.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], x, y - fontSize * 2.4);

      drops[i] += 0.42 + Math.random() * 0.3;
      if (y > h && Math.random() > 0.975) drops[i] = Math.random() * -30;
    }
  };

  measure();
  let raf;
  const loop = () => { draw(); raf = requestAnimationFrame(loop); };
  loop();

  let rTimer;
  window.addEventListener('resize', () => {
    clearTimeout(rTimer);
    rTimer = setTimeout(measure, 180);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
    else if (!raf) loop();
  });
})();

/* ─────────── СВЕЧЕНИЕ ПОД КУРСОРОМ ─────────── */
(() => {
  const glow = $('#cursorGlow');
  if (!glow || !finePointer) return;
  let tx = innerWidth / 2, ty = innerHeight / 2, cx = tx, cy = ty, on = false;

  addEventListener('pointermove', (e) => {
    tx = e.clientX; ty = e.clientY;
    if (!on) { on = true; cx = tx; cy = ty; glow.style.opacity = '1'; }
  }, { passive: true });

  (function follow() {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    glow.style.transform = `translate(${cx}px,${cy}px)`;
    requestAnimationFrame(follow);
  })();
})();

/* ─────────── 3D-НАКЛОН ─────────── */
if (finePointer && !reduced) {
  $$('[data-tilt]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--ry', (px * 9).toFixed(2) + 'deg');
      el.style.setProperty('--rx', (-py * 9).toFixed(2) + 'deg');
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--ry', '0deg');
      el.style.setProperty('--rx', '0deg');
    });
  });
}

/* ─────────── МАГНИТНЫЕ КНОПКИ ─────────── */
if (finePointer && !reduced) {
  $$('[data-magnet]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      el.style.transform = `translate(${dx * 8}px,${dy * 6}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/* ─────────── SCRAMBLE-ТЕКСТ ─────────── */
(() => {
  const CHARS = '▚▞█▓▒░01ｱｲｳｴｵｶｷABCDEFGHJKLMNPRSTUVXYZ<>/\\[]{}=+*';
  const el = $('[data-scramble]');
  if (!el) return;

  const final = el.textContent;
  const total = 22;
  const EVERY = 9000;
  let guard = 0;
  let timer = 0;

  const settle = () => { el.textContent = final; };

  const run = () => {
    if (reduced || document.hidden) { settle(); return; }

    const queue = [...final].map((ch) => ({ ch, start: Math.floor(Math.random() * 8), end: total + Math.floor(Math.random() * 14) }));
    let frame = 0;

    const tick = () => {
      let out = '';
      let done = 0;
      queue.forEach((q) => {
        if (frame >= q.end) { out += q.ch; done++; }
        else if (frame >= q.start) { out += CHARS[(Math.random() * CHARS.length) | 0]; }
        else { out += ' '; }
      });
      el.textContent = out;
      frame++;

      if (done < final.length && frame < total + 40) requestAnimationFrame(tick);
      else settle();
    };
    tick();

    clearTimeout(guard);
    guard = setTimeout(settle, 2600);
  };

  const start = () => {
    if (reduced) { settle(); return; }
    clearInterval(timer);
    timer = setInterval(run, EVERY);
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { clearInterval(timer); settle(); }
    else start();
  });

  run();
  start();
})();

/* ─────────── ПОЯВЛЕНИЕ БЛОКОВ ─────────── */
(() => {
  const targets = $$('.reveal');
  if (!targets.length) return;

  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });

  targets.forEach((el) => io.observe(el));

  window.addEventListener('load', () => setTimeout(() => targets.forEach((el) => el.classList.add('is-in')), 3000));
})();

/* ─────────── КОНСОЛЬ В ГЕРОЕ: СБОРКА ПРОЕКТОВ ПО КРУГУ ─────────── */
(() => {
  const console_ = $('#console');
  const body = $('#consoleBody');
  const fileEl = $('#consoleFile');
  const liveEl = $('#consoleLive');
  if (!console_ || !body) return;

  const PROJECTS = [
    {
      file: 'сайт-студии-йоги.html',
      ask: 'Сделай лендинг для студии йоги. Мягкие цвета, спокойный стиль, расписание занятий и форма записи.',
      plan: 'Понял задачу. План:',
      steps: ['Создаю структуру страницы и стили', 'Собираю секцию расписания из ваших данных', 'Добавляю форму записи и проверку полей', 'Оптимизирую под телефон'],
      time: '12 сек', c1: '#5EEAD4', c2: '#06B6D4',
      preview: '<div class="preview__nav"></div><div class="preview__hero"></div><div class="preview__row"><i></i><i></i><i></i></div>'
    },
    {
      file: 'portfolio-photographer.html',
      ask: 'Нужен сайт фотографа: шесть страниц, галерея с фильтром по категориям, блок отзывов и форма на съёмку.',
      plan: 'Разложу на страницы. План:',
      steps: ['Собираю многостраничную структуру и меню', 'Делаю галерею с фильтром по тегам', 'Добавляю отзывы и форму брони даты', 'Настраиваю крупные фото без потери скорости'],
      time: '19 сек', c1: '#EC4899', c2: '#A855F7',
      preview: '<div class="preview__nav"></div><div class="preview__hero preview__hero--tall"></div><div class="preview__grid"><i></i><i></i><i></i><i></i></div>'
    },
    {
      file: 'quiz-marketing.html',
      ask: 'Сделай квиз для маркетинга: пять вопросов, подсчёт баллов и сегментация аудитории по результату.',
      plan: 'Продумаю логику. План:',
      steps: ['Описываю вопросы и варианты ответа', 'Считаю баллы и определяю сегмент', 'Показываю итог с призывом к действию', 'Записываю результат в таблицу'],
      time: '16 сек', c1: '#A855F7', c2: '#3B82F6',
      preview: '<div class="preview__prog"><span></span></div><div class="preview__q">Вопрос 3 из 5</div><div class="preview__opts"><i></i><i></i><i></i></div>'
    },
    {
      file: 'calculator-price.html',
      ask: 'Нужен калькулятор стоимости услуги: параметры, зависимая логика цены и выгрузка результата в PDF.',
      plan: 'Соберу логику. План:',
      steps: ['Верстаю поля параметров и слайдеры', 'Пишу формулу с зависимыми условиями', 'Считаю цену в реальном времени', 'Добавляю выгрузку в PDF'],
      time: '21 сек', c1: '#06B6D4', c2: '#818CF8',
      preview: '<div class="preview__nav preview__nav--thin"></div><div class="preview__fields"><i></i><i></i><i></i></div><div class="preview__result"></div>'
    },
    {
      file: 'shop-handmade.html',
      ask: 'Сделай магазин handmade: каталог с фильтрами, корзина, оформление заказа и заявка в таблицу.',
      plan: 'Продумаю сценарий покупки. План:',
      steps: ['Верстаю каталог с фильтрами по категориям', 'Делаю корзину и пересчёт суммы', 'Собираю оформление и данные клиента', 'Отправляю заказ и сохраняю в таблицу'],
      time: '24 сек', c1: '#F59E0B', c2: '#EC4899',
      preview: '<div class="preview__nav"></div><div class="preview__grid preview__grid--3"><i></i><i></i><i></i></div><div class="preview__buy">В корзину · 4 900 ₽</div>'
    },
    {
      file: 'bot-booking.html',
      ask: 'Нужен бот для записи: диалог с выбором услуги, даты и времени, подтверждение и напоминание.',
      plan: 'Соберу сценарий диалога. План:',
      steps: ['Описываю сценарий и вопросы бота', 'Подключаю выбор услуги, даты и времени', 'Подтверждаю запись и шлю напоминание', 'Сохраняю всё в календарь'],
      time: '18 сек', c1: '#3B82F6', c2: '#5EEAD4',
      preview: '<div class="preview__chat"><i></i><i></i><i></i></div><div class="preview__field">Выберите время</div>'
    }
  ];

  const screen = $('.preview__screen', console_);
  let timer = 0;
  let index = 0;
  let started = false;

  const build = (p, i) => {
    const bullets = p.steps
      .map((s, n) => `<div class="pl pl--dim" data-step="${n + 3}"><span class="pl__bullet">0${n + 1}</span>${s}</div>`)
      .join('');

    body.innerHTML = `
      <div class="pl" data-step="0">
        <span class="pl__tag">вы</span>
        <span class="pl__text">${p.ask}</span>
      </div>
      <div class="pl pl--ai" data-step="1">
        <span class="pl__tag">Claude Code</span>
        <span class="pl__text">${p.plan}</span>
      </div>
      ${bullets}
      <div class="pl pl--ok" data-step="${p.steps.length + 3}">
        <span class="pl__check">✓</span>
        Готово. Открыть в браузере?
        <span class="pl__meta">${p.time}</span>
      </div>
      <div class="pl pl--cursor" data-step="${p.steps.length + 4}"><span class="caret"></span></div>
    `;

    fileEl.textContent = p.file;
    console_.style.setProperty('--c1', p.c1);
    console_.style.setProperty('--c2', p.c2);
    if (screen) screen.innerHTML = p.preview;
  };

  const play = () => {
    $$('[data-step]', body).forEach((s, i) => {
      s.style.animation = 'none';
      void s.offsetWidth;
      s.style.opacity = '0';
      s.style.animation = `rise .42s var(--ease) ${0.12 + i * 0.3}s forwards`;
    });
  };

  const show = () => {
    index = (index + 1) % PROJECTS.length;
    build(PROJECTS[index], index);
    if (reduced) {
      $$('[data-step]', body).forEach((s) => { s.style.opacity = '1'; });
      return;
    }
    play();
  };

  const start = () => {
    if (reduced || !started) return;
    clearInterval(timer);
    timer = setInterval(show, 9000);
  };

  build(PROJECTS[0], 0);

  if (reduced) {
    $$('[data-step]', body).forEach((s) => { s.style.opacity = '1'; });
  } else {
    const begin = () => { if (!started) { started = true; play(); start(); } };
    window.addEventListener('load', () => setTimeout(begin, 250));
    setTimeout(begin, 400);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(timer);
      if (liveEl) liveEl.textContent = 'пауза';
    } else {
      if (liveEl) liveEl.textContent = 'собирается';
      start();
    }
  });
})();

/* ─────────── БЕГУЩАЯ СТРОКА: ДУБЛИ ДЛЯ БЕСШОВНОСТИ ─────────── */
(() => {
  const row = $('#tickerRow');
  if (row) row.append(...$$('.tk', row).map((el) => el.cloneNode(true)));
})();

/* ─────────── АККОРДЕОН ПРОГРАММЫ ─────────── */
$$('.pm').forEach((item, i) => {
  item.style.setProperty('--d', (i % 4) * 0.06 + 's');
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    $$('.pm').forEach((o) => { if (o !== item) o.open = false; });
  });
});

/* ─────────── АККОРДЕОН FAQ ─────────── */
$$('.faq__i').forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    $$('.faq__i').forEach((o) => { if (o !== item) o.open = false; });
  });
});

/* ─────────── СЧЁТЧИКИ ─────────── */
(() => {
  const nums = $$('[data-count]');
  if (!nums.length) return;

  const render = (el, val) => {
    const target = +el.dataset.count;
    if (target === 0) { el.textContent = '0'; return; }
    el.textContent = Math.round(val).toLocaleString('ru-RU');
  };

  if (reduced || !('IntersectionObserver' in window)) {
    nums.forEach((el) => render(el, +el.dataset.count));
    return;
  }

  const cio = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.count;
      const dur = 1500;
      const t0 = performance.now();

      const step = (now) => {
        const p = clamp((now - t0) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        render(el, target * eased);
        if (p < 1) requestAnimationFrame(step);
        else render(el, target);
      };
      requestAnimationFrame(step);
      cio.unobserve(el);
    });
  }, { threshold: 0.6 });

  nums.forEach((el) => render(el, 0));
  nums.forEach((el) => cio.observe(el));
})();

/* ─────────── ПОЛЯ ФОРМЫ (плавающие лейблы) ─────────── */
(() => {
  const roleSel = $('#fRole');
  if (roleSel && roleSel.value) roleSel.parentElement.querySelector('.field__lbl-static').classList.add('is-up');
})();

/* ─────────── ФОРМА ─────────── */
const LEAD_ENDPOINT = '';

(() => {
  const form = $('#leadForm');
  if (!form) return;

  const ok = $('#formOk');
  const demo = $('.card-form__demo');
  const btn = $('button[type="submit"]', form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const required = $$('[required]', form);
    const bad = required.filter((f) => !f.value.trim());
    form.classList.toggle('has-error', bad.length > 0);
    bad.forEach((f) => f.classList.add('is-bad'));
    if (bad.length) { bad[0].focus(); return; }

    const say = (text) => { ok.textContent = text; ok.hidden = false; };

    if (!LEAD_ENDPOINT) {
      demo.hidden = true;
      say('Форма заполнена. В демо-режиме данные никуда не ушли.');
      return;
    }

    const payload = Object.fromEntries(new FormData(form).entries());
    btn.disabled = true;
    btn.textContent = 'Отправляем…';

    try {
      const res = await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      form.reset();
      demo.hidden = true;
      say('Заявка отправлена. Мы свяжемся с вами в течение часа.');
    } catch {
      say('Не получилось отправить заявку. Попробуйте позже или напишите на hi@vibe.school');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Забрать место <svg class="btn__arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
  });
})();