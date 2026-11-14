// Les réseaux du cours (slides des problèmes 1 à 4, guide de routage, exercices de la séance 1), transcrits pour le simulateur.
// Chaque nombre affiché dans les fiches (marquages, situations sans suite, borné ou non) sort de PETRI.reach sur ces définitions
// et est contrôlé par verif/test_petri.mjs.
(function (global) {
  const PETRI = global.PETRI || require('./petri.js');
  const D = PETRI.define, V = PETRI.derive;
  const P = (id, x, y, tokens = 0, lp) => ({ id, x, y, tokens, lp });
  const T = (id, x, y, lp) => ({ id, x, y, lp });

  // ---------------------------------------------------------------- Problème 1
  D('regle-A', { title: 'Règle du jeu, cas A', hidden: true, places: [P('e', 40, 30, 1), P('s', 200, 30)], trans: [T('t', 120, 30)], arcs: [['e', 't'], ['t', 's']] });
  D('regle-B', { title: 'Règle du jeu, cas B', hidden: true, places: [P('e1', 40, 20, 1, 'l'), P('e2', 40, 90, 1, 'l'), P('s', 200, 55)], trans: [T('t', 120, 55)], arcs: [['e1', 't'], ['e2', 't'], ['t', 's']] });
  D('regle-C', { title: 'Règle du jeu, cas C', hidden: true, places: [P('e1', 40, 20, 1, 'l'), P('e2', 40, 90, 0, 'l'), P('s', 200, 55)], trans: [T('t', 120, 55)], arcs: [['e1', 't'], ['e2', 't'], ['t', 's']] });
  D('regle-D', { title: 'Règle du jeu, cas D', hidden: true, places: [P('e', 40, 55, 3), P('s1', 200, 20, 0, 'r'), P('s2', 200, 90, 0, 'r')], trans: [T('t', 120, 55)], arcs: [['e', 't'], ['t', 's1'], ['t', 's2']] });
  D('regle-6', { title: 'Problème 1, slide 6', hidden: true, places: [P('e1', 40, 20, 2, 'l'), P('e2', 40, 90, 1, 'l'), P('s1', 220, 20, 1, 'r'), P('s2', 220, 90, 0, 'r')], trans: [T('t', 130, 55)], arcs: [['e1', 't'], ['e2', 't'], ['t', 's1'], ['t', 's2']] });

  const line = y => [T('entrer', 120, y), T('vacciner', 280, y), T('sortir', 440, y)];
  D('vacc-naif', { title: 'Centre de vaccination (premier plateau)',
    places: [P('attente', 40, 40, 3, 't'), P('dans_box', 200, 40, 0, 't'), P('vacciné', 360, 40, 0, 't'), P('sorti', 520, 40, 0, 't')], trans: line(40),
    arcs: [['attente', 'entrer'], ['entrer', 'dans_box'], ['dans_box', 'vacciner'], ['vacciner', 'vacciné'], ['vacciné', 'sortir'], ['sortir', 'sorti']] });
  const vaccP = n => [P('attente', 40, 120, 3, 't'), P('box_libre', 280, 30, n, 't'), P('dans_box', 200, 120), P('vacciné', 360, 120), P('sorti', 520, 120, 0, 't')];
  const vaccA = back => [['attente', 'entrer'], ['box_libre', 'entrer'], ['entrer', 'dans_box'], ['dans_box', 'vacciner'], ['vacciner', 'vacciné'], ['vacciné', 'sortir'], ['sortir', 'sorti'], [back, 'box_libre']];
  D('vacc-corrige', { title: 'Centre de vaccination corrigé (box rendu par sortir)', places: vaccP(1), trans: line(120), arcs: vaccA('sortir') });
  D('vacc-corrige-bleu', { title: 'Centre de vaccination corrigé (box rendu par vacciner)', places: vaccP(1), trans: line(120), arcs: vaccA('vacciner') });
  V('vacc-2box', 'vacc-corrige', { title: 'Centre de vaccination, deux box', tokens: { box_libre: 2 } });
  D('brancardier', { title: 'Le brancardier (trois lieux)',
    places: [P('urgences', 40, 200, 1), P('imagerie', 440, 200, 0), P('bloc', 240, 20, 0, 't')],
    trans: [T('u_vers_i', 240, 170, 't'), T('i_vers_u', 240, 235), T('u_vers_b', 105, 95, 'l'), T('b_vers_u', 170, 125, 'r'), T('b_vers_i', 375, 95, 'r'), T('i_vers_b', 310, 125, 'l')],
    arcs: [['urgences', 'u_vers_i'], ['u_vers_i', 'imagerie'], ['imagerie', 'i_vers_u'], ['i_vers_u', 'urgences'], ['urgences', 'u_vers_b'], ['u_vers_b', 'bloc'], ['bloc', 'b_vers_u'], ['b_vers_u', 'urgences'],
      ['bloc', 'b_vers_i'], ['b_vers_i', 'imagerie'], ['imagerie', 'i_vers_b'], ['i_vers_b', 'bloc']] });

  // ---------------------------------------------------------------- Problème 2
  D('message-pb2', { title: 'Le message du problème 2',
    places: [P('p1', 40, 80, 1), P('p2', 230, 30, 1, 't'), P('p3', 230, 130, 1)], trans: [T('t1', 130, 80), T('t2', 130, 0, 't'), T('t3', 330, 80)],
    arcs: [['p1', 't1'], ['t1', 'p2'], ['t1', 'p3'], ['p2', 't2'], ['t2', 'p1'], ['p2', 't3'], ['p3', 't3'], ['t3', 'p3']] });
  const door = (k, y, s) => ({ places: [P('fermée_' + k, 40, y, 1, s > 0 ? 't' : 'b'), P('ouverte_' + k, 360, y, 0, s > 0 ? 't' : 'b')], trans: [T('ouvrir_' + k, 150, y, s > 0 ? 't' : 'b'), T('fermer_' + k, 250, y, s > 0 ? 't' : 'b')],
    arcs: [['fermée_' + k, 'ouvrir_' + k], ['ouvrir_' + k, 'ouverte_' + k, 1, -22 * s], ['ouverte_' + k, 'fermer_' + k], ['fermer_' + k, 'fermée_' + k, 1, -22 * s]] });
  D('sas-porte', { title: 'Le sas : une porte', places: [P('fermée', 40, 50, 1), P('ouverte', 220, 50, 0)], trans: [T('ouvrir', 130, 15, 't'), T('fermer', 130, 85)],
    arcs: [['fermée', 'ouvrir'], ['ouvrir', 'ouverte'], ['ouverte', 'fermer'], ['fermer', 'fermée']] });
  const d1 = door(1, 30, 1), d2 = door(2, 210, -1);
  D('sas-2portes', { title: 'Le sas : deux portes indépendantes', places: [...d1.places, ...d2.places], trans: [...d1.trans, ...d2.trans], arcs: [...d1.arcs, ...d2.arcs] });
  D('sas', { title: 'Le sas avec la règle de stérilité', places: [...d1.places, ...d2.places, P('sas_fermé', 200, 120, 1, 'r')], trans: [...d1.trans, ...d2.trans],
    arcs: [...d1.arcs, ...d2.arcs, ['sas_fermé', 'ouvrir_1'], ['fermer_1', 'sas_fermé'], ['sas_fermé', 'ouvrir_2'], ['fermer_2', 'sas_fermé']] });
  D('pharmacie', { title: 'Le guichet de la pharmacie',
    places: [P('attend', 40, 30, 2, 't'), P('servi', 200, 30, 0, 't'), P('parti', 360, 30, 0, 't'), P('libre', 40, 170, 1), P('sert', 200, 170, 0, 'r'), P('enregistre', 360, 170, 0)],
    trans: [T('commencer', 120, 100, 'l'), T('fin_service', 280, 100, 'r'), T('fin_enregistrement', 200, 250)],
    arcs: [['attend', 'commencer'], ['libre', 'commencer'], ['commencer', 'servi'], ['commencer', 'sert'], ['servi', 'fin_service'], ['sert', 'fin_service'], ['fin_service', 'parti'], ['fin_service', 'enregistre'],
      ['enregistre', 'fin_enregistrement'], ['fin_enregistrement', 'libre']] });
  const navette = seats => {
    const cols = [0, 290, 580], places = [], trans = [], arcs = [];
    cols.forEach((x, k) => { const i = k + 1;
      places.push(P('quai_' + i, x, 110, [2, 1, 0][k], 't'));
      trans.push(T('monter_' + i, x + 80, 110, 't'), T('descendre_' + i, x + 185, 110, 't'));
      arcs.push(['quai_' + i, 'monter_' + i], ['monter_' + i, 'à_bord'], ['à_bord', 'descendre_' + i], ['à_S' + i, 'monter_' + i], ['monter_' + i, 'à_S' + i], ['à_S' + i, 'descendre_' + i], ['descendre_' + i, 'à_S' + i]);
      if (seats) arcs.push(['sièges_libres', 'monter_' + i], ['descendre_' + i, 'sièges_libres']); });
    cols.forEach((x, k) => places.push(P('à_S' + (k + 1), x + 132, 210, k === 0 ? 1 : 0)));
    places.push(P('à_bord', 290, -20, 0, 't')); if (seats) places.push(P('sièges_libres', 550, -20, seats, 't'));
    trans.push(T('rouler_12', 277, 210), T('rouler_23', 567, 210), T('rouler_31', 422, 300));
    arcs.push(['à_S1', 'rouler_12'], ['rouler_12', 'à_S2'], ['à_S2', 'rouler_23'], ['rouler_23', 'à_S3'], ['à_S3', 'rouler_31'], ['rouler_31', 'à_S1']);
    return { places, trans, arcs };
  };
  D('navette', { title: 'La navette inter-sites (sans limite de sièges)', ...navette(0) });
  const n8 = navette(8); n8.places.find(p => p.id === 'quai_1').tokens = 10;
  D('navette-8', { title: 'La navette limitée à 8 passagers', ...n8 });

  // ---------------------------------------------------------------- Problème 3
  const amb = (s, x) => ({ places: [P('base' + s, x + 80, 20, 1, 't'), P('mission' + s, x + 80, 140, 0)], trans: [T('rentrer' + s, x + 20, 80, 'l'), T('partir' + s, x + 140, 80, 'r')],
    arcs: [['base' + s, 'partir' + s], ['partir' + s, 'mission' + s], ['mission' + s, 'rentrer' + s], ['rentrer' + s, 'base' + s]] });
  const aA = amb('_A', 40), aB = amb('_B', 330);
  D('ambulances-1', { title: 'Ambulances, modèle 1 (une boucle par ambulance)', places: [...aA.places, ...aB.places], trans: [...aA.trans, ...aB.trans], arcs: [...aA.arcs, ...aB.arcs] });
  D('ambulances-2', { title: 'Ambulances, modèle 2 (une boucle, deux pions)', places: [P('à_la_base', 110, 20, 2, 't'), P('en_mission', 110, 140, 0)], trans: [T('rentrer', 40, 80, 'l'), T('partir', 180, 80, 'r')],
    arcs: [['à_la_base', 'partir'], ['partir', 'en_mission'], ['en_mission', 'rentrer'], ['rentrer', 'à_la_base']] });
  V('ambulances-12', 'ambulances-2', { title: 'Ambulances, modèle 2 avec 12 ambulances', tokens: { à_la_base: 12 } });
  D('cycle-abstrait', { title: 'Le réseau cyclique sans noms (problème 3, slide 4)',
    places: [P('p1', 140, 20, 1, 't'), P('p2', 240, 100, 0, 'r'), P('p3', 140, 180, 0), P('p4', 40, 100, 0, 'l')], trans: [T('t1', 240, 20, 't'), T('t2', 240, 180), T('t3', 40, 180), T('t4', 40, 20, 't')],
    arcs: [['p1', 't1'], ['t1', 'p2'], ['p2', 't2'], ['t2', 'p3'], ['p3', 't3'], ['t3', 'p4'], ['p4', 't4'], ['t4', 'p1']] });
  D('sterilisation-naive', { title: 'Stérilisation (modèle de départ)', places: [P('sale', 40, 30, 3), P('stérile', 220, 30)], trans: [T('stériliser', 130, 30)], arcs: [['sale', 'stériliser'], ['stériliser', 'stérile']] });
  D('sterilisation', { title: 'Stérilisation corrigée (cycle qui dure, un seul autoclave)',
    places: [P('sale', 40, 110, 3), P('autoclave_libre', 220, 30, 1, 't'), P('en_cycle', 220, 110), P('stérile', 400, 110)], trans: [T('lancer', 130, 110), T('terminer', 310, 110)],
    arcs: [['sale', 'lancer'], ['autoclave_libre', 'lancer'], ['lancer', 'en_cycle'], ['en_cycle', 'terminer'], ['terminer', 'stérile'], ['terminer', 'autoclave_libre']] });
  const urgHead = [P('arrivé', 40, 50, 1), P('enregistré', 200, 50), P('trié', 360, 50), P('à_prélever', 520, 10, 0, 't'), P('à_radiographier', 520, 90), P('sang_fait', 680, 10, 0, 't'), P('radio_faite', 680, 90), P('diagnostiqué', 760, 215)];
  const urgT = [T('enregistrement', 120, 50), T('tri', 280, 50), T('prescription', 440, 50), T('prise_de_sang', 600, 10, 't'), T('radio', 600, 90), T('diagnostic', 760, 50, 'r'), T('hospitalisation', 660, 180, 't'), T('retour_domicile', 660, 250)];
  const urgA = [['arrivé', 'enregistrement'], ['enregistrement', 'enregistré'], ['enregistré', 'tri'], ['tri', 'trié'], ['trié', 'prescription'], ['prescription', 'à_prélever'], ['prescription', 'à_radiographier'],
    ['à_prélever', 'prise_de_sang'], ['prise_de_sang', 'sang_fait'], ['à_radiographier', 'radio'], ['radio', 'radio_faite'], ['sang_fait', 'diagnostic'], ['radio_faite', 'diagnostic'], ['diagnostic', 'diagnostiqué'],
    ['diagnostiqué', 'hospitalisation'], ['diagnostiqué', 'retour_domicile']];
  D('urgences', { title: 'Le trajet d’un patient aux urgences', places: [...urgHead, P('à_clôturer', 560, 215), P('clos', 400, 215)], trans: [...urgT, T('clôture', 480, 215)],
    arcs: [...urgA, ['hospitalisation', 'à_clôturer'], ['retour_domicile', 'à_clôturer'], ['à_clôturer', 'clôture'], ['clôture', 'clos']] });
  D('urgences-2clotures', { title: 'Urgences, variante à deux transitions de clôture', places: [...urgHead, P('hospitalisé', 560, 180, 0, 't'), P('rentré', 560, 250), P('clos', 380, 215, 0, 'l')], trans: [...urgT, T('clôture_h', 470, 180, 't'), T('clôture_r', 470, 250)],
    arcs: [...urgA, ['hospitalisation', 'hospitalisé'], ['retour_domicile', 'rentré'], ['hospitalisé', 'clôture_h'], ['rentré', 'clôture_r'], ['clôture_h', 'clos'], ['clôture_r', 'clos']] });
  const revP = (n, lits) => [P('opéré', 40, 110, n), ...(lits ? [P('lits_libres', 200, 30, lits, 't')] : []), P('en_réveil', 200, 110), P('en_chambre', 360, 110)];
  const revT = [T('entrer', 120, 110), T('sortir', 280, 110)], revA = [['opéré', 'entrer'], ['entrer', 'en_réveil'], ['en_réveil', 'sortir'], ['sortir', 'en_chambre']];
  D('reveil-naif', { title: 'Salle de réveil (modèle de départ)', places: revP(4, 0), trans: revT, arcs: revA });
  D('reveil', { title: 'Salle de réveil à trois lits', places: revP(4, 3), trans: revT, arcs: [...revA, ['lits_libres', 'entrer'], ['sortir', 'lits_libres']] });
  V('reveil-4lits', 'reveil', { title: 'Salle de réveil à quatre lits', tokens: { lits_libres: 4 } });
  const sang = w => ({ places: [P('commandées', 40, 110, 9), P('libres', 240, 30, 6, 't'), P('stock', 240, 110), P('transfusé', 440, 110)], trans: [T('livrer', 140, 110), T('transfuser', 340, 110)],
    arcs: [['commandées', 'livrer', w ? 3 : 1], ['libres', 'livrer', w ? 3 : 1], ['livrer', 'stock', w ? 3 : 1], ['stock', 'transfuser', w ? 2 : 1], ['transfuser', 'libres', w ? 2 : 1], ['transfuser', 'transfusé']] });
  D('sang-simple', { title: 'Poches de sang, arcs simples (modèle fautif)', ...sang(false) });
  D('sang', { title: 'Poches de sang, arcs pondérés', ...sang(true) });
  D('pompes-a', { title: 'Pompes à perfusion : combien dans chaque état',
    places: [P('disponible', 150, 20, 3, 't'), P('en_utilisation', 270, 150, 0, 'r'), P('à_réviser', 30, 150, 0, 'l')], trans: [T('utiliser', 240, 70, 'r'), T('terminer', 150, 170), T('réviser', 60, 70, 'l')],
    arcs: [['disponible', 'utiliser'], ['utiliser', 'en_utilisation'], ['en_utilisation', 'terminer'], ['terminer', 'à_réviser'], ['à_réviser', 'réviser'], ['réviser', 'disponible']] });
  D('pompes-c', { title: 'Pompes à perfusion avec la technicienne',
    places: [P('disponible', 40, 40, 3, 't'), P('en_utilisation', 220, 40, 0, 't'), P('à_réviser', 400, 40, 0, 't'), P('en_révision', 220, 150), P('technicienne_libre', 220, 250, 1)],
    trans: [T('utiliser', 130, 40, 't'), T('terminer', 310, 40, 't'), T('commencer_révision', 400, 150, 'r'), T('finir_révision', 40, 150, 'l')],
    arcs: [['disponible', 'utiliser'], ['utiliser', 'en_utilisation'], ['en_utilisation', 'terminer'], ['terminer', 'à_réviser'], ['à_réviser', 'commencer_révision'], ['commencer_révision', 'en_révision'],
      ['en_révision', 'finir_révision'], ['finir_révision', 'disponible'], ['technicienne_libre', 'commencer_révision'], ['finir_révision', 'technicienne_libre']] });
  D('sortie', { title: 'La sortie d’hospitalisation',
    places: [P('hospitalisé', 40, 60, 1), P('à_préparer', 210, 20, 0, 't'), P('à_rédiger', 210, 100), P('médicaments_prêts', 420, 20, 0, 't'), P('lettre_prête', 420, 100), P('prêt_à_partir', 610, 60), P('parti', 800, 60), P('chambre_libre', 800, 190)],
    trans: [T('signature', 120, 60), T('pharmacie', 310, 20, 't'), T('secrétariat', 310, 100), T('remise', 520, 60), T('ambulance', 705, 20, 't'), T('propres_moyens', 705, 100), T('libérer_chambre', 800, 125, 'l')],
    arcs: [['hospitalisé', 'signature'], ['signature', 'à_préparer'], ['signature', 'à_rédiger'], ['à_préparer', 'pharmacie'], ['pharmacie', 'médicaments_prêts'], ['à_rédiger', 'secrétariat'], ['secrétariat', 'lettre_prête'],
      ['médicaments_prêts', 'remise'], ['lettre_prête', 'remise'], ['remise', 'prêt_à_partir'], ['prêt_à_partir', 'ambulance'], ['prêt_à_partir', 'propres_moyens'], ['ambulance', 'parti'], ['propres_moyens', 'parti'],
      ['parti', 'libérer_chambre'], ['libérer_chambre', 'chambre_libre']] });

  // ---------------------------------------------------------------- Guide de routage (motifs et pièges)
  D('motif-seq', { title: 'Motif : séquence (y après x)', places: [P('p1', 40, 30, 1), P('p2', 200, 30), P('p3', 360, 30)], trans: [T('x', 120, 30), T('y', 280, 30)], arcs: [['p1', 'x'], ['x', 'p2'], ['p2', 'y'], ['y', 'p3']] });
  D('motif-and-split', { title: 'Motif : AND-split (1 transition, plusieurs places)',
    places: [P('p_in', 40, 60, 1), P('p_branche1', 200, 20, 0, 't'), P('p_branche2', 200, 100), P('p_fin1', 360, 20, 0, 't'), P('p_fin2', 360, 100)], trans: [T('t_split', 120, 60), T('y', 280, 20, 't'), T('z', 280, 100)],
    arcs: [['p_in', 't_split'], ['t_split', 'p_branche1'], ['t_split', 'p_branche2'], ['p_branche1', 'y'], ['y', 'p_fin1'], ['p_branche2', 'z'], ['z', 'p_fin2']] });
  D('motif-and-join', { title: 'Motif : AND-join (plusieurs places, 1 transition)',
    places: [P('p1', 40, 20, 1, 't'), P('p2', 40, 100, 1), P('p_résultat1', 200, 20, 0, 't'), P('p_résultat2', 200, 100), P('p_suite', 360, 60)], trans: [T('x', 120, 20, 't'), T('y', 120, 100), T('t_sync', 280, 60)],
    arcs: [['p1', 'x'], ['x', 'p_résultat1'], ['p2', 'y'], ['y', 'p_résultat2'], ['p_résultat1', 't_sync'], ['p_résultat2', 't_sync'], ['t_sync', 'p_suite']] });
  D('motif-xor-split', { title: 'Motif : XOR-split (1 place, plusieurs transitions)',
    places: [P('p_décision', 40, 60, 1), P('p_A', 200, 20, 0, 'r'), P('p_B', 200, 100, 0, 'r')], trans: [T('t_choixA', 120, 20, 't'), T('t_choixB', 120, 100)],
    arcs: [['p_décision', 't_choixA'], ['p_décision', 't_choixB'], ['t_choixA', 'p_A'], ['t_choixB', 'p_B']] });
  D('motif-xor-join', { title: 'Motif : XOR-join (plusieurs transitions, 1 place)',
    places: [P('p_décision', 40, 60, 1), P('p_commune', 220, 60), P('p_fin', 380, 60)], trans: [T('t_brancheA', 130, 20, 't'), T('t_brancheB', 130, 100), T('t_suite', 300, 60)],
    arcs: [['p_décision', 't_brancheA'], ['p_décision', 't_brancheB'], ['t_brancheA', 'p_commune'], ['t_brancheB', 'p_commune'], ['p_commune', 't_suite'], ['t_suite', 'p_fin']] });
  D('piege1', { title: 'Piège 1 : XOR-split refermé par un AND-join',
    places: [P('p0', 40, 60, 1), P('pa', 200, 20, 0, 't'), P('pb', 200, 100), P('fin', 360, 60)], trans: [T('choisir_a', 120, 20, 't'), T('choisir_b', 120, 100), T('réunir', 280, 60)],
    arcs: [['p0', 'choisir_a'], ['p0', 'choisir_b'], ['choisir_a', 'pa'], ['choisir_b', 'pb'], ['pa', 'réunir'], ['pb', 'réunir'], ['réunir', 'fin']] });
  D('piege2', { title: 'Piège 2 : AND-split refermé par un XOR-join',
    places: [P('p0', 40, 60, 1), P('pa', 200, 20, 0, 't'), P('pb', 200, 100), P('pc', 360, 60), P('fin', 520, 60)], trans: [T('séparer', 120, 60), T('a', 280, 20, 't'), T('b', 280, 100), T('suite', 440, 60)],
    arcs: [['p0', 'séparer'], ['séparer', 'pa'], ['séparer', 'pb'], ['pa', 'a'], ['pb', 'b'], ['a', 'pc'], ['b', 'pc'], ['pc', 'suite'], ['suite', 'fin']] });

  // ---------------------------------------------------------------- Problème 4
  const echo = same => {
    const bw = same ? 'B_attend_inf' : 'B_attend_écho', bt = same ? 'B_prend_écho' : 'B_prend_inf';
    return { places: [P('A_demande', 60, 20, 1, 'l'), P('A_attend_inf', 60, 160, 0, 'l'), P('A_fini', 60, 300, 0, 'l'), P('B_demande', 420, 20, 1, 'r'), P(bw, 420, 160, 0, 'r'), P('B_fini', 420, 300, 0, 'r'), P('écho_libre', 240, 60, 1, 't'), P('inf_libre', 240, 200, 1)],
      trans: [T('A_prend_écho', 60, 90, 'l'), T('A_examine', 60, 230, 'l'), T(bt, 420, 90, 'r'), T('B_examine', 420, 230, 'r')],
      arcs: [['A_demande', 'A_prend_écho'], ['écho_libre', 'A_prend_écho'], ['A_prend_écho', 'A_attend_inf'], ['A_attend_inf', 'A_examine'], ['inf_libre', 'A_examine'], ['A_examine', 'A_fini'], ['A_examine', 'écho_libre'], ['A_examine', 'inf_libre'],
        ['B_demande', bt], [same ? 'écho_libre' : 'inf_libre', bt], [bt, bw], [bw, 'B_examine'], [same ? 'inf_libre' : 'écho_libre', 'B_examine'], ['B_examine', 'B_fini'], ['B_examine', 'écho_libre'], ['B_examine', 'inf_libre']] };
  };
  D('echo', { title: 'Deux services, un échographe, une infirmière', ...echo(false) });
  D('echo-ordre', { title: 'Échographe et infirmière : même ordre d’acquisition', ...echo(true) });
  D('accueil', { title: 'L’accueil ouvert (réseau non borné)', places: [P('accueil_ouvert', 40, 40, 1), P("salle_d'attente", 240, 40)], trans: [T('arrivée', 140, 40)],
    arcs: [['accueil_ouvert', 'arrivée'], ['arrivée', 'accueil_ouvert'], ['arrivée', "salle_d'attente"]] });
  D('accueil-borne', { title: 'L’accueil borné par des chaises', places: [P('accueil_ouvert', 40, 110, 1), P('chaises_libres', 140, 30, 3, 't'), P("salle_d'attente", 240, 110)], trans: [T('arrivée', 140, 110)],
    arcs: [['accueil_ouvert', 'arrivée'], ['arrivée', 'accueil_ouvert'], ['chaises_libres', 'arrivée'], ['arrivée', "salle_d'attente"]] });

  // ---------------------------------------------------------------- Exercices, séance 1
  D('ex11', { title: 'Exercice 1.1',
    places: [P('p1', 140, 120, 1), P('p2', 100, 40, 0, 't'), P('p3', 100, 200), P('p4', 300, 120, 1), P('p5', 500, 40, 0, 't'), P('p6', 500, 200), P('p7', 460, 120, 1)],
    trans: [T('t1', 200, 40, 't'), T('t2', 30, 120, 'l'), T('t3', 200, 200), T('t4', 400, 40, 't'), T('t5', 570, 120, 'r'), T('t6', 400, 200)],
    arcs: [['p1', 't1'], ['p2', 't2'], ['p3', 't3'], ['p4', 't1'], ['p4', 't4'], ['p5', 't5'], ['p6', 't6'], ['p7', 't4'], ['t1', 'p2'], ['t2', 'p3'], ['t3', 'p1'], ['t3', 'p4'], ['t4', 'p5'], ['t5', 'p6'], ['t6', 'p4'], ['t6', 'p7']] });
  const ex12 = (drop, title) => D('ex12' + (drop ? '-sans-' + drop : ''), { title,
    places: [P('p1', 40, 130, 1), P('p2', 130, 40, 0, 't'), P('p3', 310, 40, 1, 't'), P('p4', 220, 130, 2)].filter(p => p.id !== drop), trans: [T('t1', 130, 130), T('t2', 220, 40, 't'), T('t3', 310, 130)],
    arcs: [['p1', 't1'], ['p4', 't1'], ['t1', 'p2'], ['p2', 't2'], ['t2', 'p3'], ['t2', 'p4'], ['p3', 't3'], ['p4', 't3'], ['t3', 'p4']].filter(a => a[0] !== drop && a[1] !== drop) });
  ex12(null, 'Exercice 1.2 (figure 1)'); ex12('p1', 'Exercice 1.2 sans la place p1'); ex12('p3', 'Exercice 1.2 sans la place p3');
  D('ex13', { title: 'Exercice 1.3 : la chaîne de production',
    places: [P('en_attente', 40, 110, 2), P('chaîne_libre', 280, 20, 1, 't'), P('meulé', 200, 110), P('fraisé', 360, 110), P('à_livrer', 520, 60, 0, 't'), P('jeté', 520, 170), P('livré', 680, 60, 0, 't')],
    trans: [T('meuler', 120, 110), T('fraiser', 280, 110), T('test_positif', 440, 60, 't'), T('test_négatif', 440, 170), T('livrer', 600, 60)],
    arcs: [['en_attente', 'meuler'], ['chaîne_libre', 'meuler'], ['meuler', 'meulé'], ['meulé', 'fraiser'], ['fraiser', 'fraisé'], ['fraisé', 'test_positif'], ['fraisé', 'test_négatif'], ['test_positif', 'à_livrer'], ['test_négatif', 'jeté'],
      ['à_livrer', 'livrer'], ['livrer', 'livré'], ['livrer', 'chaîne_libre', 1, 30], ['test_négatif', 'chaîne_libre', 1, -40]] });
  D('ex14', { title: 'Exercice 1.4 : le cabinet dentaire',
    places: [P('p_maison', 40, 30, 3), P('p_attente', 220, 30), P('en_consultation', 400, 30), P('p_fini', 580, 30), P('p_parti', 760, 30), P('d_libre', 490, -70, 1, 't'), P('d_occupé', 400, 125, 0, 'l'), P('d_docu', 580, 125, 0, 'r'),
      P('inf_libre', 400, 290, 1), P('inf_occupée', 400, 205, 0, 'l'), P('s_réception', 310, -70, 1, 't'), P('s_docu', 580, 205, 0, 'r')],
    trans: [T('entrer', 130, 30), T('commencer', 310, 30), T('documenter', 490, 30), T('terminer', 670, 30)],
    arcs: [['p_maison', 'entrer'], ['entrer', 'p_attente'], ['s_réception', 'entrer'], ['entrer', 's_réception'], ['p_attente', 'commencer'], ['d_libre', 'commencer'], ['inf_libre', 'commencer'], ['commencer', 'en_consultation'], ['commencer', 'd_occupé'], ['commencer', 'inf_occupée'],
      ['en_consultation', 'documenter'], ['d_occupé', 'documenter'], ['inf_occupée', 'documenter'], ['s_réception', 'documenter'], ['documenter', 'p_fini'], ['documenter', 'd_docu'], ['documenter', 'inf_libre'], ['documenter', 's_docu'],
      ['p_fini', 'terminer'], ['d_docu', 'terminer'], ['s_docu', 'terminer'], ['terminer', 'p_parti'], ['terminer', 'd_libre'], ['terminer', 's_réception']] });
  const frogs = [P('pont', 40, 120, 3, 'l'), P('ruisseau', 240, 120, 0, 'r'), P('bord_g', 440, 50, 0, 't'), P('bord_d', 440, 190)];
  const frogT = [T('nager_gauche', 340, 50, 't'), T('nager_droite', 340, 190), T('remonter_g', 540, 50, 'r'), T('remonter_d', 540, 190, 'r')];
  const frogA = [['ruisseau', 'nager_gauche'], ['ruisseau', 'nager_droite'], ['nager_gauche', 'bord_g'], ['nager_droite', 'bord_d'], ['bord_g', 'remonter_g'], ['bord_d', 'remonter_d'], ['remonter_g', 'pont', 1, 50], ['remonter_d', 'pont', 1, -62]];
  D('ex15', { title: 'Exercice 1.5 : grenouilles et princesse (compteur pondéré)', places: [...frogs, P('sauts', 140, 30, 0, 't')], trans: [...frogT, T('sauter', 140, 120), T('embrasser', 240, 30, 't')],
    arcs: [...frogA, ['pont', 'sauter'], ['sauter', 'ruisseau'], ['sauter', 'sauts'], ['sauts', 'embrasser', 3], ['ruisseau', 'embrasser'], ['embrasser', 'pont', 1, 40]] });
  D('ex15-strict', { title: 'Exercice 1.5 : exactement une grenouille sur trois',
    places: [P('pont', 40, 150, 3, 'l'), P('ruisseau', 300, 150, 0, 'r'), P('bord_g', 480, 90, 0, 't'), P('bord_d', 480, 210), P('c0', 100, 20, 1, 't'), P('c1', 240, 20, 0, 't'), P('c2', 170, -60, 0, 't'), P('pour_princesse', 300, 290, 0, 'r')],
    trans: [T('nager_gauche', 390, 90, 't'), T('nager_droite', 390, 210), T('remonter_g', 570, 90, 'r'), T('remonter_d', 570, 210, 'r'), T('saut_1', 170, 90, 'r'), T('saut_2', 300, 60, 'r'), T('saut_3', 100, 230, 'l'), T('embrasser', 170, 290)],
    arcs: [['ruisseau', 'nager_gauche'], ['ruisseau', 'nager_droite'], ['nager_gauche', 'bord_g'], ['nager_droite', 'bord_d'], ['bord_g', 'remonter_g'], ['bord_d', 'remonter_d'], ['remonter_g', 'pont', 1, 95], ['remonter_d', 'pont', 1, -85],
      ['pont', 'saut_1'], ['c0', 'saut_1'], ['saut_1', 'ruisseau'], ['saut_1', 'c1'], ['pont', 'saut_2', 1, -18], ['c1', 'saut_2'], ['saut_2', 'ruisseau'], ['saut_2', 'c2', 1, -30],
      ['pont', 'saut_3'], ['c2', 'saut_3', 1, 62], ['saut_3', 'pour_princesse'], ['saut_3', 'c0', 1, -8], ['pour_princesse', 'embrasser'], ['embrasser', 'pont']] });
  // 1.6 : les ferrys. Aux arrêts B et C, il faut retenir le sens (aller ou retour) : le demi-tour n'existe qu'en A et en D.
  (() => {
    const pl = [P('port_X', 0, 0, 5)], tr = [], arcs = [];
    ['A', 'B', 'C', 'D'].forEach(s => pl.push({ id: s + '_libre', tokens: 1 }));
    ['A', 'B_aller', 'C_aller', 'D', 'C_retour', 'B_retour', 'AB', 'BC', 'CD', 'DC', 'CB', 'BA'].forEach(id => pl.push({ id, tokens: 0 }));
    const t = (id, ins, outs) => { tr.push({ id }); ins.forEach(p => arcs.push([p, id])); outs.forEach(p => arcs.push([id, p])); };
    t('mise_en_service', ['port_X', 'A_libre'], ['A']); t('retrait', ['A'], ['port_X', 'A_libre']);
    t('quitter_A', ['A'], ['AB', 'A_libre']); t('arriver_B_aller', ['AB', 'B_libre'], ['B_aller']); t('quitter_B_aller', ['B_aller'], ['BC', 'B_libre']);
    t('arriver_C_aller', ['BC', 'C_libre'], ['C_aller']); t('quitter_C_aller', ['C_aller'], ['CD', 'C_libre']); t('arriver_D', ['CD', 'D_libre'], ['D']);
    t('quitter_D', ['D'], ['DC', 'D_libre']); t('arriver_C_retour', ['DC', 'C_libre'], ['C_retour']); t('quitter_C_retour', ['C_retour'], ['CB', 'C_libre']);
    t('arriver_B_retour', ['CB', 'B_libre'], ['B_retour']); t('quitter_B_retour', ['B_retour'], ['BA', 'B_libre']); t('arriver_A', ['BA', 'A_libre'], ['A']);
    pl.forEach(p => { delete p.x; delete p.y; });
    D('ex16', { title: 'Exercice 1.6 : les ferrys CityCat', places: pl, trans: tr, arcs });
  })();

  // ---------------------------------------------------------------- Exercices, séance 2
  D('ex21', { title: 'Exercice 2.1 : la production d’un vélo',
    places: [P('cadre', 40, 40, 4, 't'), P('pédales', 40, 130, 4), P('en_étape_1', 220, 85), P('semi_fini_1', 400, 85), P('roues', 400, 200, 4), P('en_étape_2', 580, 85), P('semi_fini_2', 760, 85), P('freins', 760, 200, 4),
      P('en_étape_3', 940, 85), P('vélo', 1120, 85), P('B_libre', 580, -40, 7, 't'), P('A_libre', 580, 200, 3)],
    trans: [T('début_1', 130, 85), T('fin_1', 310, 85), T('début_2', 490, 85), T('fin_2', 670, 85), T('début_3', 850, 85), T('fin_3', 1030, 85)],
    arcs: [['cadre', 'début_1'], ['pédales', 'début_1', 2], ['B_libre', 'début_1'], ['début_1', 'en_étape_1'], ['en_étape_1', 'fin_1'], ['fin_1', 'semi_fini_1'], ['fin_1', 'B_libre'],
      ['semi_fini_1', 'début_2'], ['roues', 'début_2', 2], ['A_libre', 'début_2'], ['début_2', 'en_étape_2'], ['en_étape_2', 'fin_2'], ['fin_2', 'semi_fini_2'], ['fin_2', 'A_libre'],
      ['semi_fini_2', 'début_3'], ['freins', 'début_3', 2], ['B_libre', 'début_3'], ['début_3', 'en_étape_3'], ['en_étape_3', 'fin_3'], ['fin_3', 'vélo'], ['fin_3', 'B_libre']] });
  D('ex22', { title: 'Exercice 2.2 : l’institut de langues (un seul cours dessiné)',
    places: [P('dehors', 40, 40, 3, 't'), P('inscrit', 220, 40, 0, 't'), P('a_choisi', 440, 40, 0, 't'), P('places_libres', 440, 130, 20, 'r'), P('ouvert', 330, 230, 1, 'l'), P('en_cours', 550, 230), P('terminé', 770, 230)],
    trans: [T('s_inscrire', 130, 40, 't'), T('se_désinscrire', 130, 120), T('choisir', 330, 40, 't'), T('quitter_le_cours', 550, 40, 'r'), T('démarrer', 440, 230), T('terminer', 660, 230), T('rouvrir', 550, 320)],
    arcs: [['dehors', 's_inscrire'], ['s_inscrire', 'inscrit'], ['inscrit', 'se_désinscrire'], ['se_désinscrire', 'dehors'], ['inscrit', 'choisir'], ['places_libres', 'choisir'], ['ouvert', 'choisir'], ['choisir', 'ouvert'], ['choisir', 'a_choisi'],
      ['a_choisi', 'quitter_le_cours'], ['terminé', 'quitter_le_cours'], ['quitter_le_cours', 'terminé'], ['quitter_le_cours', 'places_libres'], ['quitter_le_cours', 'inscrit', 1, 38],
      ['ouvert', 'démarrer'], ['démarrer', 'en_cours'], ['en_cours', 'terminer'], ['terminer', 'terminé'], ['terminé', 'rouvrir'], ['rouvrir', 'ouvert'], ['places_libres', 'rouvrir', 20], ['rouvrir', 'places_libres', 20]] });
  D('ex23', { title: 'Exercice 2.3 (figure 1)',
    places: [P('p1', 110, 20, 0, 't'), P('p2', 110, 160, 1), P('p3', 250, 90, 0, 't'), P('p4', 390, 20, 1, 't'), P('p5', 390, 160)], trans: [T('t1', 40, 90, 'l'), T('t2', 180, 90), T('t3', 320, 90), T('t4', 460, 90, 'r')],
    arcs: [['p2', 't1'], ['t1', 'p1'], ['p1', 't2'], ['t2', 'p2'], ['t2', 'p3'], ['p3', 't3'], ['t3', 'p4'], ['p4', 't4'], ['t4', 'p5'], ['p5', 't3']] });
  D('ex24', { title: 'Exercice 2.4 : l’algorithme de communication (figure 2)',
    places: [P('p1', 60, 210, 1, 'l'), P('p2', 130, 80, 0, 'l'), P('p3', 130, 340, 0, 'l'), P('p4', 260, 80, 0, 't'), P('p5', 260, 145), P('p6', 260, 275, 0, 't'), P('p7', 260, 340), P('p8', 460, 210, 1, 'r'), P('p9', 390, 80, 0, 'r'), P('p10', 390, 340, 0, 'r')],
    trans: [T('Finish_Left', 60, 10, 't'), T('Send_Left', 130, 145, 'l'), T('Respond_Left', 130, 275, 'l'), T('Done_Left', 60, 410), T('Done_Right', 460, 10, 't'), T('Respond_Right', 390, 145, 'r'), T('Send_Right', 390, 275, 'r'), T('Finish_Right', 460, 410)],
    arcs: [['p1', 'Send_Left'], ['Send_Left', 'p2'], ['Send_Left', 'p5'], ['p5', 'Respond_Right'], ['p8', 'Respond_Right'], ['Respond_Right', 'p9'], ['Respond_Right', 'p4'], ['p9', 'Done_Right'], ['Done_Right', 'p8', 1, -20],
      ['p2', 'Finish_Left'], ['p4', 'Finish_Left'], ['Finish_Left', 'p1', 1, 20],
      ['p8', 'Send_Right'], ['Send_Right', 'p10'], ['Send_Right', 'p6'], ['p6', 'Respond_Left'], ['p1', 'Respond_Left'], ['Respond_Left', 'p3'], ['Respond_Left', 'p7'], ['p3', 'Done_Left'], ['Done_Left', 'p1', 1, -20],
      ['p10', 'Finish_Right'], ['p7', 'Finish_Right'], ['Finish_Right', 'p8', 1, 20]] });
  D('ex25', { title: 'Exercice 2.5 : l’impression d’étiquettes (figure 3)',
    places: [P('vide', 40, 130, 3), P('libre', 280, 20, 2, 't'), P('en_impression', 280, 130), P('imprimé', 520, 130)], trans: [T('démarre', 160, 130), T('termine', 400, 130)],
    arcs: [['vide', 'démarre'], ['libre', 'démarre'], ['démarre', 'en_impression'], ['en_impression', 'termine'], ['termine', 'libre'], ['termine', 'imprimé']] });
  // Dépliage de la seule place « libre » (capacité 2) : trois places libre=0, libre=1, libre=2 dont une seule est marquée
  D('ex25-libre', { title: 'Exercice 2.5 : dépliage de la place libre',
    places: [P('vide', 40, 150, 3), P('en_impression', 280, 150), P('imprimé', 520, 150), P('libre=2', 280, 10, 1, 't'), P('libre=1', 280, 80, 0, 't'), P('libre=0', 280, 290)],
    trans: [T('démarre[2]', 150, 80, 'l'), T('démarre[1]', 150, 220, 'l'), T('termine[1]', 410, 80, 'r'), T('termine[0]', 410, 220, 'r')],
    arcs: [['vide', 'démarre[2]'], ['vide', 'démarre[1]'], ['démarre[2]', 'en_impression'], ['démarre[1]', 'en_impression'], ['en_impression', 'termine[1]'], ['en_impression', 'termine[0]'], ['termine[1]', 'imprimé'], ['termine[0]', 'imprimé'],
      ['libre=2', 'démarre[2]'], ['démarre[2]', 'libre=1'], ['libre=1', 'démarre[1]'], ['démarre[1]', 'libre=0'], ['libre=0', 'termine[0]'], ['termine[0]', 'libre=1'], ['libre=1', 'termine[1]'], ['termine[1]', 'libre=2']] });
  // Dépliage : chaque place de capacité k devient k+1 places « nom=j » (une seule marquée : elle dit combien de pions la place contenait) ;
  // chaque transition est recopiée une fois par combinaison de niveaux possibles.
  (() => {
    const cap = { vide: 3, libre: 2, en_impression: 2, imprimé: 3 }, init = { vide: 3, libre: 2, en_impression: 0, imprimé: 0 };
    const pl = [], tr = [], arcs = [];
    Object.keys(cap).forEach(p => { for (let j = 0; j <= cap[p]; j++) pl.push({ id: `${p}=${j}`, tokens: init[p] === j ? 1 : 0 }); });
    const copy = (name, dec, inc) => { // dec : places qui perdent un pion, inc : places qui en gagnent un
      const all = [...dec, ...inc];
      const rec = (i, lv) => {
        if (i === all.length) { const id = `${name}[${all.map(p => lv[p]).join('')}]`; tr.push({ id });
          dec.forEach(p => { arcs.push([`${p}=${lv[p]}`, id], [id, `${p}=${lv[p] - 1}`]); }); inc.forEach(p => { arcs.push([`${p}=${lv[p]}`, id], [id, `${p}=${lv[p] + 1}`]); }); return; }
        const p = all[i], isDec = i < dec.length;
        for (let j = isDec ? 1 : 0; j <= (isDec ? cap[p] : cap[p] - 1); j++) rec(i + 1, { ...lv, [p]: j });
      };
      rec(0, {});
    };
    copy('démarre', ['vide', 'libre'], ['en_impression']); copy('termine', ['en_impression'], ['libre', 'imprimé']);
    D('ex25-deplie', { title: 'Exercice 2.5 déplié (toutes les places de capacité 1)', places: pl, trans: tr, arcs });
  })();

  if (typeof module !== 'undefined' && module.exports) module.exports = PETRI;
})(typeof window !== 'undefined' ? window : globalThis);
