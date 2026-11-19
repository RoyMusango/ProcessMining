// Exercices de la séance 3 (réseaux colorés et temporisés), avec les solutions finales officielles (Solutions_Seance3.pdf).
// Les réseaux reprennent les noms, déclarations et inscriptions du corrigé ; les durées sortent de CPN.run (verif/test_cpn.mjs).
(function () {
  const R = String.raw, u = COURSE.u, pm = COURSE.pm, { pick, rnd } = u;
  const BT = '`'; // apostrophe inversée de la notation de l'outil : 1`x++1`y
  const prop = '<p class="muted small">Corrigé officiel (solutions finales), écrit comme dans l’outil. C’est une proposition : d’autres réseaux, tout aussi corrects, sont possibles.</p>';
  const code = s => `<pre class="cp-decl"><code>${s.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</code></pre>`;

  const gens = {
    // 3.1 généralisé : n clients, k employés, d unités par carte
    club: () => {
      const n = rnd(3, 9), k = rnd(1, 3), d = pick([3, 4, 5, 6, 10]), base = CPN.nets.club;
      const net = CPN.define('gen-club', { ...base, title: `Le club : ${n} clients, ${k} employé${k > 1 ? 's' : ''}, ${d} unités par carte`,
        places: base.places.map(p => ({ ...p, init: p.id === 'client_attente' ? Array.from({ length: n }, (_, i) => ['c' + (i + 1), 30]) : p.id === 'employe' ? Array.from({ length: k }, (_, i) => ['emp' + (i + 1), 5 * (i + 1)]) : [] })),
        arcs: base.arcs.map(a => [a.from, a.to, a.text.replace('@+5', '@+' + d), { via: a.via }]) });
      const v = CPN.run(net).last;
      return { q: `${CPN.still(net)}Chaque carte demande ${d} unités de temps à un employé. <b>Après combien d’unités les ${n} cartes sont-elles délivrées ?</b>`, a: v, tol: 0, unit: 'unités',
        expl: `${k} carte${k > 1 ? 's' : ''} à la fois : ${Math.ceil(n / k)} tour${Math.ceil(n / k) > 1 ? 's' : ''} de ${d} unités, soit ${v}. Un employé rendu par fin_carte reprend aussitôt un client.` };
    },
    // 3.2 (d) généralisé : chacun sa boisson, les deux en parallèle
    cafe: () => {
      const nT = rnd(2, 12) * 5, nC = rnd(2, 12) * 5, tE = pick([2, 3, 4]), tA = pick([3, 4, 5, 6]);
      return { q: `${CPN.still('cafe-d')}Variante de (d) : ${nT} thés préparés par Eve (${tE} unités chacun) et ${nC} cafés par Adam (${tA} unités chacun). <b>Combien d’unités de temps pour toute la commande ?</b>`, a: Math.max(nT * tE, nC * tA), tol: 0, unit: 'unités',
        expl: `Chacun travaille de son côté, en même temps : Eve finit en ${nT} × ${tE} = ${nT * tE}, Adam en ${nC} × ${tA} = ${nC * tA}. La commande est prête au plus tard des deux : ${Math.max(nT * tE, nC * tA)}.` };
    },
    // 3.3 généralisé : n philosophes, combien au plus mangent ensemble ?
    philo: () => {
      const n = rnd(4, 7), net = CPN.philo('gen-philo', n), R2 = CPN.reach(net), mx = Math.max(...R2.states.map(S => S.M.phil_mange.length));
      return { q: `${n} philosophes autour de la table, ${n} couverts, couvert(i) = [i, i+1] (et [${n}, 1] pour le dernier). <b>Combien de philosophes au plus mangent en même temps ?</b>`, a: mx, tol: 0, unit: 'philosophes',
        expl: `Deux voisins partagent un couvert : au plus un philosophe sur deux, soit ${mx} pour ${n} (arrondi inférieur de ${n}/2). Le graphe d’accessibilité compte ${R2.states.length} états.` };
    },
  };

  COURSE.add({
    id: 'pmx3', kind: 'Séance d’exercices 3',
    title: 'Exercices, séance 3 : réseaux colorés et temporisés',
    short: 'Exercices 3',
    source: 'Exercices_Seance3.pdf · Solutions_Seance3.pdf',
    pitch: 'Quatre modèles à construire dans l’outil : le guichet du club de sport, le thé et le café d’Adam et Eve, les cinq philosophes, le radiateur et son thermostat. Chaque corrigé est jouable ici.',
    sections: [
      {
        id: 'pmx3-31', title: 'Exercice 3.1 : la carte de membre du club de sport', slides: 'ex. 3.1',
        summary: 'Le client et l’employé sont des jetons colorés (nom, âge) et (nom, expérience) ; debut_carte les réunit dans en_cours avec un délai de 5 ; avec deux employés, les cinq cartes sont délivrées en 15 unités.',
        fiche: R`
${pm.enonce('Pour avoir accès à la salle de sport, il faut une carte de membre qui contient le nom et l’âge. Cette carte est délivrée à un guichet d’accueil où sont présents deux employés, chacun possédant un nom et une expérience. Un employé ne peut s’occuper que d’une seule personne à la fois et met 5 unités de temps pour le faire. Cinq personnes se présentent au guichet. Représentez le processus.')}
${pm.todo('<p>Trois questions : quel type pour un client, pour un employé ? Quelle place représente « un employé occupé avec un client » ? Où mettre les 5 unités ?</p>')}
${pm.sol('Le corrigé : déclarations et réseau', R`${prop}
${code('colset CLIENT = product STRING * INT timed;   (nom, âge)\ncolset EMP = product STRING * INT timed;      (nom, expérience)\ncolset CLIEMP = product CLIENT * EMP timed;\nvar c : CLIENT;   var e : EMP;')}
${u.cpn('club', { sec: 'pmx3-31', unit: 'unités', q: { text: 'Après combien d’unités de temps les cinq cartes sont-elles délivrées ?', opts: ['15', '25', '10', '5'], a: 0, expl: 'Deux employés : deux cartes en 0–5, deux en 5–10, la dernière en 10–15. Trois tours de 5 unités.' } })}
<p>Marquage initial : client_attente = 1${BT}("c1",30)++…++1${BT}("c5",30) ; employe = 1${BT}("emp1",5)++1${BT}("emp2",10). La notation 1${BT}x++1${BT}y de l’outil est le multiensemble [x, y] du cours.</p>
<ul><li><code>debut_carte</code> prend un client c et un employé e, et produit <b>(c,e)@+5</b> : le couple reste dans en_cours 5 unités.</li><li><code>fin_carte</code> rend l’employé e (de nouveau disponible) et fait entrer le client c.</li></ul>
<p>Les cinq cartes sont délivrées en <b>15 unités de temps</b> (trois tours de 5 unités).</p>`)}
${pm.traps(['Un délai sur l’arc qui rend l’employé, sans place en_cours : on perd le lien entre l’employé et son client.', 'Deux transitions, une par employé : les deux employés sont deux jetons du même type.', 'Oublier timed dans les colset : sans lui, les jetons n’ont pas d’horodatage.'])}
${pm.recap(['Client et employé = jetons colorés de type product.', 'en_cours contient le couple (c,e) avec un délai de 5.', '5 clients, 2 employés : 15 unités.'])}`,
      },
      {
        id: 'pmx3-32', title: 'Exercice 3.2 : le thé et le café d’Adam et Eve', slides: 'ex. 3.2',
        summary: 'Le délai dépend à la fois de la boisson et de l’employé (fonction delay) ; sans garde la durée totale varie d’une simulation à l’autre ; une garde qui spécialise chacun (Eve le thé, Adam le café) donne toujours 400.',
        fiche: R`
${pm.enonce('Un magasin est tenu par deux personnes : Adam et Eve. Une commande de 100 tasses de café et de 100 tasses de thé arrive, sachant qu’un employé ne prépare qu’une seule tasse à la fois. (a) Représentez le processus. (b) Temps pour une tasse : Adam thé 6, café 4 ; Eve thé 2, café 12. Combien d’unités de temps pour les 200 tasses ? (c) Si Eve ne prépare que les tasses de thé et qu’Adam continue à préparer les deux types, quelle est la nouvelle valeur ? (d) Si Eve ne prépare que le thé et Adam que le café ?')}
${pm.table(['', 'Adam', 'Eve'], [['Thé', '6', '2'], ['Café', '4', '12']])}
${pm.sol('(a) et (b) Le corrigé, sans garde', R`${prop}
${code('colset ST = string timed;\ncolset EMPCOMM = product ST * ST timed;\nvar emp, comm : ST;\nfun delay(comm,emp) = if comm = "The" then (if emp = "Eve" then 2 else 6)\n                     else (if emp = "Eve" then 12 else 4);')}
${u.cpn('cafe-a', { sec: 'pmx3-32', unit: 'unités', runs: { n: 100, label: 'la durée totale' }, q: { text: 'Sans garde, la durée totale pour les 200 tasses est :', opts: ['variable d’une simulation à l’autre', 'toujours 400', 'toujours 1200', 'toujours 600'], a: 0, expl: 'Chaque employé prend la tasse suivante au hasard : si Eve tire des cafés (12 unités), tout s’allonge. Lance les 100 simulations.' } })}
<p>Commande = 100${BT}"The"++100${BT}"Cafe" et employe_dispo = 1${BT}"Adam"++1${BT}"Eve". <b>(b)</b> Le corrigé a obtenu entre <b>546 et 586</b> unités sur cinq simulations. Avec 100 simulations, l’app trouve une fourchette un peu plus large : c’est le même phénomène, observé plus souvent.</p>`)}
${pm.sol('(c) Eve ne prépare que le thé', R`
<p>Garde sur demarre_production : <code>[(emp="Eve" andalso comm="The") orelse emp="Adam"]</code>.</p>
${u.cpn('cafe-c', { sec: 'pmx3-32', unit: 'unités', noAxes: true, runs: { n: 100, label: 'la durée totale' } })}
<p>Le corrigé : entre <b>484 et 502</b> unités sur cinq simulations. Plus court qu’en (b) : Eve ne perd plus 12 unités sur un café, mais Adam fait encore des thés à 6 au lieu de 2.</p>`)}
${pm.sol('(d) Chacun sa boisson', R`
<p>Garde : <code>[(emp="Eve" andalso comm="The") orelse (emp="Adam" andalso comm="Cafe")]</code>.</p>
${u.cpn('cafe-d', { sec: 'pmx3-32', unit: 'unités', noAxes: true, runs: { n: 20, label: 'la durée totale' } })}
<p>Résultat <b>toujours égal à 400</b> : Adam prépare les 100 cafés (100 × 4 = 400), Eve a fini les 100 thés après 200 unités (100 × 2).</p>`)}
${pm.traps(['Une transition par couple (employé, boisson) : la fonction delay évite de dupliquer.', 'Additionner les temps des deux employés : ils travaillent en parallèle, on prend le maximum.', 'Conclure (b) avec une seule simulation : le résultat varie.'])}
${pm.recap(['delay(comm, emp) : la durée dépend de deux valeurs.', 'Sans garde : durée aléatoire (corrigé 546–586) ; (c) 484–502.', '(d) toujours 400 : chacun ce qu’il fait le plus vite.'])}`,
      },
      {
        id: 'pmx3-33', title: 'Exercice 3.3 : les cinq philosophes', slides: 'ex. 3.3',
        summary: 'Un philosophe mange avec les deux couverts couvert(i) = [i, i+1] ; la garde [couv=couvert(phi)] impose ses propres couverts : deux voisins ne mangent jamais ensemble, au plus deux mangent en même temps.',
        fiche: R`
${pm.enonce('Pendant un repas, cinq philosophes sont autour d’une table. Devant eux, il y a cinq assiettes, mais seulement cinq couverts. Pour manger, un philosophe a besoin de deux couverts. Un philosophe est soit en train de penser, soit en train de manger. Représentez le processus en utilisant la couleur et la fonction fun couvert(i) = [i, if i=5 then 1 else i+1]. Le philosophe 1 est entouré des couverts 1 et 2, le philosophe 2 des couverts 2 et 3, etc.')}
${pm.sol('Le corrigé : déclarations et réseau', R`${prop}
${code('colset LISTEINT = list INT;\ncolset PHICOUV = product INT * LISTEINT;\nvar phi : INT;   var couv : LISTEINT;\nfun couvert(i) = [i, if i=5 then 1 else i+1];')}
${u.cpn('philosophes', { sec: 'pmx3-33', steps: 12, q: { text: 'Le philosophe 3 mange. Lesquels peuvent manger en même temps que lui ?', opts: ['1 ou 5 (pas les deux) : ses voisins 2 et 4 n’ont pas leurs couverts', '2 et 4', 'tous', 'aucun'], a: 0, expl: 'Le philosophe 3 tient les couverts 3 et 4. Le 2 a besoin de [2, 3], le 4 de [4, 5] : impossible. Le 1 ([1, 2]) ou le 5 ([5, 1]) peut manger, mais pas les deux : ils partagent le couvert 1.' } })}
<p>Marquage initial : phil_pense = 1${BT}1++1${BT}2++1${BT}3++1${BT}4++1${BT}5 et couverts = 1${BT}1++1${BT}2++1${BT}3++1${BT}4++1${BT}5.</p>
<p>La garde impose que les deux couverts pris soient ceux du philosophe : couvert(3) vaut [3,4]. Une liste sur un arc désigne <b>plusieurs jetons</b> : couv = [3, 4] prend les jetons 3 et 4 de couverts. Deux philosophes voisins ne peuvent donc pas manger en même temps ; <b>au plus deux philosophes mangent simultanément</b>.</p>
<p>Le simulateur le confirme : 11 états accessibles (personne, un des 5, ou une des 5 paires de non-voisins), aucun blocage.</p>
<p><b>Variante plus courte</b> (dans le corrigé) : sans variable couv, placer couvert(phi) directement sur l’arc de couverts vers manger et sur l’arc de finir_manger vers couverts ; phil_mange contient alors seulement phi.</p>`)}
${pm.traps(['Prendre les couverts un par un : chaque philosophe peut tenir un couvert et attendre l’autre, et tout se bloque (l’interblocage de l’échographe).', 'Oublier le cas i = 5 : le cinquième philosophe utilise les couverts 5 et 1.', 'Lire couv comme un seul jeton : c’est une liste de deux couverts.'])}
${pm.recap(['Couleur : un jeton par philosophe et par couvert.', 'Garde [couv=couvert(phi)] : chacun ses deux couverts, pris d’un coup.', 'Jamais deux voisins ; au plus deux à table.'])}`,
      },
      {
        id: 'pmx3-34', title: 'Exercice 3.4 : le radiateur et la porte', slides: 'ex. 3.4',
        summary: 'Deux jetons temporisés rythment le modèle : chauffage rend son jeton @+15 (+1 degré), porte @+60 (−3 degrés) ; la pièce gagne 1 degré par heure ; le thermostat ajoute on et off, et deux gardes [t<18] et [t>22].',
        fiche: R`
${pm.enonce('Dans une pièce, il y a un radiateur et une grande porte qui s’ouvre une fois par heure. Quand la porte s’ouvre, la pièce perd 3 degrés instantanément. Le radiateur chauffe la pièce de 1 degré en 15 minutes. La pièce se réchauffe donc de 1 degré par heure (4 − 3). (a) Représentez le processus. (b) Le radiateur est maintenant relié à un thermostat qui l’allume si la température est inférieure à 18 degrés et l’éteint si elle dépasse 22 degrés. Représentez le processus.')}
${pm.sol('(a) Le corrigé, sans thermostat', R`${prop}
${code('colset UNITIMED = unit timed;\nvar port_chauff : UNITIMED;   var t : INT;')}
${u.cpn('radiateur-a', { sec: 'pmx3-34', unit: 'min', steps: 15, plot: { place: 'temperature', until: 480, label: 'Température (°C)' }, q: { text: 'Après 4 heures (240 minutes), quelle est la température, partie de 16 ?', opts: ['20', '32', '4', '16'], a: 0, expl: 'Chaque heure : 4 réchauffes (+4) et une ouverture (−3), soit +1. 16 + 4 = 20. Trace la courbe pour le voir.' } })}
<p><code>rechauffe</code> est tirée toutes les 15 unités (une unité = une minute) et ajoute 1 degré ; <code>ouvrir</code> est tirée toutes les 60 unités et retire 3 degrés. Marquage initial : temperature = 1${BT}16 (par exemple), chauffage = porte = 1${BT}().</p>
<p>Le jeton de <code>chauffage</code> sert d’<b>horloge</b> : rechauffe le prend et le rend avec @+15, donc elle ne peut pas être tirée de nouveau avant 15 minutes. La température, elle, n’est pas temporisée : c’est un INT ordinaire, toujours disponible.</p>`)}
${pm.sol('(b) Avec thermostat', R`
${u.cpn('radiateur-b', { sec: 'pmx3-34', unit: 'min', noAxes: true, steps: 20, plot: { place: 'temperature', until: 1440, label: 'Température (°C) sur 24 heures', lines: [[18, '18'], [22, '22']] } })}
<ul><li>On ajoute deux places <b>on</b> et <b>off</b> (type UNIT).</li><li><code>rechauffe</code> prend et rend le jeton de on : le radiateur ne chauffe que s’il est allumé.</li><li><code>allume</code> (garde [t&lt;18]) fait passer le jeton de off à on ; <code>eteint</code> (garde [t&gt;22]) fait l’inverse. Toutes deux lisent la température sans la modifier (arcs aller-retour inscrits t).</li><li>Marquage initial : off = 1${BT}(), on vide, temperature = 1${BT}16.</li></ul>
<p>Trace la courbe : après la montée initiale, la température oscille entre 17 et 23 degrés. Le thermostat réagit <b>après</b> avoir franchi le seuil (t &lt; 18 veut dire 17, t &gt; 22 veut dire 23).</p>`)}
${pm.traps(['Mettre le délai sur la température : c’est le rythme des événements qui est temporisé, pas la valeur.', 'Faire consommer la température par allume sans la rendre : la pièce n’aurait plus de température.', 'Oublier que rechauffe doit rendre le jeton de on : le radiateur s’éteindrait après un quart d’heure.'])}
${pm.recap(['Un jeton unit temporisé = un rythme (toutes les 15, toutes les 60 minutes).', '(a) +4 −3 = +1 degré par heure.', '(b) on/off et deux gardes : la température oscille autour de 18–22.'])}`,
      },
    ],
    cards: [
      ...pm.cards('pmx3-31', [
        ['decide', 'Exercice 3.1 : quel type pour un client et pour un employé ?', 'product STRING * INT timed : (nom, âge) pour le client, (nom, expérience) pour l’employé.'],
        ['why', 'Pourquoi une place en_cours de type CLIEMP ?', 'Pour garder ensemble l’employé et son client pendant les 5 unités, puis rendre le bon employé et faire entrer le bon client.'],
        ['read', '5 clients, 2 employés, 5 unités par carte : durée totale ?', '15 unités : trois tours de 5.'],
        ['trap', 'Faut-il une transition par employé ?', 'Non : les deux employés sont deux jetons de employe ; une variable e les désigne.'],
      ]),
      ...pm.cards('pmx3-32', [
        ['decide', 'Comment donner une durée qui dépend de la boisson et de l’employé ?', 'Une fonction delay(comm, emp) dans l’inscription (comm,emp)@+delay(comm,emp).'],
        ['read', 'Thé et café, (d) : durée ?', 'Toujours 400 : Adam fait 100 cafés à 4 (400), Eve 100 thés à 2 (200).'],
        ['why', 'Pourquoi la durée varie-t-elle en (b) ?', 'Sans garde, chaque employé prend une boisson au hasard : Eve peut tirer des cafés à 12 unités.'],
        ['trap', 'Faut-il additionner le travail d’Adam et celui d’Eve ?', 'Non : ils travaillent en parallèle ; la commande est finie au plus tard des deux.'],
      ]),
      ...pm.cards('pmx3-33', [
        ['read', 'Que vaut couvert(5) ?', '[5, 1] : le cinquième philosophe est entre les couverts 5 et 1.'],
        ['why', 'Pourquoi deux voisins ne peuvent-ils pas manger ensemble ?', 'Ils partagent un couvert, et la garde [couv=couvert(phi)] exige les deux couverts du philosophe.'],
        ['read', 'Combien de philosophes au plus mangent en même temps ?', 'Deux.'],
        ['trap', 'Prendre les couverts un par un est-il équivalent ?', 'Non : chacun pourrait tenir un couvert et attendre l’autre : interblocage. Le corrigé prend les deux d’un coup.'],
      ]),
      ...pm.cards('pmx3-34', [
        ['decide', 'Comment faire tirer rechauffe toutes les 15 minutes ?', 'Un jeton unit temporisé dans chauffage, pris et rendu avec @+15.'],
        ['read', 'Sans thermostat, la pièce gagne combien de degrés par heure ?', '1 : quatre réchauffes (+4) et une ouverture de porte (−3).'],
        ['why', 'Pourquoi allume et eteint ont-elles des arcs aller-retour inscrits t ?', 'Elles lisent la température pour tester la garde, sans la modifier.'],
        ['trap', 'La température doit-elle être un jeton temporisé ?', 'Non : c’est un INT ordinaire, toujours disponible ; seuls les rythmes (chauffage, porte) sont temporisés.'],
      ]),
    ],
    quiz: [
      ...pm.quiz('pmx3-31', [
        ['Dans le corrigé 3.1, que produit debut_carte ?', ['(c,e)@+5 dans en_cours', 'c dans client_entre', 'e@+5 dans employe', 'rien'], 0, 'Le couple reste 5 unités en cours ; fin_carte rend ensuite e et fait entrer c.'],
      ]),
      ...pm.quiz('pmx3-32', [
        ['Que vaut delay("Cafe", "Eve") ?', ['12', '2', '4', '6'], 0, 'Eve met 12 unités pour un café.'],
        ['(c) Eve ne fait que le thé, Adam les deux. Pourquoi plus de 400 ?', ['Adam prépare encore des thés, à 6 unités au lieu de 2', 'Eve est plus lente', 'Les tasses attendent', 'La garde bloque Adam'], 0, 'Chaque thé pris par Adam coûte 6 unités au lieu de 2.'],
      ]),
      ...pm.quiz('pmx3-33', [
        ['Les philosophes 1 et 3 mangent. Qui peut encore manger ?', ['personne', 'le 5', 'le 2', 'le 4'], 0, 'Couverts pris : 1, 2, 3, 4. Le 5 a besoin de [5, 1] : le couvert 1 est pris.'],
      ]),
      ...pm.quiz('pmx3-34', [
        ['Avec thermostat, quand allume est-elle tirable ?', ['quand le radiateur est éteint (off) et t < 18', 'toutes les 15 minutes', 'quand t > 22', 'toujours'], 0, 'Elle prend le jeton de off et teste [t<18].'],
      ]),
    ],
    gens: {
      'pmx3-31': [gens.club],
      'pmx3-32': [gens.cafe],
      'pmx3-33': [gens.philo],
    },
  });
})();
