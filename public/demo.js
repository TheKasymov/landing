/* Live demo: 3 transaction scenarios, animated verdict swap. */

const SCENARIOS = [
  {
    id: 'safe',
    emoji: '✅',
    label: 'Safe transfer',
    tier: 'safe',
    score: 18,
    levelTag: 'GREEN · ALLOW',
    summary: 'Standard SOL transfer between two known wallets. No suspicious patterns detected.',
    rec: 'Auto-approve · pass through to wallet',
    tx: [
      ['k', '// transaction-decoded'],
      ['k', 'origin           '],
      ['green', '"jup.ag" (trusted)'],
      ['', '\nprogram          '],
      ['blue', '"System Program"'],
      ['', '\ninstruction      '],
      ['blue', '"transfer"'],
      ['', '\nsigner.delta_SOL '],
      ['green', '"−0.1000 SOL (~$20)"'],
      ['', '\nrecipients       '],
      ['', '1 (known address)'],
      ['', '\nsim.success      '],
      ['green', 'true'],
      ['', '\n\n'],
      ['k', '// heuristics'],
      ['green', '\n✓ direct system_program transfer'],
      ['green', '\n✓ trusted domain'],
      ['green', '\n✓ no authority changes'],
      ['green', '\n✓ recipient seen 412 times'],
    ],
    reasons: [
      ['r-green', '✓ Direct SOL transfer via System Program'],
      ['r-green', '✓ Trusted domain: jup.ag'],
      ['r-green', '✓ SOL impact: 0.1000 SOL (~$20)'],
      ['r-green', '✓ No suspicious account connections'],
    ],
  },
  {
    id: 'warn',
    emoji: '⚠️',
    label: 'Delegate warning',
    tier: 'warn',
    score: 52,
    levelTag: 'YELLOW · WARN',
    summary: 'This transaction delegates spending authority to another account. Review carefully before approving.',
    rec: 'Show explicit warning · require user confirmation',
    tx: [
      ['k', '// transaction-decoded'],
      ['', '\norigin           '],
      ['yellow', '"unknown-dapp.xyz"'],
      ['', '\nprogram          '],
      ['blue', '"Token Program"'],
      ['', '\ninstruction      '],
      ['yellow', '"approve"'],
      ['', '\ndelegate         '],
      ['yellow', '"5fY3...X9pK" (new)'],
      ['', '\namount           '],
      ['yellow', 'u64::MAX'],
      ['', '\nsigner.delta_SOL '],
      ['', '0.0000'],
      ['', '\n\n'],
      ['k', '// heuristics'],
      ['yellow', '\n⚠ unknown domain (first seen)'],
      ['yellow', '\n⚠ unlimited delegate authority'],
      ['yellow', '\n⚠ unknown program interaction'],
      ['green', '\n✓ no SOL outflow'],
    ],
    reasons: [
      ['r-yellow', '⚠ Unknown domain: unknown-dapp.xyz'],
      ['r-yellow', '⚠ Delegating token spending authority to another account'],
      ['r-yellow', '⚠ Unknown program interaction detected'],
      ['r-green', '✓ SOL impact: 0.0000 SOL'],
    ],
  },
  {
    id: 'danger',
    emoji: '🔴',
    label: 'Drain attack',
    tier: 'danger',
    score: 92,
    levelTag: 'RED · BLOCK / CO-SIGN',
    summary: 'This transaction changes ownership authority and transfers all assets. EXTREMELY DANGEROUS.',
    rec: 'Block by default · require Guardian co-sign',
    tx: [
      ['k', '// transaction-decoded'],
      ['', '\norigin           '],
      ['red', '"phish-fake.tk" (BLOCKED)'],
      ['', '\nclaims_to_be     '],
      ['red', '"Jupiter" — SPOOFED'],
      ['', '\nprogram          '],
      ['red', 'unknown 0xA1B2…'],
      ['', '\ninstruction[0]   '],
      ['red', '"setAuthority"'],
      ['', '\ninstruction[1]   '],
      ['red', '"transfer (all)"'],
      ['', '\nsigner.delta_SOL '],
      ['red', '"−12.481 SOL (−98%)"'],
      ['', '\nhttps            '],
      ['red', 'false'],
      ['', '\n\n'],
      ['k', '// heuristics'],
      ['red', '\n✗ blocked domain match'],
      ['red', '\n✗ authority transfer detected'],
      ['red', '\n✗ signer drain >80%'],
      ['red', '\n✗ phishing — claims "Jupiter"'],
    ],
    reasons: [
      ['r-red', '✗ BLOCKED DOMAIN: phish-fake.tk'],
      ['r-red', '✗ Changing ownership or authority — high-risk operation'],
      ['r-red', '✗ Signer lost >80% of balance'],
      ['r-red', '✗ Large SOL outflow from signer account'],
      ['r-red', '✗ Phishing detected — domain claims "Jupiter" but is not trusted'],
      ['r-yellow', '⚠ No HTTPS — connection unencrypted'],
    ],
  },
];

