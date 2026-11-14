// Simulateur de réseaux de Petri : modèle, règle de tir, graphe d'accessibilité, plateau jouable, prédiction, éditeur textuel.
// Fichier autonome, sans dépendance. Chargeable en Node pour les tests (verif/test_petri.mjs) : seules les fonctions pures servent alors.
// Vocabulaire du cours : plateau, rond (place), carré (transition), pion (jeton), jouer un carré, situation (marquage), marche à suivre.
(function (global) {
  const NETS = {};
  const PETRI = { nets: NETS };

  // ------------------------------------------------------------------ modèle
  // net = { title, places:[{id,x,y,tokens,lp}], trans:[{id,x,y,lp}], arcs:[[from,to,poids?,courbure?]] }
  function prepare(net) {
    net.P = net.places.map(p => p.id); net.T = net.trans.map(t => t.id);
    net.pi = Object.fromEntries(net.P.map((p, i) => [p, i]));
    net.pre = {}; net.post = {};
    net.T.forEach(t => { net.pre[t] = []; net.post[t] = []; });
    for (const [a, b, w = 1] of net.arcs) {
      if (a in net.pi && net.pre[b]) net.pre[b].push([a, w]);
      else if (b in net.pi && net.post[a]) net.post[a].push([b, w]);
      else throw new Error(`arc invalide (${a}, ${b})`);
    }
    if (net.places.some(p => p.x == null) || net.trans.some(t => t.x == null)) layout(net);
    return net;
  }
  PETRI.define = (id, net) => { net.id = id; NETS[id] = prepare(net); return net; };
  // Même réseau, autre marquage initial (deux box, quatre lits…)
  PETRI.derive = (id, base, { title, tokens }) => {
    const b = NETS[base];
    return PETRI.define(id, { title: title || b.title, places: b.places.map(p => ({ ...p, tokens: p.id in tokens ? tokens[p.id] : (p.tokens || 0) })), trans: b.trans.map(t => ({ ...t })), arcs: b.arcs.map(a => a.slice()) });
  };
  const get = n => typeof n === 'string' ? NETS[n] : n;

  PETRI.m0 = net => get(net).places.map(p => p.tokens || 0);
  PETRI.pre = (net, t) => get(net).pre[t];
  PETRI.post = (net, t) => get(net).post[t];
  PETRI.isEnabled = (net, m, t) => { net = get(net); return net.pre[t].every(([p, w]) => m[net.pi[p]] >= w); };
  PETRI.enabled = (net, m) => { net = get(net); return net.T.filter(t => PETRI.isEnabled(net, m, t)); };
  PETRI.fire = (net, m, t) => {
    net = get(net);
    if (!PETRI.isEnabled(net, m, t)) throw new Error(`${t} n'est pas activable`);
    const n = m.slice();
    net.pre[t].forEach(([p, w]) => { n[net.pi[p]] -= w; });
    net.post[t].forEach(([p, w]) => { n[net.pi[p]] += w; });
    return n;
  };
  PETRI.vec = m => '[' + m.join(', ') + ']';

  // Graphe d'accessibilité : la marche à suivre du problème 4 (file des marquages à explorer, marquages déjà vus).
  // Garde-fous : arrêt à `max` marquages ; non borné si un nouveau marquage couvre strictement un de ses ancêtres (Karp-Miller).
  PETRI.reach = (net, { max = 300, from } = {}) => {
    net = get(net);
    const start = from || PETRI.m0(net), key = m => m.join(',');
    const markings = [start], index = new Map([[key(start), 0]]), parent = [-1], depth = [0], edges = [];
    const out = { markings, edges, dead: [], unbounded: false, truncated: false, grow: [], depth, parent };
    for (let i = 0; i < markings.length; i++) {
      const m = markings[i];
      for (const t of PETRI.enabled(net, m)) {
        const n = PETRI.fire(net, m, t), k = key(n);
        if (index.has(k)) { edges.push([i, t, index.get(k)]); continue; }
        for (let a = i; a >= 0; a = parent[a]) {
          const anc = markings[a];
          if (anc.every((v, j) => n[j] >= v)) { out.unbounded = true; out.grow = net.P.filter((_, j) => n[j] > anc[j]); out.witness = { from: anc, to: n }; return out; }
        }
        if (markings.length >= max) { out.truncated = true; return out; }
        index.set(k, markings.length); parent.push(i); depth.push(depth[i] + 1); markings.push(n);
        edges.push([i, t, markings.length - 1]);
      }
    }
    const hasOut = new Set(edges.map(e => e[0]));
    out.dead = markings.map((_, i) => i).filter(i => !hasOut.has(i));
    return out;
  };

  // ------------------------------------------------------------------ format texte du cours
  //   P = {p1, p2}   T = {t1}   F = {(p1,t1), (t1,p2), (stock,transfuser,2)}   m0 = [p1, p1]  ou  m0 = {p1:2}
  PETRI.parse = text => {
    const errors = [], src = text.replace(/#.*$/gm, '');
    const set = name => { const m = new RegExp('(?:^|[\\s;])' + name + '\\s*=\\s*\\{([^}]*)\\}', 'i').exec(src); return m ? m[1].split(',').map(s => s.trim()).filter(Boolean) : null; };
    const P = set('P'), T = set('T');
    if (!P) errors.push('Il manque l’ensemble des places : P = {p1, p2, …}');
    if (!T) errors.push('Il manque l’ensemble des transitions : T = {t1, t2, …}');
    const fm = /(?:^|[\s;])F\s*=\s*\{([\s\S]*?)\}\s*(?:$|[\n;]|m)/i.exec(src + '\n');
    if (!fm) errors.push('Il manque la relation de flux : F = {(p1,t1), (t1,p2), …}');
    if (errors.length) return { errors };
    const dup = P.filter(p => T.includes(p)); if (dup.length) errors.push(`« ${dup[0]} » est à la fois dans P et dans T : une place n’est pas une transition.`);
    [P, T].forEach((L, k) => L.forEach((x, i) => { if (L.indexOf(x) !== i) errors.push(`« ${x} » apparaît deux fois dans ${k ? 'T' : 'P'}.`); }));
    const arcs = [], re = /\(([^()]*)\)/g; let m;
    while ((m = re.exec(fm[1]))) {
      const [a, b, w] = m[1].split(',').map(s => s.trim());
      const ok = (P.includes(a) && T.includes(b)) || (T.includes(a) && P.includes(b));
      if (!a || !b) errors.push(`Couple incomplet : (${m[1]}).`);
      else if (!P.includes(a) && !T.includes(a)) errors.push(`« ${a} » (dans le couple (${a}, ${b})) n’est ni dans P ni dans T.`);
      else if (!P.includes(b) && !T.includes(b)) errors.push(`« ${b} » (dans le couple (${a}, ${b})) n’est ni dans P ni dans T.`);
      else if (!ok) errors.push(`Le couple (${a}, ${b}) relie deux ${P.includes(a) ? 'places' : 'transitions'} : un arc va toujours d’une place à une transition ou l’inverse.`);
      else if (w !== undefined && !(+w >= 1 && Number.isInteger(+w))) errors.push(`Poids invalide dans (${m[1]}) : un entier ≥ 1 est attendu.`);
      else arcs.push(w ? [a, b, +w] : [a, b]);
    }
    const tokens = {}, mm = /(?:^|[\s;])m_?0?\s*=\s*(\[([^\]]*)\]|\{([^}]*)\})/i.exec(src);
    if (!mm) errors.push('Il manque la situation de départ : m0 = [p1, p4] (une place par pion) ou m0 = {p1:1, p4:2}.');
    else if (mm[2] !== undefined) {
      const items = mm[2].split(',').map(s => s.trim()).filter(Boolean);
      if (items.length && items.every(s => /^\d+$/.test(s))) {
        if (items.length !== P.length) errors.push(`Le vecteur m0 a ${items.length} cases, mais P compte ${P.length} places.`);
        else items.forEach((v, i) => { tokens[P[i]] = +v; });
      } else items.forEach(p => { if (!P.includes(p)) errors.push(`m0 cite « ${p} », qui n’est pas une place.`); else tokens[p] = (tokens[p] || 0) + 1; });
    } else mm[3].split(',').map(s => s.trim()).filter(Boolean).forEach(it => {
      const [p, v] = it.split(':').map(s => s.trim());
      if (!P.includes(p)) errors.push(`m0 cite « ${p} », qui n’est pas une place.`); else if (!/^\d+$/.test(v || '')) errors.push(`m0 : nombre de pions manquant pour « ${p} ».`); else tokens[p] = +v;
    });
    if (errors.length) return { errors };
    try { return { errors, net: prepare({ title: 'Mon réseau', places: P.map(id => ({ id, tokens: tokens[id] || 0 })), trans: T.map(id => ({ id })), arcs }) }; }
    catch (e) { return { errors: [e.message] }; }
  };
  PETRI.format = net => {
    net = get(net);
    const m = net.places.filter(p => p.tokens).map(p => `${p.id}:${p.tokens}`);
    return `P = {${net.P.join(', ')}}\nT = {${net.T.join(', ')}}\nF = {${net.arcs.map(([a, b, w]) => `(${a},${b}${w > 1 ? ',' + w : ''})`).join(', ')}}\nm0 = {${m.join(', ')}}`;
  };

  // Placement automatique : couches alternées de gauche à droite, par parcours en largeur depuis les places marquées
  function layout(net) {
    const nodes = [...net.P, ...net.T], next = Object.fromEntries(nodes.map(n => [n, []]));
    net.arcs.forEach(([a, b]) => next[a].push(b));
    const layer = {}, starts = [...net.places.filter(p => p.tokens).map(p => p.id), ...nodes];
    for (const s of starts) {
      if (s in layer) continue;
      layer[s] = net.T.includes(s) ? 1 : 0; const q = [s];
      while (q.length) { const u = q.shift(); for (const v of next[u]) if (!(v in layer)) { layer[v] = layer[u] + 1; q.push(v); } }
    }
    const cols = []; nodes.forEach(n => (cols[layer[n]] = cols[layer[n]] || []).push(n));
    const H = Math.max(...cols.filter(Boolean).map(c => c.length));
    const pos = {};
    cols.forEach((c, i) => c && c.forEach((n, k) => { pos[n] = [50 + i * 84, 46 + (k + (H - c.length) / 2) * 78]; }));
    [...net.places, ...net.trans].forEach(o => { [o.x, o.y] = pos[o.id]; });
    // Les arcs qui reviennent en arrière sont courbés pour ne pas traverser les éléments
    net.arcs = net.arcs.map(([a, b, w, bend]) => { const span = layer[a] - layer[b]; return [a, b, w || 1, bend != null ? bend : (span >= 1 ? 22 + 8 * span : undefined)]; });
  }

  // ------------------------------------------------------------------ dessin du plateau (SVG)
  const PR = 20, TS = 15; // rayon d'un rond, demi-côté d'un carré
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const r1 = v => Math.round(v * 10) / 10;
  const DOTS = { 1: [[0, 0]], 2: [[-6, 0], [6, 0]], 3: [[0, -6], [-6, 5], [6, 5]], 4: [[-6, -6], [6, -6], [-6, 6], [6, 6]] };
  function edgePoint(o, isPlace, tx, ty, gap) { // point du bord de l'élément o en direction de (tx, ty)
    const dx = tx - o.x, dy = ty - o.y, L = Math.hypot(dx, dy) || 1;
    if (isPlace) return [o.x + dx / L * (PR + gap), o.y + dy / L * (PR + gap)];
    const k = (TS + gap) / Math.max(Math.abs(dx), Math.abs(dy), 1e-9);
    return [o.x + dx * k, o.y + dy * k];
  }
  let uid = 0;
  PETRI.svg = (net, m, { live = false, pickT = false } = {}) => {
    net = get(net);
    const id = 'pn' + (++uid), all = [...net.places, ...net.trans], isP = o => o.id in net.pi;
    const by = Object.fromEntries(all.map(o => [o.id, o]));
    const en = new Set(PETRI.enabled(net, m));
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const grow = (x, y) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); };
    const labelBox = o => { const w = o.id.length * 3.4 + 4, lp = o.lp || 'b'; if (lp === 'b') grow(o.x - w, o.y + 40), grow(o.x + w, o.y); else if (lp === 't') grow(o.x - w, o.y - 40), grow(o.x + w, o.y); else if (lp === 'l') grow(o.x - 26 - 2 * w, o.y); else grow(o.x + 26 + 2 * w, o.y); };
    all.forEach(o => { grow(o.x - 24, o.y - 24); grow(o.x + 24, o.y + 24); labelBox(o); });
    let arcs = '';
    const has = (a, b) => net.arcs.some(r => r[0] === a && r[1] === b);
    for (const [a, b, w = 1, bendIn] of net.arcs) {
      const A = by[a], B = by[b];
      const bend = bendIn != null ? bendIn : has(b, a) ? 12 : 0;
      const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
      const cx = (A.x + B.x) / 2 + nx * bend * 2, cy = (A.y + B.y) / 2 + ny * bend * 2; // point de contrôle
      const [sx, sy] = edgePoint(A, isP(A), bend ? cx : B.x, bend ? cy : B.y, 1.5), [ex, ey] = edgePoint(B, isP(B), bend ? cx : A.x, bend ? cy : A.y, 4);
      grow(cx, cy);
      const d = bend ? `M${r1(sx)} ${r1(sy)}Q${r1(cx)} ${r1(cy)} ${r1(ex)} ${r1(ey)}` : `M${r1(sx)} ${r1(sy)}L${r1(ex)} ${r1(ey)}`;
      arcs += `<path class="pn-arc" d="${d}" marker-end="url(#${id}-ah)"/>`;
      if (w > 1) { const mx = bend ? (sx + 2 * cx + ex) / 4 : (sx + ex) / 2, my = bend ? (sy + 2 * cy + ey) / 4 : (sy + ey) / 2; arcs += `<text class="pn-w" x="${r1(mx + nx * 9)}" y="${r1(my + ny * 9 + 4)}">${w}</text>`; }
    }
    const label = o => { const lp = o.lp || 'b', t = esc(o.id);
      return lp === 'b' ? `<text class="pn-l" x="${o.x}" y="${o.y + 35}">${t}</text>` : lp === 't' ? `<text class="pn-l" x="${o.x}" y="${o.y - 27}">${t}</text>`
        : lp === 'l' ? `<text class="pn-l" style="text-anchor:end" x="${o.x - 26}" y="${o.y + 4}">${t}</text>` : `<text class="pn-l" style="text-anchor:start" x="${o.x + 26}" y="${o.y + 4}">${t}</text>`; };
    const places = net.places.map((p, i) => {
      const k = m[i], tok = k === 0 ? '' : k <= 4 ? DOTS[k].map(([dx, dy]) => `<circle class="pn-tok" cx="${p.x + dx}" cy="${p.y + dy}" r="4.3"/>`).join('') : `<text class="pn-n" x="${p.x}" y="${p.y + 5.5}">${k}</text>`;
      return `<g class="pn-p${k ? ' has' : ''}" data-p="${esc(p.id)}"><circle cx="${p.x}" cy="${p.y}" r="${PR}"/>${tok}${label(p)}</g>`;
    }).join('');
    const trans = net.trans.map(t => {
      const on = en.has(t.id), act = (live && on) || pickT;
      return `<g class="pn-t${on && live ? ' en' : ''}${pickT ? ' pick' : ''}" data-t="${esc(t.id)}"${act ? ` tabindex="0" role="button" aria-label="${pickT ? 'Cocher' : 'Jouer'} ${esc(t.id)}"` : ''}>${act ? `<rect class="pn-halo" x="${t.x - TS - 5}" y="${t.y - TS - 5}" width="${2 * TS + 10}" height="${2 * TS + 10}" rx="7"/>` : ''}<rect class="pn-sq" x="${t.x - TS}" y="${t.y - TS}" width="${2 * TS}" height="${2 * TS}" rx="3"/>${label(t)}</g>`;
    }).join('');
    const pad = 8, W = x1 - x0 + 2 * pad, H = y1 - y0 + 2 * pad;
    return `<svg class="pn" viewBox="${r1(x0 - pad)} ${r1(y0 - pad)} ${r1(W)} ${r1(H)}" style="max-width:${Math.round(W * 1.5)}px;min-width:${Math.round(W * 0.72)}px" role="img" aria-label="Réseau de Petri : ${esc(net.title || '')}">
<defs><marker id="${id}-ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="pn-ah" d="M0 1 9 5 0 9z"/></marker></defs>${arcs}${places}${trans}</svg>`;
  };

  // ------------------------------------------------------------------ graphe d'accessibilité (tableau + dessin)
  function reachHtml(net, r, cur) {
    if (r.unbounded) return `<div class="pn-msg warn"><b>La marche à suivre ne s’arrête jamais : le réseau n’est pas borné.</b> ${r.grow.length > 1 ? 'Les places' : 'La place'} <code>${r.grow.map(esc).join(', ')}</code> ${r.grow.length > 1 ? 'grandissent' : 'grandit'} sans fin : depuis ${PETRI.vec(r.witness.from)}, on atteint ${PETRI.vec(r.witness.to)}, qui contient tout ce qu’il faut pour recommencer la même suite de coups, encore et encore. Comment le borner ?</div>`;
    const n = r.markings.length, key = m => m.join(',');
    const head = `<div class="pn-msg ${r.truncated ? 'warn' : ''}">${r.truncated ? `Arrêt du calcul à ${n} marquages (garde-fou) : le graphe est plus grand.` : `<b>${n} marquage${n > 1 ? 's' : ''} accessible${n > 1 ? 's' : ''}</b>, ${r.edges.length} passage${r.edges.length > 1 ? 's' : ''}, <b>${r.dead.length} sans suite</b>${r.dead.length ? ' (' + r.dead.map(i => 'M' + i).join(', ') + ')' : ''}. Réseau borné.`}</div>`;
    const rows = r.markings.map((m, i) => {
      const outs = r.edges.filter(e => e[0] === i).map(e => `<span class="pn-step">${esc(e[1])} → M${e[2]}</span>`).join(' ');
      return `<tr data-m="${m.join(',')}" class="${r.dead.includes(i) ? 'dead' : ''}${cur && key(cur) === key(m) ? ' cur' : ''}"><th>M${i}</th><td class="v">${PETRI.vec(m)}</td><td>${outs || '<i>sans suite</i>'}</td></tr>`;
    }).join('');
    return head + (n <= 16 ? graphSvg(r, cur) : '') + `<div class="pn-tblwrap"><table class="pn-tbl"><thead><tr><th></th><th>(${net.P.map(esc).join(', ')})</th><th>coups possibles</th></tr></thead><tbody>${rows}</tbody></table></div><p class="pn-hint">Clique une ligne pour placer le plateau dans cette situation.</p>`;
  }
  function graphSvg(r, cur) {
    const n = r.markings.length, id = 'gr' + (++uid), layers = [];
    r.depth.forEach((d, i) => (layers[d] = layers[d] || []).push(i));
    const bw = Math.max(40, r.markings[0].join(',').length * 6.2 + 34), gap = 22, rowH = 62;
    const W = Math.max(...layers.map(l => l.length)) * (bw + gap) + gap + 30, pos = [];
    layers.forEach((l, d) => l.forEach((i, k) => { pos[i] = [W / 2 + (k - (l.length - 1) / 2) * (bw + gap), 24 + d * rowH]; }));
    let es = '';
    const seen = new Set();
    r.edges.forEach(([a, t, b]) => {
      const [ax, ay] = pos[a], [bx, by] = pos[b], pair = a + '>' + b, dup = seen.has(pair); seen.add(pair);
      let d, lx, ly;
      if (a === b) { d = `M${ax + bw / 2} ${ay - 5}c22 -14 22 24 2 10`; lx = ax + bw / 2 + 20; ly = ay + 3; }
      else if (by > ay && !dup) { d = `M${r1(ax)} ${ay + 13}L${r1(bx)} ${by - 16}`; lx = ax + (bx - ax) * .42; ly = ay + 13 + (by - ay - 29) * .42; }
      else { // retour vers un marquage déjà vu, ou même rangée : courbe
        const side = bx >= ax ? 1 : -1, bendX = (Math.abs(by - ay) < 1 ? 0 : 26 + 5 * Math.abs(r.depth[a] - r.depth[b])) * (dup ? -1 : 1), up = Math.abs(by - ay) < 1 ? -26 : 0;
        const sx = Math.abs(by - ay) < 1 ? ax + side * bw / 2 : ax + bw / 2 * (dup ? -1 : 1), sy = ay, ex = Math.abs(by - ay) < 1 ? bx - side * (bw / 2 + 3) : bx + (bw / 2 + 3) * (dup ? -1 : 1), ey = by;
        const cx = (sx + ex) / 2 + bendX, cy = (sy + ey) / 2 + up;
        d = `M${r1(sx)} ${r1(sy)}Q${r1(cx)} ${r1(cy)} ${r1(ex)} ${r1(ey)}`; lx = (sx + 2 * cx + ex) / 4; ly = (sy + 2 * cy + ey) / 4;
      }
      es += `<path class="gr-e" d="${d}" marker-end="url(#${id}-ah)"/><text class="gr-t" x="${r1(lx)}" y="${r1(ly + 3)}">${esc(t)}</text>`;
    });
    const key = m => m.join(',');
    const ns = r.markings.map((m, i) => `<g class="gr-n${r.dead.includes(i) ? ' dead' : ''}${i === 0 ? ' init' : ''}${cur && key(cur) === key(m) ? ' cur' : ''}" data-m="${key(m)}"><rect x="${r1(pos[i][0] - bw / 2)}" y="${pos[i][1] - 13}" width="${r1(bw)}" height="26" rx="8"/><text x="${r1(pos[i][0])}" y="${pos[i][1] + 4}"><tspan class="gr-id">M${i} </tspan>${m.join(',')}</text></g>`).join('');
    const H = layers.length * rowH - 10;
    return `<div class="pn-graph"><svg class="gr" viewBox="0 0 ${r1(W)} ${H}" style="max-width:${Math.round(W * 1.35)}px" role="img" aria-label="Graphe d’accessibilité : ${n} marquages"><defs><marker id="${id}-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path class="gr-ah" d="M0 1 9 5 0 9z"/></marker></defs>${es}${ns}</svg></div>`;
  }

  // ------------------------------------------------------------------ composant : plateau jouable, avec ou sans prédiction
  const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
  function record(sec, ok) { try { if (sec && global.Store) global.Store.recordTopic(sec, ok); } catch (e) { /* hors de l'app */ } }

  function mount(el, netIn, optsIn) {
    const net = netIn || NETS[el.dataset.net];
    if (!net) { el.innerHTML = `<p class="pn-msg warn">Réseau inconnu : ${esc(el.dataset.net)}</p>`; return; }
    let opts = optsIn || {}; if (!optsIn && el.dataset.opts) { try { opts = JSON.parse(el.dataset.opts); } catch (e) { opts = {}; } }
    const start = opts.m || PETRI.m0(net);
    const st = { m: start.slice(), hist: [], ask: opts.ask || null, picked: new Set(), graph: !!opts.graph, res: null };
    let reachCache = null; const reach = () => reachCache || (reachCache = PETRI.reach(net, { from: start }));

    // Question posée avant de jouer
    const Q = st.ask && buildQuestion();
    function buildQuestion() {
      const qm = st.m.slice(), en = PETRI.enabled(net, qm), t = opts.t || en[0]; // qm : la situation au moment de la question
      switch (st.ask) {
        case 'enabled': return { text: 'Avant de jouer : <b>quels carrés sont jouables</b> dans cette situation ? Coche-les sur le plateau (ou aucun), puis vérifie.', kind: 'pick',
          check: () => same([...st.picked].sort(), en.slice().sort()), expl: () => en.length ? `Jouable${en.length > 1 ? 's' : ''} : <b>${en.map(esc).join(', ')}</b>. Un carré est jouable quand <b>chacun</b> de ses ronds d’entrée contient assez de pions.` : 'Aucun carré n’est jouable : au moins un rond d’entrée de chaque carré est vide.' };
        case 'after': return { text: `Avant de jouer : si l’on joue <b>${esc(t)}</b>, combien de pions y aura-t-il dans chaque rond ?`, kind: 'vec',
          check: v => same(v, PETRI.fire(net, qm, t)), expl: () => `Après <b>${esc(t)}</b> : ${PETRI.vec(PETRI.fire(net, qm, t))}. Chaque rond d’entrée perd ${net.pre[t].some(a => a[1] > 1) ? 'le poids de sa flèche' : 'un pion'}, chaque rond de sortie en gagne ${net.post[t].some(a => a[1] > 1) ? 'le poids de sa flèche' : 'un'} ; les autres ne bougent pas.`, demo: t };
        case 'twice': { const again = PETRI.isEnabled(net, PETRI.fire(net, qm, t), t);
          return { text: `Avant de jouer : peut-on jouer <b>${esc(t)}</b> deux fois de suite ?`, kind: 'yn', check: v => v === again,
            expl: () => again ? `Oui : après le premier coup, les entrées de ${esc(t)} contiennent encore assez de pions.` : `Non : après le premier coup, la situation est ${PETRI.vec(PETRI.fire(net, qm, t))} et une entrée de ${esc(t)} est vide.`, demo: t }; }
        case 'count': { const r = reach();
          return { text: 'Avant de lancer le calcul : <b>combien de situations différentes</b> la marche à suivre va-t-elle trouver (départ compris) ? Combien <b>sans suite</b> ?', kind: 'two', check: v => v[0] === r.markings.length && v[1] === r.dead.length,
            expl: () => `${r.markings.length} marquages accessibles, dont ${r.dead.length} sans suite${r.dead.length ? ' : ' + r.dead.map(i => PETRI.vec(r.markings[i])).join(' et ') : ''}.`, graph: true }; }
        case 'dead': { const r = reach(), yes = r.dead.length > 0;
          return { text: 'Avant de jouer : peut-on arriver dans une situation où <b>plus aucun carré n’est jouable</b> ?', kind: 'yn', check: v => v === yes,
            expl: () => yes ? `Oui : ${r.dead.map(i => PETRI.vec(r.markings[i])).join(' et ')} ${r.dead.length > 1 ? 'sont des situations' : 'est une situation'} sans suite. Ouvre le graphe et clique la ligne pour la voir sur le plateau.` : 'Non : dans chacune des situations accessibles, au moins un carré reste jouable. Le réseau tourne indéfiniment.', graph: true }; }
        case 'bounded': { const r = reach(), yes = !r.unbounded;
          return { text: 'Avant de lancer le calcul : la marche à suivre <b>va-t-elle s’arrêter</b> sur ce réseau ?', kind: 'yn', check: v => v === yes,
            expl: () => yes ? `Oui : elle s’arrête après ${r.markings.length} marquages. Le réseau est borné.` : `Non : ${r.grow.length > 1 ? 'les places' : 'la place'} ${r.grow.map(esc).join(', ')} ${r.grow.length > 1 ? 'grandissent' : 'grandit'} sans fin, il y a une infinité de situations.`, graph: true }; }
      }
      return null;
    }

    function paint() {
      const asking = Q && !st.res, en = PETRI.enabled(net, st.m);
      const histTxt = st.hist.length ? st.hist.map(h => `<span class="pn-step">${esc(h.t)}</span>`).join(' → ') : '<i>aucun coup joué</i>';
      let q = '';
      if (Q) {
        const fields = Q.kind === 'vec' ? `<div class="pn-fields">${net.P.map((p, i) => `<label><span>${esc(p)}</span><input type="number" min="0" inputmode="numeric" data-vi="${i}"></label>`).join('')}</div>`
          : Q.kind === 'two' ? `<div class="pn-fields"><label><span>situations</span><input type="number" min="0" inputmode="numeric" data-vi="0"></label><label><span>sans suite</span><input type="number" min="0" inputmode="numeric" data-vi="1"></label></div>`
          : Q.kind === 'yn' ? '<div class="pn-yn"><button type="button" class="btn quiet small" data-yn="1">Oui</button><button type="button" class="btn quiet small" data-yn="0">Non</button></div>' : '';
        q = st.res ? `<div class="pn-q done ${st.res.ok ? 'ok' : 'ko'}"><b>${st.res.ok ? 'Bien vu.' : 'Pas tout à fait.'}</b> ${Q.expl()} <span class="pn-free">Le plateau est maintenant libre : joue pour vérifier.</span></div>`
          : `<div class="pn-q"><span class="pn-tag">Prédis d’abord</span><p>${Q.text}</p>${fields}${Q.kind !== 'yn' ? '<button type="button" class="btn small" data-act="check">Vérifier</button>' : ''}</div>`;
      }
      const dead = !asking && !en.length;
      el.innerHTML = `${opts.caption ? `<div class="pn-cap">${opts.caption}</div>` : ''}${q}
<div class="pn-board${asking ? ' locked' : ''}">${PETRI.svg(net, st.m, { live: !asking, pickT: asking && Q.kind === 'pick' })}</div>
<div class="pn-state"><span class="pn-vec" title="Une case par rond, dans l’ordre indiqué"><b>m</b> = ${PETRI.vec(st.m)}</span><span class="pn-order">ordre : (${net.P.map(esc).join(', ')})</span></div>
${asking ? '' : `<div class="pn-hist">Coups : ${histTxt}</div>
${dead ? '<div class="pn-msg end">Plus aucun carré n’est jouable : <b>situation sans suite</b> (marquage terminal).</div>' : ''}
<div class="pn-tools"><button type="button" class="btn quiet small" data-act="rand" ${en.length ? '' : 'disabled'}>Coup au hasard</button><button type="button" class="btn quiet small" data-act="undo" ${st.hist.length ? '' : 'disabled'}>Annuler le dernier coup</button><button type="button" class="btn quiet small" data-act="reset" ${st.hist.length || !same(st.m, start) ? '' : 'disabled'}>Recommencer</button><button type="button" class="btn quiet small" data-act="graph" aria-expanded="${st.graph}">${st.graph ? 'Masquer le graphe' : 'Graphe d’accessibilité'}</button></div>
${st.graph ? `<div class="pn-reach">${reachHtml(net, reach(), st.m)}</div>` : ''}`}`;
      if (asking && Q.kind === 'pick') st.picked.forEach(t => { const g = el.querySelector(`.pn-t[data-t="${CSS.escape(t)}"]`); if (g) g.classList.add('picked'); });
    }
    const play = t => { if (!PETRI.isEnabled(net, st.m, t)) return; st.hist.push({ t, m: st.m }); st.m = PETRI.fire(net, st.m, t); paint(); };
    function answer(v) {
      const ok = !!Q.check(v); st.res = { ok }; record(opts.sec, ok);
      if (Q.graph) st.graph = true;
      paint();
      if (Q.demo) setTimeout(() => { if (el.isConnected && !st.hist.length) play(Q.demo); }, 650);
    }
    const onT = g => {
      const t = g.dataset.t;
      if (Q && !st.res) { if (Q.kind !== 'pick') return; st.picked.has(t) ? st.picked.delete(t) : st.picked.add(t); g.classList.toggle('picked'); return; }
      play(t);
    };
    el.addEventListener('click', e => {
      const g = e.target.closest('.pn-t'); if (g && el.contains(g)) return onT(g);
      const yn = e.target.closest('[data-yn]'); if (yn) return answer(yn.dataset.yn === '1');
      const row = e.target.closest('[data-m]'); if (row && st.graph) { st.m = row.dataset.m.split(',').map(Number); st.hist = []; return paint(); }
      const b = e.target.closest('[data-act]'); if (!b) return;
      const a = b.dataset.act;
      if (a === 'check') {
        if (Q.kind === 'pick') return answer();
        const v = [...el.querySelectorAll('[data-vi]')].map(i => i.value.trim());
        if (v.some(x => x === '')) { const f = el.querySelector('.pn-q'); f.classList.add('shake'); setTimeout(() => f.classList.remove('shake'), 400); return; }
        return answer(v.map(Number));
      }
      if (a === 'rand') { const en = PETRI.enabled(net, st.m); return play(en[Math.floor(Math.random() * en.length)]); }
      if (a === 'undo') { const h = st.hist.pop(); if (h) st.m = h.m; return paint(); }
      if (a === 'reset') { st.m = start.slice(); st.hist = []; return paint(); }
      if (a === 'graph') { st.graph = !st.graph; return paint(); }
    });
    el.addEventListener('keydown', e => { if (e.key !== 'Enter' && e.key !== ' ') return; const g = e.target.closest && e.target.closest('.pn-t'); if (g) { e.preventDefault(); onT(g); } });
    paint();
  }
  PETRI.mount = mount;

  // ------------------------------------------------------------------ Atelier : éditeur textuel + plateau + graphe + comparaison
  const SAMPLE = `# Le message du problème 2 : remplace-le par ton réseau.
P = {p1, p2, p3}
T = {t1, t2, t3}
F = {(p1,t1), (t1,p2), (t1,p3), (p2,t2), (t2,p1), (p2,t3), (p3,t3), (t3,p3)}
m0 = [p1, p2, p3]`;
  const props = net => { const r = PETRI.reach(net, { max: 2000 }); return { places: net.P.length, trans: net.T.length, bounded: !r.unbounded, n: r.unbounded || r.truncated ? null : r.markings.length, dead: r.unbounded || r.truncated ? null : r.dead.length, maxTok: r.unbounded ? null : Math.max(...r.markings.flat()) }; };
  PETRI.props = props;
  PETRI.atelier = el => {
    const KEY = 'petri-atelier';
    let saved = ''; try { saved = localStorage.getItem(KEY) || ''; } catch (e) { /* stockage indisponible */ }
    const list = Object.values(NETS).filter(n => !n.hidden);
    const optsHtml = list.map(n => `<option value="${esc(n.id)}">${esc(n.title)}</option>`).join('');
    el.innerHTML = `<div class="at-grid"><div class="at-edit">
<label class="field"><span>Ton réseau, au format du cours (listes et couples, comme dans le problème 2)</span><textarea id="atText" rows="9" spellcheck="false" autocapitalize="off" autocomplete="off">${esc(saved || SAMPLE)}</textarea></label>
<div class="at-row"><select id="atLoad" aria-label="Charger un réseau du cours"><option value="">Charger un réseau du cours…</option>${optsHtml}</select><button type="button" class="btn quiet small" id="atSample">Exemple</button></div>
<p class="pn-hint">Poids d’un arc : <code>(stock,transfuser,2)</code>. Plusieurs pions : <code>m0 = [p4, p4]</code> ou <code>m0 = {p4:2}</code>. Tout ce qui suit <code>#</code> est ignoré.</p>
<div id="atErr"></div></div>
<div class="at-out"><div id="atBoard"></div></div></div>
<div class="at-cmp"><label class="field"><span>Comparer à un réseau du cours</span><select id="atRef"><option value="">Choisir la solution de référence…</option>${optsHtml}</select></label><div id="atCmp"></div></div>`;
    const $ = s => el.querySelector(s), ta = $('#atText');
    let cur = null, timer = 0;
    function analyse() {
      try { localStorage.setItem(KEY, ta.value); } catch (e) { /* idem */ }
      const { net, errors } = PETRI.parse(ta.value);
      $('#atErr').innerHTML = errors.length ? `<div class="pn-msg warn"><b>À corriger :</b><ul>${errors.slice(0, 6).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : '';
      if (!net) { cur = null; compare(); return; }
      cur = net;
      const host = document.createElement('div'); host.className = 'petri'; host.dataset.mounted = '1';
      $('#atBoard').replaceChildren(host);
      mount(host, net, { graph: true });
      compare();
    }
    function compare() {
      const ref = NETS[$('#atRef').value], out = $('#atCmp');
      if (!ref || !cur) { out.innerHTML = ''; return; }
      const a = props(cur), b = props(ref);
      const row = (name, x, y) => `<tr class="${x === y ? 'eq' : 'ne'}"><th>${name}</th><td>${x}</td><td>${y}</td><td>${x === y ? '✓' : '≠'}</td></tr>`;
      const f = v => v == null ? '∞' : v;
      const eq = a.bounded === b.bounded && a.n === b.n && a.dead === b.dead && a.maxTok === b.maxTok;
      out.innerHTML = `<div class="pn-tblwrap"><table class="pn-tbl cmp"><thead><tr><th></th><th>Ton réseau</th><th>${esc(ref.title)}</th><th></th></tr></thead><tbody>
${row('Places', a.places, b.places)}${row('Transitions', a.trans, b.trans)}${row('Borné', a.bounded ? 'oui' : 'non', b.bounded ? 'oui' : 'non')}${row('Marquages accessibles', f(a.n), f(b.n))}${row('Marquages sans suite', f(a.dead), f(b.dead))}${row('Maximum de pions dans une place', f(a.maxTok), f(b.maxTok))}</tbody></table></div>
<div class="pn-msg ${eq ? 'end' : 'warn'}">${eq ? 'Mêmes propriétés que la référence.' : 'Les propriétés diffèrent : cherche laquelle, puis demande-toi si ton modèle répond à une autre question ou s’il autorise une situation interdite.'} C’est une comparaison de <b>propriétés</b>, pas une preuve que les deux réseaux sont équivalents : deux modèles différents peuvent être corrects (problème 3, les ambulances).</div>`;
    }
    ta.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(analyse, 350); });
    $('#atLoad').onchange = e => { const n = NETS[e.target.value]; if (n) { ta.value = `# ${n.title}\n` + PETRI.format(n); analyse(); } e.target.value = ''; };
    $('#atSample').onclick = () => { ta.value = SAMPLE; analyse(); };
    $('#atRef').onchange = compare;
    analyse();
  };

  // ------------------------------------------------------------------ branchement dans l'app
  if (global.document) {
    const mountAll = () => {
      document.querySelectorAll('.petri:not([data-mounted])').forEach(el => { el.dataset.mounted = '1'; mount(el); });
      document.querySelectorAll('.petri-atelier:not([data-mounted])').forEach(el => { el.dataset.mounted = '1'; PETRI.atelier(el); });
    };
    let queued = false;
    const obs = new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; mountAll(); }); } });
    const startObs = () => { obs.observe(document.body, { childList: true, subtree: true }); mountAll(); };
    if (document.body) startObs(); else document.addEventListener('DOMContentLoaded', startObs);
  }
  if (global.COURSE) {
    // Plateau dans une fiche : COURSE.u.petri('vacc-corrige', { ask:'enabled', sec:'pm1-regle', pion:'…', axes:[[k,v]] })
    // Toujours suivi de l'encadré « Lire la figure ».
    global.COURSE.u.petri = (netId, o = {}) => {
      const { pion, axes: extra, noAxes, ...opts } = o;
      const rows = [
        ['Rond', 'une <b>place</b> : un lieu, un état, une condition ou une ressource.'],
        ['Carré', 'une <b>transition</b> : une action, un événement. Entouré d’un halo quand il est jouable : clique pour le jouer.'],
        ['Pion', pion || 'un <b>jeton</b> : un patient, un objet ou une ressource disponible, selon la place où il se trouve.'],
        ['Flèche', 'vers un carré : ce que l’action <b>consomme</b> ; depuis un carré : ce qu’elle <b>produit</b>. Un chiffre sur la flèche est son poids (1 par défaut).'],
        ['m = […]', 'la <b>situation</b> (le marquage) : une case par rond, dans l’ordre écrit à côté.'],
        ...(extra || []),
      ];
      return `<figure class="petri-fig"><div class="petri" data-net="${esc(netId)}" data-opts="${esc(JSON.stringify(opts))}"></div>${noAxes ? '' : global.COURSE.u.axes(rows)}</figure>`;
    };
  }

  global.PETRI = PETRI;
  if (typeof module !== 'undefined' && module.exports) module.exports = PETRI;
})(typeof window !== 'undefined' ? window : globalThis);
