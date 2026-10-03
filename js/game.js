// ===== あっち向いてホイ・ゲーム本体 =====
(function () {
  const C = window.HOI_CONFIG;
  const CH = window.HOI_CHARS;
  const $ = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const nowIso = () => new Date().toISOString();

  // ---------- 割り付け（学籍番号をシードにしたハッシュ） ----------
  function cyrb53(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }
  function assign(sid) {
    const q = new URLSearchParams(location.search).get('cond');
    if (q && C.CONDITIONS.includes(q)) return { cond: q, override: 1 };
    return { cond: C.CONDITIONS[cyrb53(C.ASSIGN_SALT + ':' + sid) % C.CONDITIONS.length], override: 0 };
  }

  function normalizeId(s) {
    return String(s || '')
      .replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
      .replace(/\s+/g, '').toUpperCase();
  }

  function device() {
    const ua = navigator.userAgent;
    if (/iPad|Tablet/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'tablet';
    if (/Mobi|Android|iPhone/i.test(ua)) return 'phone';
    return 'pc';
  }

  function ls(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      if (val === null) localStorage.removeItem(key); else localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  // ---------- 状態 ----------
  const S = {
    sid: '', cond: '', override: 0, attempt: 1,
    session: Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4),
    startedAt: '', trials: [], me: 0, wins: 0, losses: 0, t: 0, busy: true, shownAt: 0, payload: null,
  };

  function show(id) {
    document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('on', s.id === id));
    window.scrollTo(0, 0);
  }

  // ---------- 1. 学籍番号 ----------
  $('btn-id').onclick = () => {
    const sid = normalizeId($('sid').value);
    if (!sid) { $('sid-err').textContent = '学籍番号を入力してください'; return; }
    if (!/^[0-9A-Z_-]{2,20}$/.test(sid)) { $('sid-err').textContent = '半角の英数字で入力してください'; return; }
    S.sid = sid;
    const a = assign(sid); S.cond = a.cond; S.override = a.override;
    const key = 'hoi_attempt_' + sid;
    S.attempt = (parseInt(ls(key) || '0', 10) || 0) + 1; ls(key, String(S.attempt));
    setupIntro();
    show('s-intro');
  };
  $('sid').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('btn-id').click(); });

  // ---------- 2. 導入 ----------
  function setupIntro() {
    $('intro-char').innerHTML = window.HOI_CHAR_SVG(S.cond);
    $('intro-line').textContent = CH[S.cond].intro;
    $('intro-n').textContent = C.N_TRIALS;
    $('r-win').textContent = fmt(C.WIN_POINTS); $('r-lose').textContent = fmt(C.LOSS_POINTS);
  }
  $('btn-start').onclick = () => {
    S.startedAt = nowIso();
    $('game-char').innerHTML = window.HOI_CHAR_SVG(S.cond);
    $('opp-name').textContent = 'あいて：' + CH[S.cond].label;
    $('rd-n').textContent = C.N_TRIALS;
    show('s-game');
    nextTrial();
  };

  // ---------- 3. ゲーム ----------
  const charEl = () => $('game-char').querySelector('.char');
  function look(dir) {
    const el = charEl(); if (!el) return;
    el.classList.remove('look-L', 'look-R');
    if (dir) el.classList.add('look-' + dir);
  }
  // 吹き出しを、正面を向いたキャラクタの頭のすぐ右上に置く（画面の高さが違っても頭から離れないように）
  let headBox = null;
  function measureHead() {
    look(null);
    const el = charEl(); if (!el) return;
    const st = document.querySelector('.stage').getBoundingClientRect();
    // getBBox は首振りの変形を含まない元の形なので、アニメーション中でも位置がぶれない
    const r = el.getBoundingClientRect(), vb = el.viewBox.baseVal, bb = el.querySelector('.head').getBBox();
    const k = Math.min(r.width / vb.width, r.height / vb.height);
    const ox = r.left + (r.width - vb.width * k) / 2 - st.left, oy = r.top + (r.height - vb.height * k) / 2 - st.top;
    headBox = { top: oy + bb.y * k, cx: ox + (bb.x + bb.width / 2) * k, w: bb.width * k, stW: st.width };
  }
  function placeCall() {
    const c = $('call'); if (!headBox || !c.textContent) return;
    const TAIL = 24, GAP = 4;
    let top = headBox.top - c.offsetHeight - TAIL - GAP;
    let left = headBox.cx + headBox.w * 0.18 - 36;     // しっぽの先が頭の右上あたりに来る位置
    left = Math.max(12, Math.min(left, headBox.stW - c.offsetWidth - 12));
    c.style.top = Math.max(46, top) + 'px';
    c.style.left = left + 'px';
  }
  window.addEventListener('resize', () => { if ($('s-game').classList.contains('on') && !S.busy) { measureHead(); } });

  function oppMove(i) { return C.PATTERN[i % C.PATTERN.length]; }

  function nextTrial() {
    if (S.t >= C.N_TRIALS) return finishGame();
    measureHead();
    $('rd').textContent = S.t + 1;
    $('prog').style.width = (S.t / C.N_TRIALS * 100) + '%';
    $('call').textContent = ''; $('call').className = 'call';
    $('result').className = 'result';
    $('pointer').className = 'pointer';
    $('prompt').textContent = 'どっちを指さす？';
    const ch = $('choices'); ch.classList.remove('locked');
    ch.querySelectorAll('.choice').forEach((b) => { b.disabled = false; b.classList.remove('picked'); });
    S.busy = false;
    S.shownAt = performance.now();
  }

  async function choose(my) {
    if (S.busy) return;
    S.busy = true;
    const rt = Math.round(performance.now() - S.shownAt);
    const ch = $('choices'); ch.classList.add('locked');
    ch.querySelectorAll('.choice').forEach((b) => { b.disabled = true; b.classList.toggle('picked', b.dataset.c === my); });
    $('prompt').textContent = '';
    $('pointer').className = 'pointer ready';  // 手を構えるだけ（向きはまだ見せない）

    const delay = Math.round(C.DELAY_MIN_MS + Math.random() * (C.DELAY_MAX_MS - C.DELAY_MIN_MS));
    $('call').textContent = 'あっち向いて…'; placeCall();
    await sleep(delay);

    const opp = oppMove(S.t);
    $('call').textContent = 'ホイ！'; $('call').className = 'call hoi'; placeCall();
    look(opp);
    $('pointer').className = 'pointer ' + my;  // 首が動くのと同時に、選んだ方へ指さす
    await sleep(320);

    const win = my === opp ? 1 : 0;
    const delta = win ? C.WIN_POINTS : C.LOSS_POINTS;
    S.me += delta; if (win) S.wins++; else S.losses++;
    $('pt-me').textContent = S.me; bump('sc-me');
    const r = $('result');
    r.textContent = (win ? 'あたり！ ' : 'はずれ！ ') + fmt(delta);
    r.className = 'result on ' + (win ? 'win' : 'lose');

    S.trials.push({
      trial: S.t + 1, my_choice: my, opp_choice: opp, win,
      my_score: S.me, opp_score: S.losses, points: delta, rt_ms: rt, delay_ms: delay, trial_at: nowIso(),
    });
    if (C.SHOW_HISTORY) {
      const s = document.createElement('span'); s.textContent = opp === 'L' ? '左' : '右'; $('hist').appendChild(s);
    }
    S.t++;
    await sleep(C.RESULT_HOLD_MS);
    nextTrial();
  }
  function fmt(n) { return n > 0 ? '+' + n : n < 0 ? '−' + Math.abs(n) : '±0'; }
  function bump(id) { const e = $(id); e.classList.remove('bump'); void e.offsetWidth; e.classList.add('bump'); }

  $('choices').addEventListener('click', (e) => {
    const b = e.target.closest('.choice'); if (b) choose(b.dataset.c);
  });
  document.addEventListener('keydown', (e) => {
    if (!$('s-game').classList.contains('on')) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); choose('L'); }
    if (e.key === 'ArrowRight') { e.preventDefault(); choose('R'); }
  });

  // ---------- 4. 事後質問 ----------
  function finishGame() {
    $('prog').style.width = '100%';
    $('post-score').innerHTML = `あなたの得点 <b>${S.me}</b> 点`;
    show('s-post');
  }
  $('btn-post').onclick = () => {
    const txt = $('rule-text').value.trim();
    if (!txt) { $('rule-err').textContent = '何か書いてください（特になければ「なし」）'; return; }
    S.payload = buildPayload(txt);
    ls('hoi_pending', JSON.stringify(S.payload));
    show('s-done');
    send();
  };

  function rate(arr) { return arr.length ? +(arr.reduce((a, t) => a + t.win, 0) / arr.length).toFixed(3) : ''; }
  function buildPayload(ruleText) {
    const T = S.trials, half = Math.floor(T.length / 2);
    let streak = 0, best = 0;
    T.forEach((t) => { streak = t.win ? streak + 1 : 0; best = Math.max(best, streak); });
    const common = {
      session_id: S.session, student_id: S.sid, condition: S.cond, cond_override: S.override, attempt: S.attempt,
      device: device(), app_version: C.APP_VERSION,
    };
    const finishedAt = nowIso();
    return {
      trials: T.map((t) => Object.assign({}, common, t)),
      participant: Object.assign({}, common, {
        n_trials: T.length, total_wins: S.wins, final_score: S.me,
        win_rate_first_half: rate(T.slice(0, half)), win_rate_last_half: rate(T.slice(half)),
        max_streak: best, rule_text: ruleText,
        duration_s: Math.round((new Date(finishedAt) - new Date(S.startedAt)) / 1000),
        pattern: C.PATTERN.join(''), delay_min_ms: C.DELAY_MIN_MS, delay_max_ms: C.DELAY_MAX_MS,
        screen: `${screen.width}x${screen.height}`, user_agent: navigator.userAgent,
        started_at: S.startedAt, finished_at: finishedAt,
      }),
    };
  }

  // ---------- 5. 送信 ----------
  async function post(payload) {
    if (!C.GAS_URL) throw new Error('送信先が設定されていません（config.js の GAS_URL）');
    const res = await fetch(C.GAS_URL, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload),
    });
    const j = await res.json();
    if (!j.ok) throw new Error(j.error || '保存に失敗しました');
    return j;
  }

  async function send() {
    const st = $('send-status');
    st.className = 'status'; st.textContent = '送信中…';
    $('send-actions').style.display = 'none';
    try {
      await post(S.payload);
      ls('hoi_pending', null);
      document.querySelector('#s-done h1').textContent = 'ありがとうございました';
      st.className = 'status ok'; st.textContent = '送信完了しました。このページは閉じてかまいません。';
      $('done-note').textContent = '規則の答え合わせは授業で行います。まわりの人にはまだ話さないでください。';
    } catch (err) {
      st.className = 'status ng'; st.textContent = '送信できませんでした：' + err.message;
      $('send-actions').style.display = '';
      $('done-note').textContent = 'うまくいかないときは「記録をファイルで保存」して、先生の指示に従って提出してください。';
    }
  }
  $('btn-retry').onclick = send;
  $('btn-dl').onclick = () => {
    const blob = new Blob([JSON.stringify(S.payload, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `hoi_${S.sid}_${S.session}.json`; a.click();
  };

  // 前回送れなかった記録があれば、こっそり再送する
  (async function resendPending() {
    const raw = ls('hoi_pending'); if (!raw || !C.GAS_URL) return;
    try { await post(JSON.parse(raw)); ls('hoi_pending', null); $('pending-note').textContent = '（前回送信できなかった記録を送信しました）'; }
    catch (e) { /* 次回また試す */ }
  })();

  // デバッグ用：?auto=1 で自動プレイ（動作確認用）
  if (new URLSearchParams(location.search).get('auto')) {
    window.HOI_AUTO = { choose, S };
  }
})();
