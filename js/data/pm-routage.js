// Guide de référence : connexions et routage dans les réseaux de Petri (mémento de 3 pages distribué pour les travaux dirigés)
(function () {
  const R = String.raw, u = COURSE.u, pm = COURSE.pm, g = pm.gens;

  COURSE.add({
    id: 'pmr', kind: 'Mémento',
    title: 'Guide de routage : ET, OU, pièges et ressources',
    short: 'Guide de routage',
    source: 'Guide de Reference - Routage dans les Reseaux de Petri.pdf · 3 pages',
    pitch: 'Le mémento des travaux dirigés : la règle d’or (le ET par les transitions, le OU par les places), les quatre configurations, les deux pièges classiques, la place ressource et l’arbre de décision pour traduire un énoncé.',
    sections: [
      {
        id: 'pmr-regle', title: 'La règle d’or et les quatre configurations', slides: 'p. 1-2',
        summary: 'Le ET est gouverné par les transitions (une transition reliée à plusieurs places), le OU par les places (une place reliée à plusieurs transitions).',
        fiche: R`
${pm.why(`<p>Devant un énoncé, la difficulté est toujours la même : où mettre plusieurs flèches ? Sur une place ou sur une transition ? La règle d’or répond en une ligne.</p>`)}
<div class="thm"><b>La règle d’or</b><br>Le <b>ET</b> (AND) est gouverné par les <b>transitions</b> : une transition connectée à plusieurs places.<br>Le <b>OU</b> (XOR) est gouverné par les <b>places</b> : une place connectée à plusieurs transitions.</div>
<p>Pourquoi ? Une transition agit sur <b>toutes</b> ses places en même temps (elle exige un pion dans chaque entrée, en dépose un dans chaque sortie). Un pion, lui, ne peut être pris que par <b>une seule</b> des transitions qui sortent de sa place.</p>
${pm.table(['Configuration', 'Structure', 'Condition d’activation', 'Effet du tir sur les jetons', 'Mots-clés de l’énoncé'], [
  ['<b>AND-split</b>', '1 transition avec $|t\\bullet|\\ge 2$', 'dépend uniquement de $\\bullet t$', 'génère 1 jeton par place aval (création)', '« en parallèle », « les deux », « indépendamment »'],
  ['<b>AND-join</b>', '1 transition avec $|\\bullet t|\\ge 2$', 'chaque place $p\\in\\bullet t$ doit avoir 1 jeton', 'consomme 1 jeton de chaque entrée (réduction)', '« quand les deux sont prêts », « dès que »'],
  ['<b>XOR-split</b>', '1 place avec $|p\\bullet|\\ge 2$', 'chaque $t\\in p\\bullet$ est activable si $p$ a un jeton', 'le premier tir consomme le jeton partagé', '« ou bien », « soit… soit », « si succès / si échec »'],
  ['<b>XOR-join</b>', 'plusieurs $t$ pointant vers la même $p$', 'chaque branche active indépendamment $p$', 'ajoute 1 jeton dans $p$ sans attendre les autres', '« dans les deux cas », « puis enfin »'],
])}
<p>$|t\bullet|$ se lit « le nombre de places de sortie de $t$ » ; $p\bullet$ est l’ensemble des transitions qui sortent de la place $p$.</p>
<p>Les quatre configurations dans un même réseau : le trajet aux urgences.</p>
${u.petri('urgences', { sec: 'pmr-regle', pion: 'le dossier du patient.', axes: [['<code>prescription</code>', 'AND-split : une transition, deux places de sortie.'], ['<code>diagnostic</code>', 'AND-join : deux places d’entrée, une transition.'], ['<code>diagnostiqué</code>', 'XOR-split : une place, deux transitions de sortie.'], ['<code>à_clôturer</code>', 'XOR-join : deux transitions y déposent.']] })}
${pm.traps(['Mettre le choix sur une transition (deux places de sortie) : les deux branches partiraient.', 'Mettre le parallélisme sur une place (deux transitions de sortie) : une seule branche partirait.'])}
${pm.recap(['ET : plusieurs flèches sur une <b>transition</b>.', 'OU : plusieurs flèches sur une <b>place</b>.', 'Split = ça se sépare ; join = ça se rejoint.'])}`,
      },
      {
        id: 'pmr-splits', title: 'Les divergences : AND-split et XOR-split', slides: 'p. 1',
        summary: 'AND-split : une transition produit un jeton dans chaque branche, qui avancent indépendamment. XOR-split : une place offre son unique jeton à plusieurs transitions, une seule l’emporte.',
        fiche: R`
${pm.why(`<p>Une divergence modélise la façon dont un processus se sépare en plusieurs branches. Deux sens possibles pour « se sépare » : on fait <b>tout</b>, ou on fait <b>l’un des deux</b>.</p>`)}
<h4>AND-split (parallélisme) : 1 transition, N places</h4>
${u.petri('motif-and-split', { ask: 'after', t: 't_split', sec: 'pmr-splits', pion: 'l’avancement d’une branche du dossier.' })}
<div class="def"><b>Comportement</b> : le tir de <code>t_split</code> consomme 1 jeton en entrée et produit <b>simultanément</b> 1 jeton dans chaque place de sortie.<br>
<b>Sens</b> : concurrence pure. Les deux activités suivantes sont lancées et se déroulent indépendamment, dans un ordre quelconque.<br>
<b>Exemple médical</b> : prescription → prise de sang <b>ET</b> radiographie.</div>
<h4>XOR-split (choix exclusif) : 1 place, N transitions</h4>
${u.petri('motif-xor-split', { ask: 'dead', sec: 'pmr-splits', noAxes: true })}
<div class="def"><b>Comportement</b> : il n’y a qu’un seul jeton disponible. Le premier tir d’une transition le consomme et <b>désactive immédiatement</b> l’autre.<br>
<b>Sens</b> : alternative stricte (conflit, non-déterminisme). Un chemin ou l’autre, jamais les deux pour une même instance.<br>
<b>Exemple médical</b> : selon le résultat, hospitalisation <b>OU BIEN</b> retour à domicile.</div>
${pm.traps(['Compter les jetons : après un AND-split il y en a un de plus par branche ; après un XOR-split, toujours un seul.', 'Croire que le XOR-split « choisit le bon chemin » : le réseau ne modélise pas le critère, seulement que les deux issues sont possibles.'])}
${pm.recap(['AND-split : une transition, plusieurs sorties, tous les jetons partent.', 'XOR-split : une place, plusieurs transitions, un seul jeton.', 'Le XOR-split est la source du non-déterminisme.'])}`,
      },
      {
        id: 'pmr-joins', title: 'Les convergences : AND-join et XOR-join', slides: 'p. 1-2',
        summary: 'AND-join : une transition attend un jeton dans chacune de ses entrées (rendez-vous). XOR-join : plusieurs transitions déposent dans une même place, la suite part dès le premier jeton.',
        fiche: R`
${pm.why(`<p>Une convergence modélise la façon dont des branches se rejoignent. Soit on <b>attend tout le monde</b>, soit on continue dès que <b>l’une</b> arrive.</p>`)}
<h4>AND-join (synchronisation) : N places, 1 transition</h4>
${u.petri('motif-and-join', { ask: 'enabled', m: [0, 1, 1, 0, 0], sec: 'pmr-joins', pion: 'un résultat disponible.' })}
<div class="def"><b>Comportement</b> : <code>t_sync</code> est bloquée tant que <b>toutes</b> ses places d’entrée ne contiennent pas au moins 1 jeton. Au tir, elle détruit 1 jeton dans chaque entrée et en émet 1 en sortie.<br>
<b>Sens</b> : point de rendez-vous obligatoire.<br>
<b>Exemple médical</b> : le médecin ne pose le diagnostic <b>QUE</b> si les résultats de biologie <b>ET</b> de radiologie sont arrivés.</div>
<h4>XOR-join (fusion alternative) : N transitions, 1 place</h4>
${u.petri('motif-xor-join', { sec: 'pmr-joins', noAxes: true })}
<div class="def"><b>Comportement</b> : dès que l’une ou l’autre des transitions amont est tirée, elle dépose 1 jeton dans <code>p_commune</code>, ce qui permet immédiatement la suite, sans attendre d’autre événement.<br>
<b>Sens</b> : convergence sans synchronisation.<br>
<b>Exemple médical</b> : que le patient ait été hospitalisé <b>OU</b> qu’il soit rentré, on procède à la clôture du dossier.</div>
${pm.traps(['Refermer un choix par un AND-join : la transition attendrait une branche qui n’a pas eu lieu.', 'Refermer un parallélisme par un XOR-join : la suite serait exécutée une fois par branche.'])}
${pm.recap(['AND-join : une transition, plusieurs entrées, elle attend tout.', 'XOR-join : une place, plusieurs transitions y déposent, on n’attend personne.', 'La fermeture doit être du même type que l’ouverture.'])}`,
      },
      {
        id: 'pmr-piege1', title: 'Piège 1 : XOR-split refermé par un AND-join', slides: 'p. 2',
        summary: 'Un choix exclusif ne donne qu’une branche ; une transition de synchronisation qui attend les deux ne sera jamais jouable : blocage définitif.',
        fiche: R`
${pm.why(`<p>C’est l’erreur la plus fréquente : on dessine « deux chemins qui se rejoignent » sans se demander si les deux ont lieu.</p>`)}
${u.petri('piege1', { ask: 'dead', sec: 'pmr-piege1', pion: 'le dossier.', axes: [['<code>p0</code>', 'XOR-split : un pion, deux transitions.'], ['<code>réunir</code>', 'AND-join : elle exige un pion dans <code>pa</code> <b>et</b> dans <code>pb</code>.']] })}
<div class="def">Le XOR-split n’envoie le pion que dans <b>une</b> branche. <code>réunir</code> attend un pion dans les deux : elle attendra éternellement celui de la branche non choisie. Le système est <b>définitivement bloqué</b> (deadlock).</div>
<p>Le graphe d’accessibilité le dit : 3 marquages, dont 2 sans suite, $[0,1,0,0]$ et $[0,0,1,0]$. La place <code>fin</code> n’est jamais atteinte.</p>
<div class="thm"><b>Règle de correction</b> : un XOR-split doit toujours être refermé par un XOR-join (plusieurs transitions vers une place commune).</div>
${u.petri('motif-xor-join', { caption: 'La bonne fermeture : les deux branches déposent dans la même place', sec: 'pmr-piege1', noAxes: true })}
${pm.traps(['Tester une seule branche et conclure que ça marche : ici aucune des deux n’aboutit.', 'Corriger en ajoutant un pion dans <code>p0</code> : les deux branches partiraient, ce n’est plus un choix.'])}
${pm.recap(['Choix + synchronisation = blocage.', 'On le voit dans le graphe : des marquages sans suite qui ne sont pas la fin.', 'XOR-split se referme par XOR-join.'])}`,
      },
      {
        id: 'pmr-piege2', title: 'Piège 2 : AND-split refermé par un XOR-join', slides: 'p. 2',
        summary: 'Deux branches parallèles qui déposent dans la même place y mettent deux jetons : la transition suivante est exécutée deux fois.',
        fiche: R`
${pm.why(`<p>L’erreur symétrique. Elle est plus sournoise : rien ne se bloque, le réseau « marche », mais il fait une chose en double.</p>`)}
${u.petri('piege2', { ask: 'twice', t: 'suite', m: [0, 0, 0, 2, 0], sec: 'pmr-piege2', pion: 'le dossier.', axes: [['<code>séparer</code>', 'AND-split : deux pions partent.'], ['<code>pc</code>', 'XOR-join : chaque branche y dépose son pion.']] })}
<div class="def">L’AND-split fait circuler <b>deux</b> jetons. S’ils convergent vers la même place, elle en reçoit deux. La transition suivante est jouable <b>deux fois</b> : clôturer deux fois le dossier, facturer deux fois, libérer deux fois la chambre.</div>
<p>Dans le graphe : 9 marquages, et la fin est $[0,0,0,0,2]$, deux pions dans <code>fin</code>. Clique « Recommencer » ci-dessus puis joue depuis le début pour voir les deux pions arriver.</p>
<div class="thm"><b>Règle de correction</b> : un AND-split doit toujours être synchronisé par un AND-join (une transition qui consomme les deux branches).</div>
${u.petri('motif-and-join', { caption: 'La bonne fermeture : une transition qui attend les deux branches', sec: 'pmr-piege2', noAxes: true })}
${pm.traps(['Ne chercher que les blocages : ce piège n’en produit pas. Il faut aussi regarder le <b>nombre de pions</b> à la fin.', 'Croire que deux pions dans <code>fin</code> sont « plus sûrs » : chaque pion est une exécution de trop.'])}
${pm.recap(['Parallèle + fusion simple = dédoublement.', 'Signe : une place reçoit plus de pions que prévu.', 'AND-split se referme par AND-join.'])}`,
      },
      {
        id: 'pmr-ressource', title: 'Contrôle de capacité : la place ressource et son invariant', slides: 'p. 3',
        summary: 'Pour « un seul box », « un objet à la fois », « au plus 3 lits », on ne touche pas à la règle de tir : on ajoute une place ressource à N jetons, et l’invariant m(en_cours) + m(ressource_libre) = N le prouve.',
        fiche: R`
${pm.why(`<p>Beaucoup d’énoncés contiennent une limite : « il n’y a qu’un seul box », « la chaîne traite un objet à la fois », « au plus 3 lits en réveil ». La réponse est toujours la même construction.</p>`)}
<div class="thm"><b>Mécanisme de la boucle ressource</b><ol>
<li>On crée une place ressource (par exemple <code>box_libre</code>) avec <b>N jetons</b> : N est la capacité maximale (1 pour un box ou une machine, 3 pour une salle de réveil).</li>
<li>La transition d’entrée prend un jeton dans la file d’attente <b>ET</b> un jeton dans la ressource.</li>
<li>La transition de sortie restitue le jeton dans la ressource.</li></ol></div>
${u.petri('reveil', { ask: 'enabled', m: [1, 0, 3, 0], sec: 'pmr-ressource', pion: 'dans <code>lits_libres</code> : un lit libre ; ailleurs : un patient.' })}
<div class="def"><b>Invariant garanti</b> : pour tout marquage accessible $m$,<br>$m(\text{en\_cours})+m(\text{ressource\_libre})=N$.<br>Il prouve qu’il ne peut jamais y avoir plus de $N$ éléments dans l’état critique.</div>
${pm.table(['Exemple du cours', 'Ressource', 'N', 'Invariant'], [
  ['Centre de vaccination', '<code>box_libre</code>', '1 (ou 2)', '$m(\\text{dans\\_box})+m(\\text{vacciné})+m(\\text{box\\_libre})=N$'],
  ['Stérilisation', '<code>autoclave_libre</code>', '1', '$m(\\text{en\\_cycle})+m(\\text{autoclave\\_libre})=1$'],
  ['Salle de réveil', '<code>lits_libres</code>', '3', '$m(\\text{en\\_réveil})+m(\\text{lits\\_libres})=3$'],
  ['Navette', '<code>sièges_libres</code>', '8', '$m(\\text{à\\_bord})+m(\\text{sièges\\_libres})=8$'],
  ['Sas', '<code>sas_fermé</code>', '1', '$m(\\text{ouverte\\_1})+m(\\text{ouverte\\_2})+m(\\text{sas\\_fermé})=1$'],
])}
<p>« En cours » désigne toutes les places traversées entre la prise et la restitution de la ressource : pour le centre de vaccination (box rendu par <code>sortir</code>), <code>dans_box</code> et <code>vacciné</code>.</p>
${pm.traps(['Modifier la règle de tir (« cette place est limitée à 3 ») : jamais.', 'Oublier une place « en cours » dans l’invariant quand la ressource est gardée sur plusieurs étapes.', 'Restituer la ressource trop tôt ou pas du tout.'])}
${pm.recap(['Limite de capacité = place ressource à N jetons.', 'Entrée : prend ; sortie : rend.', 'Invariant : en cours + libre = N.'])}`,
      },
      {
        id: 'pmr-arbre', title: 'Arbre de décision : de la phrase au motif', slides: 'p. 3',
        summary: 'Chaque tournure d’un énoncé désigne un motif : « puis » la séquence, « sans ordre imposé » l’AND-split, « dès que les deux » l’AND-join, « soit… soit » le XOR-split, « dans les deux cas » le XOR-join, « un seul à la fois » la place ressource.',
        fiche: R`
${pm.why(`<p>À l’examen, on part d’un texte. Lire phrase par phrase et reconnaître le motif évite de dessiner au hasard.</p>`)}
${pm.table(['La phrase dit…', 'Motif', 'Dessin'], [
  ['« A puis B »', 'séquence', 'une place intermédiaire : (p1) → [A] → (p2) → [B]'],
  ['« On fait X et Y sans ordre imposé »', 'AND-split', '[début] → (pX) <b>et</b> (pY)'],
  ['« Dès que X et Y sont terminés, on fait Z »', 'AND-join', '(pX) <b>et</b> (pY) → [Z]'],
  ['« En fonction de l’examen, soit X soit Y »', 'XOR-split', '(p_décision) → [X] <b>ou</b> [Y]'],
  ['« Qu’il ait choisi X ou Y, l’étape suivante est Z »', 'XOR-join', '[X] → (p_fin) <b>et</b> [Y] → (p_fin)'],
  ['« Une seule tâche à la fois / N ressources disponibles »', 'place ressource', 'boucle sur une place à N jetons au départ'],
])}
<p>Notation du guide : (rond) pour une place, [carré] pour une transition.</p>
${pm.ex(R`<p><b>Application à la sortie d’hospitalisation.</b> « Le médecin signe l’autorisation de sortie. <u>La pharmacie prépare… et le secrétariat rédige…, sans ordre imposé</u> (AND-split). <u>Quand les deux sont prêts</u>, l’infirmière remet le tout (AND-join). Celui-ci rentre <u>en ambulance ou par ses propres moyens</u> (XOR-split). <u>Enfin</u>, la chambre est libérée (XOR-join puis séquence). »</p>`)}
${u.petri('sortie', { sec: 'pmr-arbre', pion: 'le dossier de sortie.' })}
<h4>Méthode en cinq temps</h4>
<ol><li>Lister les <b>événements</b> (verbes) : ce seront les transitions.</li><li>Lister les <b>états</b> entre deux événements : ce seront les places.</li><li>Pour chaque phrase, reconnaître le motif.</li><li>Ajouter les <b>ressources</b> pour chaque limite de capacité.</li><li><b>Jouer</b> le réseau : chercher un blocage, un dédoublement, une situation interdite.</li></ol>
${pm.traps(['« et » dans un énoncé ne veut pas toujours dire parallèle : « il s’enregistre et passe au tri » est une séquence. Cherche « indépendants », « sans ordre », « en parallèle ».', 'Sauter l’étape 5 : la plupart des erreurs se voient en jouant.'])}
${pm.recap(['Verbes = transitions, états = places.', 'Une tournure = un motif.', 'Toujours finir en jouant le réseau.'])}`,
      },
    ],
    cards: [
      ...pm.cards('pmr-regle', [
        ['def', 'Énonce la règle d’or du routage.', 'Le ET est gouverné par les <b>transitions</b> (1 transition, plusieurs places). Le OU est gouverné par les <b>places</b> (1 place, plusieurs transitions).'],
        ['why', 'Pourquoi le ET est-il du côté des transitions ?', 'Une transition agit sur toutes ses places à la fois : elle exige un pion dans chaque entrée et en dépose un dans chaque sortie.'],
        ['why', 'Pourquoi le OU est-il du côté des places ?', 'Un pion ne peut être consommé que par une seule des transitions qui sortent de sa place : elles sont en concurrence.'],
        ['read', 'Structure d’un AND-split et d’un XOR-split, en formule ?', 'AND-split : une transition avec $|t\\bullet|\\ge 2$. XOR-split : une place avec $|p\\bullet|\\ge 2$.'],
        ['trap', 'Deux flèches sortent d’une transition. Est-ce un choix ?', 'Non, un parallélisme : chaque place de sortie reçoit un pion.'],
      ]),
      ...pm.cards('pmr-splits', [
        ['def', 'Comportement d’un AND-split ?', `Le tir consomme 1 jeton en entrée et en produit 1 dans chaque place de sortie : les branches avancent indépendamment.${pm.fig('motif-and-split')}`],
        ['def', 'Comportement d’un XOR-split ?', `Un seul jeton ; le premier tir le consomme et désactive l’autre transition. Un chemin ou l’autre, jamais les deux.${pm.fig('motif-xor-split')}`],
        ['why', 'Pourquoi dit-on que le XOR-split est un conflit ?', 'Les transitions qui sortent de la place sont toutes activables mais se disputent le même jeton : tirer l’une désactive les autres.'],
        ['trap', 'Le XOR-split modélise-t-il le critère du choix (le diagnostic) ?', 'Non. Il dit seulement que les deux issues sont possibles ; le réseau ne choisit pas.'],
      ]),
      ...pm.cards('pmr-joins', [
        ['def', 'Comportement d’un AND-join ?', `La transition est bloquée tant que toutes ses entrées n’ont pas un jeton ; au tir, elle en prend un dans chacune et en émet un.${pm.fig('motif-and-join')}`],
        ['def', 'Comportement d’un XOR-join ?', `Chaque transition amont dépose un jeton dans la place commune ; la suite part aussitôt, sans attendre les autres.${pm.fig('motif-xor-join')}`],
        ['why', 'Pourquoi la fermeture doit-elle être du même type que l’ouverture ?', 'Parce que le nombre de pions doit correspondre : un AND-split en crée un par branche (il faut les réunir), un XOR-split n’en laisse qu’un (il ne faut pas en attendre deux).'],
        ['trap', '« Le médecin ne pose le diagnostic que si biologie ET radiologie sont arrivées. » AND-join ou XOR-join ?', 'AND-join : une transition <code>diagnostic</code> avec deux places d’entrée.'],
      ]),
      ...pm.cards('pmr-piege1', [
        ['def', 'Quel est le piège 1 du guide ?', `Un XOR-split refermé par un AND-join : la transition de synchronisation attend une branche qui n’a pas été choisie. Blocage définitif.${pm.fig('piege1')}`],
        ['why', 'Pourquoi <code>réunir</code> n’est-elle jamais jouable dans le piège 1 ?', 'Elle exige un pion dans <code>pa</code> et dans <code>pb</code>, mais le choix n’en a mis que dans l’une des deux.'],
        ['read', 'Graphe d’accessibilité du piège 1 ?', '3 marquages, 2 sans suite : $[0,1,0,0]$ et $[0,0,1,0]$. <code>fin</code> n’est jamais marquée.'],
        ['decide', 'Comment corriger le piège 1 ?', 'Refermer par un XOR-join : chaque branche a sa transition, et les deux déposent dans une place commune.'],
      ]),
      ...pm.cards('pmr-piege2', [
        ['def', 'Quel est le piège 2 du guide ?', `Un AND-split refermé par un XOR-join : la place commune reçoit deux jetons et la suite s’exécute deux fois.${pm.fig('piege2')}`],
        ['why', 'Pourquoi le piège 2 est-il plus difficile à voir que le piège 1 ?', 'Rien ne se bloque : le réseau va jusqu’au bout. Il faut regarder le nombre de pions (deux dans <code>fin</code>).'],
        ['read', 'Graphe d’accessibilité du piège 2 ?', '9 marquages, 1 sans suite : $[0,0,0,0,2]$, deux pions dans <code>fin</code>.'],
        ['decide', 'Comment corriger le piège 2 ?', 'Refermer par un AND-join : une transition qui consomme un pion de chaque branche.'],
      ]),
      ...pm.cards('pmr-ressource', [
        ['def', 'Décris le mécanisme de la boucle ressource en trois étapes.', '1. Une place ressource à N jetons (N = capacité). 2. La transition d’entrée prend un jeton dans la file <b>et</b> un dans la ressource. 3. La transition de sortie le restitue.'],
        ['def', 'Quel invariant la place ressource garantit-elle ?', '$m(\\text{en\\_cours})+m(\\text{ressource\\_libre})=N$ pour tout marquage accessible.'],
        ['why', 'Pourquoi ne modifie-t-on jamais la règle de tir pour limiter une capacité ?', 'La règle doit rester unique pour tous les réseaux ; la contrainte est portée par le plateau, et l’invariant en donne la preuve.'],
        ['trap', 'Centre de vaccination, box rendu par <code>sortir</code>. L’invariant est-il $m(\\text{dans\\_box})+m(\\text{box\\_libre})=1$ ?', 'Non : la ressource est gardée aussi pendant l’état <code>vacciné</code>. C’est $m(\\text{dans\\_box})+m(\\text{vacciné})+m(\\text{box\\_libre})=1$.'],
      ]),
      ...pm.cards('pmr-arbre', [
        ['read', '« On fait X et Y sans ordre imposé. » Motif ?', 'AND-split : une transition avec une place de sortie pour X et une pour Y.'],
        ['read', '« Qu’il ait choisi X ou Y, l’étape suivante est Z. » Motif ?', 'XOR-join : X et Y déposent dans la même place, d’où part Z.'],
        ['read', '« Une seule tâche à la fois. » Motif ?', 'Boucle sur une place ressource avec 1 jeton.'],
        ['why', 'Pourquoi finir en jouant le réseau ?', 'Les erreurs de routage (blocage, dédoublement, situation interdite) ne se voient pas sur le dessin : elles apparaissent en jouant ou dans le graphe d’accessibilité.'],
        ['trap', '« Il s’enregistre et passe au tri. » Est-ce un AND-split ?', 'Non : c’est une séquence. Le parallélisme demande « indépendants », « sans ordre imposé », « en parallèle ».'],
      ]),
    ],
    quiz: [
      ...pm.quiz('pmr-regle', [
        ['« Après l’accueil, le patient va soit en chirurgie, soit en médecine. » Où mettre les deux flèches sortantes ?', ['Sur une place', 'Sur une transition', 'Sur les deux', 'Sur un arc pondéré'], 0, 'OU = place : un pion, deux transitions possibles.'],
        ['Une transition $t$ a $|\\bullet t|=1$ et $|t\\bullet|=3$. C’est :', ['un AND-split à trois branches', 'un XOR-split à trois branches', 'un AND-join', 'un XOR-join'], 0, 'Une transition, plusieurs places de sortie : trois pions partent.'],
        ['Dans le réseau des urgences, quelle place est un XOR-join ?', ['<code>à_clôturer</code>', '<code>diagnostiqué</code>', '<code>trié</code>', '<code>sang_fait</code>'], 0, 'Deux transitions y déposent. <code>diagnostiqué</code> est le XOR-split.'],
      ]),
      ...pm.quiz('pmr-splits', [
        [`${pm.fig('motif-and-split', [0, 1, 1, 0, 0])}Quels carrés sont jouables ?`, ['<code>y</code> et <code>z</code>', '<code>y</code> seulement', '<code>t_split</code>', 'aucun'], 0, 'Les deux branches ont leur pion et avancent indépendamment.'],
        ['Combien de pions après un AND-split à trois branches tiré une fois depuis un pion ?', ['3', '1', '2', '4'], 0, 'Un consommé, trois produits.'],
      ]),
      ...pm.quiz('pmr-joins', [
        [`${pm.fig('motif-xor-join')}Combien de fois <code>t_suite</code> sera-t-elle jouée ?`, ['Une fois', 'Deux fois', 'Jamais', 'Cela dépend de la branche'], 0, 'Une seule branche est prise (un pion dans <code>p_décision</code>), donc un seul pion arrive dans <code>p_commune</code>.'],
        ['Un AND-join a trois places d’entrée contenant 1, 1 et 0 pion. Il est :', ['bloqué', 'jouable', 'jouable deux fois', 'jouable après un XOR-split'], 0, 'Il attend toutes ses entrées.'],
      ]),
      ...pm.quiz('pmr-piege1', [
        [`${pm.fig('piege1', [0, 1, 0, 0])}Que peut-on jouer ?`, ['Rien : le réseau est bloqué', '<code>réunir</code>', '<code>choisir_b</code>', '<code>choisir_a</code>'], 0, '<code>réunir</code> attend aussi <code>pb</code>, qui ne recevra jamais de pion.'],
        ['Quel symptôme le piège 1 produit-il dans le graphe d’accessibilité ?', ['Des marquages sans suite qui ne sont pas la fin attendue', 'Une infinité de marquages', 'Deux pions dans la place finale', 'Aucun'], 0, 'Blocage : le processus s’arrête avant la fin.'],
      ]),
      ...pm.quiz('pmr-piege2', [
        [`${pm.fig('piege2', [0, 0, 0, 2, 0])}Combien de fois <code>suite</code> peut-elle encore être jouée ?`, ['2', '1', '0', 'sans limite'], 0, 'Deux pions dans <code>pc</code> : deux tirs.'],
        ['Un processus facture deux fois le même patient. Quelle erreur de modélisation chercher ?', ['Un AND-split refermé par un XOR-join', 'Un XOR-split refermé par un AND-join', 'Une place ressource manquante', 'Un réseau non borné'], 0, 'Dédoublement involontaire : deux pions arrivent dans la place qui précède la facturation.'],
      ]),
      ...pm.quiz('pmr-ressource', [
        ['« La chaîne traite un objet à la fois. » Combien de jetons dans la place ressource ?', ['1', '0', '2', 'autant que d’objets'], 0, 'N = capacité maximale = 1.'],
        ['Place ressource à $N=5$ ; on observe 2 éléments en cours. $m(\\text{ressource\\_libre})$ vaut :', ['3', '2', '5', '7'], 0, 'Invariant : en cours + libre = 5.'],
      ]),
      ...pm.quiz('pmr-arbre', [
        ['« Dès que le scanner et l’avis du spécialiste sont disponibles, on décide. » Motif ?', ['AND-join', 'AND-split', 'XOR-join', 'XOR-split'], 0, '« Dès que… et… » : une transition qui attend deux places.'],
        ['« Si le test est négatif, l’objet est jeté ; sinon il est livré. » Motif ?', ['XOR-split', 'AND-split', 'AND-join', 'place ressource'], 0, 'Une place (testé) suivie de deux transitions.'],
        ['Dans un énoncé, les verbes d’action deviennent en général :', ['des transitions', 'des places', 'des pions', 'des poids'], 0, 'Événements = transitions ; états entre deux événements = places.'],
      ]),
    ],
    gens: {
      'pmr-regle': [g.enabled(['urgences', 'sortie'])],
      'pmr-splits': [g.enabled(['motif-and-split', 'motif-xor-split']), g.after(['motif-and-split', 'motif-xor-split'])],
      'pmr-joins': [g.enabled(['motif-and-join', 'motif-xor-join']), g.after(['motif-and-join', 'motif-xor-join'])],
      'pmr-piege1': [g.dead(['piege1', 'motif-xor-join']), g.enabled(['piege1'])],
      'pmr-piege2': [g.enabled(['piege2']), g.after(['piege2'])],
      'pmr-ressource': [g.enabled(['reveil', 'sterilisation', 'vacc-corrige', 'sas'])],
      'pmr-arbre': [g.enabled(['sortie', 'urgences']), g.after(['sortie'])],
    },
  });
})();
