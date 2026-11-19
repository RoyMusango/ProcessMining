// Problème 6 : Combien de temps attend le patient ? Horodatage et délais (F. Lecron, I-MANA-223, slides + synthèse théorique)
// Unité : la minute, 0 = 8 h 00. Les heures citées sortent de CPN.run sur les réseaux de cpn-nets.js (verif/test_cpn.mjs).
(function () {
  const R = String.raw, u = COURSE.u, pm = COURSE.pm, { pick, rnd } = u, at = CPN.at;
  const H = m => { const t = 480 + m; return `${Math.floor(t / 60)} h ${String(t % 60).padStart(2, '0')}`; };
  const TIME = { unit: 'min', base: 480 };
  const PAT = ['ana', 'ben', 'cleo', 'dan'];
  const exitsOf = r => Object.fromEntries(r.log.filter(h => h.bd.t === 'terminer').map(h => [Array.isArray(h.bd.b.p) ? h.bd.b.p[0] : h.bd.b.p, h.clock]));

  const gens = {
    // Heure de sortie du dernier patient (un ou deux scanners, durée d)
    scanner: () => {
      const n = rnd(2, 4), d = pick([10, 15, 20, 30]), k = pick([1, 1, 2]);
      const arr = PAT.slice(0, n).map((p, i) => at(p, i === 0 ? 0 : 5 * rnd(1, 6) + 5 * (i - 1)));
      const base = CPN.nets.scanner;
      const net = CPN.define('gen-scanner', { ...base, title: `${k === 1 ? 'Un scanner' : 'Deux scanners'}, examens de ${d} minutes`,
        places: base.places.map(p => ({ ...p, init: p.id === 'attente' ? arr : p.id === 'scanner_libre' ? Array(k).fill(at(null, 0)) : [] })),
        arcs: base.arcs.map(a => [a.from, a.to, a.text === 'p@+20' ? `p@+${d}` : a.text, { via: a.via }]) });
      const last = new Set(); for (let i = 0; i < 30; i++) last.add(CPN.run(net).last);
      const v = [...last][0];
      return { q: `${CPN.still(net)}Arrivées (en minutes après 8 h 00) : ${arr.map(x => `${x.v} à ${x.t}`).join(', ')}. Chaque examen dure ${d} minutes. <b>À quelle minute le dernier patient sort-il ?</b>`, a: v, tol: 0, unit: 'min',
        expl: `Dernière sortie en ${v} (${H(v)}). ${k === 1 ? 'Un seul scanner : les examens s’enchaînent, chacun commence au plus tôt quand le patient est arrivé et le scanner rendu.' : 'Deux scanners : deux examens peuvent se dérouler en même temps.'} L’ordre entre deux patients disponibles au même instant n’est pas fixé, mais l’heure de la dernière sortie, si.` };
    },
    // Moment d'activation d'une liaison
    activation: () => {
      const a = 5 * rnd(0, 8), s = 5 * rnd(0, 8), p = pick(PAT), base = CPN.nets.scanner;
      const net = CPN.define('gen-activation', { ...base, title: 'Le scanner à un instant donné', places: base.places.map(x => ({ ...x, init: x.id === 'attente' ? [at(p, a)] : x.id === 'scanner_libre' ? [at(null, s)] : [] })), arcs: base.arcs.map(x => [x.from, x.to, x.text, { via: x.via }]) });
      return { q: `${CPN.still(net)}${p} est arrivé en ${a} ; le scanner est rendu en ${s}. <b>Quel est le moment d’activation de commencer ⟨p = ${p}⟩ ?</b>`, a: Math.max(a, s), tol: 0, unit: 'min',
        expl: `Le moment d’activation est le plus grand horodatage des jetons consommés : max(${a}, ${s}) = ${Math.max(a, s)}. ${a >= s ? `Le scanner attend le patient.` : `Le patient attend le scanner ${s - a} minutes.`}` };
    },
    // Contraste : heure de sortie d'un patient (seulement si elle ne dépend pas des choix)
    contraste: () => {
      for (let k = 0; k < 40; k++) {
        const n = rnd(2, 4), pts = PAT.slice(0, n).map((p, i) => at([p, Math.random() < .45], i === 0 ? 0 : 5 * rnd(1, 4) + 5 * i));
        const base = CPN.nets['scanner-contraste'];
        const net = CPN.define('gen-contraste', { ...base, title: 'Avec ou sans contraste, une autre matinée', places: base.places.map(x => ({ ...x, init: x.id === 'arrivée' ? pts : x.id === 'scanner_libre' ? [at(null, 0)] : [] })),
          arcs: base.arcs.map(x => [x.from, x.to, x.text, { via: x.via, delay: x.text.includes('@+') ? x.delay : undefined }]) });
        const who = pick(pts).v[0], seen = new Set(); for (let i = 0; i < 30; i++) seen.add(exitsOf(CPN.run(net))[who]);
        if (seen.size !== 1) continue;
        const v = [...seen][0];
        return { q: `${CPN.still(net)}Avec contraste (vrai) : 15 minutes d’attente après l’injection, examen de 30 minutes ; sans (faux) : examen de 15 minutes. Un seul scanner. <b>À quelle minute ${who} sort-il ou sort-elle ?</b>`, a: v, tol: 0, unit: 'min',
          expl: `${who} sort en ${v} (${H(v)}). Chaque patient est prêt à son arrivée + prep(c), puis attend que le scanner soit rendu : l’examen commence au plus grand des deux instants. (Réponse identique sur 30 simulations.)` };
      }
      return gens.activation();
    },
  };

  COURSE.add({
    id: 'pm6', kind: 'Problème 6',
    title: 'Combien de temps attend le patient ? Horodatage et délais',
    short: 'Pb 6 · Réseaux temporisés',
    source: 'Probleme6_Slides_distribuees.pdf · Probleme6_Theorie.pdf',
    pitch: 'Un réseau dit ce qui peut arriver, pas quand. Le réseau temporisé ajoute une horloge, un horodatage à chaque jeton et des délais sur les arcs : on calcule les heures de sortie et les temps d’attente, et on teste une décision (un second scanner) avant de la prendre.',
    sections: [
      {
        id: 'pm6-scanner', title: 'Le scanner du matin : ce que le modèle ne dit pas', slides: '2',
        summary: 'Le réseau sans temps sait dans quel ordre les choses peuvent arriver, pas à quelle heure ; pour répondre « à quelle heure » et « combien de temps », il faut des instants dans les jetons et des durées sur les arcs.',
        fiche: R`
${pm.why(`<p>La direction ne demande plus seulement « est-ce que ça peut se bloquer ? », mais « <b>combien de temps</b> les patients attendent-ils ? ». Les problèmes 1 à 5 ne savent pas répondre : leurs réseaux n’ont pas d’horloge.</p>`)}
${pm.enonce('Le service d’imagerie dispose d’un seul scanner. Un examen dure 20 minutes. Ce matin, Ana arrive à 8 h 00, Ben à 8 h 05 et Cléo à 8 h 10. (1) À quelle heure le dernier patient sort-il ? Combien de temps chacun attend-il ? (2) Ce modèle permet-il de répondre ? Que faudrait-il lui ajouter, et où : dans les jetons, dans les transitions, sur les arcs ?')}
${u.petri('scanner-noir', { ask: 'count', sec: 'pm6-scanner', pion: 'dans <code>attente</code>, <code>en_examen</code>, <code>sorti</code> : un <b>patient</b> ; dans <code>scanner_libre</code> : le scanner est disponible.' })}
<h4>(1) Le calcul à la main</h4>
<p>Ana de 8 h 00 à 8 h 20 ; puis Ben et Cléo de 8 h 20 à 8 h 40 et de 8 h 40 à 9 h 00, <b>dans un ordre que l’énoncé ne fixe pas</b>. Le dernier sort à <b>9 h 00</b>. Attentes : Ana 0 ; Ben 15 et Cléo 30 si Ben passe d’abord, sinon Cléo 10 et Ben 35.</p>
<h4>(2) Ce que le modèle ne sait pas</h4>
<p>Le plateau ci-dessus a 7 situations, mais aucune ne dit « quand ». Il ne connaît ni les heures d’arrivée, ni la durée d’un examen. Il faut ajouter :</p>
<ul><li><b>dans les jetons</b> : l’instant à partir duquel chacun est disponible (son <b>horodatage</b>, ana@0, ben@5) ;</li><li><b>sur les arcs</b> : la durée, comme un <b>délai</b> sur l’arc de sortie (p@+20) ;</li><li><b>pour tout le réseau</b> : une <b>horloge globale</b>. Les transitions, elles, ne changent pas : un tir ne prend pas de temps.</li></ul>
${pm.traps(['Mettre la durée « dans la transition » : un tir est instantané, la durée se met sur l’arc de sortie.', 'Croire que l’ordre Ben puis Cléo est imposé par l’heure d’arrivée : le modèle ne le dit pas (voir « Premier arrivé, premier servi »).', 'Confondre le nombre de situations et la durée : 7 situations ne disent rien du temps.'])}
${pm.recap(['Réseau sans temps : l’ordre possible, pas l’heure.', 'Il faut un horodatage dans les jetons, un délai sur les arcs, une horloge.', 'Scanner : dernier sorti à 9 h 00 ; attentes 0, 15 et 30 (ou 0, 10 et 35).'])}`,
      },
      {
        id: 'pm6-horloge', title: 'L’horloge globale et l’horodatage', slides: 'synthèse 4-5',
        summary: 'L’horloge globale mesure le temps du modèle et part de 0 ; chaque jeton porte un horodatage, noté après @, avant lequel il ne peut pas être consommé ; un tir ne prend pas de temps.',
        fiche: R`
${pm.why(`<p>Pour que Ben ne passe pas avant d’être arrivé, son jeton doit exister dans le modèle dès le départ, mais n’être <b>utilisable</b> qu’à 8 h 05.</p>`)}
<div class="def"><b>Horloge globale</b> : une valeur unique pour tout le réseau, exprimée en unités de temps. L’unité dépend de ce que l’on modélise : une minute pour le scanner, une heure pour l’occupation des lits, un jour pour une liste d’attente. L’horloge part de 0 au marquage initial. <b>Le tir d’une transition ne prend pas de temps</b> : l’horloge ne change qu’entre deux tirs.</div>
<div class="def"><b>Horodatage</b> : chaque jeton porte un instant, noté après @ ; il ne peut pas être consommé avant cet instant.</div>
${pm.table(['Place', 'Marquage initial'], [['attente', '[ana@0, ben@5, cleo@10]'], ['scanner_libre', '[()@0]']])}
<p>En 0, Ben et Cléo sont déjà dans le modèle, mais ils ne sont pas encore arrivés : leurs jetons ne sont pas disponibles.</p>
${u.cpn('scanner', { ...TIME, sec: 'pm6-horloge', q: { text: 'Horloge à 0 (8 h 00). Quelles liaisons de commencer sont tirables ?', opts: ['⟨p = ana⟩ seulement', 'Ana, Ben et Cléo', 'aucune : il faut attendre 8 h 10', 'Ana et Ben'], a: 0, expl: 'ben@5 et cleo@10 ne sont pas encore disponibles. Seule ana@0 l’est, avec le scanner ()@0.' } })}
${pm.traps(['Croire qu’un jeton horodaté 5 « n’existe pas » avant 5 : il est dans la place, il n’est pas encore utilisable.', 'Faire avancer l’horloge pendant un tir : le tir est instantané.', 'Oublier l’unité : 20 veut dire 20 minutes ici, 20 heures ailleurs.'])}
${pm.recap(['Horloge globale : une seule, part de 0.', 'Horodatage x@t : pas consommable avant t.', 'Un tir est instantané.'])}`,
      },
      {
        id: 'pm6-activation', title: 'Le moment d’activation fait avancer l’horloge', slides: '3 · synthèse 6',
        summary: 'Le moment d’activation d’une liaison est le plus grand horodatage des jetons qu’elle consomme ; si rien n’est tirable, l’horloge saute jusqu’au plus petit moment d’activation à venir ; à instant égal, le choix est non déterministe.',
        fiche: R`
${pm.why(`<p>Rejouer la matinée demande une règle précise : quand une transition peut-elle être tirée, et que fait l’horloge quand rien n’est possible ?</p>`)}
<div class="def"><b>Moment d’activation</b> : pour une liaison donnée, le <b>plus grand horodatage</b> des jetons que la transition consomme. Une transition peut être tirée quand l’horloge a atteint son moment d’activation. <b>Si rien n’est tirable maintenant</b>, l’horloge avance jusqu’au plus petit moment d’activation à venir. Si plusieurs liaisons ont le même moment d’activation, le choix est <b>non déterministe</b> : en 20, Ben ou Cléo.</div>
${pm.enonce('Rejouer la matinée : m0(attente) = [ana@0, ben@5, cleo@10], m0(scanner_libre) = [()@0], en minutes. Pour chaque tir : la valeur de l’horloge, la transition tirée et les jetons produits avec leur horodatage. Que fait l’horloge quand aucune transition n’est activable ?')}
${u.cpn('scanner', { ...TIME, sec: 'pm6-activation', q: { text: 'On tire commencer ⟨p = ana⟩ en 0. Ensuite rien n’est tirable. Jusqu’où l’horloge avance-t-elle ?', opts: ['20 : quand ana@20 permet de tirer terminer', '5 : l’arrivée de Ben', '10 : l’arrivée de Cléo', '60 : la fin de la matinée'], a: 0, expl: 'commencer ⟨p = ben⟩ n’est pas une liaison possible : le scanner n’est pas dans scanner_libre. La seule liaison à venir est terminer ⟨p = ana⟩, au moment ana@20.' } })}
${pm.ex(pm.table(['Horloge', 'Tir', 'Jetons produits'], [['0', 'commencer ⟨p = ana⟩', 'en_examen : ana@20'], ['20', 'terminer ⟨p = ana⟩', 'sorti : ana@20, scanner_libre : ()@20'], ['20', 'commencer ⟨p = ben⟩ (ou cleo)', 'en_examen : ben@40'], ['40', 'terminer ⟨p = ben⟩', 'sorti : ben@40, scanner_libre : ()@40'], ['40', 'commencer ⟨p = cleo⟩', 'en_examen : cleo@60'], ['60', 'terminer ⟨p = cleo⟩', 'sorti : cleo@60, scanner_libre : ()@60']]) + '<p>Moment d’activation de commencer ⟨p = ben⟩ en 20 : max(5, 20) = 20. Ben attend 15 minutes : l’attente n’est écrite nulle part, elle <b>résulte</b> du modèle.</p>', 'La matinée, tir par tir')}
${pm.traps(['Prendre le plus petit horodatage : il faut que <b>tous</b> les jetons consommés soient disponibles, donc le plus grand.', 'Faire avancer l’horloge jusqu’à 5 parce que Ben arrive : rien ne devient tirable en 5 (le scanner est occupé).', 'Croire que l’horloge avance d’une minute à la fois : elle saute d’un moment d’activation au suivant.'])}
${pm.recap(['Moment d’activation = max des horodatages consommés.', 'Rien de tirable : l’horloge saute au prochain moment d’activation.', 'À instant égal : choix non déterministe.'])}`,
      },
      {
        id: 'pm6-delai', title: 'Un délai sur l’arc de sortie représente une durée', slides: 'synthèse 7-8',
        summary: 'p@+20 produit un jeton horodaté « instant du tir + 20 » : l’activité dure, la ressource n’est rendue qu’à la fin ; la durée peut dépendre de la valeur du jeton, ce qui évite une transition par cas.',
        fiche: R`
${pm.why(`<p>Au problème 3, une activité qui dure demandait deux transitions et une place « en cours ». Cela disait <b>qu’</b>elle dure, pas <b>combien</b>.</p>`)}
<div class="def"><b>Délai</b> : l’inscription <code>p@+20</code> sur un arc de sortie produit un jeton horodaté « instant du tir + 20 ». Sans délai, le jeton produit est disponible immédiatement.</div>
<p>Dans le scanner, <code>commencer</code> produit <code>p@+20</code> dans en_examen : <code>terminer</code> ne peut pas être tirée avant 20 minutes, et le scanner n’est rendu qu’au tir de <code>terminer</code>. Le délai donne la durée que le problème 3 ne pouvait pas dire.</p>
${u.petri('sterilisation', { sec: 'pm6-delai', pion: 'problème 3 : un <b>plateau</b> sale, en cycle, stérile ; dans <code>autoclave_libre</code> : l’autoclave est disponible. Ici, rien ne dit que le cycle dure 60 minutes.' })}
<h4>Une durée qui dépend de la valeur du jeton</h4>
<p>Couleurs et temps se combinent : <code>(p, c)@+duree(c)</code> avec <code>duree(c) = si c alors 30 sinon 15</code>. La valeur du jeton choisit la durée : <b>une seule transition</b> au lieu d’une par type d’examen.</p>
${pm.traps(['Mettre le délai sur l’arc d’entrée : le délai porte sur le jeton <b>produit</b>.', 'Rendre la ressource avec un délai au lieu de la rendre à terminer : on perd l’information « en cours ».', 'Dupliquer la transition pour chaque durée : une fonction de la valeur suffit.'])}
${pm.recap(['@+d sur un arc de sortie = durée d.', 'La ressource est rendue au tir de fin.', 'duree(c) : la durée dépend de la valeur du jeton.'])}`,
      },
      {
        id: 'pm6-fifo', title: 'Premier arrivé, premier servi ?', slides: '4 · synthèse 9',
        summary: 'Deux jetons disponibles au même instant sont choisis au hasard : Cléo peut passer avant Ben ; pour imposer l’ordre d’arrivée, on le modélise avec un numéro d’ordre et une garde.',
        fiche: R`
${pm.why(`<p>Dans l’outil, Cléo passe parfois avant Ben, alors qu’elle est arrivée après lui. Le modèle n’est pas faux : il ne dit simplement rien de l’ordre de service.</p>`)}
${pm.enonce('Modifiez le modèle pour que les patients passent dans leur ordre d’arrivée.')}
<div class="def"><b>L’ordre de service n’est pas l’ordre d’arrivée</b> : deux jetons disponibles au même instant sont choisis au hasard. En 20, ben@5 et cleo@10 sont tous deux disponibles. Pour imposer « premier arrivé, premier servi », il faut le <b>modéliser</b> : un numéro d’ordre et une garde.</div>
${pm.sol('Une proposition, à jouer', R`<p class="muted small">Proposition de l’app (la slide pose la question sans corrigé ; la synthèse indique « un numéro d’ordre et une garde »).</p>
${u.cpn('scanner-fifo', { ...TIME, sec: 'pm6-fifo', q: { text: 'Avec le numéro d’ordre et la garde [k = n], dans quel ordre les patients passent-ils ?', opts: ['Toujours Ana, Ben, Cléo', 'Ana, puis Ben ou Cléo au hasard', 'Cléo d’abord : elle a le plus grand numéro', 'L’ordre dépend de l’horloge'], a: 0, expl: 'La place suivant contient le numéro du prochain patient. commencer exige k = n et remet n + 1. En 20, seule la liaison ⟨p = ben, k = 2, n = 2⟩ rend la garde vraie.' } })}
<ul><li>Chaque patient porte (nom, numéro d’arrivée) : [(ana, 1)@0, (ben, 2)@5, (cleo, 3)@10].</li><li>Une place <code>suivant</code> contient le numéro du prochain à servir, au départ [1].</li><li><code>commencer</code> a la garde <b>[k = n]</b> et remet <b>n + 1</b> dans suivant.</li></ul>
<p>Sorties : Ana 8 h 20, Ben 8 h 40, Cléo 9 h 00, à chaque simulation.</p>`)}
${pm.traps(['Croire que l’horodatage impose l’ordre : il ne donne que l’instant le plus tôt.', 'Numéroter sans garde : le numéro ne sert à rien si rien ne le teste.', 'Oublier de faire avancer le compteur (n + 1) : seul le premier patient passerait.'])}
${pm.recap(['À instant égal, choix au hasard.', 'Un ordre de service se modélise : numéro + garde.', 'Compteur suivant : [k = n], puis n + 1.'])}`,
      },
      {
        id: 'pm6-deux', title: 'Un deuxième scanner ?', slides: '5',
        summary: 'Il suffit d’un deuxième jeton dans scanner_libre : Ana sort à 8 h 20, Ben à 8 h 25, Cléo à 8 h 40 ; le modèle temporisé permet de tester une décision avant de la prendre.',
        fiche: R`
${pm.why(`<p>La direction envisage d’ouvrir un second scanner le matin. Le modèle temporisé dit, avant d’acheter quoi que ce soit, ce que les patients y gagneraient.</p>`)}
${pm.enonce('Que faut-il changer dans le modèle ? Prédisez l’heure de sortie de chaque patient.')}
${u.cpn('scanner-2', { ...TIME, sec: 'pm6-deux', q: { text: 'Deux jetons ()@0 dans scanner_libre. Heures de sortie ?', opts: ['Ana 8 h 20, Ben 8 h 25, Cléo 8 h 40', 'Ana 8 h 20, Ben 8 h 40, Cléo 9 h 00', 'Ana 8 h 20, Ben 8 h 25, Cléo 8 h 30', 'Tous à 8 h 20'], a: 0, expl: 'Ana prend un scanner en 0, Ben l’autre dès son arrivée en 5. Cléo, arrivée en 10, attend le premier scanner rendu : celui d’Ana, en 20. Sorties 20, 25 et 40.' } })}
<p><b>Le changement</b> : un deuxième jeton dans <code>scanner_libre</code>, <code>[()@0, ()@0]</code>. Rien d’autre.</p>
${pm.table(['Patient', 'Arrivée', 'Début', 'Sortie', 'Attente'], [['Ana', '8 h 00', '8 h 00', '8 h 20', '0'], ['Ben', '8 h 05', '8 h 05', '8 h 25', '0'], ['Cléo', '8 h 10', '8 h 20', '8 h 40', '10']])}
<p>Avec un scanner, le dernier sortait à 9 h 00 et les attentes totalisaient 45 minutes ; avec deux, 8 h 40 et 10 minutes.</p>
${pm.traps(['Dupliquer tout le réseau pour le second scanner : un jeton de plus suffit.', 'Croire que Cléo passe tout de suite : les deux scanners sont occupés à son arrivée.', 'Oublier que la décision se juge aussi sur le coût, que le modèle ne contient pas.'])}
${pm.recap(['Une ressource de plus = un jeton de plus.', 'Sorties 8 h 20, 8 h 25, 8 h 40.', 'Le modèle teste une décision avant de la prendre.'])}`,
      },
      {
        id: 'pm6-contraste', title: 'Avec ou sans produit de contraste', slides: '6 · synthèse 3',
        summary: 'Le jeton porte (patient, contraste) ; préparer produit (p, c)@+prep(c) et commencer (p, c)@+duree(c) : Ana sort à 8 h 15, Cléo à 8 h 30, Ben, prêt à 8 h 20, passe de 8 h 30 à 9 h 00.',
        fiche: R`
${pm.why(`<p>Tous les examens ne se ressemblent pas. Dupliquer les transitions par type d’examen alourdirait le modèle : la couleur choisit la durée.</p>`)}
${pm.enonce('Certains examens demandent une injection de produit de contraste : il faut alors attendre au moins 15 minutes avant de passer au scanner, et l’examen dure 30 minutes au lieu de 15. Ana (sans) arrive à 8 h 00, Ben (avec) à 8 h 05, Cléo (sans) à 8 h 10. On repart du premier modèle : un seul scanner, sans numéro d’ordre. Modélisez cette situation sans dupliquer les transitions, puis prédisez l’heure de sortie de chaque patient.')}
${u.cpn('scanner-contraste', { ...TIME, sec: 'pm6-contraste', q: { text: 'À quelle heure Ben sort-il ?', opts: ['9 h 00', '8 h 50', '8 h 35', '8 h 55'], a: 0, expl: 'Ben est prêt en 5 + 15 = 20, mais le scanner est occupé : Ana de 0 à 15, puis Cléo (prête en 10) de 15 à 30. Ben passe de 30 à 60.' } })}
<ul><li>c vaut <b>vrai</b> si l’examen demande un contraste. <code>prep(c) = si c alors 15 sinon 0</code>, <code>duree(c) = si c alors 30 sinon 15</code>.</li><li>Marquage initial : m(arrivée) = [(ana, faux)@0, (ben, vrai)@5, (cleo, faux)@10].</li></ul>
${pm.table(['Patient', 'Prêt', 'Examen', 'Sortie'], [['Ana (sans)', '8 h 00', '8 h 00 – 8 h 15', '8 h 15'], ['Cléo (sans)', '8 h 10', '8 h 15 – 8 h 30', '8 h 30'], ['Ben (avec)', '8 h 20', '8 h 30 – 9 h 00', '9 h 00']])}
<p>Ben est arrivé avant Cléo, mais il n’est <b>prêt</b> qu’en 20 : en 15, quand le scanner se libère, seule Cléo peut passer. Ici l’ordre ne dépend d’aucun hasard (vérifié sur 200 simulations).</p>
${pm.traps(['Faire commencer Ben en 5 : il doit attendre 15 minutes après l’injection.', 'Une transition par type d’examen : la consigne demande de ne pas dupliquer.', 'Croire que Ben passe en 20 : le scanner est occupé par Cléo jusqu’en 30.'])}
${pm.recap(['Le jeton porte la donnée, la fonction donne la durée.', 'prep(c) puis duree(c) : deux délais.', 'Ana 8 h 15, Cléo 8 h 30, Ben 9 h 00.'])}`,
      },
      {
        id: 'pm6-attente', title: '« Au moins » plutôt que « exactement », et vers le process mining', slides: 'synthèse 9-10',
        summary: 'L’horodatage donne l’instant le plus tôt où un jeton peut servir, pas l’instant où il sert : les attentes résultent du modèle ; les horodatages des systèmes d’information permettent de mesurer ces durées sur des milliers de patients.',
        fiche: R`
${pm.why(`<p>Le délai ne dit pas « Ben passera à 8 h 20 » : il dit « pas avant 8 h 20 ». C’est ce qui fait apparaître les attentes sans les écrire.</p>`)}
<div class="def"><b>« Au moins » plutôt que « exactement »</b> : l’horodatage donne l’instant le plus tôt où un jeton peut servir, pas l’instant où il sert. Ben est prêt en 20, mais le scanner est occupé jusqu’en 30 : il attend 10 minutes de plus. L’attente n’est pas modélisée explicitement, elle <b>résulte</b> du modèle. Le séchage, la récupération après une anesthésie ou le délai avant un contrôle sont des durées minimales : un délai les représente directement.</div>
${u.cpn('scanner', { ...TIME, sec: 'pm6-attente', runs: { n: 200, label: 'la dernière sortie' }, q: { text: 'L’ordre Ben / Cléo change d’une simulation à l’autre. Et l’heure de la dernière sortie ?', opts: ['Toujours 9 h 00', 'Tantôt 8 h 40, tantôt 9 h 00', 'Toujours 8 h 40', 'Elle dépend de l’ordre'], a: 0, expl: 'Le scanner travaille sans interruption de 0 à 60 : seul l’ordre des deux derniers change. Lance les 200 simulations pour le vérifier.' } })}
<h4>Vers le process mining</h4>
<ul><li>Les systèmes d’information de l’hôpital enregistrent l’instant de chaque événement : arrivée, début d’examen, fin d’examen.</li><li>Ces horodatages permettent de mesurer, sur des milliers de patients, ce que nous avons calculé à la main : durées des activités, temps d’attente, ressources saturées.</li><li>Un modèle temporisé permet ensuite de <b>tester une décision avant de la prendre</b> : un second scanner, un autre ordre de passage.</li></ul>
${pm.traps(['Ajouter une transition « attendre » : l’attente résulte du modèle.', 'Lire l’horodatage comme l’heure de service : c’est l’heure la plus tôt.', 'Conclure d’une seule simulation : l’ordre change, il faut en lancer plusieurs.'])}
${pm.recap(['Délai = durée minimale.', 'L’attente se déduit, elle ne se modélise pas.', 'Journaux horodatés → mesurer ; modèle temporisé → décider.'])}`,
      },
      {
        id: 'pm6-sterilisation', title: 'À vous : la stérilisation chronométrée', slides: '7',
        summary: 'Un autoclave, un cycle de 60 minutes, trois boîtes arrivées à 0, 10 et 20 : stériles à 60, puis 120 et 180 dans un ordre non fixé ; avec une boîte lourde de 90 minutes, le jeton porte sa durée et la dernière boîte est stérile à 210.',
        fiche: R`
${pm.enonce('Reprenez la stérilisation du problème 3 : un seul autoclave, un cycle de 60 minutes. Trois boîtes arrivent à 0, 10 et 20 minutes. (a) Modélisez et prédisez l’heure à laquelle chaque boîte est stérile. (b) La deuxième boîte est lourde : son cycle dure 90 minutes. Que change ce modèle ?')}
${pm.todo('<p>Pars du réseau du scanner : mêmes places, autre durée. Pour (b), qu’est-ce qui doit porter la durée ?</p>')}
${pm.sol('(a) Une proposition, à jouer', R`<p class="muted small">Proposition de l’app (la slide n’a pas de corrigé).</p>
${u.cpn('sterilisation-t', { unit: 'min', sec: 'pm6-sterilisation', q: { text: 'À quelle minute la boîte 3 est-elle stérile ?', opts: ['En 120 ou en 180 : l’ordre avec la boîte 2 n’est pas fixé', 'Toujours en 180', 'En 80 (20 + 60)', 'En 60'], a: 0, expl: 'La boîte 1 occupe l’autoclave de 0 à 60. En 60, les boîtes 2 (prête en 10) et 3 (prête en 20) sont toutes deux disponibles : choix au hasard. Stériles en 120 et 180, dans un ordre ou dans l’autre.' } })}
<p>Boîte 1 stérile en 60 ; les boîtes 2 et 3 en 120 et 180, <b>dans un ordre que le modèle ne fixe pas</b> (comme Ben et Cléo au scanner). Pour imposer l’ordre d’arrivée : un numéro et une garde.</p>`)}
${pm.sol('(b) La boîte lourde', R`
${u.cpn('sterilisation-t2', { unit: 'min', sec: 'pm6-sterilisation', noAxes: true, q: { text: 'La boîte 2 dure 90 minutes. Quand la dernière boîte est-elle stérile ?', opts: ['Toujours en 210', 'En 180', 'En 210 ou en 240 selon l’ordre', 'En 150'], a: 0, expl: 'Après la boîte 1 (0–60), il reste 90 + 60 = 150 minutes de cycles : fin en 210, quel que soit l’ordre. Seule l’heure de la boîte 2 change : 150 si elle passe d’abord, 210 sinon.' } })}
<p>Le jeton porte (boîte, durée) et l’arc de sortie de <code>lancer</code> porte <code>(b, d)@+d</code> : la durée vient de la valeur. Toujours une seule transition <code>lancer</code>. La dernière boîte est stérile en <b>210</b> quel que soit l’ordre ; la boîte 2 en 150 ou 210.</p>`)}
${pm.traps(['Donner un délai fixe de 60 à toutes les boîtes en (b).', 'Ajouter une transition lancer_lourde : la valeur du jeton suffit.', 'Annoncer « boîte 2 en 120 » comme une certitude en (a) : l’ordre n’est pas fixé.'])}
${pm.recap(['(a) 60, puis 120 et 180 dans un ordre non fixé.', '(b) Jeton (boîte, durée), délai @+d.', 'Dernière boîte stérile en 210 dans tous les cas.'])}`,
      },
    ],
    cards: [
      ...pm.cards('pm6-scanner', [
        ['read', 'Scanner, un examen de 20 minutes, arrivées 8 h 00, 8 h 05, 8 h 10 : quand sort le dernier ?', 'À 9 h 00. Ana 8 h 00 – 8 h 20, puis Ben et Cléo de 8 h 20 à 8 h 40 et de 8 h 40 à 9 h 00, dans un ordre non fixé.'],
        ['why', 'Pourquoi le réseau du problème 3 ne peut-il pas répondre « à quelle heure » ?', 'Il ne connaît ni les instants d’arrivée ni les durées : il dit ce qui peut arriver, pas quand.'],
        ['decide', 'Que faut-il ajouter, et où, pour répondre ?', 'Un horodatage dans les jetons, un délai sur les arcs de sortie, une horloge globale. Les transitions restent instantanées.'],
        ['trap', 'Les attentes au scanner sont-elles fixées ?', 'Non : Ana 0 ; Ben 15 et Cléo 30 si Ben passe d’abord, sinon Cléo 10 et Ben 35.'],
      ]),
      ...pm.cards('pm6-horloge', [
        ['def', 'Qu’est-ce que l’horloge globale ?', 'Une valeur unique pour tout le réseau, en unités de temps, qui part de 0 au marquage initial et ne change qu’entre deux tirs.'],
        ['def', 'Que signifie ben@5 ?', 'Un jeton de valeur ben, horodaté 5 : il ne peut pas être consommé avant l’instant 5.'],
        ['why', 'Pourquoi mettre Ben dans attente dès 0 ?', 'Le marquage initial décrit toute la matinée ; l’horodatage empêche simplement d’utiliser son jeton avant son arrivée.'],
        ['trap', 'Un tir fait-il avancer l’horloge ?', 'Non : le tir est instantané. La durée vient des délais sur les arcs de sortie.'],
      ]),
      ...pm.cards('pm6-activation', [
        ['def', 'Qu’est-ce que le moment d’activation d’une liaison ?', 'Le plus grand horodatage des jetons qu’elle consomme.'],
        ['def', 'Que fait l’horloge quand rien n’est tirable ?', 'Elle saute jusqu’au plus petit moment d’activation à venir.'],
        ['read', 'commencer ⟨p = ben⟩ en 20 : moment d’activation ?', 'max(5, 20) = 20 : Ben est là depuis 5, le scanner est rendu en 20.'],
        ['trap', 'Après le premier tir, l’horloge avance-t-elle à 5, l’arrivée de Ben ?', 'Non : en 5, rien n’est tirable (le scanner est occupé). Elle saute à 20.'],
        ['why', 'Pourquoi le choix est-il non déterministe en 20 ?', 'ben@5 et cleo@10 sont tous deux disponibles : deux liaisons ont le même moment d’activation.'],
      ]),
      ...pm.cards('pm6-delai', [
        ['def', 'Que produit l’inscription p@+20 ?', 'Un jeton p horodaté « instant du tir + 20 » : il ne sera utilisable que 20 unités plus tard.'],
        ['link', 'Problème 3 contre problème 6 : comment représenter une activité qui dure ?', 'Problème 3 : deux transitions et une place « en cours » (elle dure). Problème 6 : en plus, un délai sur l’arc de sortie (elle dure 20 minutes).'],
        ['decide', 'Comment donner des durées différentes selon le type d’examen ?', 'Une fonction de la valeur du jeton : (p, c)@+duree(c).'],
        ['trap', 'Le délai se met-il sur l’arc d’entrée ?', 'Non : il porte sur le jeton produit, donc sur un arc de sortie.'],
        ['why', 'Pourquoi le scanner n’est-il rendu qu’au tir de terminer ?', 'Pour qu’il reste occupé pendant toute la durée de l’examen : terminer ne peut pas être tirée avant que p@+20 soit disponible.'],
      ]),
      ...pm.cards('pm6-fifo', [
        ['why', 'Pourquoi Cléo passe-t-elle parfois avant Ben ?', 'En 20, leurs deux jetons sont disponibles : le choix entre liaisons de même moment d’activation est au hasard.'],
        ['decide', 'Comment imposer « premier arrivé, premier servi » ?', 'Un numéro d’ordre dans chaque jeton patient, une place suivant avec le prochain numéro, la garde [k = n] sur commencer et n + 1 en retour.'],
        ['trap', 'L’horodatage suffit-il à imposer l’ordre d’arrivée ?', 'Non : il ne donne que l’instant le plus tôt.'],
        ['read', 'Scanner avec numéro d’ordre : sorties ?', 'Ana 8 h 20, Ben 8 h 40, Cléo 9 h 00, à chaque simulation.'],
      ]),
      ...pm.cards('pm6-deux', [
        ['decide', 'Comment modéliser un second scanner ?', 'Un deuxième jeton ()@0 dans scanner_libre.'],
        ['read', 'Deux scanners : heures de sortie ?', 'Ana 8 h 20, Ben 8 h 25, Cléo 8 h 40 (Cléo attend 10 minutes).'],
        ['why', 'Pourquoi un modèle temporisé aide-t-il la direction ?', 'Il chiffre l’effet d’une décision (attentes, dernière sortie) avant de la prendre.'],
        ['trap', 'Avec deux scanners, Cléo passe-t-elle dès son arrivée ?', 'Non : à 8 h 10, les deux scanners sont occupés ; elle attend celui d’Ana, rendu à 8 h 20.'],
      ]),
      ...pm.cards('pm6-contraste', [
        ['read', 'Contraste : heures de sortie d’Ana (sans), Ben (avec), Cléo (sans) ?', 'Ana 8 h 15, Cléo 8 h 30, Ben 9 h 00.'],
        ['why', 'Pourquoi Cléo passe-t-elle avant Ben, arrivé plus tôt ?', 'Ben n’est prêt qu’en 20 (15 minutes après l’injection). En 15, quand le scanner se libère, seule Cléo est prête.'],
        ['decide', 'Comment modéliser le contraste sans dupliquer les transitions ?', 'Jeton (p, c) ; préparer produit (p, c)@+prep(c), commencer (p, c)@+duree(c).'],
        ['trap', 'Ben commence-t-il à 8 h 20, quand il est prêt ?', 'Non : le scanner est occupé par Cléo jusqu’à 8 h 30.'],
      ]),
      ...pm.cards('pm6-attente', [
        ['def', 'Que veut dire « au moins » plutôt que « exactement » ?', 'L’horodatage donne l’instant le plus tôt où un jeton peut servir, pas l’instant où il sert.'],
        ['why', 'Pourquoi ne modélise-t-on pas l’attente ?', 'Elle résulte du modèle : un jeton prêt attend que les autres jetons nécessaires soient disponibles.'],
        ['link', 'Quel lien avec le process mining ?', 'Les systèmes d’information horodatent chaque événement : on mesure durées et attentes sur des milliers de patients, puis un modèle temporisé teste les décisions.'],
        ['trap', 'Une simulation suffit-elle pour conclure ?', 'Non : à instant égal, les choix sont au hasard ; il faut plusieurs simulations.'],
      ]),
      ...pm.cards('pm6-sterilisation', [
        ['read', 'Stérilisation, cycle de 60, boîtes à 0, 10, 20 : heures stériles ?', 'Boîte 1 en 60 ; boîtes 2 et 3 en 120 et 180 dans un ordre non fixé.'],
        ['decide', 'Boîte lourde de 90 minutes : que change-t-on ?', 'Le jeton porte (boîte, durée) et l’arc de sortie de lancer porte (b, d)@+d.'],
        ['read', 'Avec la boîte lourde, quand la dernière boîte est-elle stérile ?', 'En 210, quel que soit l’ordre ; la boîte 2 en 150 ou 210.'],
        ['trap', 'La boîte 2 est-elle forcément stérile en 120 dans le cas (a) ?', 'Non : en 60, les boîtes 2 et 3 sont toutes deux prêtes, l’ordre est au hasard.'],
        ['why', 'Pourquoi la dernière boîte est-elle stérile en 210 quel que soit l’ordre en (b) ?', 'L’autoclave ne s’arrête pas de 0 à la fin : 60 + 90 + 60 = 210 minutes de cycles enchaînés.'],
      ]),
    ],
    quiz: [
      ...pm.quiz('pm6-scanner', [
        ['Un seul scanner, 20 minutes par examen, arrivées 0, 5, 10. Si Cléo passe avant Ben, combien de temps Ben attend-il ?', ['35 minutes', '15 minutes', '30 minutes', '10 minutes'], 0, 'Cléo passe de 20 à 40, Ben de 40 à 60 : arrivé en 5, il attend 35 minutes.'],
        ['Pour répondre « à quelle heure », on ajoute :', ['un horodatage aux jetons, un délai aux arcs, une horloge', 'une transition par minute', 'une place par heure', 'des poids sur les arcs'], 0, 'Les transitions restent instantanées.'],
      ]),
      ...pm.quiz('pm6-horloge', [
        [`${CPN.still('scanner')}Horloge à 7. Quels jetons d’attente sont disponibles ?`, ['ana et ben', 'ana seulement', 'les trois', 'aucun'], 0, 'ana@0 et ben@5 ; cleo@10 ne le sera qu’en 10.'],
      ]),
      ...pm.quiz('pm6-activation', [
        ['Une liaison consomme des jetons horodatés 5, 20 et 12. Son moment d’activation :', ['20', '5', '12', '37'], 0, 'Le plus grand horodatage : tous les jetons doivent être disponibles.'],
        ['L’horloge est à 20, rien n’est tirable, les moments d’activation à venir sont 35 et 40. L’horloge passe à :', ['35', '21', '40', '37,5'], 0, 'Au plus petit moment d’activation à venir.'],
      ]),
      ...pm.quiz('pm6-delai', [
        ['En 40, commencer produit p@+20 dans en_examen. Quand terminer ⟨p⟩ peut-elle être tirée ?', ['À partir de 60', 'En 40', 'En 20', 'À 60 exactement, jamais après'], 0, 'Au plus tôt en 60 ; plus tard si un autre jeton consommé n’est pas prêt.'],
      ]),
      ...pm.quiz('pm6-fifo', [
        ['Dans le modèle avec numéro d’ordre, que contient suivant après le passage de Ben ?', ['[3]', '[2]', '[1]', '[ben]'], 0, 'Chaque commencer remet n + 1 : 1 → 2 (Ana) → 3 (Ben).'],
      ]),
      ...pm.quiz('pm6-deux', [
        [`${CPN.still('scanner-2')}Avec deux scanners, combien de temps Cléo attend-elle ?`, ['10 minutes', '0', '30 minutes', '15 minutes'], 0, 'Arrivée en 10, le premier scanner se libère en 20.'],
      ]),
      ...pm.quiz('pm6-contraste', [
        ['Avec contraste, Ben arrive en 5. Quand est-il prêt ?', ['En 20', 'En 5', 'En 35', 'En 50'], 0, 'prep(vrai) = 15 : 5 + 15 = 20.'],
        ['Que vaut duree(faux) ?', ['15', '30', '20', '0'], 0, 'Sans contraste, l’examen dure 15 minutes.'],
      ]),
      ...pm.quiz('pm6-attente', [
        ['Ben est prêt en 20, le scanner est rendu en 30. Ben commence :', ['en 30', 'en 20', 'en 25', 'jamais'], 0, 'Moment d’activation : max(20, 30) = 30. L’attente de 10 minutes résulte du modèle.'],
      ]),
      ...pm.quiz('pm6-sterilisation', [
        ['Stérilisation (a) : la boîte 2 passe en dernier. Quand est-elle stérile ?', ['En 180', 'En 120', 'En 70', 'En 240'], 0, 'Boîte 1 de 0 à 60, boîte 3 de 60 à 120, boîte 2 de 120 à 180.'],
      ]),
    ],
    gens: {
      'pm6-activation': [gens.activation],
      'pm6-deux': [gens.scanner],
      'pm6-attente': [gens.scanner],
      'pm6-contraste': [gens.contraste],
    },
  });
})();
