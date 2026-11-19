// Problème 5 : Des jetons qui portent une valeur : types, variables et conditions (F. Lecron, I-MANA-223, slides + synthèse théorique)
// Les résultats cités (liaisons, contenu final des places, stock final) sortent de CPN.bindings / CPN.run (verif/test_cpn.mjs).
(function () {
  const R = String.raw, u = COURSE.u, pm = COURSE.pm, { pick, rnd } = u;
  const still = (id, S) => CPN.still(id, S);
  const mcq = (q, good, lures, expl) => { const opts = [good, ...lures.filter((x, i, a) => x !== good && a.indexOf(x) === i)].slice(0, 4); return { q, opts, a: 0, expl }; };
  const PAT = ['ana', 'ben', 'cleo', 'dan', 'eva'];

  // ----- générateurs : chaque réponse vient d'une simulation du réseau tiré au hasard
  const gens = {
    // Laboratoire : quels patients finissent dans dossier_complet ?
    labo: () => {
      const tubes = []; PAT.slice(0, rnd(3, 5)).forEach(p => { const k = pick(['h', 'b', 'hb', 'hb']); if (k.includes('h')) tubes.push([p, 'hemato']); if (k.includes('b')) tubes.push([p, 'bio']); });
      const base = CPN.nets.labo, net = CPN.define('gen-labo', { ...base, title: 'Le laboratoire, autre matinée', places: base.places.map(p => ({ ...p, init: p.id === 'tubes_reçus' ? tubes : [] })), arcs: base.arcs.map(a => [a.from, a.to, a.text, { side: a.side, lo: a.lo }]) });
      const r = CPN.run(net), good = CPN.fmtPlace(net, r.S.M.dossier_complet);
      const all = '[' + [...new Set(tubes.map(t => t[0]))].join(', ') + ']', none = '[]', bios = '[' + [...new Set(tubes.filter(t => t[1] === 'bio').map(t => t[0]))].join(', ') + ']';
      return mcq(`<b>Le laboratoire, une autre matinée.</b>${still(net)}Quand plus rien n’est possible, <b>que contient dossier_complet ?</b>`, good, [all, none, bios, '[' + PAT.slice(0, 2).join(', ') + ']'],
        `<code>consulter</code> exige les deux résultats <b>du même patient</b> : (p, hemato) et (p, bio) avec la même valeur de p. Seuls les patients qui ont leurs deux tubes y arrivent : ${good}. Restent dans résultats : ${CPN.fmtPlace(net, r.S.M.résultats)}.`);
    },
    // Garde : combien de liaisons rendent vers_pédiatre tirable ?
    garde: () => {
      const n = rnd(3, 5), pts = PAT.slice(0, n).map(p => [p, pick([3, 6, 9, 12, 15, 16, 17, 25, 40, 70])]);
      const base = CPN.nets.pediatre, net = CPN.define('gen-pediatre', { ...base, title: 'Pédiatre ou généraliste : une autre salle d’attente', places: base.places.map(p => ({ ...p, init: p.id === 'attente' ? pts : [] })), arcs: base.arcs.map(a => [a.from, a.to, a.text]) });
      const b = CPN.bindings(net, CPN.init(net), 'vers_pédiatre');
      return { q: `${still(net)}<b>Combien de liaisons rendent vers_pédiatre tirable ?</b>`, a: b.length, tol: 0, unit: 'liaisons',
        expl: `La garde [a < 16] ne laisse passer que les patients de moins de 16 ans : ${b.length ? b.map(x => CPN.fmtB(net, x)).join(', ') : 'aucun'}. Attention, 16 ans va chez le généraliste (a ≥ 16).` };
    },
    // Réactifs : stock final d'un réactif
    stock: () => {
      for (let k = 0; k < 30; k++) {
        const tubes = []; PAT.slice(0, rnd(2, 5)).forEach(p => { if (Math.random() < .7) tubes.push([p, 'hemato']); if (Math.random() < .8) tubes.push([p, 'bio']); });
        const qh = rnd(0, 4), qb = rnd(0, 4), base = CPN.nets['labo-reactifs'];
        const net = CPN.define('gen-reactifs', { ...base, title: 'Les réactifs, une autre matinée', places: base.places.map(p => ({ ...p, init: p.id === 'tubes_reçus' ? tubes : p.id === 'réactifs' ? [['hemato', qh], ['bio', qb]] : [] })),
          arcs: base.arcs.map(a => [a.from, a.to, a.text, { out: a.text.includes('−') || a.text.includes('+') ? a.out : undefined, side: a.side, lo: a.lo }]) });
        const which = pick(['hemato', 'bio']), ends = new Set();
        for (let i = 0; i < 40; i++) { const r = CPN.run(net); ends.add(r.S.M.réactifs.find(x => x.v[0] === which).v[1]); }
        if (ends.size !== 1) continue;
        const v = [...ends][0], n = tubes.filter(t => t[1] === which).length, q0 = which === 'hemato' ? qh : qb;
        return { q: `${still(net)}Tous les tubes sont analysés et plus rien n’est possible. <b>Combien de doses de ${which} reste-t-il ?</b> (on recommande 5 doses dès qu’il en reste moins de 2)`, a: v, tol: 0, unit: 'doses',
          expl: `Départ ${q0} dose${q0 > 1 ? 's' : ''}, ${n} analyse${n > 1 ? 's' : ''} de ${which}. ${v - q0 + n > 0 ? `Il faut ${(v - q0 + n) / 5} commande${v - q0 + n > 5 ? 's' : ''} de 5 : ` : 'Aucune commande : '}${q0} − ${n}${v - q0 + n > 0 ? ' + ' + (v - q0 + n) : ''} = ${v}. Le résultat ne dépend pas de l’ordre des tirs (vérifié sur 40 simulations).` };
      }
      return gens.garde();
    },
  };

  COURSE.add({
    id: 'pm5', kind: 'Problème 5',
    title: 'Des jetons qui portent une valeur : types, variables et conditions',
    short: 'Pb 5 · Réseaux colorés',
    source: 'Probleme5_Slides_distribuees.pdf · Probleme5_Theorie.pdf',
    pitch: 'Avec des jetons tous identiques, on sait combien de patients attendent, pas qui. Le réseau coloré donne une valeur à chaque jeton, des variables aux arcs et des conditions aux transitions : un seul réseau suffit pour cent patients.',
    sections: [
      {
        id: 'pm5-labo', title: 'Le laboratoire reçoit des tubes', slides: '2',
        summary: 'Avec cinq jetons identiques, le modèle ne sait pas quel tube est d’hématologie ni à quel patient il appartient ; le corriger sans couleur oblige à recopier le réseau pour chaque patient.',
        fiche: R`
${pm.why(`<p>Jusqu’ici, un pion dans <code>attente</code> était « un patient », sans plus. Dès que le traitement dépend de <b>qui</b> est le patient ou de <b>ce que</b> contient le tube, des jetons identiques ne suffisent plus.</p>`)}
${pm.enonce('Chaque tube porte une étiquette : le patient et l’analyse demandée, hématologie ou biochimie. Un automate traite les tubes d’hématologie, un autre ceux de biochimie. Le médecin ne consulte le dossier d’un patient que lorsqu’il a ses deux résultats. Ce matin : deux tubes pour Ana, un tube de biochimie pour Ben, deux tubes pour Cléo. (1) Quelle suite ce modèle autorise-t-il, alors que la réalité l’interdit ? (2) Corrigez-le avec ce que vous connaissez, pour ces trois patients. Combien de places faudrait-il pour cent patients ? (3) Que faudrait-il changer dans la notation ?')}
${u.petri('labo-noir', { ask: 'twice', t: 'analyser_hémato', sec: 'pm5-labo', pion: 'un <b>tube</b>, sans étiquette : le modèle ne sait ni à qui il appartient, ni quelle analyse il demande.' })}
<h4>(1) Une suite que la réalité interdit</h4>
<p>Tirer <code>analyser_hémato</code> <b>cinq fois</b> : cinq analyses d’hématologie, alors qu’il n’y a que deux tubes d’hématologie (Ana et Cléo). Les jetons sont identiques, donc n’importe quel tube peut passer dans n’importe quel automate. Et dans <code>résultats</code>, rien ne dit à quel patient appartient un résultat : le médecin ne peut pas savoir si un patient a « ses deux » résultats.</p>
<h4>(2) La correction avec ce que l’on connaît</h4>
<p>Il faut une place par (patient, analyse) : un tube d’hématologie d’Ana, un tube de biochimie d’Ana, leurs résultats, le dossier d’Ana. Autrement dit, <b>une copie du réseau par patient</b>.</p>
${u.petri('labo-ana', { sec: 'pm5-labo', noAxes: true })}
<p>Avec ce découpage : 5 places et 3 transitions par patient, soit <b>500 places et 300 transitions pour cent patients</b> (calcul de l’app : la slide pose la question sans donner le nombre). Et chaque nouveau patient oblige à redessiner.</p>
<h4>(3) Ce qu’il faut changer dans la notation</h4>
<p>Donner une <b>valeur</b> à chaque jeton : le tube devient le jeton (ana, hemato). C’est le <b>réseau coloré</b> des notions suivantes.</p>
${pm.traps(['Croire que le modèle à cinq jetons « sait » qu’il y a deux tubes d’hématologie : il ne voit que le nombre 5.', 'Corriger avec deux places tubes_hémato et tubes_bio : le type d’analyse est réglé, mais pas le patient (le médecin pourrait réunir le résultat d’Ana et celui de Ben).', 'Penser que recopier le réseau est une bonne solution : c’est correct, mais cela ne passe pas à l’échelle.'])}
${pm.recap(['Jetons identiques : on sait combien, pas qui ni quoi.', 'Sans couleur, il faut une copie du réseau par patient (500 places pour cent).', 'La solution : un jeton qui porte une valeur.'])}`,
      },
      {
        id: 'pm5-valeur', title: 'Un jeton qui porte une valeur ; chaque place a un type', slides: 'synthèse 2-3',
        summary: 'Dans un réseau coloré, chaque jeton porte une valeur du type de sa place ; le marquage d’une place est un multiensemble de valeurs, où une même valeur peut figurer plusieurs fois.',
        fiche: R`
${pm.why(`<p>Trois patients attendent devant un cabinet. Sans couleur, <code>m(attente) = 3</code> : on sait combien de patients attendent, pas qui. Avec couleur, <code>m(attente) = [ana, ben, cleo]</code> : on sait qui attend.</p>`)}
<div class="def"><b>Marquage d’un réseau coloré</b> : chaque place contient un <b>multiensemble</b> de valeurs, c’est-à-dire une liste où l’ordre ne compte pas et où une même valeur peut figurer plusieurs fois. Si Cléo a deux consultations ce matin, la place des rendez-vous contient <code>[ana, ben, 2.cleo]</code> : quatre jetons, dont deux portent la valeur cleo.</div>
<div class="def"><b>Type d’une place</b> (sa « couleur ») : l’ensemble des valeurs que peuvent porter ses jetons. Il se déclare dans l’outil avec <code>colset</code>.</div>
${pm.table(['Construction', 'Déclaration dans l’outil', 'Valeurs'], [['string', '<code>colset PATIENT = string;</code>', '"ana", "ben", …'], ['int', '<code>colset QUANTITE = int;</code>', '0, 1, 2, …'], ['unit', '<code>colset UNIT = unit;</code>', '(), sans valeur'], ['enumerated', '<code>colset ANALYSE = with hemato | bio;</code>', 'hemato, bio'], ['product', '<code>colset TUBE = product PATIENT * ANALYSE;</code>', '("ana", hemato)']])}
<p>Un <b>product</b> regroupe plusieurs informations dans un même jeton : le tube (patient, analyse). Les jetons des problèmes 1 à 4 étaient de type <b>unit</b> : une seule valeur possible, d’où « des pions identiques ».</p>
${u.cpn('labo', { sec: 'pm5-valeur', q: { text: 'Regarde le tableau sous le dessin. Combien de jetons de tubes_reçus portent le patient ana ?', opts: ['2', '1', '5', '0'], a: 0, expl: 'Deux tubes d’Ana : (ana, hemato) et (ana, bio). Le rond affiche 5 (le nombre de jetons) ; le tableau donne leurs valeurs.' } })}
${pm.traps(['Écrire <code>m(attente) = 3</code> pour un réseau coloré : le marquage est la liste des valeurs, pas un nombre.', 'Croire que deux jetons ne peuvent pas porter la même valeur : un multiensemble l’autorise (2.cleo).', 'Oublier que tous les jetons d’une place ont le même type.'])}
${pm.recap(['Jeton coloré = jeton qui porte une valeur.', 'Marquage d’une place = multiensemble de valeurs de son type.', 'Types : string, int, unit, énumération, product.'])}`,
      },
      {
        id: 'pm5-arcs', title: 'Les arcs portent des expressions : variables et liaison', slides: 'synthèse 4',
        summary: 'Une inscription d’arc utilise des variables ; choisir une valeur pour chaque variable, c’est choisir une liaison, et une même variable prend la même valeur sur tous les arcs de la transition.',
        fiche: R`
${pm.why(`<p>Au cabinet, le médecin appelle un patient et prend <b>son</b> dossier, pas celui d’un autre. Il faut pouvoir dire sur les arcs « le même patient ».</p>`)}
${pm.enonce('Le médecin appelle un patient et prend son dossier ; un compteur note le nombre de patients vus. m(attente) = m(dossiers) = [ana, ben, cleo], m(patients_vus) = [0].')}
${u.cpn('cabinet', { sec: 'pm5-arcs', q: { text: 'Au départ, combien de liaisons différentes rendent appeler tirable ?', opts: ['3 : une par patient, avec n = 0', '9 : trois patients × trois dossiers', '1 : on appelle le premier arrivé', '6'], a: 0, expl: 'La variable p apparaît sur l’arc venant d’attente et sur celui venant de dossiers : elle prend la même valeur sur les deux. Les liaisons sont ⟨p = ana, n = 0⟩, ⟨p = ben, n = 0⟩, ⟨p = cleo, n = 0⟩.' } })}
<div class="def"><b>Variable</b> (ici p et n) : elle prend une valeur de son type. <b>Liaison</b> : le choix d’une valeur pour chaque variable de la transition, noté ⟨p = ben, n = 0⟩.</div>
<div class="thm"><b>Trois règles à retenir</b><ol><li>Une même variable prend la <b>même valeur sur tous les arcs</b> de la transition : le médecin prend le dossier <i>du patient appelé</i>.</li><li>Sur un arc d’entrée, l’inscription dit <b>quels jetons</b> sont pris.</li><li>Sur un arc de sortie, l’expression peut <b>calculer</b> une valeur : <code>n + 1</code> remet 1 dans patients_vus.</li></ol></div>
${pm.ex(`<p>Avec la liaison ⟨p = ben, n = 0⟩ : le tir retire ben de attente, ben de dossiers et 0 de patients_vus ; il ajoute ben dans en_consultation et 1 dans patients_vus. Clique « Jusqu’au bout » : patients_vus finit à [3].</p>`)}
${pm.traps(['Croire que p sur deux arcs désigne deux patients différents : c’est la même valeur.', 'Lire n + 1 comme « ajouter un jeton » : c’est un seul jeton dont la valeur augmente de 1.', 'Oublier l’arc qui rend le compteur : sans lui, patients_vus serait vidé au premier tir.'])}
${pm.recap(['Inscription = expression avec des variables.', 'Liaison = une valeur par variable, la même sur tous les arcs de la transition.', 'Un arc de sortie peut calculer une nouvelle valeur.'])}`,
      },
      {
        id: 'pm5-garde', title: 'Une transition peut porter une condition : la garde', slides: 'synthèse 5',
        summary: 'Une garde est une condition sur les variables, notée entre crochets ; une transition est tirable s’il existe une liaison qui rend la garde vraie et pour laquelle chaque place d’entrée contient les jetons demandés.',
        fiche: R`
${pm.why(`<p>Aiguiller selon une donnée (l’âge, le type d’analyse, une couleur de tri) demandait une place par cas. Avec la couleur, une <b>condition</b> sur la valeur du jeton suffit.</p>`)}
${pm.enonce('Chaque patient arrive avec son âge ; les moins de 16 ans vont chez le pédiatre. m(attente) = [(ana, 34), (ben, 8), (cleo, 52)].')}
${u.cpn('pediatre', { sec: 'pm5-garde', q: { text: 'Quelles liaisons rendent vers_pédiatre tirable ?', opts: ['⟨p = ben, a = 8⟩ seulement', 'les trois patients', '⟨p = ana, a = 34⟩ et ⟨p = cleo, a = 52⟩', 'aucune'], a: 0, expl: 'La garde [a < 16] n’est vraie que pour Ben (8 ans). Ana et Cléo passent par vers_généraliste, dont la garde est [a ≥ 16].' } })}
<div class="thm"><b>Garde et règle de tir</b> : une <b>garde</b> est une condition sur les variables, notée entre crochets. Une transition est <b>activable</b> s’il existe une liaison pour laquelle la garde est vraie <b>et</b> chaque place d’entrée contient les jetons demandés. Le tir retire ces jetons et ajoute ceux des arcs de sortie.</div>
<p>Les deux gardes [a &lt; 16] et [a ≥ 16] couvrent tous les âges sans se chevaucher : chaque patient a exactement une destination. C’est le XOR-split du guide de routage, mais décidé par la <b>donnée</b> au lieu d’être laissé au hasard.</p>
${pm.traps(['Écrire [a < 16] et [a > 16] : un patient de 16 ans resterait bloqué en attente.', 'Croire que la garde agit sur les jetons : elle ne fait que filtrer les liaisons.', 'Oublier qu’une transition gardée peut avoir plusieurs liaisons tirables à la fois.'])}
${pm.recap(['Garde = condition entre crochets sur les variables.', 'Tirable : une liaison qui rend la garde vraie et trouve ses jetons.', 'Des gardes complémentaires = un aiguillage selon la donnée.'])}`,
      },
      {
        id: 'pm5-labo-couleur', title: 'Le laboratoire coloré : prédire, puis vérifier', slides: '3 · synthèse 7-8',
        summary: 'Chaque tube porte (patient, analyse) ; les gardes envoient chaque tube au bon automate, et consulter exige (p, hemato) et (p, bio) du même patient : à la fin, Ana et Cléo ont leur dossier, (ben, bio) reste dans résultats.',
        fiche: R`
${pm.why(`<p>Le même laboratoire qu’au départ, en une seule copie, pour autant de patients qu’on veut : seul le marquage change.</p>`)}
${pm.enonce('Types : PATIENT = {ana, ben, cleo}, ANALYSE = {hemato, bio}. tubes_reçus et résultats contiennent des couples (patient, analyse), dossier_complet des patients. m(tubes_reçus) = [(ana, hemato), (ana, bio), (ben, bio), (cleo, hemato), (cleo, bio)]. (1) Pour quelles valeurs de p et de a peut-on tirer analyser_bio ? (2) Quand plus rien n’est possible, que contient dossier_complet ? Et résultats ?')}
${u.cpn('labo', { sec: 'pm5-labo-couleur', q: { text: 'Quand plus rien n’est possible, que contient dossier_complet ?', opts: ['[ana, cleo]', '[ana, ben, cleo]', '[ana]', '[] : le médecin ne consulte personne'], a: 0, expl: 'Ana et Cléo ont leurs deux résultats. Ben n’a qu’un tube de biochimie : (ben, bio) reste dans résultats, faute de résultat d’hématologie.' } })}
<h4>(1) Les liaisons d’analyser_bio</h4>
<p>p et a doivent prendre les valeurs d’un jeton de tubes_reçus, et la garde [a = bio] doit être vraie : ⟨p = ana, a = bio⟩, ⟨p = ben, a = bio⟩, ⟨p = cleo, a = bio⟩.</p>
${pm.ex(`<p><b>Un tir pas à pas.</b> On choisit la liaison ⟨p = ben, a = bio⟩. L’arc d’entrée retire (ben, bio) de tubes_reçus ; l’arc de sortie ajoute (ben, bio) dans résultats.</p>
${pm.table(['Place', 'Avant', 'Après'], [['tubes_reçus', '[(ana, hemato), (ana, bio), (ben, bio), (cleo, hemato), (cleo, bio)]', '[(ana, hemato), (ana, bio), (cleo, hemato), (cleo, bio)]'], ['résultats', '[ ]', '[(ben, bio)]']])}`, 'Exemple travaillé')}
<h4>(2) La fin</h4>
<p>L’arc vers <code>consulter</code> porte <b>deux</b> jetons, (p, hemato) et (p, bio), avec la <b>même</b> variable p : le médecin ne consulte que le dossier d’un patient qui a ses deux résultats. Fin : <b>[ana, cleo]</b> dans dossier_complet, <b>(ben, bio)</b> reste dans résultats. Fais « Jusqu’au bout » plusieurs fois : l’ordre des tirs change, la fin jamais.</p>
${pm.traps(['Oublier la garde [a = hemato] : l’automate d’hématologie pourrait traiter un tube de biochimie.', 'Croire que Ben bloque le laboratoire : les autres patients avancent, (ben, bio) attend simplement.', 'Lire (p, hemato), (p, bio) comme un seul jeton : ce sont deux jetons pris en même temps.'])}
${pm.recap(['Un seul réseau, le marquage décrit les patients.', 'La même variable sur deux jetons d’un arc = « du même patient ».', 'Fin : [ana, cleo] et (ben, bio) reste dans résultats.'])}`,
      },
      {
        id: 'pm5-variable', title: 'La même variable sur deux arcs : ce qu’on perd en la changeant', slides: '4',
        summary: 'Si l’arc vers consulter porte (p, hemato), (q, bio), le médecin peut réunir le résultat d’hématologie d’un patient et celui de biochimie d’un autre : c’est la variable commune qui garantissait « du même patient ».',
        fiche: R`
${pm.why(`<p>Une inscription se lit vite et se modifie vite. Changer une lettre change le modèle : il faut savoir lire ce que la variable garantissait.</p>`)}
${pm.enonce('Un collègue remplace l’inscription de l’arc vers consulter par (p, hemato), (q, bio). Que permet ce modèle que le précédent interdisait ?')}
${u.cpn('labo-pq', { sec: 'pm5-variable', q: { text: 'Que permet ce modèle que le précédent interdisait ?', opts: ['Consulter le dossier d’un patient avec le résultat de biochimie d’un autre', 'Consulter un dossier sans aucun résultat', 'Analyser deux fois le même tube', 'Rien : c’est le même modèle'], a: 0, expl: 'p et q sont deux variables : elles peuvent prendre deux valeurs différentes. ⟨p = ana, q = ben⟩ réunit l’hématologie d’Ana et la biochimie de Ben.' } })}
<p>Avec deux variables <b>p</b> et <b>q</b>, rien n’oblige p = q. La liaison ⟨p = ana, q = ben⟩ est permise : le dossier d’Ana est « complet » avec le résultat de biochimie de Ben. À la fin, il peut donc rester (ana, bio) ou (cleo, bio) dans résultats au lieu de (ben, bio). Fais « Jusqu’au bout » plusieurs fois et regarde résultats.</p>
${pm.ex(`<p>Ben n’entre jamais dans dossier_complet : l’arc de sortie produit p, et p vient d’un tube d’<b>hématologie</b>, que Ben n’a pas. Mais son résultat de biochimie peut servir à quelqu’un d’autre, ce qui est pire : l’erreur est invisible dans dossier_complet.</p>`, 'Ce que montre le simulateur')}
${pm.traps(['Croire que deux lettres différentes désignent forcément deux patients différents : p et q <b>peuvent</b> être différents, ils peuvent aussi être égaux.', 'Chercher l’erreur dans dossier_complet : elle se voit dans les liaisons tirées.', 'Corriger en ajoutant une garde [p = q] : correct, mais revenir à une seule variable est plus simple.'])}
${pm.recap(['Même variable = même valeur, c’est une contrainte.', 'Deux variables = valeurs libres, la contrainte disparaît.', 'Une lettre changée peut mélanger les patients.'])}`,
      },
      {
        id: 'pm5-quantite', title: 'Une valeur qui compte : le stock et les réactifs', slides: '5-6 · synthèse 6, 9',
        summary: 'Un seul jeton peut porter une quantité (le stock) ; une garde teste cette quantité et l’arc de sortie la met à jour. Pour les réactifs : un jeton par réactif ; fin [(hemato, 4), (bio, 5)] quel que soit l’ordre des tirs.',
        fiche: R`
${pm.why(`<p>Avec des pions identiques, un réseau ne peut pas tester qu’une place contient <b>peu</b> de jetons : « s’il en reste moins de 2 » est impossible à écrire. Une valeur qui porte la quantité le permet.</p>`)}
${pm.enonce('L’armoire du cabinet contient 3 boîtes de pansements. Chaque soin en utilise une ; dès qu’il en reste moins de 2, on en commande 10.')}
${u.cpn('armoire', { sec: 'pm5-quantite', steps: 8, q: { text: 'L’armoire contient [3]. Peut-on tirer commander tout de suite ?', opts: ['Non : la garde [q < 2] est fausse pour q = 3', 'Oui, commander est toujours possible', 'Oui, puisque l’armoire contient un jeton', 'Non : il faut d’abord trois soins'], a: 0, expl: 'Il faut q < 2 : après deux soins (3 → 2 → 1), commander devient tirable et donne 11.' } })}
<p>Un seul jeton, qui porte le stock : <code>m(armoire) = [3]</code>, de type int. L’arc de sortie rend le jeton avec la valeur mise à jour : 3 → 2 → 1 → 11.</p>
<h4>Les réactifs du laboratoire</h4>
${pm.enonce('Chaque analyse consomme une dose du réactif de son type. Stock initial : une dose pour l’hématologie, trois pour la biochimie. Dès qu’il reste moins de deux doses, on en recommande cinq. (1) Faut-il un jeton par dose, ou un jeton par réactif ? (2) Ajoutez les réactifs au modèle. (3) Tous les tubes sont analysés : que contient réactifs ? Cela dépend-il de l’ordre des tirs ?')}
${u.cpn('labo-reactifs', { sec: 'pm5-quantite', noAxes: true, q: { text: 'Tous les tubes sont analysés et plus rien n’est possible. Que contient réactifs ?', opts: ['[(hemato, 4), (bio, 5)], quel que soit l’ordre', '[(hemato, 0), (bio, 0)]', 'Cela dépend de l’ordre des tirs', '[(hemato, 6), (bio, 8)]'], a: 0, expl: 'Hématologie : 1 dose, 2 analyses, une commande de 5 : 1 − 2 + 5 = 4. Biochimie : 3 doses, 3 analyses, une commande : 3 − 3 + 5 = 5. Que la commande passe avant ou après la dernière analyse, le total est le même.' } })}
<p><b>(1) Un jeton par réactif</b>, qui porte le stock : <code>m(réactifs) = [(hemato, 1), (bio, 3)]</code>. Avec un jeton par dose, on ne pourrait pas tester « moins de deux ». <b>(2)</b> La variable <b>a</b> est commune au tube et au réactif : analyser_hémato prend une dose du réactif <i>de son type</i>. <b>(3)</b> Fin : <b>[(hemato, 4), (bio, 5)]</b>, une commande par réactif, quel que soit l’ordre des tirs (clique « Jusqu’au bout » plusieurs fois).</p>
${pm.traps(['Un jeton par dose : la garde « moins de deux » devient impossible à écrire.', 'Oublier l’arc qui rend le jeton du stock : le réactif disparaîtrait après une analyse.', 'Croire que la garde [q < 2] force la commande : elle la permet ; c’est « plus rien n’est possible » qui garantit qu’elle a eu lieu.'])}
${pm.recap(['Une quantité = un seul jeton qui porte un nombre.', 'Garde pour tester, arc de sortie pour mettre à jour.', 'Réactifs : fin [(hemato, 4), (bio, 5)], indépendante de l’ordre.'])}`,
      },
      {
        id: 'pm5-compact', title: 'La couleur rend le modèle compact', slides: 'synthèse 10',
        summary: 'Un réseau coloré se déplie en réseau sans couleur, avec une place par couple (place, valeur) : même comportement, mais beaucoup plus court à écrire ; passer de 3 à 100 patients ne change que le marquage.',
        fiche: R`
${pm.why(`<p>La couleur n’ajoute pas de pouvoir de modélisation : tout ce qu’on fait en couleur, on peut le faire sans, en recopiant. Elle sert à écrire <b>moins</b>, et à ne pas redessiner quand les données changent.</p>`)}
${pm.table(['', 'Sans couleur', 'Avec couleur'], [['Distinguer les objets', 'une copie du réseau par objet', 'un jeton par objet, une valeur par jeton'], ['Passer de 3 à 100 patients', 'dessiner 97 copies', 'changer le marquage'], ['Associer deux jetons', 'des places dédiées', 'une même variable'], ['Décider selon une donnée', 'une place par cas', 'une garde']])}
<div class="def"><b>Dépliage</b> : un réseau coloré se « déplie » en réseau sans couleur, avec une place par couple (place, valeur). Le comportement est le même ; le réseau coloré est seulement beaucoup plus court à écrire.</div>
<p>La copie pour Ana, ci-dessous, est exactement ce que donne le dépliage du laboratoire coloré pour la valeur ana. C’est la même idée que le dépliage de l’exercice 2.5, appliqué aux valeurs au lieu des nombres de jetons.</p>
${u.petri('labo-ana', { sec: 'pm5-compact', pion: 'un jeton sans valeur : sa <b>place</b> dit à qui il appartient (tube_hémato_ana, rés_bio_ana…).' })}
${pm.traps(['Croire qu’un réseau coloré modélise des choses impossibles sans couleur : il se déplie toujours.', 'Croire que la couleur change le comportement : seul le dessin raccourcit.', 'Oublier qu’on peut analyser le réseau déplié avec les outils du problème 4.'])}
${pm.recap(['Couleur = notation compacte, pas plus puissante.', 'Dépliage : une place par couple (place, valeur).', '3 ou 100 patients : même réseau, autre marquage.'])}`,
      },
      {
        id: 'pm5-ambulances', title: 'À vous : les ambulances, une dernière fois', slides: '8',
        summary: 'Au problème 3, savoir quelle ambulance est sortie exigeait un cycle par ambulance ; avec la couleur, un seul cycle et un jeton par ambulance qui porte son identité.',
        fiche: R`
${pm.enonce('Au problème 3, savoir quelle ambulance est sortie exigeait un cycle par ambulance. Modélisez les deux ambulances avec un seul cycle, en gardant leur identité.')}
${pm.todo('<p>Reprends le modèle 2 du problème 3 (une boucle, deux pions). Que faut-il ajouter pour savoir laquelle est partie ?</p>')}
${pm.sol('Une proposition, à jouer', R`<p class="muted small">Proposition de l’app (la slide n’a pas de corrigé).</p>
${u.cpn('ambulances-c', { sec: 'pm5-ambulances', steps: 10, q: { text: 'Combien de situations différentes ce réseau peut-il atteindre ?', opts: ['4 : chaque ambulance à la base ou en mission', '3 : 0, 1 ou 2 ambulances en mission', '2', 'une infinité'], a: 0, expl: 'Les jetons ont une identité : « amb_1 en mission » et « amb_2 en mission » sont deux situations différentes. 2 × 2 = 4, comme le modèle 1 du problème 3 (une boucle par ambulance), alors que le modèle 2 anonyme n’en avait que 3.' } })}
<p>Le type <code>AMBULANCE = with amb_1 | amb_2</code> ; une seule variable <b>a</b> sur les quatre arcs : l’ambulance qui rentre est celle qui était en mission. Pour 12 ambulances : même réseau, 12 jetons.</p>`)}
${pm.traps(['Garder deux cycles « pour être sûr » : c’est justement ce que la couleur évite.', 'Utiliser deux variables différentes sur les arcs de partir : l’ambulance qui part ne serait plus celle qui était à la base.', 'Croire que la couleur réduit le nombre de situations : elle les distingue (4 au lieu de 3).'])}
${pm.recap(['Identité = valeur du jeton.', 'Un seul cycle, une variable commune aux arcs.', 'Ajouter des ambulances = ajouter des jetons.'])}`,
      },
      {
        id: 'pm5-tri', title: 'À vous : le tri aux urgences', slides: '9',
        summary: 'Chaque patient porte (nom, couleur) ; deux gardes complémentaires envoient les rouges en déchocage (une seule place, une ressource) et les autres en salle d’attente.',
        fiche: R`
${pm.enonce('À l’accueil des urgences, l’infirmière d’orientation attribue une couleur à chaque patient : rouge, orange ou vert. Les patients rouges vont en salle de déchocage, qui n’a qu’une place ; les autres vont en salle d’attente. Ce matin : Ana (vert), Ben (rouge), Cléo (orange).')}
${pm.todo('<p>Trois ingrédients : le type du jeton patient, les gardes de l’aiguillage, la capacité de la salle de déchocage (problème 3 : une place ressource).</p>')}
${pm.sol('Une proposition, à jouer', R`<p class="muted small">Proposition de l’app (la slide n’a pas de corrigé).</p>
${u.cpn('tri', { sec: 'pm5-tri', q: { text: 'Où finissent Ana, Ben et Cléo ?', opts: ['Ben en déchocage (puis stabilisé), Ana et Cléo en salle d’attente', 'Les trois en salle d’attente', 'Ben et Cléo en déchocage, Ana en salle d’attente', 'Ben en salle d’attente, faute de place'], a: 0, expl: 'Seul Ben est rouge : la garde [c = rouge] ne laisse passer que lui, et la salle est libre. Ana (vert) et Cléo (orange) passent par [c ≠ rouge].' } })}
<ul><li><b>Type</b> : <code>colset COULEUR = with rouge | orange | vert; colset PATIENT = product NOM * COULEUR;</code></li>
<li><b>Aiguillage</b> : vers_déchocage [c = rouge] et vers_salle_attente [c ≠ rouge], deux gardes complémentaires.</li>
<li><b>Une seule place</b> : <code>déchocage_libre</code>, un jeton (), pris à l’entrée, rendu par <code>stabiliser</code>. Un deuxième patient rouge attendrait à l’accueil.</li></ul>`)}
${pm.traps(['Trois transitions pour trois couleurs : orange et vert ont la même destination, une garde [c ≠ rouge] suffit.', 'Oublier la capacité d’une place : deux rouges entreraient en même temps.', 'Mettre la couleur dans le nom de la place (attente_rouge…) : c’est revenir au réseau sans couleur.'])}
${pm.recap(['Donnée qui décide = valeur du jeton + garde.', 'Capacité = place ressource, comme au problème 3.', 'Un réseau, quel que soit le nombre de patients.'])}`,
      },
    ],
    cards: [
      ...pm.cards('pm5-labo', [
        ['why', 'Pourquoi le modèle du laboratoire à cinq jetons identiques est-il faux ?', 'Il ne sait ni quel tube demande quelle analyse, ni à quel patient il appartient : <code>analyser_hémato</code> peut être tirée cinq fois, et le médecin ne peut pas réunir « les deux résultats » d’un même patient.'],
        ['decide', 'Comment corriger le laboratoire sans couleur ?', 'Une copie du réseau par patient (une place par patient et par analyse) : 5 places et 3 transitions par patient, 500 places pour cent patients.'],
        ['trap', 'Deux places tubes_hémato et tubes_bio suffisent-elles ?', 'Non : le type d’analyse est réglé, mais pas le patient. Le médecin pourrait réunir le résultat d’Ana et celui de Ben.'],
        ['link', 'Que faut-il changer dans la notation ?', 'Donner une valeur à chaque jeton : (ana, hemato). C’est le réseau coloré.'],
      ]),
      ...pm.cards('pm5-valeur', [
        ['def', 'Qu’est-ce que le marquage d’une place dans un réseau coloré ?', 'Un multiensemble de valeurs de son type : une liste sans ordre où une valeur peut figurer plusieurs fois, par exemple [ana, ben, 2.cleo].'],
        ['def', 'Qu’est-ce que le type (la couleur) d’une place ?', 'L’ensemble des valeurs que peuvent porter ses jetons, déclaré avec <code>colset</code> (string, int, unit, énumération, product).'],
        ['why', 'Pourquoi les jetons des problèmes 1 à 4 étaient-ils identiques ?', 'Ils étaient de type unit : une seule valeur possible, ().'],
        ['trap', 'Peut-on écrire m(attente) = 3 dans un réseau coloré ?', 'Non : le marquage est la liste des valeurs, [ana, ben, cleo]. Le 3 est seulement le nombre de jetons.'],
      ]),
      ...pm.cards('pm5-arcs', [
        ['def', 'Qu’est-ce qu’une liaison ?', 'Le choix d’une valeur pour chaque variable de la transition, noté ⟨p = ben, n = 0⟩.'],
        ['why', 'Pourquoi la même variable p sur les arcs venant d’attente et de dossiers ?', 'Une variable prend la même valeur sur tous les arcs de la transition : le médecin prend le dossier du patient qu’il appelle.'],
        ['read', 'Que fait l’inscription n + 1 sur l’arc vers patients_vus ?', 'Elle remet un seul jeton, dont la valeur est l’ancienne plus 1 : 0 devient 1.'],
        ['trap', 'Le cabinet : combien de liaisons pour appeler au départ, 3 ou 9 ?', '3. p est commun aux deux arcs : (ana, dossier d’ana), (ben, dossier de ben), (cleo, dossier de cleo).'],
      ]),
      ...pm.cards('pm5-garde', [
        ['def', 'Qu’est-ce qu’une garde ?', 'Une condition sur les variables, notée entre crochets, qui doit être vraie pour que la liaison soit tirable.'],
        ['def', 'Quand une transition colorée est-elle activable ?', 'S’il existe une liaison pour laquelle la garde est vraie et chaque place d’entrée contient les jetons demandés.'],
        ['decide', 'Comment aiguiller selon l’âge sans une place par cas ?', 'Deux transitions avec des gardes complémentaires : [a < 16] et [a ≥ 16].'],
        ['why', 'Pourquoi une garde plutôt qu’un XOR-split ordinaire ?', 'Le XOR-split laisse le choix au hasard ; la garde fait décider la donnée du jeton (l’âge), comme dans la réalité.'],
        ['trap', 'Gardes [a < 16] et [a > 16] : quel problème ?', 'Un patient de 16 ans n’a aucune destination : il reste bloqué.'],
      ]),
      ...pm.cards('pm5-labo-couleur', [
        ['read', 'Laboratoire coloré : liaisons d’analyser_bio au départ ?', '⟨p = ana, a = bio⟩, ⟨p = ben, a = bio⟩, ⟨p = cleo, a = bio⟩.'],
        ['read', 'Laboratoire coloré : que contiennent dossier_complet et résultats à la fin ?', 'dossier_complet = [ana, cleo] ; résultats = [(ben, bio)], faute de résultat d’hématologie pour Ben.'],
        ['why', 'Pourquoi consulter porte-t-il (p, hemato), (p, bio) ?', 'Deux jetons du même patient : la variable p commune garantit que le médecin a les deux résultats de ce patient.'],
        ['trap', 'La fin dépend-elle de l’ordre des tirs ?', 'Non : quel que soit l’ordre, Ana et Cléo finissent dans dossier_complet et (ben, bio) reste dans résultats.'],
      ]),
      ...pm.cards('pm5-variable', [
        ['read', 'Inscription (p, hemato), (q, bio) vers consulter : que devient permis ?', 'Réunir l’hématologie d’un patient et la biochimie d’un autre, par exemple ⟨p = ana, q = ben⟩.'],
        ['why', 'Pourquoi deux variables suppriment-elles la garantie ?', 'Deux variables peuvent prendre deux valeurs différentes : rien n’oblige p = q.'],
        ['trap', 'Avec (p, hemato), (q, bio), Ben peut-il finir dans dossier_complet ?', 'Non : la sortie produit p, qui vient d’un tube d’hématologie, que Ben n’a pas. Mais son résultat de biochimie peut servir au dossier d’un autre.'],
        ['decide', 'Comment corriger le modèle du collègue ?', 'Revenir à une seule variable : (p, hemato), (p, bio). (Une garde [p = q] marcherait aussi.)'],
      ]),
      ...pm.cards('pm5-quantite', [
        ['why', 'Pourquoi un réseau sans couleur ne peut-il pas dire « dès qu’il en reste moins de 2 » ?', 'Une transition ne peut exiger qu’un minimum de jetons, pas un maximum : tester que la place contient peu de jetons est impossible.'],
        ['decide', 'Un jeton par dose ou un jeton par réactif ?', 'Un jeton par réactif, qui porte le stock (a, q) : la garde [q < 2] peut alors décider de recommander.'],
        ['read', 'Armoire à [3] : quelle suite donne 11 ?', 'Deux soins (3 → 2 → 1), puis commander (garde [q < 2] vraie) : 1 + 10 = 11.'],
        ['read', 'Réactifs : stock final et dépendance à l’ordre ?', '[(hemato, 4), (bio, 5)], une commande par réactif, quel que soit l’ordre des tirs.'],
        ['trap', 'La garde [q < 2] oblige-t-elle à commander ?', 'Non, elle le permet. C’est « plus rien n’est possible » à la fin qui garantit que la commande a eu lieu.'],
      ]),
      ...pm.cards('pm5-compact', [
        ['def', 'Qu’est-ce que déplier un réseau coloré ?', 'Le transformer en réseau sans couleur avec une place par couple (place, valeur) : même comportement.'],
        ['why', 'Pourquoi la couleur est-elle utile si elle ne permet rien de plus ?', 'Elle rend le modèle beaucoup plus court, et passer de 3 à 100 patients ne change que le marquage.'],
        ['link', 'Sans couleur / avec couleur : comment associer deux jetons ?', 'Sans couleur : des places dédiées. Avec couleur : une même variable.'],
        ['trap', 'Un réseau coloré peut-il modéliser quelque chose d’impossible sans couleur ?', 'Non : il se déplie toujours en réseau sans couleur.'],
      ]),
      ...pm.cards('pm5-ambulances', [
        ['decide', 'Comment garder l’identité des ambulances avec un seul cycle ?', 'Un jeton par ambulance, qui porte son nom, et une même variable a sur les arcs du cycle.'],
        ['why', 'Pourquoi le réseau coloré a-t-il 4 situations et le modèle 2 anonyme 3 ?', 'Avec l’identité, « amb_1 en mission » et « amb_2 en mission » sont deux situations différentes.'],
        ['trap', 'Faut-il deux variables pour deux ambulances ?', 'Non : une variable prend la valeur de l’ambulance qui part ; deux variables casseraient le lien entre les arcs.'],
        ['link', 'Que devient le modèle pour 12 ambulances ?', 'Le même réseau, avec 12 jetons dans à_la_base.'],
      ]),
      ...pm.cards('pm5-tri', [
        ['decide', 'Comment aiguiller les patients selon leur couleur de tri ?', 'Le jeton porte (nom, couleur) ; vers_déchocage [c = rouge] et vers_salle_attente [c ≠ rouge].'],
        ['decide', 'Comment dire que le déchocage n’a qu’une place ?', 'Une place ressource déchocage_libre avec un jeton (), prise à l’entrée et rendue à la sortie.'],
        ['why', 'Pourquoi une seule garde [c ≠ rouge] pour orange et vert ?', 'Les deux vont au même endroit : une transition suffit.'],
        ['trap', 'Créer des places attente_rouge, attente_orange… est-ce correct ?', 'Correct, mais c’est revenir au réseau sans couleur : la couleur doit rester dans le jeton.'],
      ]),
    ],
    quiz: [
      ...pm.quiz('pm5-labo', [
        [`${pm.fig('labo-noir')}Dans ce modèle, combien de fois peut-on tirer analyser_hémato d’affilée ?`, ['5', '2', '1', '0'], 0, 'Les cinq jetons sont identiques : rien n’empêche d’envoyer les cinq tubes à l’automate d’hématologie, alors qu’il n’y a que deux tubes d’hématologie.'],
        ['Sans couleur, avec une copie du réseau par patient (5 places par patient), combien de places pour cent patients ?', ['500', '5', '100', '105'], 0, '5 places × 100 patients. Et il faut redessiner à chaque nouveau patient.'],
      ]),
      ...pm.quiz('pm5-valeur', [
        ['Cléo a deux consultations ce matin, Ana et Ben une. Le marquage de la place des rendez-vous s’écrit :', ['[ana, ben, 2.cleo]', '4', '[ana, ben, cleo]', '[1, 1, 2]'], 0, 'Quatre jetons, dont deux portent la valeur cleo.'],
        ['Quel type déclare un tube (patient, analyse) ?', ['colset TUBE = product PATIENT * ANALYSE;', 'colset TUBE = string;', 'colset TUBE = unit;', 'colset TUBE = with ana | ben;'], 0, 'Un product regroupe plusieurs informations dans un même jeton.'],
      ]),
      ...pm.quiz('pm5-arcs', [
        [`${CPN.still('cabinet')}Avec la liaison ⟨p = ben, n = 0⟩, que contient patients_vus après le tir ?`, ['[1]', '[0, 1]', '[0]', '[ben]'], 0, 'L’arc d’entrée retire 0, l’arc de sortie remet n + 1 = 1 : un seul jeton.'],
        ['Une même variable apparaît sur deux arcs d’entrée d’une transition. Cela veut dire :', ['les deux jetons pris portent la même valeur', 'on prend deux jetons au hasard', 'les deux arcs doivent avoir le même poids', 'rien de particulier'], 0, 'Une variable prend une seule valeur pour un tir.'],
      ]),
      ...pm.quiz('pm5-garde', [
        [`${CPN.still('pediatre')}Combien de liaisons rendent vers_généraliste tirable ?`, ['2', '1', '3', '0'], 0, '[a ≥ 16] est vraie pour Ana (34) et Cléo (52).'],
        ['Une transition gardée est activable quand :', ['il existe une liaison qui rend la garde vraie et trouve ses jetons', 'la garde est vraie pour tous les jetons', 'au moins un jeton est présent', 'toutes les liaisons rendent la garde vraie'], 0, 'Il suffit d’une liaison.'],
      ]),
      ...pm.quiz('pm5-labo-couleur', [
        [`${CPN.still('labo')}Combien de liaisons rendent analyser_hémato tirable au départ ?`, ['2', '5', '3', '1'], 0, '⟨p = ana, a = hemato⟩ et ⟨p = cleo, a = hemato⟩ : la garde [a = hemato] écarte les tubes de biochimie.'],
        ['Pourquoi (ben, bio) reste-t-il dans résultats ?', ['Ben n’a pas de résultat d’hématologie : consulter exige (p, hemato) et (p, bio)', 'L’automate de biochimie est en panne', 'Ben est arrivé trop tard', 'Le marquage initial est erroné'], 0, 'La variable p commune impose les deux résultats du même patient.'],
      ]),
      ...pm.quiz('pm5-variable', [
        ['Avec (p, hemato), (q, bio) vers consulter, que peut-il rester dans résultats à la fin ?', ['(ben, bio), (ana, bio) ou (cleo, bio), selon les liaisons choisies', 'Toujours (ben, bio)', 'Rien', 'Toujours (ana, hemato)'], 0, 'Le résultat de biochimie de Ben peut servir au dossier d’Ana ou de Cléo ; c’est alors le leur qui reste.'],
      ]),
      ...pm.quiz('pm5-quantite', [
        [`${CPN.still('armoire')}On tire soigner trois fois de suite, sans commander. Que contient l’armoire ?`, ['[0]', '[3]', '[1]', '[11]'], 0, '3 → 2 → 1 → 0. La garde [q > 0] interdit alors un quatrième soin ; seule commander reste tirable (0 < 2) et donne [10].'],
        ['Réactifs : stock initial [(hemato, 1), (bio, 3)], deux analyses d’hématologie et trois de biochimie, on recommande 5 sous 2 doses. Fin ?', ['[(hemato, 4), (bio, 5)]', '[(hemato, −1), (bio, 0)]', '[(hemato, 6), (bio, 5)]', 'dépend de l’ordre'], 0, '1 − 2 + 5 = 4 et 3 − 3 + 5 = 5, une commande chacun.'],
      ]),
      ...pm.quiz('pm5-compact', [
        ['Pour passer de 3 à 100 patients dans le laboratoire coloré, il faut :', ['changer le marquage', 'dessiner 97 copies', 'ajouter 97 transitions', 'changer les gardes'], 0, 'Le réseau ne dépend pas du nombre de patients.'],
        ['Déplier un réseau coloré donne :', ['un réseau sans couleur, une place par couple (place, valeur), même comportement', 'un réseau plus petit', 'un réseau au comportement différent', 'un graphe d’accessibilité'], 0, 'Même comportement, réseau plus gros.'],
      ]),
      ...pm.quiz('pm5-ambulances', [
        [`${CPN.still('ambulances-c')}Quelle inscription mettre sur les quatre arcs ?`, ['a, la même variable partout', 'amb_1 sur un arc, amb_2 sur l’autre', 'deux variables a et b', 'rien'], 0, 'L’ambulance qui part est celle qui était à la base, et celle qui rentre est celle qui était en mission.'],
      ]),
      ...pm.quiz('pm5-tri', [
        ['Deux patients rouges arrivent. Que fait le modèle proposé ?', ['Le premier entre en déchocage, le second attend à l’accueil que déchocage_libre revienne', 'Les deux entrent', 'Le second va en salle d’attente', 'Le réseau se bloque définitivement'], 0, 'La garde [c ≠ rouge] l’empêche d’aller en salle d’attente ; la ressource l’empêche d’entrer.'],
      ]),
    ],
    gens: {
      'pm5-labo-couleur': [gens.labo],
      'pm5-garde': [gens.garde],
      'pm5-quantite': [gens.stock],
      'pm5-variable': [gens.labo],
    },
  });
})();
