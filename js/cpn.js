// Simulateur de réseaux de Petri colorés et temporisés (problèmes 5 et 6, séance d'exercices 3).
// Un jeton porte une valeur (chaîne, nombre, booléen, () ou n-uplet) et un horodatage ; les arcs portent des inscriptions
// avec des variables ; une transition peut porter une garde ; un arc de sortie peut ajouter un délai @+d.
// Règle de tir (synthèse du problème 6) : une liaison est tirable quand sa garde est vraie, que chaque place d'entrée contient
// les jetons demandés et que l'horloge a atteint son moment d'activation (le plus grand horodatage des jetons consommés).
// Si rien n'est tirable, l'horloge avance jusqu'au plus petit moment d'activation à venir.
// Fichier autonome, chargeable en Node pour les tests (verif/test_cpn.mjs).
(function (global) {
  const NETS = {};
  const CPN = { nets: NETS };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const r1 = v => Math.round(v * 10) / 10;

  // ------------------------------------------------------------------ valeurs
  // n-uplet = tableau ; liste (exercice 3.3) = { L: [...] } ; () = null
  CPN.list = a => ({ L: a });
  const key = v => JSON.stringify(v);
  const fmtV = v => v === null || v === undefined ? '()' : v === true ? 'vrai' : v === false ? 'faux' : Array.isArray(v) ? '(' + v.map(fmtV).join(', ') + ')'
    : typeof v === 'object' && v.L ? '[' + v.L.map(fmtV).join(', ') + ']' : String(v);
  CPN.fmtV = fmtV;
  // Jeton horodaté : CPN.at(valeur, instant)
  CPN.at = (v, t) => ({ __tok: true, v, t });
  const tok = x => x && x.__tok ? { v: x.v, t: x.t } : { v: x, t: 0 };

  // ------------------------------------------------------------------ inscriptions
  function splitTop(s) { const out = []; let d = 0, cur = ''; for (const ch of s) { if (ch === '(' || ch === '[') d++; if (ch === ')' || ch === ']') d--; if (ch === ',' && d === 0) { out.push(cur.trim()); cur = ''; } else cur += ch; } if (cur.trim()) out.push(cur.trim()); return out; }
  function parseTerm(s, vars) {
    s = s.trim();
    if (s === '()') return { c: null };
    if (s[0] === '(' && s.endsWith(')')) return { tup: splitTop(s.slice(1, -1)).map(x => parseTerm(x, vars)) };
    if (/^-?\d+$/.test(s)) return { c: +s };
    if (/^".*"$/.test(s)) return { c: s.slice(1, -1) };
    if (s === 'vrai') return { c: true }; if (s === 'faux') return { c: false };
    if (vars.includes(s)) return { v: s };
    if (/^[\p{L}_][\p{L}\p{N}_]*$/u.test(s)) return { c: s };
    throw new Error('inscription non reconnue : ' + s);
  }
  function match(term, val, b) {
    if ('c' in term) return key(term.c) === key(val) ? b : null;
    if (term.v) { if (term.v in b) return key(b[term.v]) === key(val) ? b : null; return { ...b, [term.v]: val }; }
    if (!Array.isArray(val) || val.length !== term.tup.length) return null;
    let bb = b; for (let i = 0; i < term.tup.length && bb; i++) bb = match(term.tup[i], val[i], bb);
    return bb;
  }
  function inst(term, b) {
    if ('c' in term) return term.c;
    if (term.v) { if (!(term.v in b)) throw new Error('variable non liée : ' + term.v); return b[term.v]; }
    return term.tup.map(t => inst(t, b));
  }

  // ------------------------------------------------------------------ modèle
  // net = { title, timed, vars:[…], places:[{id,x,y,lp,type,init:[…]}], trans:[{id,x,y,lp,guard,g,derive,gp}],
  //         arcs:[[de, vers, inscription, { out, delay, need, bend, lo }]] }
  CPN.define = (id, net) => {
    net.id = id; net.vars = net.vars || [];
    net.P = net.places.map(p => p.id); net.T = net.trans.map(t => t.id);
    net.by = Object.fromEntries([...net.places, ...net.trans].map(o => [o.id, o]));
    net.isP = Object.fromEntries(net.P.map(p => [p, true]));
    net.ins = Object.fromEntries(net.T.map(t => [t, []])); net.outs = Object.fromEntries(net.T.map(t => [t, []]));
    net.arcs = net.arcs.map(([from, to, text = '', o = {}]) => {
      const a = { from, to, text, ...o };
      if (net.isP[from] && net.ins[to]) {
        if (!a.need) a.pat = splitTop(text.trim() || '()').map(s => parseTerm(s, net.vars)); // flèche sans texte : un jeton ()
        net.ins[to].push(a);
      } else if (net.isP[to] && net.outs[from]) {
        const m = /^(.*?)@\+\s*(.+)$/.exec(text), body = (m ? m[1] : text).trim() || '()';
        if (!a.out) { const terms = splitTop(body).map(s => parseTerm(s, net.vars)); a.out = b => terms.map(t => inst(t, b)); }
        if (!a.delay) { const d = m && /^\d+$/.test(m[2].trim()) ? +m[2] : 0; if (m && !/^\d+$/.test(m[2].trim())) throw new Error(`${id} : délai calculé sans fonction (${text})`); a.delay = () => d; }
        net.outs[from].push(a);
      } else throw new Error(`${id} : arc invalide (${from}, ${to})`);
      return a;
    });
    NETS[id] = net; return net;
  };
  const get = n => typeof n === 'string' ? NETS[n] : n;

  CPN.init = net => { net = get(net); return { M: Object.fromEntries(net.places.map(p => [p.id, (p.init || []).map(tok)])), clock: 0 }; };
  const clone = S => ({ M: Object.fromEntries(Object.entries(S.M).map(([p, l]) => [p, l.slice()])), clock: S.clock });

  // Toutes les liaisons d'une transition, avec leur moment d'activation (même celles qui ne sont pas encore prêtes)
  CPN.bindings = (net, S, t) => {
    net = get(net);
    const tr = net.by[t], items = [], res = [], seen = new Set();
    net.ins[t].filter(a => a.pat).forEach(a => a.pat.forEach(term => items.push([a.from, term])));
    const groups = p => { const g = new Map(); for (const x of S.M[p]) { const k = key(x.v); if (!g.has(k)) g.set(k, x.v); } return [...g.values()]; };
    const finish = b0 => {
      let b = b0;
      if (tr.derive) b = { ...b, ...tr.derive(b) };
      if (tr.g && !tr.g(b)) return;
      const need = {}; // place -> clé -> nombre
      const add = (p, v) => { const k = key(v); need[p] = need[p] || {}; need[p][k] = (need[p][k] || 0) + 1; };
      for (const a of net.ins[t]) { if (a.pat) a.pat.forEach(term => add(a.from, inst(term, b))); else a.need(b).forEach(v => add(a.from, v)); }
      let act = 0;
      for (const p in need) for (const k in need[p]) {
        const ts = S.M[p].filter(x => key(x.v) === k).map(x => x.t).sort((x, y) => x - y);
        if (ts.length < need[p][k]) return;
        act = Math.max(act, ts[need[p][k] - 1]);
      }
      const shown = Object.keys(b).filter(v => net.vars.includes(v) || (tr.derive && v in tr.derive(b)));
      const id = t + '|' + shown.map(v => v + '=' + key(b[v])).join(';');
      if (seen.has(id)) return; seen.add(id);
      res.push({ t, b, act, need, id });
    };
    const rec = (i, b) => { if (i === items.length) return finish(b); const [p, term] = items[i]; for (const v of groups(p)) { const b2 = match(term, v, b); if (b2) rec(i + 1, b2); } };
    rec(0, {});
    return res;
  };
  CPN.all = (net, S) => { net = get(net); return net.T.flatMap(t => CPN.bindings(net, S, t)); };
  CPN.ready = (net, S) => CPN.all(net, S).filter(x => x.act <= S.clock);
  CPN.next = (net, S) => { const f = CPN.all(net, S).map(x => x.act).filter(a => a > S.clock); return f.length ? Math.min(...f) : null; };
  CPN.fire = (net, S, bd) => {
    net = get(net);
    if (bd.act > S.clock) throw new Error(`${bd.t} n'est pas encore tirable`);
    const N = clone(S), made = [];
    for (const p in bd.need) for (const k in bd.need[p]) for (let i = 0; i < bd.need[p][k]; i++) {
      let best = -1; N.M[p].forEach((x, j) => { if (key(x.v) === k && x.t <= S.clock && (best < 0 || x.t < N.M[p][best].t)) best = j; });
      if (best < 0) throw new Error(`jeton manquant dans ${p}`);
      N.M[p].splice(best, 1);
    }
    for (const a of net.outs[bd.t]) { const d = a.delay(bd.b); for (const v of a.out(bd.b)) { const x = { v, t: S.clock + d }; N.M[a.to].push(x); made.push([a.to, x]); } }
    N.made = made;
    return N;
  };
  CPN.advance = (net, S) => { const n = CPN.next(net, S); if (n == null) return null; const N = clone(S); N.clock = n; return N; };
  const pickRandom = l => l[Math.floor(Math.random() * l.length)];
  // Simulation complète : tire au hasard parmi les liaisons prêtes, fait avancer l'horloge quand rien n'est prêt
  CPN.run = (net, S0, { maxSteps = 20000, until = Infinity, pick = pickRandom, onStep } = {}) => {
    net = get(net); let S = S0 || CPN.init(net), steps = 0, last = S.clock; const log = [];
    while (steps < maxSteps) {
      const r = CPN.ready(net, S);
      if (!r.length) { const n = CPN.next(net, S); if (n == null || n > until) break; S = { ...S, clock: n }; continue; }
      const bd = pick(r); const N = CPN.fire(net, S, bd); log.push({ clock: S.clock, bd, made: N.made }); S = N; steps++; last = S.clock;
      if (onStep) onStep(S, bd);
    }
    return { S, steps, last, log };
  };
  // Marquage en texte, comme dans le cours : [ana, ben, 2.cleo] ou [ana@0, ben@5]
  CPN.fmtPlace = (net, l, timed) => {
    net = get(net); timed = timed == null ? net.timed : timed;
    const g = new Map(); l.slice().sort((a, b) => key(a.v) < key(b.v) ? -1 : key(a.v) > key(b.v) ? 1 : a.t - b.t).forEach(x => { const k = key(x.v) + (timed ? '@' + x.t : ''); const e = g.get(k); if (e) e.n++; else g.set(k, { x, n: 1 }); });
    return '[' + [...g.values()].map(({ x, n }) => (n > 1 ? n + '.' : '') + fmtV(x.v) + (timed ? '@' + x.t : '')).join(', ') + ']';
  };
  CPN.fmtB = (net, bd) => { net = get(net); const ks = Object.keys(bd.b); return ks.length ? '⟨' + ks.map(k => `${k} = ${fmtV(bd.b[k])}`).join(', ') + '⟩' : '⟨⟩'; };
  CPN.values = (S, p) => S.M[p].map(x => x.v);

  // Graphe d'accessibilité d'un réseau coloré non temporisé (exercice 3.3) : un état = un multiensemble par place
  const skey = S => Object.keys(S.M).map(p => S.M[p].map(x => key(x.v)).sort().join('+')).join('|');
  CPN.reach = (net, { max = 5000 } = {}) => {
    net = get(net); const S0 = CPN.init(net), states = [S0], index = new Map([[skey(S0), 0]]), edges = [];
    for (let i = 0; i < states.length; i++) {
      for (const bd of CPN.ready(net, states[i])) {
        const N = CPN.fire(net, states[i], bd); delete N.made; const k = skey(N);
        if (!index.has(k)) { if (states.length >= max) return { states, edges, truncated: true }; index.set(k, states.length); states.push(N); }
        edges.push([i, bd.t, index.get(k)]);
      }
    }
    const hasOut = new Set(edges.map(e => e[0]));
    return { states, edges, dead: states.map((_, i) => i).filter(i => !hasOut.has(i)), truncated: false };
  };

  // ------------------------------------------------------------------ dessin (mêmes ronds et carrés que le simulateur simple)
  const PR = 20, TS = 15;
  function edgePoint(o, isPlace, tx, ty, gap) {
    const dx = tx - o.x, dy = ty - o.y, L = Math.hypot(dx, dy) || 1;
    if (isPlace) return [o.x + dx / L * (PR + gap), o.y + dy / L * (PR + gap)];
    const k = (TS + gap) / Math.max(Math.abs(dx), Math.abs(dy), 1e-9);
    return [o.x + dx * k, o.y + dy * k];
  }
  let uid = 0;
  const tw = s => String(s).length * 6.1; // largeur approchée d'un texte
  CPN.svg = (net, S, { live = null, pickT = null } = {}) => {
    net = get(net);
    const id = 'cp' + (++uid), all = [...net.places, ...net.trans];
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const grow = (x, y) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); };
    const textBox = (x, y, s, anchor = 'middle') => { const w = tw(s); const a = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x; grow(a, y - 11); grow(a + w, y + 4); };
    all.forEach(o => { grow(o.x - 24, o.y - 24); grow(o.x + 24, o.y + 24); });
    const has = (a, b) => net.arcs.some(r => r.from === a && r.to === b);
    let arcs = '', ins = '';
    for (const a of net.arcs) {
      if (a.hidden) continue; // retour dessiné par la double flèche de l'arc aller (both)
      const A = net.by[a.from], B = net.by[a.to];
      const bend = a.bend != null ? a.bend : has(a.to, a.from) ? 12 : 0;
      let d, mx, my, nx, ny;
      if (a.via) { // coude(s) à angle droit : liste de points intermédiaires
        const pts = [[A.x, A.y], ...a.via, [B.x, B.y]];
        const [sx, sy] = edgePoint(A, !!net.isP[A.id], pts[1][0], pts[1][1], 1.5), [ex, ey] = edgePoint(B, !!net.isP[B.id], pts[pts.length - 2][0], pts[pts.length - 2][1], 4);
        const P = [[sx, sy], ...a.via, [ex, ey]]; P.forEach(([x, y]) => grow(x, y));
        d = 'M' + P.map(([x, y]) => `${r1(x)} ${r1(y)}`).join('L');
        const k = a.seg != null ? a.seg : Math.floor((P.length - 1) / 2), [px, py] = P[k], [qx, qy] = P[k + 1];
        mx = (px + qx) / 2; my = (py + qy) / 2; const L = Math.hypot(qx - px, qy - py) || 1; nx = -(qy - py) / L; ny = (qx - px) / L;
      } else {
        const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1; nx = -dy / L; ny = dx / L;
        const cx = (A.x + B.x) / 2 + nx * bend * 2, cy = (A.y + B.y) / 2 + ny * bend * 2;
        const [sx, sy] = edgePoint(A, !!net.isP[A.id], bend ? cx : B.x, bend ? cy : B.y, 1.5), [ex, ey] = edgePoint(B, !!net.isP[B.id], bend ? cx : A.x, bend ? cy : A.y, 4);
        grow(cx, cy);
        d = bend ? `M${r1(sx)} ${r1(sy)}Q${r1(cx)} ${r1(cy)} ${r1(ex)} ${r1(ey)}` : `M${r1(sx)} ${r1(sy)}L${r1(ex)} ${r1(ey)}`;
        mx = bend ? (sx + 2 * cx + ex) / 4 : (sx + ex) / 2; my = bend ? (sy + 2 * cy + ey) / 4 : (sy + ey) / 2;
      }
      arcs += `<path class="pn-arc" d="${d}" marker-end="url(#${id}-ah)"${a.both ? ` marker-start="url(#${id}-ah)"` : ''}/>`;
      if (a.text) {
        const side = a.side || (!a.via && bend ? Math.sign(bend) : 1), [ox, oy] = a.lo || [0, 0]; // arc courbé : texte du côté de la courbe
        const tx = mx + nx * 10 * side + ox, ty = my + ny * 10 * side + oy + 4;
        const anchor = Math.abs(nx) > .7 ? (nx * side > 0 ? 'start' : 'end') : 'middle';
        ins += `<text class="cp-ins" x="${r1(tx)}" y="${r1(ty)}" style="text-anchor:${anchor}">${esc(a.text)}</text>`; textBox(tx, ty, a.text, anchor);
      }
    }
    const label = o => { const lp = o.lp || 'b', t = esc(o.id); let x = o.x, y, an = 'middle';
      if (lp === 'b') y = o.y + 35; else if (lp === 't') y = o.y - 27; else if (lp === 'l') { x = o.x - 26; y = o.y + 4; an = 'end'; } else { x = o.x + 26; y = o.y + 4; an = 'start'; }
      textBox(x, y, o.id, an); return `<text class="pn-l" style="text-anchor:${an}" x="${x}" y="${y}">${t}</text>`; };
    const places = net.places.map(p => {
      const k = S.M[p.id].length;
      return `<g class="pn-p${k ? ' has' : ''}" data-p="${esc(p.id)}"><circle cx="${p.x}" cy="${p.y}" r="${PR}"/>${k ? `<text class="pn-n" x="${p.x}" y="${p.y + 5.5}">${k}</text>` : ''}${label(p)}</g>`;
    }).join('');
    const trans = net.trans.map(t => {
      const on = live && live.has(t.id), pk = pickT && pickT.has(t.id);
      let gd = '';
      if (t.guard) { const gp = t.gp || 'b', lp = t.lp || 'b'; let x = t.x, y, an = 'middle';
        if (gp === 'b') y = t.y + (lp === 'b' ? 50 : 32); else if (gp === 't') y = t.y - (lp === 't' ? 42 : 24); else if (gp === 'r') { x = t.x + 22; y = t.y + (lp === 'r' ? 18 : 4); an = 'start'; } else { x = t.x - 22; y = t.y + (lp === 'l' ? 18 : 4); an = 'end'; }
        if (t.go) { x += t.go[0]; y += t.go[1]; }
        gd = `<text class="cp-guard" style="text-anchor:${an}" x="${r1(x)}" y="${r1(y)}">${esc(t.guard)}</text>`; textBox(x, y, t.guard, an); }
      return `<g class="pn-t${on ? ' en' : ''}${pk ? ' picked' : ''}" data-t="${esc(t.id)}"${on ? ` tabindex="0" role="button" aria-label="Tirer ${esc(t.id)}"` : ''}>${on ? `<rect class="pn-halo" x="${t.x - TS - 5}" y="${t.y - TS - 5}" width="${2 * TS + 10}" height="${2 * TS + 10}" rx="7"/>` : ''}<rect class="pn-sq" x="${t.x - TS}" y="${t.y - TS}" width="${2 * TS}" height="${2 * TS}" rx="3"/>${label(t)}${gd}</g>`;
    }).join('');
    const pad = 8, W = x1 - x0 + 2 * pad, H = y1 - y0 + 2 * pad;
    return `<svg class="pn cpn-svg" viewBox="${r1(x0 - pad)} ${r1(y0 - pad)} ${r1(W)} ${r1(H)}" style="max-width:${Math.round(W * 1.45)}px;min-width:${Math.round(W * 0.7)}px" role="img" aria-label="Réseau coloré : ${esc(net.title || '')}">
<defs><marker id="${id}-ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="pn-ah" d="M0 1 9 5 0 9z"/></marker></defs>${arcs}${ins}${places}${trans}</svg>`;
  };
  // Tableau du marquage : une ligne par place, ses jetons au format du cours
  CPN.table = (net, S, { only } = {}) => {
    net = get(net);
    const rows = net.places.filter(p => !only || only.includes(p.id)).map(p => `<tr><th>${esc(p.id)}${p.type ? `<span class="cp-type">${esc(p.type)}</span>` : ''}</th><td class="v">${esc(CPN.fmtPlace(net, S.M[p.id]))}</td></tr>`).join('');
    return `<div class="pn-tblwrap cp-mk"><table class="pn-tbl"><thead><tr><th>Place</th><th>Jetons (marquage)</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  };
  // Schéma fixe (QCM, cartes) : le réseau et son marquage initial
  CPN.still = (id, S) => { const net = get(id); S = S || CPN.init(net); return `<div class="pn-still">${CPN.svg(net, S)}${CPN.table(net, S)}</div>`; };

  // ------------------------------------------------------------------ composant jouable
  const hhmm = (base, m) => { const t = base + m, h = Math.floor(t / 60), mn = t % 60; return `${h} h ${String(mn).padStart(2, '0')}`; };
  function record(sec, ok) { try { if (sec && global.Store) global.Store.recordTopic(sec, ok); } catch (e) { /* hors de l'app */ } }
  function shuffle(a) { const b = a.map((x, i) => [x, i]); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

  function mount(el, netIn, optsIn) {
    const net = netIn || NETS[el.dataset.net];
    if (!net) { el.innerHTML = `<p class="pn-msg warn">Réseau inconnu : ${esc(el.dataset.net)}</p>`; return; }
    let opts = optsIn || {}; if (!optsIn && el.dataset.opts) { try { opts = JSON.parse(el.dataset.opts); } catch (e) { opts = {}; } }
    const st = { S: CPN.init(net), hist: [], filter: null, res: null, runs: null, plot: null };
    const Q = opts.q || null, order = Q ? shuffle(Q.opts) : [];
    const clockTxt = c => net.timed ? `${c}${opts.unit ? ' ' + opts.unit : ''}${opts.base != null ? ` (${hhmm(opts.base, c)})` : ''}` : '';

    function paint() {
      const asking = Q && !st.res;
      const ready = asking ? [] : CPN.ready(net, st.S), nx = asking || ready.length ? null : CPN.next(net, st.S);
      const live = new Set(ready.map(b => b.t));
      const shown = st.filter ? ready.filter(b => b.t === st.filter) : ready;
      let q = '';
      if (Q) q = st.res ? `<div class="pn-q done ${st.res.ok ? 'ok' : 'ko'}"><b>${st.res.ok ? 'Bien vu.' : 'Pas tout à fait.'}</b> ${Q.expl} <span class="pn-free">Le plateau est maintenant libre : tire les transitions pour vérifier.</span></div>`
        : `<div class="pn-q"><span class="pn-tag">Prédis d’abord</span><p>${Q.text}</p><div class="cp-opts">${order.map(([o, i]) => `<button type="button" class="btn quiet small" data-qi="${i}">${o}</button>`).join('')}</div></div>`;
      const hist = st.hist.length ? `<ol class="cp-log">${st.hist.map(h => `<li>${net.timed ? `<span class="cp-clk">${esc(clockTxt(h.clock))}</span> ` : ''}<b>${esc(h.bd.t)}</b> ${esc(CPN.fmtB(net, h.bd))}${h.made.length ? ' → ' + h.made.map(([p, x]) => `<span class="pn-step">${esc(p)} : ${esc(fmtV(x.v))}${net.timed ? '@' + x.t : ''}</span>`).join(' ') : ''}</li>`).join('')}</ol>` : '<p class="pn-hint">Aucun tir pour l’instant.</p>';
      const binds = asking ? '' : ready.length ? `<div class="cp-binds"><div class="cp-bh">${net.timed ? `Tirables en ${esc(clockTxt(st.S.clock))}` : 'Liaisons tirables'}${st.filter ? ` pour <b>${esc(st.filter)}</b> <button type="button" class="link" data-act="all">voir toutes</button>` : ''} : clique une liaison pour la tirer.</div>${shown.map(b => `<button type="button" class="btn quiet small cp-b" data-b="${esc(b.id)}"><b>${esc(b.t)}</b> ${esc(CPN.fmtB(net, b))}</button>`).join('')}</div>`
        : nx != null ? `<div class="pn-msg warn">Rien n’est tirable en ${esc(clockTxt(st.S.clock))}. Prochain moment d’activation : <b>${esc(clockTxt(nx))}</b>. <button type="button" class="btn small" data-act="adv">Avancer l’horloge à ${nx}</button></div>`
          : '<div class="pn-msg end">Plus rien n’est possible : <b>marquage final</b>.</div>';
      el.innerHTML = `${opts.caption ? `<div class="pn-cap">${opts.caption}</div>` : ''}${q}
<div class="pn-board${asking ? ' locked' : ''}">${CPN.svg(net, st.S, { live })}</div>
${net.timed ? `<div class="pn-state cp-clock"><span>Horloge globale : <b>${esc(clockTxt(st.S.clock))}</b></span></div>` : ''}
${CPN.table(net, st.S)}
${binds}
${asking ? '' : `<div class="pn-hist"><b>Tirs</b>${hist}</div>
<div class="pn-tools"><button type="button" class="btn quiet small" data-act="rand" ${ready.length || nx != null ? '' : 'disabled'}>Pas au hasard</button><button type="button" class="btn quiet small" data-act="end" ${ready.length || nx != null ? '' : 'disabled'}>${opts.steps ? opts.steps + ' pas' : 'Jusqu’au bout'}</button><button type="button" class="btn quiet small" data-act="undo" ${st.hist.length ? '' : 'disabled'}>Annuler</button><button type="button" class="btn quiet small" data-act="reset" ${st.hist.length || st.S.clock ? '' : 'disabled'}>Recommencer</button>${opts.runs ? `<button type="button" class="btn quiet small" data-act="runs">${opts.runs.n} simulations</button>` : ''}${opts.plot ? `<button type="button" class="btn quiet small" data-act="plot">Courbe de ${esc(opts.plot.place)}</button>` : ''}</div>
${st.runs ? `<div class="pn-msg end">${st.runs}</div>` : ''}${st.plot || ''}`}`;
      if (global.renderMathInElement) try { global.renderMathInElement(el, { delimiters: [{ left: '$', right: '$', display: false }], throwOnError: false }); } catch (e) { /* sans KaTeX */ }
    }
    const fire = bd => { const N = CPN.fire(net, st.S, bd); st.hist.push({ clock: st.S.clock, bd, made: N.made, prev: st.S }); delete N.made; st.S = N; st.filter = null; paint(); };
    const step = () => { const r = CPN.ready(net, st.S); if (r.length) return fire(r[Math.floor(Math.random() * r.length)]); const n = CPN.next(net, st.S); if (n != null) { st.S = { ...st.S, clock: n }; paint(); } };
    function runs() {
      const { n, measure = 'last', label = 'durée totale' } = opts.runs, vals = [];
      for (let i = 0; i < n; i++) { const r = CPN.run(net); vals.push(measure === 'last' ? r.last : measure(r)); }
      const mn = Math.min(...vals), mx = Math.max(...vals), mean = vals.reduce((a, b) => a + b, 0) / n;
      st.runs = `<b>${n} simulations jusqu’au bout</b> (choix au hasard à chaque pas) : ${esc(label)} entre <b>${mn}</b> et <b>${mx}</b>${mn === mx ? ', toujours la même' : `, en moyenne ${Math.round(mean * 10) / 10}`}${opts.unit ? ' ' + esc(opts.unit) : ''}.`;
      paint();
    }
    function plot() {
      const { place, until = 480, label } = opts.plot, pts = [];
      const val = S => { const l = S.M[place]; return l.length ? l[0].v : null; };
      let S = CPN.init(net); pts.push([0, val(S)]);
      CPN.run(net, S, { until, onStep: N => pts.push([N.clock, val(N)]) });
      const W = 560, H = 190, L = 34, B = 24, vs = pts.map(p => p[1]), lo = Math.min(...vs) - 1, hi = Math.max(...vs) + 1;
      const X = t => L + (W - L - 8) * t / until, Y = v => 8 + (H - B - 8) * (hi - v) / (hi - lo);
      let d = `M${r1(X(0))} ${r1(Y(pts[0][1]))}`; for (let i = 1; i < pts.length; i++) d += `H${r1(X(pts[i][0]))}V${r1(Y(pts[i][1]))}`; d += `H${r1(X(until))}`;
      let ax = ''; for (let v = Math.ceil(lo); v <= hi; v++) ax += `<line class="cp-grid" x1="${L}" x2="${W - 8}" y1="${r1(Y(v))}" y2="${r1(Y(v))}"/><text class="cp-ax" x="${L - 5}" y="${r1(Y(v) + 3.5)}" style="text-anchor:end">${v}</text>`;
      const dt = until > 900 ? 180 : until > 480 ? 120 : 60;
      for (let t = 0; t <= until; t += dt) ax += `<text class="cp-ax" x="${r1(X(t))}" y="${H - 6}">${t}</text>`;
      (opts.plot.lines || []).forEach(([v, txt]) => { ax += `<line class="cp-ref" x1="${L}" x2="${W - 8}" y1="${r1(Y(v))}" y2="${r1(Y(v))}"/><text class="cp-ax ref" x="${W - 10}" y="${r1(Y(v) - 3)}" style="text-anchor:end">${esc(txt)}</text>`; });
      st.plot = `<figure class="cp-plot"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label || place)} au cours du temps">${ax}<path class="cp-line" d="${d}"/></svg><figcaption>${esc(label || place)} pendant ${until} ${esc(opts.unit || '')} d’une simulation (axe horizontal : horloge globale).</figcaption></figure>`;
      paint();
    }
    el.addEventListener('click', e => {
      const qi = e.target.closest('[data-qi]'); if (qi && Q && !st.res) { const ok = +qi.dataset.qi === (Q.a || 0); st.res = { ok }; record(opts.sec, ok); return paint(); }
      const g = e.target.closest('.pn-t.en'); if (g && el.contains(g)) { const t = g.dataset.t, r = CPN.ready(net, st.S).filter(b => b.t === t); if (r.length === 1) return fire(r[0]); st.filter = t; return paint(); }
      const bb = e.target.closest('[data-b]'); if (bb) { const bd = CPN.ready(net, st.S).find(b => b.id === bb.dataset.b); if (bd) fire(bd); return; }
      const b = e.target.closest('[data-act]'); if (!b) return;
      const a = b.dataset.act;
      if (a === 'all') { st.filter = null; return paint(); }
      if (a === 'adv') { const N = CPN.advance(net, st.S); if (N) st.S = N; return paint(); }
      if (a === 'rand') return step();
      if (a === 'end') { const r = CPN.run(net, st.S, { maxSteps: opts.steps || 2000, until: opts.plot ? opts.plot.until : Infinity }); r.log.forEach((h, i) => st.hist.push({ ...h, prev: i ? null : st.S })); st.S = r.S; delete st.S.made; st.filter = null; return paint(); }
      if (a === 'undo') { let h; do { h = st.hist.pop(); } while (h && !h.prev && st.hist.length); if (h) st.S = h.prev || CPN.init(net); st.filter = null; return paint(); }
      if (a === 'reset') { st.S = CPN.init(net); st.hist = []; st.filter = null; return paint(); }
      if (a === 'runs') return runs();
      if (a === 'plot') return plot();
    });
    el.addEventListener('keydown', e => { if (e.key !== 'Enter' && e.key !== ' ') return; const g = e.target.closest && e.target.closest('.pn-t.en'); if (g) { e.preventDefault(); g.dispatchEvent(new MouseEvent('click', { bubbles: true })); } });
    paint();
  }
  CPN.mount = mount;

  if (global.document) {
    const mountAll = () => document.querySelectorAll('.cpn:not([data-mounted])').forEach(el => { el.dataset.mounted = '1'; mount(el); });
    let queued = false;
    const obs = new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; mountAll(); }); } });
    const startObs = () => { obs.observe(document.body, { childList: true, subtree: true }); mountAll(); };
    if (document.body) startObs(); else document.addEventListener('DOMContentLoaded', startObs);
  }
  if (global.COURSE) {
    // Plateau coloré dans une fiche : COURSE.u.cpn('labo', { q:{text, opts, a:0, expl}, sec, axes:[[k,v]] }) ; toujours suivi de « Lire la figure »
    global.COURSE.u.cpn = (netId, o = {}) => {
      const { axes: extra, noAxes, ...opts } = o, net = NETS[netId];
      const rows = [
        ['Rond', 'une <b>place</b>. Le chiffre est le nombre de jetons ; le tableau sous le dessin donne la <b>valeur</b> de chacun.'],
        ['Carré', 'une <b>transition</b>. Entouré d’un halo quand une liaison est tirable : clique-le, ou clique une liaison dans la liste.'],
        ['Texte sur une flèche', 'l’<b>inscription</b> : les jetons pris (vers le carré) ou produits (depuis le carré), écrits avec des variables.'],
        ...(net && net.trans.some(t => t.guard) ? [['[ … ] en rouge', 'la <b>garde</b> : une condition sur les variables, qui doit être vraie pour tirer.']] : []),
        ['⟨p = ben, …⟩', 'une <b>liaison</b> : une valeur choisie pour chaque variable de la transition.'],
        ...(net && net.timed ? [['x@5, @+20', 'l’<b>horodatage</b> d’un jeton (pas utilisable avant 5) ; un <b>délai</b> sur un arc de sortie (le jeton produit n’est disponible que 20 unités plus tard).']] : []),
        ...(extra || []),
      ];
      return `<figure class="petri-fig"><div class="cpn" data-net="${esc(netId)}" data-opts="${esc(JSON.stringify(opts))}"></div>${noAxes ? '' : global.COURSE.u.axes(rows)}</figure>`;
    };
  }

  global.CPN = CPN;
  if (typeof module !== 'undefined' && module.exports) module.exports = CPN;
})(typeof window !== 'undefined' ? window : globalThis);