const tabsEl = document.getElementById('demo-tabs');
const txEl = document.getElementById('demo-tx');
const vbEl = document.getElementById('verdict-box');

function renderTabs(activeId) {
  tabsEl.innerHTML = '';
  SCENARIOS.forEach(s => {
    const b = document.createElement('button');
    b.className = 'demo-tab' + (s.id === activeId ? ' active' : '');
    b.innerHTML = `<span class="tab-emoji">${s.emoji}</span> ${s.label}`;
    b.onclick = () => render(s.id);
    tabsEl.appendChild(b);
  });
}

const SHIELD_SAFE = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`;
const SHIELD_WARN = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.7 17-9-15a2 2 0 0 0-3.4 0l-9 15A2 2 0 0 0 2 20h18a2 2 0 0 0 1.7-3z"/><path d="M12 9v4M12 17h.01"/></svg>`;
const SHIELD_DANGER = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m14.5 9-5 5M9.5 9l5 5"/></svg>`;

function shieldFor(tier) {
  return tier === 'safe' ? SHIELD_SAFE : tier === 'warn' ? SHIELD_WARN : SHIELD_DANGER;
}

function render(id) {
  const s = SCENARIOS.find(x => x.id === id);
  renderTabs(id);

  // Tx pane: reset, then animate token-by-token typing
  txEl.innerHTML = '';
  let i = 0;
  const tokens = s.tx;
  const typeNext = () => {
    if (i >= tokens.length) return;
    const [cls, text] = tokens[i++];
    const span = document.createElement('span');
    if (cls) span.className = cls;
    span.textContent = text;
    txEl.appendChild(span);
    setTimeout(typeNext, 24);
  };
  typeNext();

  // Verdict pane
  vbEl.innerHTML = `
    <div class="verdict-pane ${s.tier}">
      <div class="verdict-top">
        <div class="verdict-shield shield-${s.tier}">${shieldFor(s.tier)}</div>
        <div class="verdict-meta">
          <div class="verdict-num ${s.tier}">${s.score}<span class="max">/100</span></div>
          <div class="verdict-tag tag-${s.tier}">${s.levelTag}</div>
        </div>
      </div>
      <p class="verdict-explain">${s.summary}</p>
      <ul class="reason-list">
        ${s.reasons.map(([cls, t]) => `<li class="${cls}">${t}</li>`).join('')}
      </ul>
      <div class="score-bar"><div class="score-fill ${s.tier}" style="width:0%"></div></div>
      <div style="font-size:11px;color:var(--text-muted);margin-top:14px;font-family:var(--font-mono);">RECOMMENDED: ${s.rec}</div>
    </div>`;
  // Animate score bar
  requestAnimationFrame(() => {
    const fill = vbEl.querySelector('.score-fill');
    setTimeout(() => { fill.style.width = s.score + '%'; }, 80);
  });
}

document.getElementById('hero-demo').onclick = () => {
  document.getElementById('demo').scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => render('danger'), 600);
};
document.getElementById('nav-cta').onclick = () => {
  document.getElementById('demo').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

render('danger');
