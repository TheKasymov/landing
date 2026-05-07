/* Wallet network graph — drainer cluster + grey neighbors visualization */

const NODES = [
  // YOU
  { id: 'self',    x: 120, y: 230, r: 16, type: 'self',    label: 'YOU',           addr: 'YOUR WALLET' },
  // Recipient
  { id: 'target',  x: 430, y: 230, r: 14, type: 'target',  label: '0xC1A4…K2',     addr: 'RECIPIENT' },
  // Known drainers
  { id: 'd1',      x: 640, y: 120, r: 12, type: 'drainer', label: 'DRAINER',       addr: 'sanc-DR1' },
  { id: 'd2',      x: 680, y: 340, r: 12, type: 'drainer', label: 'DRAINER',       addr: 'sanc-DR2' },
  // Mixer
  { id: 'mix',     x: 540, y: 60,  r: 10, type: 'mixer',   label: 'MIXER',         addr: 'tornado' },
  // Grey neighbors (1-2 hops from drainer)
  { id: 'g1',      x: 510, y: 150, r: 6,  type: 'grey' },
  { id: 'g2',      x: 590, y: 200, r: 6,  type: 'grey' },
  { id: 'g3',      x: 560, y: 290, r: 6,  type: 'grey' },
  { id: 'g4',      x: 510, y: 330, r: 6,  type: 'grey' },
  { id: 'g5',      x: 620, y: 240, r: 5,  type: 'grey' },
  { id: 'g6',      x: 720, y: 200, r: 5,  type: 'grey' },
  { id: 'g7',      x: 730, y: 280, r: 5,  type: 'grey' },
  { id: 'g8',      x: 470, y: 380, r: 5,  type: 'grey' },
  { id: 'g9',      x: 460, y: 90,  r: 5,  type: 'grey' },
  // Far-side wallets connected to your side
  { id: 'n1',      x: 230, y: 130, r: 5,  type: 'grey' },
  { id: 'n2',      x: 250, y: 320, r: 5,  type: 'grey' },
  { id: 'n3',      x: 320, y: 200, r: 5,  type: 'grey' },
];

const EDGES = [
  // Pending tx — your wallet → recipient
  { a: 'self',   b: 'target', danger: true,  pending: true },
  // Recipient ↔ drainers (the smoking gun)
  { a: 'target', b: 'd1',     danger: true },
  { a: 'target', b: 'd2',     danger: true },
  { a: 'target', b: 'mix',    warn: true },
  // Drainer cluster
  { a: 'd1', b: 'g1' }, { a: 'd1', b: 'g2' }, { a: 'd1', b: 'g6' }, { a: 'd1', b: 'g9' },
  { a: 'd2', b: 'g3' }, { a: 'd2', b: 'g4' }, { a: 'd2', b: 'g5' }, { a: 'd2', b: 'g7' }, { a: 'd2', b: 'g8' },
  { a: 'mix', b: 'g9' }, { a: 'mix', b: 'g1' }, { a: 'mix', b: 'g2' },
  { a: 'd1', b: 'd2' },
  { a: 'g2', b: 'g5' }, { a: 'g3', b: 'g5' }, { a: 'g6', b: 'g7' },
  { a: 'target', b: 'g1' }, { a: 'target', b: 'g3' },
  // Your side (clean history)
  { a: 'self', b: 'n1' }, { a: 'self', b: 'n2' }, { a: 'self', b: 'n3' },
  { a: 'n3',   b: 'target', warn: true }, // single thin "shared funder" hint
];

(function drawGraph() {
  const svg = document.getElementById('wallet-graph');
  if (!svg) return;
  const edgesG = svg.querySelector('#edges');
  const nodesG = svg.querySelector('#nodes');
  const byId = Object.fromEntries(NODES.map(n => [n.id, n]));

  // Edges
  EDGES.forEach((e, i) => {
    const a = byId[e.a], b = byId[e.b];
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
    if (e.danger) line.setAttribute('class', 'edge-danger');
    else if (e.warn) line.setAttribute('class', 'edge-warn');
    if (e.pending) {
      line.setAttribute('stroke-dasharray', '6 4');
      line.style.animation = `dash 1.5s linear infinite`;
    }
    edgesG.appendChild(line);
  });

  // Pulsing rings on drainers
  ['d1', 'd2'].forEach((id, idx) => {
    const n = byId[id];
    for (let r = 0; r < 2; r++) {
      const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ring.setAttribute('cx', n.x); ring.setAttribute('cy', n.y);
      ring.setAttribute('r', n.r);
      ring.setAttribute('class', 'pulse-ring');
      ring.style.animation = `pulse-ring 2.4s ${idx * 0.4 + r * 1.2}s ease-out infinite`;
      nodesG.appendChild(ring);
    }
  });

  // Nodes
  NODES.forEach(n => {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', n.x); c.setAttribute('cy', n.y); c.setAttribute('r', n.r);
    c.setAttribute('class', 'node-' + n.type);
    nodesG.appendChild(c);

    if (n.label) {
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', n.x);
      t.setAttribute('y', n.y + n.r + 14);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('class', 'label-' + (n.type === 'mixer' ? 'drainer' : n.type));
      t.textContent = n.label;
      nodesG.appendChild(t);
    }
  });

  // Inject keyframes once
  if (!document.getElementById('graph-keyframes')) {
    const s = document.createElement('style');
    s.id = 'graph-keyframes';
    s.textContent = `
      @keyframes pulse-ring {
        0%   { r: var(--start, 12); opacity: 0.6; }
        100% { r: 36; opacity: 0; }
      }
      @keyframes dash {
        from { stroke-dashoffset: 0; }
        to   { stroke-dashoffset: -20; }
      }
      #wallet-graph .pulse-ring { transform-box: fill-box; }
    `;
    document.head.appendChild(s);
  }
})();
