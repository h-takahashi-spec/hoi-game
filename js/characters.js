// ===== 3体の相手キャラクタ（すべて同じ構図・同じ線の太さ・同じ動き） =====
// 構造：<g.body>（動かない）＋ <g.head>（首を中心に少し傾く）＋ <g.face>（目鼻が左右に寄る）
// 「左」「右」は画面で見たときの左右。顔のパーツがそちらへ寄ることで「そっちを向いた」に見せる。
(function () {
  const INK = '#2a2420';
  const O = `stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;

  const shadow = `<ellipse cx="150" cy="314" rx="112" ry="10" fill="${INK}" opacity=".12"/>`;

  // ---------------- 人間 ----------------
  const human = `
  ${shadow}
  <g class="body">
    <path d="M40 320 C40 262 88 236 150 236 C212 236 260 262 260 320 Z" fill="#5b8fa8" ${O}/>
    <path d="M118 240 Q150 262 182 240" fill="none" ${O}/>
    <path d="M130 196 L170 196 L172 244 Q150 256 128 244 Z" fill="#f0c4a0" ${O}/>
  </g>
  <g class="head">
    <path d="M72 140 C66 70 106 44 150 44 C194 44 234 70 228 140 C228 176 214 196 204 204 L96 204 C86 196 72 176 72 140 Z" fill="#3b2a22" ${O}/>
    <circle cx="80" cy="146" r="13" fill="#f0c4a0" ${O}/>
    <circle cx="220" cy="146" r="13" fill="#f0c4a0" ${O}/>
    <ellipse cx="150" cy="140" rx="68" ry="76" fill="#f6cfad" ${O}/>
    <g class="face">
      <ellipse cx="114" cy="170" rx="10" ry="6" fill="#e88c7d" opacity=".35"/>
      <ellipse cx="186" cy="170" rx="10" ry="6" fill="#e88c7d" opacity=".35"/>
      <path d="M110 118 Q123 110 136 117" fill="none" ${O}/>
      <path d="M164 117 Q177 110 190 118" fill="none" ${O}/>
      <g class="eyes">
        <ellipse cx="123" cy="142" rx="7.5" ry="10" fill="${INK}"/>
        <ellipse cx="177" cy="142" rx="7.5" ry="10" fill="${INK}"/>
        <circle cx="126" cy="138" r="2.6" fill="#fff"/>
        <circle cx="180" cy="138" r="2.6" fill="#fff"/>
      </g>
      <path d="M150 148 Q145 162 153 164" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <path d="M136 182 Q150 192 164 182" fill="none" ${O}/>
    </g>
    <path d="M84 128 C80 78 116 58 150 58 C192 58 222 82 216 128 C204 108 186 98 166 96 C156 112 124 122 84 128 Z" fill="#3b2a22" ${O}/>
  </g>`;

  // ---------------- 柴犬 ----------------
  const shiba = `
  ${shadow}
  <g class="body">
    <path d="M214 296 C266 296 272 236 238 230 C214 228 214 256 232 258" fill="none" stroke="${INK}" stroke-width="26" stroke-linecap="round"/>
    <path d="M214 296 C266 296 272 236 238 230 C214 228 214 256 232 258" fill="none" stroke="#d9893f" stroke-width="18" stroke-linecap="round"/>
    <path d="M66 320 C62 250 96 200 150 200 C204 200 238 250 234 320 Z" fill="#d9893f" ${O}/>
    <path d="M112 320 C108 268 126 226 150 226 C174 226 192 268 188 320 Z" fill="#f6e6cf" stroke="none"/>
    <ellipse cx="126" cy="312" rx="18" ry="11" fill="#f6e6cf" ${O}/>
    <ellipse cx="174" cy="312" rx="18" ry="11" fill="#f6e6cf" ${O}/>
  </g>
  <g class="head">
    <path d="M80 112 L94 30 L142 82 Z" fill="#d9893f" ${O}/>
    <path d="M220 112 L206 30 L158 82 Z" fill="#d9893f" ${O}/>
    <path d="M96 94 L102 52 L128 82 Z" fill="#f3c19a"/>
    <path d="M204 94 L198 52 L172 82 Z" fill="#f3c19a"/>
    <path d="M150 70 C206 70 234 104 232 146 C230 190 196 214 150 214 C104 214 70 190 68 146 C66 104 94 70 150 70 Z" fill="#d9893f" ${O}/>
    <g class="face">
      <path d="M150 114 C118 114 96 136 94 164 C94 196 122 212 150 212 C178 212 206 196 206 164 C204 136 182 114 150 114 Z" fill="#f6e6cf"/>
      <ellipse cx="121" cy="114" rx="9" ry="5.5" fill="#f6e6cf"/>
      <ellipse cx="179" cy="114" rx="9" ry="5.5" fill="#f6e6cf"/>
      <g class="eyes">
        <ellipse cx="121" cy="138" rx="7.5" ry="9" fill="${INK}"/>
        <ellipse cx="179" cy="138" rx="7.5" ry="9" fill="${INK}"/>
        <circle cx="124" cy="134" r="2.6" fill="#fff"/>
        <circle cx="182" cy="134" r="2.6" fill="#fff"/>
      </g>
      <ellipse cx="150" cy="168" rx="13" ry="9" fill="${INK}"/>
      <ellipse cx="146" cy="165" rx="4" ry="2.4" fill="#fff" opacity=".5"/>
      <path d="M150 177 L150 186 M136 188 Q143 196 150 186 Q157 196 164 188" fill="none" ${O}/>
    </g>
  </g>`;

  // ---------------- コンピュータ（メカメカしい） ----------------
  const rivet = (x, y) => `<circle cx="${x}" cy="${y}" r="3.5" fill="#c9d0d6" stroke="${INK}" stroke-width="2"/>`;
  const computer = `
  ${shadow}
  <defs>
    <clipPath id="cmp-screen"><rect x="100" y="86" width="100" height="86" rx="6"/></clipPath>
    <pattern id="cmp-scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1.4" fill="#000" opacity=".28"/></pattern>
  </defs>
  <g class="body">
    <path d="M68 320 L84 240 L216 240 L232 320 Z" fill="#8a949c" ${O}/>
    <rect x="108" y="256" width="84" height="44" rx="5" fill="#5c666e" ${O}/>
    <circle cx="128" cy="278" r="12" fill="#eef1e8" ${O}/>
    <path d="M128 278 L136 270" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="156" cy="270" r="5" fill="#e05a47" stroke="${INK}" stroke-width="2"/>
    <circle cx="172" cy="270" r="5" fill="#eeb43c" stroke="${INK}" stroke-width="2"/>
    <circle class="led" cx="164" cy="288" r="5" fill="#7ef0a8" stroke="${INK}" stroke-width="2"/>
    ${rivet(94, 252)}${rivet(206, 252)}${rivet(84, 306)}${rivet(216, 306)}
    <path d="M70 300 C40 300 40 262 64 252" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
    <path d="M70 300 C40 300 40 262 64 252" fill="none" stroke="#41494f" stroke-width="4" stroke-linecap="round"/>
    <rect x="132" y="200" width="36" height="12" rx="3" fill="#6d767e" ${O}/>
    <rect x="128" y="212" width="44" height="12" rx="3" fill="#6d767e" ${O}/>
    <rect x="132" y="224" width="36" height="14" rx="3" fill="#6d767e" ${O}/>
  </g>
  <g class="head">
    <path d="M150 58 L150 30" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    <circle class="antenna" cx="150" cy="24" r="8" fill="#e05a47" ${O}/>
    <rect x="60" y="112" width="20" height="48" rx="4" fill="#6d767e" ${O}/>
    <rect x="220" y="112" width="20" height="48" rx="4" fill="#6d767e" ${O}/>
    <rect x="74" y="56" width="152" height="150" rx="14" fill="#9aa4ac" ${O}/>
    <path d="M118 64 L118 74 M130 64 L130 74 M142 64 L142 74 M158 64 L158 74 M170 64 L170 74 M182 64 L182 74" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    <rect x="90" y="78" width="120" height="102" rx="10" fill="#3a4248" ${O}/>
    <rect x="100" y="86" width="100" height="86" rx="6" fill="#163126"/>
    <g clip-path="url(#cmp-screen)">
      <g class="face">
        <g class="eyes">
          <rect x="114" y="106" width="18" height="24" rx="2" fill="#7ef0a8"/>
          <rect x="168" y="106" width="18" height="24" rx="2" fill="#7ef0a8"/>
          <rect x="118" y="110" width="5" height="5" fill="#d8ffe6"/>
          <rect x="172" y="110" width="5" height="5" fill="#d8ffe6"/>
        </g>
        <path d="M132 152 L140 152 L140 158 L148 158 L148 152 L156 152 L156 158 L164 158 L164 152 L170 152" fill="none" stroke="#7ef0a8" stroke-width="4" stroke-linejoin="miter"/>
      </g>
      <rect x="100" y="86" width="100" height="86" fill="url(#cmp-scan)"/>
      <path d="M104 90 L150 90 L104 120 Z" fill="#fff" opacity=".07"/>
    </g>
    ${rivet(84, 66)}${rivet(216, 66)}${rivet(84, 196)}${rivet(216, 196)}
    <rect x="104" y="188" width="92" height="8" rx="2" fill="#6d767e" stroke="${INK}" stroke-width="2"/>
  </g>`;

  window.HOI_CHARS = {
    human:    { id: 'human',    label: '人間',       intro: 'あなたの相手は、この人です。',           svg: human },
    shiba:    { id: 'shiba',    label: '柴犬',       intro: 'あなたの相手は、この柴犬です。',         svg: shiba },
    computer: { id: 'computer', label: 'コンピュータ', intro: 'あなたの相手は、このコンピュータです。', svg: computer },
  };

  window.HOI_CHAR_SVG = function (id, extraClass) {
    return `<svg class="char ${extraClass || ''}" data-char="${id}" viewBox="0 0 300 330" role="img" aria-label="${window.HOI_CHARS[id].label}">${window.HOI_CHARS[id].svg}</svg>`;
  };
})();
