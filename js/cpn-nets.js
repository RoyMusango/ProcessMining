// Réseaux colorés et temporisés : problèmes 5 et 6 (F. Lecron), séance d'exercices 3 (solutions finales).
// Chaque résultat cité dans les fiches (contenu final des places, heures de sortie, 15 et 400 unités…) sort de CPN.run
// ou CPN.reach sur ces définitions et est contrôlé par verif/test_cpn.mjs.
(function (global) {
  const CPN = global.CPN || require('./cpn.js');
  const PETRI = global.PETRI || require('./petri.js');
  const D = CPN.define, at = CPN.at;
  const P = (id, x, y, init, o = {}) => ({ id, x, y, init, ...o });
  const T = (id, x, y, o = {}) => ({ id, x, y, ...o });
  const PP = (id, x, y, tokens = 0, lp) => ({ id, x, y, tokens, lp });
  const TT = (id, x, y, lp) => ({ id, x, y, lp });

  // ================================================================ Problème 5 : des jetons qui portent une valeur
  // Slide 2 : le laboratoire sans couleur (cinq jetons identiques)
  PETRI.define('labo-noir', { title: 'Le laboratoire sans couleur (problème 5, slide 2)',
    places: [PP('tubes_reçus', 40, 100, 5), PP('résultats', 300, 100, 0)],
    trans: [TT('analyser_hémato', 170, 30, 't'), TT('analyser_bio', 170, 170)],
    arcs: [['tubes_reçus', 'analyser_hémato'], ['tubes_reçus', 'analyser_bio'], ['analyser_hémato', 'résultats'], ['analyser_bio', 'résultats']] });
  // La correction « avec ce que l'on connaît » : une copie du réseau par patient (ici Ana)
  PETRI.define('labo-ana', { title: 'Sans couleur : la copie du réseau pour Ana',
    places: [PP('tube_hémato_ana', 40, 30, 1, 't'), PP('tube_bio_ana', 40, 170, 1), PP('rés_hémato_ana', 300, 30, 0, 't'), PP('rés_bio_ana', 300, 170, 0), PP('dossier_ana', 540, 100, 0)],
    trans: [TT('analyser_hémato_ana', 170, 30, 't'), TT('analyser_bio_ana', 170, 170), TT('consulter_ana', 420, 100)],
    arcs: [['tube_hémato_ana', 'analyser_hémato_ana'], ['analyser_hémato_ana', 'rés_hémato_ana'], ['tube_bio_ana', 'analyser_bio_ana'], ['analyser_bio_ana', 'rés_bio_ana'], ['rés_hémato_ana', 'consulter_ana'], ['rés_bio_ana', 'consulter_ana'], ['consulter_ana', 'dossier_ana']] });

  // Théorie, slide 4 : le cabinet
  D('cabinet', { title: 'Le cabinet : appeler un patient et prendre son dossier', vars: ['p', 'n'],
    places: [P('attente', 40, 140, ['ana', 'ben', 'cleo'], { type: 'PATIENT' }), P('dossiers', 120, 30, ['ana', 'ben', 'cleo'], { type: 'PATIENT', lp: 't' }), P('patients_vus', 320, 30, [0], { type: 'INT', lp: 't' }), P('en_consultation', 400, 140, [], { type: 'PATIENT' })],
    trans: [T('appeler', 220, 140)],
    arcs: [['attente', 'appeler', 'p'], ['dossiers', 'appeler', 'p'], ['patients_vus', 'appeler', 'n', { bend: -14 }], ['appeler', 'patients_vus', 'n + 1', { out: b => [b.n + 1], bend: -14 }], ['appeler', 'en_consultation', 'p']] });

  // Théorie, slide 5 : la garde (pédiatre ou généraliste)
  D('pediatre', { title: 'Une garde : les moins de 16 ans chez le pédiatre', vars: ['p', 'a'],
    places: [P('attente', 40, 110, [['ana', 34], ['ben', 8], ['cleo', 52]], { type: 'PATIENT * AGE', lp: 'b' }), P('chez_pédiatre', 360, 40, [], { lp: 'r' }), P('chez_généraliste', 360, 180, [], { lp: 'r' })],
    trans: [T('vers_pédiatre', 200, 40, { lp: 't', guard: '[a < 16]', g: b => b.a < 16 }), T('vers_généraliste', 200, 180, { guard: '[a ≥ 16]', g: b => b.a >= 16 })],
    arcs: [['attente', 'vers_pédiatre', '(p, a)'], ['attente', 'vers_généraliste', '(p, a)'], ['vers_pédiatre', 'chez_pédiatre', '(p, a)'], ['vers_généraliste', 'chez_généraliste', '(p, a)']] });

  // Théorie, slide 6 : une valeur qui compte (l'armoire)
  D('armoire', { title: 'L’armoire : un seul jeton qui porte le stock', vars: ['q'],
    places: [P('armoire', 60, 120, [3], { type: 'INT', lp: 'r' })],
    trans: [T('commander', 60, 20, { lp: 'l', guard: '[q < 2]', gp: 'r', g: b => b.q < 2 }), T('soigner', 60, 220, { lp: 'l', guard: '[q > 0]', gp: 'r', g: b => b.q > 0 })],
    arcs: [['armoire', 'commander', 'q', { bend: 16 }], ['commander', 'armoire', 'q + 10', { out: b => [b.q + 10], bend: 16 }], ['armoire', 'soigner', 'q', { bend: 16 }], ['soigner', 'armoire', 'q − 1', { out: b => [b.q - 1], bend: 16 }]] });

  // Le laboratoire coloré (théorie slide 7, slides 3 et 4 du problème)
  const TUBES = [['ana', 'hemato'], ['ana', 'bio'], ['ben', 'bio'], ['cleo', 'hemato'], ['cleo', 'bio']];
  const labo = (id, title, consult, vars) => D(id, { title, vars,
    places: [P('tubes_reçus', 40, 110, TUBES, { type: 'TUBE' }), P('résultats', 320, 110, [], { type: 'TUBE' }), P('dossier_complet', 680, 110, [], { type: 'PATIENT' })],
    trans: [T('analyser_hémato', 180, 30, { lp: 't', guard: '[a = hemato]', g: b => b.a === 'hemato' }), T('analyser_bio', 180, 190, { guard: '[a = bio]', gp: 't', g: b => b.a === 'bio' }), T('consulter', 540, 110)],
    arcs: [['tubes_reçus', 'analyser_hémato', '(p, a)'], ['tubes_reçus', 'analyser_bio', '(p, a)', { side: -1 }], ['analyser_hémato', 'résultats', '(p, a)'], ['analyser_bio', 'résultats', '(p, a)', { side: -1 }],
      ['résultats', 'consulter', consult, { side: -1 }], ['consulter', 'dossier_complet', 'p']] });
  labo('labo', 'Le laboratoire de biologie clinique (réseau coloré)', '(p, hemato), (p, bio)', ['p', 'a']);
  labo('labo-pq', 'Le laboratoire, inscription modifiée par un collègue', '(p, hemato), (q, bio)', ['p', 'a', 'q']);

  // Théorie slide 9 : les réactifs
  D('labo-reactifs', { title: 'Le laboratoire avec ses réactifs', vars: ['p', 'a', 'q'],
    places: [P('tubes_reçus', -60, 150, TUBES, { type: 'TUBE' }), P('réactifs', 220, 150, [['hemato', 1], ['bio', 3]], { type: 'ANALYSE * INT', lp: 'b' }), P('résultats', 500, 150, [], { type: 'TUBE' }), P('dossier_complet', 840, 150, [], { type: 'PATIENT' })],
    trans: [T('analyser_hémato', 220, 0, { lp: 't', guard: '[a = hemato, q > 0]', gp: 't', go: [0, -16], g: b => b.a === 'hemato' && b.q > 0 }),
      T('analyser_bio', 220, 300, { guard: '[a = bio, q > 0]', g: b => b.a === 'bio' && b.q > 0 }),
      T('réapprovisionner', 370, 150, { lp: 't', guard: '[q < 2]', gp: 'b', g: b => b.q < 2 }), T('consulter', 680, 150)],
    arcs: [['tubes_reçus', 'analyser_hémato', '(p, a)', { side: -1 }], ['tubes_reçus', 'analyser_bio', '(p, a)'], ['analyser_hémato', 'résultats', '(p, a)'], ['analyser_bio', 'résultats', '(p, a)', { side: -1 }],
      ['réactifs', 'analyser_hémato', '(a, q)'], ['analyser_hémato', 'réactifs', '(a, q − 1)', { out: b => [[b.a, b.q - 1]] }],
      ['réactifs', 'analyser_bio', '(a, q)'], ['analyser_bio', 'réactifs', '(a, q − 1)', { out: b => [[b.a, b.q - 1]] }],
      ['réactifs', 'réapprovisionner', '(a, q)', { lo: [0, -2] }], ['réapprovisionner', 'réactifs', '(a, q + 5)', { out: b => [[b.a, b.q + 5]], lo: [0, 4] }],
      ['résultats', 'consulter', '(p, hemato), (p, bio)', { side: -1 }], ['consulter', 'dossier_complet', 'p']] });

  // Slide 8 : les ambulances, une dernière fois (un seul cycle, deux jetons qui gardent leur identité)
  D('ambulances-c', { title: 'Les ambulances avec un seul cycle et leur identité', vars: ['a'],
    places: [P('à_la_base', 120, 20, ['amb_1', 'amb_2'], { type: 'AMBULANCE', lp: 't' }), P('en_mission', 120, 160, [], { type: 'AMBULANCE' })],
    trans: [T('rentrer', 40, 90, { lp: 'l' }), T('partir', 200, 90, { lp: 'r' })],
    arcs: [['à_la_base', 'partir', 'a'], ['partir', 'en_mission', 'a'], ['en_mission', 'rentrer', 'a'], ['rentrer', 'à_la_base', 'a']] });

  // Slide 9 : le tri aux urgences (proposition)
  D('tri', { title: 'Le tri aux urgences (proposition)', vars: ['p', 'c'],
    places: [P('accueil', 40, 120, [['ana', 'vert'], ['ben', 'rouge'], ['cleo', 'orange']], { type: 'PATIENT * COULEUR' }), P('déchocage_libre', 220, -40, [null], { type: 'UNIT', lp: 't' }),
      P('en_déchocage', 380, 40, [], { type: 'PATIENT', lp: 't' }), P('salle_d_attente', 380, 200, [], { type: 'PATIENT * COULEUR', lp: 'r' }), P('stabilisé', 640, 40, [], { type: 'PATIENT', lp: 't' })],
    trans: [T('vers_déchocage', 220, 40, { lp: 'b', guard: '[c = rouge]', gp: 'b', g: b => b.c === 'rouge' }), T('vers_salle_attente', 220, 200, { guard: '[c ≠ rouge]', g: b => b.c !== 'rouge' }), T('stabiliser', 520, 40, { lp: 'b' })],
    arcs: [['accueil', 'vers_déchocage', '(p, c)', { side: -1 }], ['accueil', 'vers_salle_attente', '(p, c)'], ['déchocage_libre', 'vers_déchocage', ''], ['vers_déchocage', 'en_déchocage', 'p'],
      ['vers_salle_attente', 'salle_d_attente', '(p, c)'], ['en_déchocage', 'stabiliser', 'p'], ['stabiliser', 'stabilisé', 'p'], ['stabiliser', 'déchocage_libre', '', { via: [[520, -40]] }]] });

  // ================================================================ Problème 6 : horodatage et délais (unité : la minute, 0 = 8 h 00)
  PETRI.define('scanner-noir', { title: 'Le scanner du matin, sans le temps (problème 6, slide 2)',
    places: [PP('attente', 40, 110, 3), PP('en_examen', 270, 110, 0), PP('sorti', 500, 110, 0), PP('scanner_libre', 270, 20, 1, 't')],
    trans: [TT('commencer', 155, 110), TT('terminer', 385, 110)],
    arcs: [['attente', 'commencer'], ['scanner_libre', 'commencer'], ['commencer', 'en_examen'], ['en_examen', 'terminer'], ['terminer', 'sorti'], ['terminer', 'scanner_libre']] });
  const scanner = (id, title, o) => D(id, { title, timed: true, vars: o.vars || ['p'],
    places: [P('attente', 40, 120, o.attente, { type: o.type || 'PATIENT' }), P('en_examen', 290, 120, [], { type: o.type || 'PATIENT' }), P('sorti', 540, 120, [], { type: o.type || 'PATIENT' }), P('scanner_libre', 290, 20, o.libre, { type: 'UNIT', lp: 't' }), ...(o.places || [])],
    trans: [T('commencer', 165, 120, o.tc || {}), T('terminer', 415, 120)],
    arcs: [['attente', 'commencer', o.in || 'p'], ['scanner_libre', 'commencer', '', { via: [[165, 20]] }], ['commencer', 'en_examen', 'p@+20'], ['en_examen', 'terminer', 'p'], ['terminer', 'sorti', 'p'], ['terminer', 'scanner_libre', '', { via: [[415, 20]] }], ...(o.arcs || [])] });
  const MATIN = [at('ana', 0), at('ben', 5), at('cleo', 10)];
  scanner('scanner', 'Le scanner du matin, avec l’horodatage et le délai', { attente: MATIN, libre: [at(null, 0)] });
  scanner('scanner-2', 'Deux scanners le matin', { attente: MATIN, libre: [at(null, 0), at(null, 0)] });
  // Premier arrivé, premier servi (proposition) : un numéro d'ordre sur chaque patient et un compteur « suivant »
  scanner('scanner-fifo', 'Premier arrivé, premier servi (proposition)', { vars: ['p', 'k', 'n'], type: 'PATIENT * NUMÉRO', attente: [at(['ana', 1], 0), at(['ben', 2], 5), at(['cleo', 3], 10)], libre: [at(null, 0)],
    in: '(p, k)', tc: { guard: '[k = n]', gp: 't', go: [-44, 0], g: b => b.k === b.n },
    places: [P('suivant', 165, 300, [1], { type: 'INT' })], arcs: [['suivant', 'commencer', 'n', { bend: -12 }], ['commencer', 'suivant', 'n + 1', { out: b => [b.n + 1], bend: -12 }]] });
  CPN.nets['scanner-fifo'].places.find(p => p.id === 'en_examen').type = 'PATIENT';
  CPN.nets['scanner-fifo'].places.find(p => p.id === 'sorti').type = 'PATIENT';

  // Théorie slide 3, problème slide 6 : avec ou sans produit de contraste
  const prep = c => c ? 15 : 0, duree = c => c ? 30 : 15;
  D('scanner-contraste', { title: 'Avec ou sans produit de contraste', timed: true, vars: ['p', 'c'],
    places: [P('arrivée', 30, 120, [at(['ana', false], 0), at(['ben', true], 5), at(['cleo', false], 10)], { type: 'PATIENT * BOOL' }), P('prêt', 360, 120, []), P('en_examen', 690, 120, []), P('sorti', 990, 120, []), P('scanner_libre', 690, 20, [at(null, 0)], { type: 'UNIT', lp: 't' })],
    trans: [T('préparer', 170, 120), T('commencer', 520, 120), T('terminer', 840, 120)],
    arcs: [['arrivée', 'préparer', '(p, c)'], ['préparer', 'prêt', '(p, c)@+prep(c)', { delay: b => prep(b.c) }], ['prêt', 'commencer', '(p, c)'], ['scanner_libre', 'commencer', '', { via: [[520, 20]] }],
      ['commencer', 'en_examen', '(p, c)@+duree(c)', { delay: b => duree(b.c) }], ['en_examen', 'terminer', '(p, c)'], ['terminer', 'sorti', '(p, c)'], ['terminer', 'scanner_libre', '', { via: [[840, 20]] }]] });

  // Slide 7 : la stérilisation chronométrée (proposition)
  const steri = (id, title, sale, type, inscr, delay) => D(id, { title, timed: true, vars: ['b', 'd'],
    places: [P('sale', 40, 120, sale, { type }), P('en_cycle', 290, 120, [], { type }), P('stérile', 540, 120, [], { type }), P('autoclave_libre', 290, 20, [at(null, 0)], { type: 'UNIT', lp: 't' })],
    trans: [T('lancer', 165, 120), T('terminer', 415, 120)],
    arcs: [['sale', 'lancer', inscr], ['autoclave_libre', 'lancer', '', { via: [[165, 20]] }], ['lancer', 'en_cycle', inscr + '@+' + (delay ? 'd' : '60'), delay ? { delay } : {}], ['en_cycle', 'terminer', inscr], ['terminer', 'stérile', inscr], ['terminer', 'autoclave_libre', '', { via: [[415, 20]] }]] });
  steri('sterilisation-t', 'La stérilisation chronométrée : cycle de 60 minutes', [at('boîte_1', 0), at('boîte_2', 10), at('boîte_3', 20)], 'BOÎTE', 'b');
  steri('sterilisation-t2', 'La stérilisation : la deuxième boîte est lourde (90 minutes)', [at(['boîte_1', 60], 0), at(['boîte_2', 90], 10), at(['boîte_3', 60], 20)], 'BOÎTE * DURÉE', '(b, d)', b => b.d);

  // ================================================================ Séance 3 (solutions finales)
  // 3.1 : le club de sport
  D('club', { title: 'Exercice 3.1 : la carte de membre du club de sport', timed: true, vars: ['c', 'e'],
    places: [P('client_attente', 40, 130, ['c1', 'c2', 'c3', 'c4', 'c5'].map(n => [n, 30]), { type: 'CLIENT' }), P('employe', 340, 20, [['emp1', 5], ['emp2', 10]], { type: 'EMP', lp: 't' }), P('en_cours', 340, 130, [], { type: 'CLIEMP' }), P('client_entre', 640, 130, [], { type: 'CLIENT' })],
    trans: [T('debut_carte', 190, 130), T('fin_carte', 490, 130)],
    arcs: [['client_attente', 'debut_carte', 'c'], ['employe', 'debut_carte', 'e', { via: [[190, 20]] }], ['debut_carte', 'en_cours', '(c,e)@+5'], ['en_cours', 'fin_carte', '(c,e)'], ['fin_carte', 'client_entre', 'c'], ['fin_carte', 'employe', 'e', { via: [[490, 20]] }]] });

  // 3.2 : thé et café
  const delay = (comm, emp) => comm === 'The' ? (emp === 'Eve' ? 2 : 6) : (emp === 'Eve' ? 12 : 4);
  const cafe = (id, title, guard, g) => D(id, { title, timed: true, vars: ['emp', 'comm'],
    places: [P('Commande', 40, 130, [...Array(100).fill('The'), ...Array(100).fill('Cafe')], { type: 'ST' }), P('employe_dispo', 410, 20, ['Adam', 'Eve'], { type: 'ST', lp: 't' }), P('en_production', 450, 130, [], { type: 'EMPCOMM' }), P('Boisson', 780, 130, [], { type: 'ST' })],
    trans: [T('demarre_production', 190, 130, guard ? { guard, g, gp: 'b', go: [60, 0] } : {}), T('fin_production', 630, 130)],
    arcs: [['Commande', 'demarre_production', 'comm'], ['employe_dispo', 'demarre_production', 'emp', { via: [[190, 20]] }], ['demarre_production', 'en_production', '(comm,emp)@+delay(comm,emp)', { delay: b => delay(b.comm, b.emp), lo: [0, -2] }],
      ['en_production', 'fin_production', '(comm,emp)'], ['fin_production', 'Boisson', 'comm'], ['fin_production', 'employe_dispo', 'emp', { via: [[630, 20]] }]] });
  cafe('cafe-a', 'Exercice 3.2 (a, b) : thé et café, sans garde');
  cafe('cafe-c', 'Exercice 3.2 (c) : Eve ne prépare que le thé', '[(emp="Eve" andalso comm="The") orelse emp="Adam"]', b => (b.emp === 'Eve' && b.comm === 'The') || b.emp === 'Adam');
  cafe('cafe-d', 'Exercice 3.2 (d) : Eve le thé, Adam le café', '[(emp="Eve" andalso comm="The") orelse (emp="Adam" andalso comm="Cafe")]', b => (b.emp === 'Eve' && b.comm === 'The') || (b.emp === 'Adam' && b.comm === 'Cafe'));

  // 3.3 : les cinq philosophes. couvert(i) = [i, i+1] (et [5, 1] pour le cinquième)
  const couvert = (i, n = 5) => CPN.list([i, i === n ? 1 : i + 1]);
  const philo = (id, n) => D(id, { title: `Exercice 3.3 : les ${n} philosophes`, vars: ['phi', 'couv'],
    places: [P('phil_pense', 40, 100, Array.from({ length: n }, (_, i) => i + 1), { type: 'INT', lp: 'b' }), P('phil_mange', 350, 100, [], { type: 'PHICOUV', lp: 't' }), P('couverts', 270, 230, Array.from({ length: n }, (_, i) => i + 1), { type: 'INT' })],
    trans: [T('manger', 200, 100, { lp: 't', guard: '[couv=couvert(phi)]', gp: 't', derive: b => ({ couv: couvert(b.phi, n) }) }), T('finir_manger', 500, 100, { lp: 't' })],
    arcs: [['phil_pense', 'manger', 'phi'], ['couverts', 'manger', 'couv', { need: b => b.couv.L }], ['manger', 'phil_mange', '(phi,couv)'], ['phil_mange', 'finir_manger', '(phi,couv)'],
      ['finir_manger', 'phil_pense', 'phi', { via: [[560, 100], [560, 10], [40, 10]], seg: 2 }], ['finir_manger', 'couverts', 'couv', { out: b => b.couv.L }]] });
  philo('philosophes', 5);
  CPN.couvert = couvert; CPN.philo = philo;

  // 3.4 : le radiateur et la porte (une unité = une minute)
  const radiateur = (id, title, thermo) => D(id, { title, timed: true, vars: ['port_chauff', 't'],
    places: [P('temperature', 300, 120, [16], { type: 'INT', lp: 't' }), P('chauffage', 100, 20, [at(null, 0)], { type: 'UNITIMED', lp: 'l' }), P('porte', 500, 20, [at(null, 0)], { type: 'UNITIMED', lp: 'r' }),
      ...(thermo ? [P('off', 300, 240, [null], { type: 'UNIT', lp: 't' }), P('on', 300, 350, [], { type: 'UNIT' })] : [])],
    trans: [T('rechauffe', 100, 120, { lp: 'l' }), T('ouvrir', 500, 120, { lp: 'r' }),
      ...(thermo ? [T('eteint', 200, 240, { lp: 'l', guard: '[t>22]', gp: 'l' }), T('allume', 400, 240, { lp: 'r', guard: '[t<18]', gp: 'r' })] : [])],
    arcs: [['chauffage', 'rechauffe', 'port_chauff'], ['rechauffe', 'chauffage', 'port_chauff@+15'], ['porte', 'ouvrir', 'port_chauff'], ['ouvrir', 'porte', 'port_chauff@+60'],
      ['temperature', 'rechauffe', 't', { bend: 14 }], ['rechauffe', 'temperature', 't+1', { out: b => [b.t + 1], bend: 14 }], ['temperature', 'ouvrir', 't', { bend: 14 }], ['ouvrir', 'temperature', 't-3', { out: b => [b.t - 3], bend: 14 }],
      ...(thermo ? [['temperature', 'eteint', 't', { bend: 8 }], ['eteint', 'temperature', 't', { bend: 8 }], ['temperature', 'allume', 't', { bend: 8 }], ['allume', 'temperature', 't', { bend: 8 }],
        ['off', 'allume', ''], ['allume', 'on', '', { via: [[400, 350]] }], ['on', 'eteint', '', { via: [[200, 350]] }], ['eteint', 'off', ''], ['on', 'rechauffe', '', { via: [[100, 350]], both: true }], ['rechauffe', 'on', '', { hidden: true }]] : [])] });
  radiateur('radiateur-a', 'Exercice 3.4 (a) : le radiateur et la porte', false);
  radiateur('radiateur-b', 'Exercice 3.4 (b) : avec le thermostat', true);
  const rb = CPN.nets['radiateur-b'];
  rb.by.eteint.g = b => b.t > 22; rb.by.allume.g = b => b.t < 18;

  if (typeof module !== 'undefined' && module.exports) module.exports = CPN;
})(typeof window !== 'undefined' ? window : globalThis);
