// Outils communs aux chapitres Process mining : blocs du gabarit d'une notion, cartes typées, générateurs d'exercices sur les réseaux.
(function () {
  const { pick, rnd } = COURSE.u;
  const ul = items => `<ul>${items.map(x => `<li>${x}</li>`).join('')}</ul>`;
  const TAGS = { def: 'Définition', why: 'Pourquoi', decide: 'Que décider', read: 'Lire', trap: 'Piège', link: 'Relier' };

  const pm = {
    // ----- blocs d'une fiche
    why: h => `<div class="why"><span class="lbl">Pourquoi ça existe</span>${h}</div>`,
    ex: (h, t = 'Exemple travaillé') => `<div class="ex"><span class="lbl">${t}</span>${h}</div>`,
    traps: items => `<div class="traps"><span class="lbl">Pièges</span>${ul(items)}</div>`,
    recap: items => `<div class="recap"><span class="lbl">À retenir</span>${ul(items)}</div>`,
    todo: h => `<div class="todo"><span class="lbl">À toi d’abord, sur papier</span>${h}</div>`,
    sol: (t, h) => `<details class="sol"><summary>${t}</summary>${h}</details>`,
    enonce: h => `<div class="enonce">${h}</div>`,
    table: (head, rows) => `<div class="t-wrap"><table class="t"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`,
    ul,
    // ----- cartes typées : cards('pm1-regle', [['why', question, réponse], …]) ; l'id garde le type (why1, trap2…)
    cards(sec, list) { const n = {}; return list.map(([type, q, a]) => { n[type] = (n[type] || 0) + 1; return [sec, type + n[type], `<span class="tag ${type}">${TAGS[type]}</span>${q}`, a]; }); },
    quiz: (sec, list) => list.map(([q, opts, a, expl]) => [sec, q, opts, a, expl]),
  };

  // ----- description textuelle d'un réseau (comme dans le problème 2 : pas de dessin)
  const side = arcs => arcs.length ? arcs.map(([p, w]) => (w > 1 ? w + ' ' : '') + p).join(' + ') : '∅';
  const N = id => PETRI.nets[id];
  pm.rules = id => { const net = N(id); return net.T.map(t => `<code>${t}</code> : ${side(net.pre[t])} → ${side(net.post[t])}`).join(' ; '); };
  // Schéma du réseau dans une situation donnée (ronds, carrés, pions), pour les exercices et les cartes : image fixe, non jouable
  pm.fig = (id, m) => { const net = N(id); return `<div class="pn-still">${PETRI.svg(net, m || PETRI.m0(net))}</div>`; };
  const intro = (net, m) => `<b>${net.title}</b>${pm.fig(net.id, m)}<span class="pn-order">Ordre des places : (${net.P.join(', ')}).</span>`;
  const walk = (net, k) => { let m = PETRI.m0(net); for (let i = 0; i < k; i++) { const en = PETRI.enabled(net, m); if (!en.length) break; m = PETRI.fire(net, m, pick(en)); } return m; };
  const uniq = list => { const seen = new Set(); return list.filter(x => { if (seen.has(x)) return false; seen.add(x); return true; }); };
  // QCM à partir de la bonne réponse et de leurres : on garde 4 choix distincts, la bonne réponse en indice 0 puis mélange par l'app
  const mcq = (q, good, lures, expl) => { const opts = uniq([good, ...lures]).slice(0, 4); return { q, opts, a: 0, expl }; };
  const setTxt = s => s.length ? '{' + s.join(', ') + '}' : 'aucun';

  pm.gens = {
    // Quels carrés sont jouables dans une situation tirée au hasard ?
    enabled: ids => () => {
      const net = N(pick(ids)), m = walk(net, rnd(0, 5)), en = PETRI.enabled(net, m);
      const some = net.T.filter(t => net.pre[t].some(([p]) => m[net.pi[p]] > 0)); // leurre : « au moins une entrée marquée »
      const lures = [setTxt(some), setTxt(net.T), setTxt(net.T.filter(t => !en.includes(t))), setTxt(en.slice(1)), setTxt(en.concat(net.T.filter(t => !en.includes(t)).slice(0, 1))), 'aucun'];
      return mcq(`${intro(net, m)}<br>Situation dessinée : $m=${PETRI.vec(m)}$. <b>Quels carrés sont jouables ?</b>`, setTxt(en), lures.filter(x => x !== setTxt(en)),
        `Un carré est jouable quand <b>chacune</b> de ses entrées contient au moins le poids de sa flèche. Ici : ${setTxt(en)}.`);
    },
    // Marquage après un tir
    after: ids => () => {
      let net, m, en, tries = 0;
      do { net = N(pick(ids)); m = walk(net, rnd(0, 4)); en = PETRI.enabled(net, m); } while (!en.length && ++tries < 20);
      if (!en.length) { m = PETRI.m0(net); en = PETRI.enabled(net, m); }
      const t = pick(en), good = PETRI.fire(net, m, t);
      const onlySub = m.slice(), onlyAdd = m.slice(); net.pre[t].forEach(([p, w]) => { onlySub[net.pi[p]] -= w; }); net.post[t].forEach(([p, w]) => { onlyAdd[net.pi[p]] += w; });
      const other = en.filter(x => x !== t).map(x => PETRI.fire(net, m, x)), shifted = good.map((v, i) => i === net.pi[(net.post[t][0] || net.pre[t][0])[0]] ? v + 1 : v);
      return mcq(`${intro(net, m)}<br>Situation dessinée : $m=${PETRI.vec(m)}$. On joue <code>${t}</code>. <b>Quelle est la nouvelle situation ?</b>`, `$${PETRI.vec(good)}$`,
        [onlySub, onlyAdd, ...other, m, shifted].map(v => `$${PETRI.vec(v)}$`).filter(x => x !== `$${PETRI.vec(good)}$`),
        `$m'(p)=m(p)-w(p,t)+w(t,p)$ : les entrées de ${t} (${side(net.pre[t])}) perdent des pions, ses sorties (${side(net.post[t])}) en gagnent, le reste ne bouge pas.`);
    },
    // Nombre de marquages accessibles (à construire sur papier)
    count: ids => () => {
      const net = N(pick(ids)), r = PETRI.reach(net);
      return { q: `${intro(net)}<br>Départ (dessiné) : $m_0=${PETRI.vec(PETRI.m0(net))}$. Applique la marche à suivre : <b>combien de marquages accessibles</b> (départ compris) ?`, a: r.markings.length, tol: 0, unit: 'marquages',
        expl: `${r.markings.length} marquages : ${r.markings.slice(0, 12).map(PETRI.vec).join(', ')}${r.markings.length > 12 ? '…' : ''}. ${r.dead.length ? 'Sans suite : ' + r.dead.map(i => PETRI.vec(r.markings[i])).join(', ') + '.' : 'Aucun n’est sans suite.'}` };
    },
    // Nombre de marquages sans suite
    dead: ids => () => {
      const net = N(pick(ids)), r = PETRI.reach(net);
      return { q: `${intro(net)}<br>Départ (dessiné) : $m_0=${PETRI.vec(PETRI.m0(net))}$. <b>Combien de marquages accessibles sont sans suite</b> (aucun carré jouable) ?`, a: r.dead.length, tol: 0, unit: 'marquages',
        expl: r.dead.length ? `Sans suite : ${r.dead.map(i => PETRI.vec(r.markings[i])).join(' et ')} (sur ${r.markings.length} marquages accessibles).` : `Aucun : dans chacun des ${r.markings.length} marquages accessibles, un carré reste jouable.` };
    },
    // Preset ou postset d'une transition
    preset: ids => () => {
      const net = N(pick(ids)), t = pick(net.T), isPre = Math.random() < .5;
      const good = (isPre ? net.pre[t] : net.post[t]).map(a => a[0]), other = (isPre ? net.post[t] : net.pre[t]).map(a => a[0]);
      const F = net.arcs.map(([a, b]) => `(${a},${b})`).join(', ');
      const lures = [setTxt(other), setTxt(uniq([...good, ...other])), setTxt(net.P.filter(p => !good.includes(p))), setTxt(net.P), setTxt(good.slice(1))].filter(x => x !== setTxt(good));
      const tt = `\\text{${t.replace(/_/g, '\\_')}}`;
      return mcq(`<b>${net.title}</b>${pm.fig(net.id)}$F=\\{$${F}$\\}$. <b>Que vaut $${isPre ? `\\bullet ${tt}` : `${tt}\\bullet`}$</b> (${isPre ? 'le preset' : 'le postset'} de <code>${t}</code>) ?`, setTxt(good), lures,
        `${isPre ? 'Preset' : 'Postset'} : les places $p$ telles que ${isPre ? `$(p,${t.replace(/_/g, '\\_')})\\in F$ (elles pointent vers la transition)` : `$(${t.replace(/_/g, '\\_')},p)\\in F$ (la transition pointe vers elles)`}. Ici ${setTxt(good)}.`);
    },
  };

  COURSE.pm = pm;
})();
