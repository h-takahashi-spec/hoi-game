// ===== 設定ファイル（ここだけ書き換えれば動きます） =====
window.HOI_CONFIG = {
  // Google Apps Script のウェブアプリ URL（README の手順で取得して貼る）
  GAS_URL: 'https://script.google.com/macros/s/AKfycbwUOkXpRQjU0l0fcnxFeZVGrsekv8INtBQ-sYL4DasKSML0ouNwsNZdmjogf-Ll8CE/exec',

  // 試行数
  N_TRIALS: 40,

  // 相手の手の並び（全条件共通）。'L' = 画面の左、'R' = 画面の右。これを繰り返す
  PATTERN: ['L', 'L', 'R', 'R'],

  // 「あっち向いて…」から「ホイ！」までの待ち時間（ミリ秒）。全条件共通の一様乱数
  DELAY_MIN_MS: 600,
  DELAY_MAX_MS: 1600,

  // 結果を表示してから次の回に進むまでの時間（ミリ秒）
  RESULT_HOLD_MS: 1300,

  // 割り付けに使う「塩」。学期ごとに変えると、同じ学籍番号でも別の条件になります
  ASSIGN_SALT: 'hoi-2026-fall',

  // 条件（順番を変えないでください）
  CONDITIONS: ['human', 'shiba', 'computer'],

  // 過去の相手の手を一覧で見せるか（false 推奨：見せると誰でも気づきやすくなります）
  SHOW_HISTORY: false,

  APP_VERSION: '1.0',
};
