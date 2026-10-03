/**
 * あっち向いてホイ・ゲーム：記録の受け取り口（Google Apps Script）
 *
 *  1. 新しい Google スプレッドシートを作る
 *  2. 拡張機能 → Apps Script を開き、このファイルの中身を丸ごと貼り付ける
 *  3. 下の ADMIN_KEY を好きな合言葉に変える（先生用画面でデータを読むときに使う）
 *  4. デプロイ → 新しいデプロイ → 種類「ウェブアプリ」
 *       次のユーザーとして実行：自分
 *       アクセスできるユーザー：全員
 *  5. 表示された「ウェブアプリ URL」を config.js の GAS_URL と、先生用画面に貼る
 *
 *  記録は2つのタブに入ります。
 *    trials       … 1試行1行（1人40行）
 *    participants … 1人1行（自由記述・勝率のまとめ）
 */

const ADMIN_KEY = 'hoi';

const TRIAL_HEADERS = [
  'received_at', 'session_id', 'student_id', 'condition', 'cond_override', 'attempt',
  'trial', 'my_choice', 'opp_choice', 'win', 'my_score', 'opp_score',
  'rt_ms', 'delay_ms', 'trial_at', 'device', 'app_version',
];

const PARTICIPANT_HEADERS = [
  'received_at', 'session_id', 'student_id', 'condition', 'cond_override', 'attempt',
  'n_trials', 'total_wins', 'win_rate_first_half', 'win_rate_last_half', 'max_streak',
  'rule_text', 'duration_s', 'pattern', 'delay_min_ms', 'delay_max_ms',
  'device', 'screen', 'user_agent', 'started_at', 'finished_at', 'app_version',
];

const TEXT_COLS = ['student_id', 'session_id', 'rule_text'];

function sheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(headers);
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function toRow_(r, headers, now) {
  return headers.map(function (h) {
    if (h === 'received_at') return now;
    let v = r[h];
    if (v === undefined || v === null) return '';
    v = String(v).slice(0, h === 'rule_text' ? 2000 : 500);
    // 学籍番号や自由記述が数式・数値として解釈されないように
    if (TEXT_COLS.indexOf(h) >= 0) v = "'" + v;
    return v;
  });
}

// 学生のブラウザから記録を受け取る
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000);
    const data = JSON.parse(e.postData.contents);
    const trials = (data.trials || []).slice(0, 200);
    const p = data.participant;
    if (!p || !trials.length) return json_({ ok: false, error: 'データが空です' });

    // 同じセッションの二重送信を防ぐ
    const ps = sheet_('participants', PARTICIPANT_HEADERS);
    if (ps.getLastRow() > 1) {
      const ids = ps.getRange(2, 2, ps.getLastRow() - 1, 1).getValues().map(function (r) { return String(r[0]).replace(/^'/, ''); });
      if (ids.indexOf(String(p.session_id)) >= 0) return json_({ ok: true, duplicate: true });
    }

    const now = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm:ss');
    const ts = sheet_('trials', TRIAL_HEADERS);
    const tv = trials.map(function (r) { return toRow_(r, TRIAL_HEADERS, now); });
    ts.getRange(ts.getLastRow() + 1, 1, tv.length, TRIAL_HEADERS.length).setValues(tv);
    ps.appendRow(toRow_(p, PARTICIPANT_HEADERS, now));
    return json_({ ok: true, n: tv.length });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

// 先生用画面からデータを読む： ?key=合言葉
function doGet(e) {
  const key = (e && e.parameter && e.parameter.key) || '';
  if (key !== ADMIN_KEY) return json_({ ok: false, error: '合言葉が違います' });
  function read(name, headers) {
    const sh = sheet_(name, headers);
    const v = sh.getDataRange().getValues();
    const h = v.shift();
    return v.map(function (row) {
      const o = {};
      h.forEach(function (k, i) { o[k] = row[i]; });
      return o;
    });
  }
  return json_({
    ok: true,
    trials: read('trials', TRIAL_HEADERS),
    participants: read('participants', PARTICIPANT_HEADERS),
  });
}
