// Problème 3 : Construire un modèle : choix, constructions et capacités (F. Lecron, I-MANA-223, slides 1 à 16)
(function () {
  const R = String.raw, u = COURSE.u, pm = COURSE.pm, g = pm.gens, { rnd, pick } = u;

  COURSE.add({
    id: 'pm3', kind: 'Problème 3',
    title: 'Construire un modèle : choix, constructions et capacités',
    short: 'Pb 3 · Modéliser',
    source: 'Probleme3_Slides_distribuees.pdf · 16 slides',
    pitch: 'Deux modèles différents peuvent être corrects. On apprend à choisir ce que représentent les pions, à assembler séquence, parallélisme et choix, à limiter une capacité par une place ressource et à compter par lots avec des arcs pondérés.',
    sections: [
      {
        id: 'pm3-ambulances', title: 'Deux stagiaires ont-ils modélisé la même chose ?', slides: '2',
        summary: 'Une boucle par ambulance dit laquelle est sortie ; une seule boucle avec deux pions dit combien sont disponibles et passe à 12 sans effort : les deux modèles sont corrects, pour des questions différentes.',
        fiche: R`
${pm.why(`<p>Le responsable demande « lequel des deux modèles est correct ? ». La question est mal posée : un modèle n’est pas correct dans l’absolu, il l’est <b>pour une question</b>.</p>`)}
<p>Consigne donnée aux stagiaires : modéliser les deux ambulances du service, qui sont soit à la base, soit en mission.</p>
${u.petri('ambulances-1', { caption: 'Modèle 1 : une boucle par ambulance', sec: 'pm3-ambulances', pion: 'une <b>ambulance précise</b> : A à gauche, B à droite.' })}
${u.petri('ambulances-2', { caption: 'Modèle 2 : une boucle, deux pions', sec: 'pm3-ambulances', noAxes: true })}
<h4>1. Une suite possible dans l’un, impossible dans l’autre ?</h4>
<p>Si l’on oublie de quelle ambulance il s’agit (on ne regarde que « un départ », « un retour »), <b>non</b> : dans les deux modèles, on peut avoir au plus deux départs sans retour, et jamais un retour sans départ préalable. Les suites de départs et de retours sont les mêmes.</p>
<h4>2. Quel modèle pour quelle question ?</h4>
${pm.table(['Question', 'Modèle', 'Pourquoi'], [
  ['(a) Savoir <b>quelle</b> ambulance est sortie', 'Modèle 1', 'chaque ambulance a ses propres places : on lit $m(\\text{mission\\_A})$'],
  ['(b) Savoir <b>combien</b> sont disponibles', 'Modèle 2', 'c’est directement $m(\\text{à\\_la\\_base})$'],
  ['(c) Passer à 12 ambulances', 'Modèle 2', '12 pions dans <code>à_la_base</code> ; le modèle 1 demanderait 24 places et 24 transitions'],
])}
<h4>3. Que répondre au responsable ?</h4>
<div class="def">Les deux modèles sont corrects. Ils ne répondent pas à la même question : le modèle 1 garde l’<b>identité</b> des ambulances, le modèle 2 ne garde que leur <b>nombre</b>. Il faut d’abord savoir ce que le service veut suivre.</div>
${pm.traps(['Chercher « le » bon modèle sans demander à quoi il doit servir.', 'Croire que le modèle 2 est faux parce qu’on ne sait plus quelle ambulance est où : ce n’était peut-être pas demandé.', 'Compter les situations pour les comparer : 4 pour le modèle 1, 3 pour le modèle 2, et pourtant les deux sont fidèles.'])}
${pm.recap(['Identité = un circuit par objet ; nombre = des pions dans un seul circuit.', 'Un modèle se juge par rapport à une question.', 'Le modèle « par pions » passe à l’échelle sans changer le dessin.'])}`,
      },
      {
        id: 'pm3-abstrait', title: 'Que représente ce réseau ?', slides: '4',
        summary: 'Un même réseau sans noms peut représenter des systèmes très différents : le sens n’est pas dans le dessin, il est dans les noms qu’on donne aux places et aux transitions.',
        fiche: R`
${pm.why(`<p>À force de dessiner des hôpitaux, on croit que le réseau « contient » l’hôpital. Cet exercice montre le contraire : le réseau n’est qu’une structure.</p>`)}
${u.petri('cycle-abstrait', { sec: 'pm3-abstrait', pion: 'un jeton <b>sans signification</b> tant qu’on n’a pas nommé les places.' })}
<p>Un seul pion qui parcourt un cycle de quatre états. Quelques systèmes que ce réseau représente aussi bien l’un que l’autre :</p>
${pm.table(['Système', 'Les quatre places', 'Les transitions'], [
  ['Un lit d’hôpital', 'libre, occupé, à nettoyer, en nettoyage', 'admettre, libérer, commencer le nettoyage, finir'],
  ['Un feu de chantier', 'vert, orange, rouge, rouge et orange', 'les quatre changements de couleur'],
  ['Les quatre saisons', 'printemps, été, automne, hiver', 'les passages d’une saison à la suivante'],
  ['Un brancardier en tournée', 'quatre services visités dans l’ordre', 'les déplacements'],
])}
<div class="def"><b>Conclusion</b> : le réseau ne porte aucun sens par lui-même. Deux systèmes très différents ont la même structure, donc le même comportement possible. Le sens vient de l’<b>interprétation</b> : les noms, et ce que l’on décide que les pions représentent.</div>
${pm.ex(`<p>Conséquence pratique : ce qu’on démontre sur la structure vaut pour tous les systèmes qui la partagent. Ici, 4 situations accessibles, aucune sans suite, jamais plus d’un pion par place : vrai pour le lit, le feu et les saisons.</p>`)}
${pm.traps(['Rendre un réseau sans nommer les places et les transitions : il est illisible, et invérifiable.', 'Croire qu’un nom ajoute une contrainte : appeler une place « box » ne limite pas son nombre de pions.'])}
${pm.recap(['Même structure = même comportement, quel que soit le système.', 'Le sens est dans l’interprétation, pas dans le dessin.', 'Un modèle rendu doit toujours dire ce que représentent pions, places et transitions.'])}`,
      },
      {
        id: 'pm3-sterilisation', title: 'La stérilisation : durée et autoclave unique', slides: '5-6',
        summary: 'Une action qui dure devient deux transitions (début, fin) avec une place entre les deux ; un appareil unique devient une place ressource ; et tous les pions n’ont pas le même rôle.',
        fiche: R`
${pm.why(`<p>Le modèle de départ, <code>sale → stériliser → stérile</code>, est juste mais pauvre. La responsable objecte : « On ne voit pas qu’un cycle dure une heure, ni qu’il n’y a qu’un seul autoclave, qui traite une boîte à la fois. » Deux objections, deux constructions à connaître.</p>`)}
${u.petri('sterilisation-naive', { caption: 'Le modèle de départ : joue trois fois stériliser d’affilée', sec: 'pm3-sterilisation', pion: 'une <b>boîte d’instruments</b>.' })}
<h4>Objection 1 : un cycle dure</h4>
<p>Une transition est <b>instantanée</b>. Pour montrer qu’une action prend du temps, on la coupe en deux événements, <code>lancer</code> et <code>terminer</code>, avec une place <code>en_cycle</code> entre les deux : tant que le pion y est, le cycle est en cours.</p>
<h4>Objection 2 : un seul autoclave, une boîte à la fois</h4>
<p>Une place ressource <code>autoclave_libre</code> avec un pion : <code>lancer</code> la consomme, <code>terminer</code> la rend.</p>
${u.petri('sterilisation', { ask: 'twice', t: 'lancer', sec: 'pm3-sterilisation', pion: 'dans <code>sale</code>, <code>en_cycle</code>, <code>stérile</code> : une <b>boîte</b>. Dans <code>autoclave_libre</code> : l’<b>autoclave disponible</b>.' })}
<p>7 situations accessibles, une seule sans suite : $[0,1,0,3]$ (tout est stérile, l’autoclave est libre). Et toujours $m(\text{en\_cycle})+m(\text{autoclave\_libre})=1$.</p>
<h4>Tous les jetons jouent-ils le même rôle ? (slide 6)</h4>
${pm.table(['', 'Stérilisation', 'Centre de vaccination'], [
  ['Jetons', 'des <b>objets</b> (boîtes) ; une <b>ressource</b> (l’autoclave)', 'des <b>personnes</b> (patients) ; une <b>ressource</b> (le box)'],
  ['Places', 'des <b>états</b> ou des stocks (sale, en cycle, stérile) ; une <b>disponibilité</b> (autoclave_libre)', 'des lieux ou états (attente, dans_box…) ; une disponibilité (box_libre)'],
  ['Transitions', 'des <b>événements</b> (lancer, terminer)', 'des événements ou actions (entrer, vacciner, sortir)'],
])}
${pm.traps(['Vouloir écrire « 1 h » sur une transition : le réseau du cours n’a pas de durée. On montre seulement qu’il y a un <b>pendant</b>.', 'Rendre l’autoclave au lancement : il faut le rendre à la fin du cycle.', 'Lire tous les pions comme des objets du même type.'])}
${pm.recap(['Une action qui dure = début + place « en cours » + fin.', 'Une ressource unique = une place à un pion, prise au début, rendue à la fin.', 'Un pion peut être un objet, une personne, une ressource ou une condition.'])}`,
      },
      {
        id: 'pm3-urgences', title: 'Le trajet d’un patient aux urgences', slides: '7',
        summary: 'On traduit un texte en réseau : « puis » donne une séquence, « deux examens indépendants » un AND-split, « lorsqu’il a les deux » un AND-join, « hospitalisé ou rentre » un XOR-split, « dans les deux cas » un XOR-join.',
        fiche: R`
${pm.enonce('« Le patient est d’abord enregistré à l’accueil, puis il passe au tri. Le médecin prescrit alors une prise de sang et une radiographie. Ces deux examens sont indépendants : on fait d’abord celui qui est disponible. Le médecin ne pose son diagnostic que lorsqu’il a les deux résultats. Selon le diagnostic, le patient est hospitalisé ou il rentre chez lui. Dans les deux cas, on clôture ensuite son dossier. » Construisez le réseau du trajet d’un patient, avec un jeton dans une place de départ. Transitions : enregistrement, tri, prescription, prise_de_sang, radio, diagnostic, hospitalisation, retour_domicile, clôture.')}
${pm.why(`<p>C’est l’exercice type : un texte, une liste de transitions imposée, et il faut trouver les <b>places</b>. Chaque tournure de phrase correspond à une construction.</p>`)}
${pm.todo('<p>Souligne dans l’énoncé les mots qui indiquent l’ordre : « puis », « et », « indépendants », « lorsqu’il a les deux », « ou », « dans les deux cas ». Dessine, puis compare.</p>')}
${pm.table(['Dans le texte', 'Construction', 'Dans le réseau'], [
  ['« d’abord… puis… »', 'séquence', 'arrivé → enregistrement → enregistré → tri → trié'],
  ['« une prise de sang <b>et</b> une radiographie… indépendants »', 'AND-split', '<code>prescription</code> a <b>deux</b> places de sortie'],
  ['« que lorsqu’il a <b>les deux</b> résultats »', 'AND-join', '<code>diagnostic</code> a <b>deux</b> places d’entrée'],
  ['« hospitalisé <b>ou</b> il rentre chez lui »', 'XOR-split', 'la place <code>diagnostiqué</code> a <b>deux</b> transitions de sortie'],
  ['« <b>dans les deux cas</b>, on clôture »', 'XOR-join', 'les deux transitions déposent dans la <b>même</b> place <code>à_clôturer</code>'],
])}
${pm.sol('Voir la solution et la jouer', R`
${u.petri('urgences', { sec: 'pm3-urgences', pion: 'le <b>patient</b> (son dossier). Après <code>prescription</code>, il y a deux pions : les deux examens à faire pour ce même patient.' })}
<p>10 situations accessibles, une seule sans suite : le pion dans <code>clos</code>. Les deux examens se font dans n’importe quel ordre, et <code>diagnostic</code> attend les deux.</p>
<p><b>Variante acceptable</b> : garder deux places (<code>hospitalisé</code>, <code>rentré</code>) et dessiner <b>deux</b> transitions de clôture, une par branche.</p>
${u.petri('urgences-2clotures', { sec: 'pm3-urgences', noAxes: true })}
<p>Elle a 11 situations au lieu de 10 : on y distingue encore, juste avant la clôture, si le patient a été hospitalisé. La première version est plus compacte et utilise une seule transition <code>clôture</code>, comme le demande la liste.</p>`)}
${pm.traps(['Relier <code>hospitalisation</code> et <code>retour_domicile</code> à une seule transition <code>clôture</code> par <b>deux places d’entrée</b> : elle attendrait les deux, alors qu’une seule branche a lieu (blocage : piège 1 du guide).', 'Faire sortir deux flèches de la <b>place</b> <code>trié</code> vers les deux examens : ce serait un choix (l’un <b>ou</b> l’autre), pas un parallélisme.', 'Oublier les places entre deux transitions : deux carrés ne se relient jamais directement.'])}
${pm.recap(['ET = une transition avec plusieurs places (sorties : split ; entrées : join).', 'OU = une place avec plusieurs transitions (sorties : split ; entrées : join).', 'On referme un ET par un ET, un OU par un OU.'])}`,
      },
      {
        id: 'pm3-catalogue', title: 'Un catalogue de constructions', slides: '9',
        summary: 'Cinq morceaux de réseau à savoir dessiner au plus court : séquence, AND-split, AND-join, XOR-split, XOR-join.',
        fiche: R`
${pm.why(`<p>Tout modèle de processus est un assemblage de quelques motifs. Les connaître par cœur, sous leur forme la plus petite, permet de traduire un énoncé phrase par phrase.</p>`)}
${pm.enonce('Dessinez, sous la forme la plus petite possible, le morceau de réseau qui dit : (a) y a lieu après x ; (b) après x, y et z ont lieu dans un ordre quelconque ; (c) z n’a lieu qu’après x et y ; (d) après x, y ou bien z a lieu ; (e) z a lieu après x ou après y.')}
<h4>(a) y a lieu après x : la séquence</h4>
<p>Une place entre les deux transitions : $x$ y dépose le pion dont $y$ a besoin.</p>
${u.petri('motif-seq', { sec: 'pm3-catalogue', pion: 'l’avancement du dossier.' })}
<h4>(b) après x, y et z dans un ordre quelconque : AND-split</h4>
<p><b>Une transition, plusieurs places de sortie.</b> $x$ (ici <code>t_split</code>) produit un pion par branche : $y$ et $z$ deviennent jouables tous les deux, dans l’ordre qu’on veut.</p>
${u.petri('motif-and-split', { ask: 'after', t: 't_split', sec: 'pm3-catalogue', noAxes: true })}
<h4>(c) z n’a lieu qu’après x et y : AND-join</h4>
<p><b>Plusieurs places, une transition.</b> $z$ (ici <code>t_sync</code>) a une place d’entrée par branche et attend un pion dans chacune.</p>
${u.petri('motif-and-join', { ask: 'enabled', sec: 'pm3-catalogue', noAxes: true })}
<h4>(d) après x, y ou bien z : XOR-split</h4>
<p><b>Une place, plusieurs transitions de sortie.</b> Il n’y a qu’un pion : la première transition jouée le consomme et désactive l’autre.</p>
${u.petri('motif-xor-split', { ask: 'twice', t: 't_choixA', sec: 'pm3-catalogue', noAxes: true })}
<h4>(e) z a lieu après x ou après y : XOR-join</h4>
<p><b>Plusieurs transitions, une place.</b> Chacune dépose dans la même place ; la suite n’attend qu’un pion.</p>
${u.petri('motif-xor-join', { sec: 'pm3-catalogue', noAxes: true })}
${pm.traps(['Mélanger : « plusieurs flèches qui sortent d’une <b>place</b> » est un choix, « plusieurs flèches qui sortent d’une <b>transition</b> » est un parallélisme.', 'Pour (e), mettre deux places d’entrée à $z$ : ce serait (c).', 'Dessiner plus grand que nécessaire : le cours demande la forme la plus petite.'])}
${pm.recap(['Séquence : transition, place, transition.', 'ET : gouverné par les transitions.', 'OU : gouverné par les places.'])}`,
      },
      {
        id: 'pm3-reveil', title: 'La salle de réveil n’a que trois lits', slides: '10',
        summary: 'Une place lits_libres à trois pions limite la salle ; l’égalité m(en_réveil) + m(lits_libres) = 3 reste vraie après n’importe quel tir : c’est un invariant.',
        fiche: R`
${pm.enonce('Après une intervention, les patients passent par la salle de réveil, qui compte trois lits. Un patient ne peut quitter le bloc que si un lit de réveil est libre. Le modèle actuel : opéré → entrer → en_réveil → sortir → en_chambre. (1) Corrigez le modèle, sans changer la règle de tir. (2) Trouvez une égalité entre des nombres de jetons qui reste vraie quel que soit le marquage atteint. Pourquoi aucun tir ne peut-il la rendre fausse ? (3) L’hôpital ouvre un quatrième lit : que changez-vous ?')}
${pm.why(`<p>C’est la place ressource du problème 1, avec une nouveauté : on ne se contente plus de constater que « ça marche », on donne une <b>égalité</b> qui le prouve pour tous les déroulements.</p>`)}
${u.petri('reveil-naif', { caption: 'Le modèle actuel, avec quatre opérés : joue quatre fois entrer', sec: 'pm3-reveil', pion: 'un <b>patient</b>.' })}
<h4>1. La correction</h4>
<p>Une place <code>lits_libres</code> avec <b>3 pions</b>. <code>entrer</code> la consomme, <code>sortir</code> la rend.</p>
${u.petri('reveil', { ask: 'count', sec: 'pm3-reveil', pion: 'dans <code>lits_libres</code> : un <b>lit libre</b>. Ailleurs : un patient.' })}
<h4>2. L’invariant</h4>
<div class="thm"><b>Pour tout marquage accessible</b> : $\ m(\text{en\_réveil})+m(\text{lits\_libres})=3$.</div>
<p><b>Pourquoi aucun tir ne peut la rendre fausse ?</b> Regarde ce que chaque transition fait à la somme :</p>
${pm.table(['Transition', '$m(\\text{en\\_réveil})$', '$m(\\text{lits\\_libres})$', 'Somme'], [['<code>entrer</code>', '$+1$', '$-1$', 'inchangée'], ['<code>sortir</code>', '$-1$', '$+1$', 'inchangée']])}
<p>Au départ la somme vaut $0+3=3$. Chaque transition qui touche l’une des deux places touche l’autre en sens inverse. La somme reste donc 3, et comme $m(\text{lits\_libres})\ge 0$, on a toujours $m(\text{en\_réveil})\le 3$.</p>
<h4>3. Un quatrième lit</h4>
<p>On met <b>4 pions</b> dans <code>lits_libres</code>. Le dessin ne change pas ; l’invariant devient $m(\text{en\_réveil})+m(\text{lits\_libres})=4$.</p>
${pm.traps(['Vérifier la propriété en jouant quelques parties : cela ne prouve rien pour les autres. L’invariant vaut pour toutes.', 'Oublier d’expliquer <b>pourquoi</b> l’égalité tient : il faut passer en revue toutes les transitions.', 'Écrire l’invariant avec <code>opéré</code> : une autre égalité est vraie ($m(\\text{opéré})+m(\\text{en\\_réveil})+m(\\text{en\\_chambre})=4$, le nombre de patients), mais elle ne dit rien des lits.'])}
${pm.recap(['Capacité $N$ = place ressource à $N$ pions.', 'Invariant : $m(\\text{en cours})+m(\\text{ressource libre})=N$.', 'On le prouve en vérifiant que chaque transition laisse la somme inchangée.'])}`,
      },
      {
        id: 'pm3-sang', title: 'Les poches de sang arrivent par lots : les arcs pondérés', slides: '12-13',
        summary: 'Quand une action consomme ou produit plusieurs pions d’un coup, on écrit un poids sur la flèche ; activable devient m(p) ≥ w(p,t) et le tir retire et ajoute les poids.',
        fiche: R`
${pm.enonce('Le réfrigérateur contient au plus 6 poches. La banque de sang livre par lots de 3, et une livraison n’est acceptée que si le lot entier peut être rangé. Chaque transfusion utilise 2 poches. Neuf poches ont été commandées ; le réfrigérateur est vide.')}
${pm.why(`<p>Avec la règle connue, une transition déplace <b>un</b> pion par flèche. Or ici tout se fait par paquets : 3 poches livrées ensemble, 2 poches utilisées ensemble. Il faut étendre la notation.</p>`)}
<h4>1. Quelle situation indésirable le modèle à arcs simples autorise-t-il ?</h4>
${u.petri('sang-simple', { caption: 'Arcs simples : une poche à la fois', sec: 'pm3-sang', pion: 'dans <code>commandées</code> et <code>stock</code> : une <b>poche</b> ; dans <code>libres</code> : un <b>emplacement libre</b> du réfrigérateur ; dans <code>transfusé</code> : une transfusion faite.' })}
<p>Il autorise la livraison d’<b>une seule poche</b> (un lot incomplet), et une transfusion avec <b>une seule poche</b>. Dessiner trois flèches parallèles ne veut rien dire : $F$ est un ensemble de couples, la même flèche ne peut pas y figurer trois fois.</p>
<h4>2. L’extension : un poids sur la flèche</h4>
<div class="def"><b>Arc pondéré</b> : une fonction $w$ donne à chaque flèche un entier $\ge 1$ (1 si rien n’est écrit). $w(p,t)$ : combien de pions $t$ prend dans $p$. $w(t,p)$ : combien elle en dépose dans $p$.</div>
${u.petri('sang', { ask: 'enabled', m: [3, 2, 4, 1], sec: 'pm3-sang', pion: 'comme ci-dessus.', axes: [['Chiffre sur une flèche', 'son <b>poids</b> : <code>livrer</code> prend 3 poches commandées et 3 emplacements libres, dépose 3 poches en stock ; <code>transfuser</code> prend 2 poches et libère 2 emplacements.']] })}
<h4>3. Prédire, puis vérifier</h4>
${pm.ex(R`<p><b>Après deux livraisons et une transfusion, une troisième livraison est-elle possible ?</b></p>
<p>Départ $[9,6,0,0]$ sur (commandées, libres, stock, transfusé). Deux livraisons : $[3,0,6,0]$. Une transfusion : $[3,2,4,1]$. La troisième livraison exige 3 emplacements libres : il n’y en a que 2. <b>Non</b>, pas avant une deuxième transfusion ($[3,4,2,2]$).</p>
<p><b>Dans quelle situation le jeu se termine-t-il ?</b> En $[0,5,1,4]$ : tout est livré, quatre transfusions ont utilisé 8 poches, il en reste une, insuffisante pour une transfusion.</p>`)}
<h4>4. Que modifier dans <code>activable</code> et <code>tirer</code> ?</h4>
<div class="thm"><b>Activable</b> : $\ \forall p\in\bullet t,\ m(p)\ge w(p,t)$.<br><b>Tirer</b> : $\ m'(p)=m(p)-w(p,t)+w(t,p)$, en posant $w=0$ là où il n’y a pas de flèche.</div>
<p>Avec tous les poids à 1, on retrouve exactement les formules du problème 2.</p>
${pm.traps(['Dessiner plusieurs flèches identiques au lieu d’un poids.', 'Mettre le poids sur une seule flèche de <code>livrer</code> : il en faut 3 sur l’entrée <code>commandées</code>, 3 sur l’entrée <code>libres</code> et 3 sur la sortie <code>stock</code>.', 'Croire que 9 poches commandées donnent forcément 4 transfusions complètes et un stock vide : il reste une poche.'])}
${pm.recap(['Poids = nombre de pions pris ou déposés par la flèche.', 'Activable : $m(p)\\ge w(p,t)$ ; tir : $-w(p,t)+w(t,p)$.', 'Le modèle pondéré a 10 situations ; il se termine en $[0,5,1,4]$.'])}`,
      },
      {
        id: 'pm3-pompes', title: 'À vous : les pompes à perfusion', slides: '14',
        summary: 'Combien de pompes dans chaque état : un cycle à trois places et trois pions ; laquelle : un cycle par pompe ; la technicienne : une place ressource et une révision coupée en début et fin.',
        fiche: R`
${pm.enonce('Le service dispose de trois pompes à perfusion, chacune disponible, en utilisation ou à réviser après usage. (a) Modélisez pour savoir combien de pompes sont dans chaque état. (b) Modélisez pour savoir quelle pompe est à réviser. (c) Une seule technicienne révise les pompes, une à la fois, et une révision prend du temps : complétez le modèle (a). Donnez le rôle de chaque jeton et de chaque place.')}
${pm.todo('<p>Cet exercice réutilise trois idées déjà vues : les ambulances (combien ou laquelle), la stérilisation (durée) et la place ressource. Essaie avant de regarder.</p>')}
${pm.sol('(a) Combien dans chaque état', `<p>Un cycle de trois places, <b>trois pions</b> dans <code>disponible</code>.</p>${u.petri('pompes-a', { sec: 'pm3-pompes', pion: 'une <b>pompe</b>. La place dit son état.' })}<p>Toujours $m(\\text{disponible})+m(\\text{en\\_utilisation})+m(\\text{à\\_réviser})=3$.</p>`)}
${pm.sol('(b) Laquelle', '<p><b>Trois copies</b> du cycle, une par pompe (<code>disponible_1</code>, <code>en_utilisation_1</code>, <code>à_réviser_1</code>, puis _2 et _3), un pion dans chacune. On lit directement si la pompe 2 est à réviser : $m(\\text{à\\_réviser\\_2})=1$. C’est le modèle 1 des ambulances : neuf places et neuf transitions au lieu de trois et trois.</p>')}
${pm.sol('(c) La technicienne', R`<p>La révision prend du temps : on la coupe en <code>commencer_révision</code> et <code>finir_révision</code>, avec une place <code>en_révision</code>. Une seule technicienne : une place <code>technicienne_libre</code> à un pion, prise au début, rendue à la fin.</p>
${u.petri('pompes-c', { ask: 'enabled', m: [0, 0, 2, 1, 0], sec: 'pm3-pompes', pion: 'dans <code>technicienne_libre</code> : la <b>technicienne disponible</b>. Dans les quatre autres places : une <b>pompe</b>.' })}
${pm.table(['Élément', 'Rôle'], [['Jetons des places <code>disponible</code>, <code>en_utilisation</code>, <code>à_réviser</code>, <code>en_révision</code>', 'les pompes (des objets)'], ['Jeton de <code>technicienne_libre</code>', 'une ressource : la technicienne est disponible'], ['Places du cycle', 'l’état d’une pompe'], ['<code>technicienne_libre</code>', 'la disponibilité de la ressource']])}
<p>Invariant : $m(\text{en\_révision})+m(\text{technicienne\_libre})=1$ : jamais deux pompes en révision.</p>`)}
${pm.traps(['Pour (b), garder un seul cycle et « numéroter » les pions : les pions sont anonymes.', 'Pour (c), laisser une seule transition <code>réviser</code> : elle est instantanée, la technicienne ne serait jamais occupée.', 'Ne pas répondre à la dernière phrase : le rôle de chaque jeton et de chaque place fait partie de la réponse.'])}
${pm.recap(['Combien = pions dans un cycle ; laquelle = un cycle par objet.', 'Durée + ressource unique = début, place « en cours », fin, et une place ressource.', 'Toujours dire ce que représente chaque pion.'])}`,
      },
      {
        id: 'pm3-sortie', title: 'À vous : la sortie d’hospitalisation', slides: '15',
        summary: 'Même gabarit que les urgences : séquence, AND-split (pharmacie et secrétariat), AND-join (remise), XOR-split (ambulance ou propres moyens), XOR-join, puis libération de la chambre.',
        fiche: R`
${pm.enonce('Le médecin signe l’autorisation de sortie. La pharmacie prépare alors les médicaments et le secrétariat rédige la lettre de sortie, sans ordre imposé. Quand les deux sont prêts, l’infirmière remet le tout au patient. Celui-ci rentre en ambulance ou par ses propres moyens. Enfin, la chambre est libérée.')}
${pm.todo('<p>Repère les tournures : « sans ordre imposé », « quand les deux sont prêts », « ou », « enfin ». Chacune correspond à un motif du catalogue.</p>')}
${pm.table(['Dans le texte', 'Motif'], [['« prépare… <b>et</b>… rédige…, sans ordre imposé »', 'AND-split après <code>signature</code>'], ['« quand <b>les deux</b> sont prêts »', 'AND-join sur <code>remise</code>'], ['« en ambulance <b>ou</b> par ses propres moyens »', 'XOR-split depuis la place <code>prêt_à_partir</code>'], ['« <b>enfin</b>, la chambre est libérée »', 'XOR-join dans la place <code>parti</code>, puis séquence']])}
${pm.sol('Voir la solution et la jouer', R`${u.petri('sortie', { sec: 'pm3-sortie', pion: 'le <b>dossier de sortie</b> du patient ; deux pions pendant que pharmacie et secrétariat travaillent en parallèle.' })}
<p>8 situations accessibles, une seule sans suite : le pion dans <code>chambre_libre</code>. Aucun blocage en chemin : le ET est refermé par un ET, le OU par un OU.</p>`)}
${pm.traps(['Mettre <code>pharmacie</code> puis <code>secrétariat</code> en séquence : l’énoncé dit « sans ordre imposé ».', 'Faire arriver <code>ambulance</code> et <code>propres_moyens</code> dans deux places qui entrent toutes deux dans <code>libérer_chambre</code> : la chambre ne serait jamais libérée.'])}
${pm.recap(['« sans ordre imposé » = parallèle = AND.', '« ou » = choix = XOR.', 'On vérifie en jouant jusqu’à la fin par chaque branche.'])}`,
      },
      {
        id: 'pm3-navette8', title: 'À vous : la navette limitée à 8 passagers', slides: '16',
        summary: 'Une place sièges_libres à 8 pions, consommée par chaque monter et rendue par chaque descendre, garantit m(à_bord) + m(sièges_libres) = 8.',
        fiche: R`
${pm.enonce('Reprenez la navette du problème 2 et terminez le modèle : jamais plus de 8 passagers à bord.')}
${pm.todo('<p>Quelle construction limite une capacité ? Quelles transitions doivent prendre un siège, lesquelles le rendent ?</p>')}
${pm.sol('Voir la solution et la jouer', R`
<p>Une place ressource <code>sièges_libres</code> avec <b>8 pions</b>. Les trois <code>monter_i</code> en consomment un, les trois <code>descendre_i</code> en rendent un.</p>
${u.petri('navette-8', { sec: 'pm3-navette8', pion: 'dans <code>sièges_libres</code> : un <b>siège libre</b> ; dans <code>à_Si</code> : la navette ; ailleurs : un passager.' })}
<p>Dix passagers attendent au quai 1 : après huit <code>monter_1</code>, <code>sièges_libres</code> est vide et <code>monter_1</code> n’est plus jouable, même si la navette est là et que deux passagers attendent.</p>
<div class="thm"><b>Invariant</b> : $\ m(\text{à\_bord})+m(\text{sièges\_libres})=8$. Chaque <code>monter</code> fait $+1$ et $-1$, chaque <code>descendre</code> fait $-1$ et $+1$, <code>rouler</code> ne touche à aucune des deux.</div>`)}
${pm.traps(['Ne relier <code>sièges_libres</code> qu’à un seul <code>monter</code> : on pourrait dépasser 8 en montant ailleurs.', 'Oublier de rendre le siège à la descente.', 'Mettre un poids 8 quelque part : chaque passager prend <b>un</b> siège.'])}
${pm.recap(['Même construction que <code>box_libre</code> et <code>lits_libres</code>.', 'Toutes les transitions d’entrée prennent, toutes les transitions de sortie rendent.', 'Invariant : $m(\\text{à\\_bord})+m(\\text{sièges\\_libres})=8$.'])}`,
      },
    ],
    cards: [
      ...pm.cards('pm3-ambulances', [
        ['decide', 'On doit savoir <b>quelle</b> ambulance est sortie. Quel modèle ?', 'Une boucle par ambulance (base_A / mission_A, base_B / mission_B) : chaque ambulance a ses propres places.'],
        ['decide', 'On doit savoir <b>combien</b> d’ambulances sont disponibles, et passer à 12. Quel modèle ?', 'Une seule boucle (à_la_base / en_mission) avec autant de pions que d’ambulances : 12 pions, même dessin.'],
        ['why', 'Pourquoi répond-on au responsable que les deux modèles sont corrects ?', 'Ils décrivent fidèlement le service, mais pour des questions différentes : l’un garde l’identité, l’autre le nombre. Un modèle se juge par rapport à une question.'],
        ['trap', 'Sans regarder quelle ambulance bouge, les deux modèles autorisent-ils les mêmes suites de départs et de retours ?', 'Oui : au plus deux départs sans retour, jamais de retour sans départ. La différence n’est pas dans ces suites mais dans l’information gardée.'],
      ]),
      ...pm.cards('pm3-abstrait', [
        ['why', 'Que montre l’exercice du réseau cyclique sans noms ?', 'Qu’un même réseau représente des systèmes très différents (un lit, un feu, les saisons). Le réseau n’a pas de sens par lui-même : le sens vient des noms et de l’interprétation.'],
        ['link', 'Quel intérêt y a-t-il à ce que deux systèmes aient le même réseau ?', 'Ce qu’on prouve sur la structure (nombre de situations, absence de blocage) vaut pour les deux.'],
        ['trap', 'Appeler une place « box » limite-t-il son nombre de pions ?', 'Non. Un nom n’ajoute aucune contrainte : seule la structure (une place ressource) le fait.'],
        ['decide', 'Que doit toujours accompagner un réseau qu’on rend ?', 'Les noms des places et des transitions, et ce que représentent les pions.'],
      ]),
      ...pm.cards('pm3-sterilisation', [
        ['decide', 'Comment montrer qu’une action dure ?', 'La couper en deux transitions (début, fin) avec une place « en cours » entre les deux. Une transition seule est instantanée.'],
        ['decide', 'Comment dire qu’il n’y a qu’un autoclave, une boîte à la fois ?', 'Une place ressource <code>autoclave_libre</code> à un pion : prise par <code>lancer</code>, rendue par <code>terminer</code>.'],
        ['why', 'Pourquoi tous les jetons ne jouent-ils pas le même rôle ?', 'Certains sont des objets ou des personnes qui avancent (boîtes, patients), d’autres des ressources ou des conditions (autoclave libre, box libre). On le lit à la place où ils sont.'],
        ['trap', 'Peut-on écrire « 1 heure » sur la transition <code>stériliser</code> ?', 'Pas dans les réseaux du cours : il n’y a pas de durée. On montre seulement qu’il existe un état « en cycle » entre le début et la fin.'],
      ]),
      ...pm.cards('pm3-urgences', [
        ['read', '« Le médecin prescrit une prise de sang et une radiographie, indépendantes. » Quel motif ?', 'AND-split : la transition <code>prescription</code> a deux places de sortie, une par examen.'],
        ['read', '« Dans les deux cas, on clôture ensuite son dossier. » Quel motif ?', 'XOR-join : les deux transitions (hospitalisation, retour_domicile) déposent dans la même place, d’où part <code>clôture</code>.'],
        ['why', 'Pourquoi <code>diagnostic</code> a-t-il deux places d’entrée ?', 'Parce qu’il ne peut avoir lieu que lorsque les <b>deux</b> résultats sont là : la transition attend un pion dans chaque place (AND-join).'],
        ['trap', 'Que se passe-t-il si <code>clôture</code> a deux places d’entrée, une par branche ?', 'Elle attend un pion dans chacune, mais une seule branche a lieu : blocage définitif. C’est le piège 1 du guide.'],
      ]),
      ...pm.cards('pm3-catalogue', [
        ['def', 'Dessine l’AND-split au plus court.', `Une transition avec deux places de sortie.${pm.fig('motif-and-split')}`],
        ['def', 'Dessine le XOR-split au plus court.', `Une place avec deux transitions de sortie.${pm.fig('motif-xor-split')}`],
        ['def', 'Dessine l’AND-join au plus court.', `Deux places qui entrent dans une même transition.${pm.fig('motif-and-join')}`],
        ['def', 'Dessine le XOR-join au plus court.', `Deux transitions qui déposent dans une même place.${pm.fig('motif-xor-join')}`],
        ['why', 'Pourquoi le ET est-il porté par une transition et le OU par une place ?', 'Une transition agit sur <b>toutes</b> ses places à la fois (elle prend partout, dépose partout). Un pion dans une place ne peut être consommé que par <b>une</b> des transitions qui en sortent.'],
        ['trap', 'Deux flèches sortent d’une place vers deux transitions. Parallélisme ou choix ?', 'Choix (XOR) : il n’y a qu’un pion, une seule des deux transitions le prendra.'],
      ]),
      ...pm.cards('pm3-reveil', [
        ['def', 'Qu’est-ce qu’un invariant de marquage ?', 'Une égalité entre des nombres de pions qui est vraie dans <b>tous</b> les marquages accessibles, par exemple $m(\\text{en\\_réveil})+m(\\text{lits\\_libres})=3$.'],
        ['why', 'Pourquoi aucun tir ne peut-il fausser $m(\\text{en\\_réveil})+m(\\text{lits\\_libres})=3$ ?', '<code>entrer</code> fait $+1$ sur en_réveil et $-1$ sur lits_libres ; <code>sortir</code> fait l’inverse. La somme ne change jamais, et elle vaut 3 au départ.'],
        ['decide', 'L’hôpital ouvre un quatrième lit de réveil. Que changer ?', 'Mettre 4 pions dans <code>lits_libres</code>. Rien d’autre.'],
        ['trap', 'Jouer dix parties sans jamais voir quatre patients en réveil prouve-t-il la propriété ?', 'Non. Seul un argument valable pour tous les déroulements le prouve : l’invariant, ou le graphe d’accessibilité complet.'],
      ]),
      ...pm.cards('pm3-sang', [
        ['def', 'Qu’est-ce qu’un arc pondéré ?', 'Une flèche qui porte un entier $w\\ge 1$ : le nombre de pions que la transition prend dans la place (ou y dépose) en un seul tir.'],
        ['def', 'Écris <code>activable</code> et <code>tirer</code> avec des poids.', 'Activable : $m(p)\\ge w(p,t)$ pour tout $p\\in\\bullet t$. Tir : $m\'(p)=m(p)-w(p,t)+w(t,p)$.'],
        ['why', 'Pourquoi les arcs simples ne suffisent-ils pas pour les poches de sang ?', 'Ils autorisent la livraison d’une seule poche (lot incomplet) et une transfusion à une poche. Il faut prendre 3, ou 2, d’un seul coup.'],
        ['read', 'Poches de sang : après deux livraisons et une transfusion, peut-on livrer une troisième fois ?', 'Non : la situation est $[3,2,4,1]$, il n’y a que 2 emplacements libres et il en faut 3. Il faut d’abord une autre transfusion.'],
        ['trap', 'Peut-on dessiner trois flèches parallèles au lieu d’un poids 3 ?', 'Non : $F$ est un ensemble de couples, la même flèche ne peut pas y figurer trois fois. On écrit le poids sur la flèche.'],
        ['read', 'Dans quelle situation le jeu des poches de sang se termine-t-il ?', '$[0,5,1,4]$ : tout livré, 4 transfusions, une poche restante qui ne suffit pas pour une cinquième.'],
      ]),
      ...pm.cards('pm3-pompes', [
        ['decide', 'Trois pompes : on veut savoir combien sont à réviser. Modèle ?', 'Un cycle disponible → en_utilisation → à_réviser → disponible, avec 3 pions.'],
        ['decide', 'Trois pompes : on veut savoir laquelle est à réviser. Modèle ?', 'Un cycle par pompe (trois copies), un pion dans chacune.'],
        ['why', 'Pourquoi couper la révision en <code>commencer_révision</code> et <code>finir_révision</code> ?', 'Pour que la technicienne soit occupée <b>pendant</b> la révision : elle est prise au début, rendue à la fin.'],
        ['trap', 'Dans le modèle (c), que représente le pion de <code>technicienne_libre</code> ?', 'Pas une pompe : la disponibilité de la technicienne. Les autres pions sont des pompes.'],
      ]),
      ...pm.cards('pm3-sortie', [
        ['read', '« …sans ordre imposé. Quand les deux sont prêts… » Quels motifs ?', 'AND-split (une transition, deux places de sortie) puis AND-join (deux places, une transition).'],
        ['why', 'Pourquoi la sortie d’hospitalisation ne se bloque-t-elle jamais en chemin ?', 'Parce que le ET est refermé par un ET et le OU par un OU. Le seul marquage sans suite est la fin (chambre libre).'],
        ['trap', 'Peut-on dessiner <code>pharmacie</code> puis <code>secrétariat</code> à la suite ?', 'Non : cela imposerait un ordre, alors que l’énoncé dit « sans ordre imposé ».'],
        ['link', 'À quel autre exercice la sortie d’hospitalisation ressemble-t-elle ?', 'Au trajet aux urgences : séquence, parallèle, synchronisation, choix, fusion.'],
      ]),
      ...pm.cards('pm3-navette8', [
        ['decide', 'Comment limiter la navette à 8 passagers ?', 'Une place <code>sièges_libres</code> à 8 pions : chaque <code>monter_i</code> en prend un, chaque <code>descendre_i</code> en rend un.'],
        ['def', 'Quel invariant prouve la limite de la navette ?', '$m(\\text{à\\_bord})+m(\\text{sièges\\_libres})=8$.'],
        ['why', 'Pourquoi relier <code>sièges_libres</code> aux <b>trois</b> transitions monter ?', 'Sinon on pourrait dépasser 8 en montant à un site qui ne prend pas de siège.'],
        ['trap', 'Faut-il un arc de poids 8 ?', 'Non : chaque passager prend un seul siège. Le 8 est le nombre de pions au départ, pas un poids.'],
      ]),
    ],
    quiz: [
      ...pm.quiz('pm3-ambulances', [
        ['Le service veut un tableau « ambulance A : en mission depuis… ». Quel modèle sert de base ?', ['Une boucle par ambulance', 'Une boucle avec deux pions', 'Les deux conviennent', 'Aucun : il faut une place ressource'], 0, 'Il faut l’identité : seul le modèle à une boucle par ambulance la garde.'],
        [`${pm.fig('ambulances-2', [1, 1])}Dans cette situation, que sait-on ?`, ['Une ambulance est en mission, sans savoir laquelle', 'L’ambulance A est en mission', 'L’ambulance B est en mission', 'Les deux ambulances sont en mission'], 0, 'Les pions sont anonymes : on connaît le nombre, pas l’identité.'],
        ['Combien de situations accessibles pour 12 ambulances dans le modèle à une boucle ?', ['13', '12', '24', '4096'], 0, 'De 0 à 12 ambulances en mission : 13 situations. Le modèle à une boucle par ambulance en aurait $2^{12}=4096$.'],
      ]),
      ...pm.quiz('pm3-abstrait', [
        ['Deux systèmes ont exactement le même réseau et le même marquage initial. Alors :', ['Ils ont les mêmes déroulements possibles, à l’interprétation près', 'Ils sont le même système', 'L’un des deux modèles est faux', 'On ne peut rien dire'], 0, 'Le comportement ne dépend que de la structure et du marquage.'],
        [`${pm.fig('cycle-abstrait')}Combien de situations accessibles pour ce réseau ?`, ['4', '1', '8', '16'], 0, 'Un pion qui occupe une place parmi quatre.'],
      ]),
      ...pm.quiz('pm3-sterilisation', [
        [`${pm.fig('sterilisation', [2, 0, 1, 0])}Un cycle est en cours. Quels carrés sont jouables ?`, ['<code>terminer</code> seulement', '<code>lancer</code> et <code>terminer</code>', '<code>lancer</code> seulement', 'aucun'], 0, '<code>lancer</code> exige <code>autoclave_libre</code>, vide pendant le cycle.'],
        ['L’hôpital achète un deuxième autoclave. Que changer ?', ['2 pions dans <code>autoclave_libre</code>', 'Dupliquer <code>en_cycle</code>', 'Ajouter une transition <code>lancer_2</code> sans place', 'Mettre un poids 2 sur <code>lancer</code>'], 0, 'Deux ressources identiques = deux pions. Un poids 2 obligerait à lancer deux boîtes d’un coup.'],
        ['Pourquoi <code>stériliser</code> est-elle remplacée par deux transitions ?', ['Pour faire apparaître un état « en cycle » pendant lequel l’autoclave est occupé', 'Pour stériliser deux boîtes à la fois', 'Parce qu’une transition ne peut avoir qu’une sortie', 'Pour respecter l’ordre alphabétique'], 0, 'Sans état intermédiaire, la ressource serait prise et rendue dans le même tir : elle ne limiterait rien.'],
      ]),
      ...pm.quiz('pm3-urgences', [
        [`${pm.fig('urgences', [0, 0, 0, 0, 1, 1, 0, 0, 0, 0])}La prise de sang est faite, la radio pas encore. Que peut-on jouer ?`, ['<code>radio</code> seulement', '<code>diagnostic</code>', '<code>radio</code> ou <code>diagnostic</code>', '<code>prise_de_sang</code>'], 0, '<code>diagnostic</code> attend un pion dans <code>sang_fait</code> <b>et</b> dans <code>radio_faite</code>.'],
        ['« Selon le diagnostic, hospitalisé ou retour » se modélise par :', ['une place suivie de deux transitions', 'une transition suivie de deux places', 'deux places suivies d’une transition', 'un arc pondéré'], 0, 'XOR-split : un pion, deux transitions qui se le disputent.'],
        ['Combien de pions sur le plateau juste après <code>prescription</code> ?', ['2', '1', '3', '0'], 0, 'L’AND-split produit un pion par branche.'],
      ]),
      ...pm.quiz('pm3-catalogue', [
        [`${pm.fig('motif-and-join', [0, 1, 1, 0, 0])}Quels carrés sont jouables ?`, ['<code>y</code> seulement', '<code>t_sync</code>', '<code>y</code> et <code>t_sync</code>', 'aucun'], 0, '<code>t_sync</code> a besoin des deux résultats ; il manque <code>p_résultat2</code>.'],
        [`${pm.fig('motif-xor-split')}Après <code>t_choixA</code>, <code>t_choixB</code> est-elle encore jouable ?`, ['Non : le seul pion a été consommé', 'Oui', 'Oui, une fois', 'Seulement si <code>p_A</code> est vidée'], 0, 'Alternative stricte : un chemin ou l’autre, jamais les deux.'],
        ['« z n’a lieu qu’après x et y » :', ['AND-join', 'AND-split', 'XOR-join', 'XOR-split'], 0, 'Une transition $z$ avec une place d’entrée alimentée par $x$ et une autre par $y$.'],
      ]),
      ...pm.quiz('pm3-reveil', [
        [`${pm.fig('reveil', [1, 0, 3, 0])}Un opéré attend. Peut-il entrer en salle de réveil ?`, ['Non, tant qu’un <code>sortir</code> n’a pas libéré un lit', 'Oui', 'Oui, si l’on joue <code>entrer</code> deux fois', 'Non, jamais'], 0, '<code>lits_libres</code> est vide : <code>entrer</code> n’est pas activable.'],
        ['Laquelle de ces égalités est aussi un invariant de la salle de réveil (4 opérés) ?', ['$m(\\text{opéré})+m(\\text{en\\_réveil})+m(\\text{en\\_chambre})=4$', '$m(\\text{opéré})+m(\\text{lits\\_libres})=7$', '$m(\\text{en\\_réveil})+m(\\text{en\\_chambre})=3$', '$m(\\text{lits\\_libres})=3$'], 0, 'Chaque transition déplace un patient d’une de ces trois places à la suivante : le nombre de patients est conservé.'],
      ]),
      ...pm.quiz('pm3-sang', [
        [`${pm.fig('sang', [6, 3, 3, 0])}Quels carrés sont jouables ?`, ['<code>livrer</code> et <code>transfuser</code>', '<code>livrer</code> seulement', '<code>transfuser</code> seulement', 'aucun'], 0, '<code>livrer</code> : 6 ≥ 3 commandées et 3 ≥ 3 libres. <code>transfuser</code> : 3 ≥ 2 en stock.'],
        ['$w(\\text{stock},\\text{transfuser})=2$ et $m(\\text{stock})=1$. Alors <code>transfuser</code> :', ['n’est pas activable', 'est activable et laisse $-1$ poche', 'est activable et utilise la poche restante', 'est activable une fois'], 0, 'Il faut $m(p)\\ge w(p,t)$, soit au moins 2 poches.'],
      ]),
      ...pm.quiz('pm3-pompes', [
        [`${pm.fig('pompes-c', [1, 0, 1, 1, 0])}Une pompe est en révision, une autre attend. Que peut-on jouer ?`, ['<code>utiliser</code> ou <code>finir_révision</code>', '<code>commencer_révision</code>', '<code>utiliser</code> seulement', 'tout'], 0, '<code>commencer_révision</code> exige la technicienne, occupée. La pompe disponible peut être utilisée, la révision en cours peut finir.'],
        ['Pour savoir <b>laquelle</b> des trois pompes est en utilisation, il faut :', ['un cycle par pompe', 'un cycle avec trois pions', 'trois places ressources', 'un arc de poids 3'], 0, 'L’identité demande des places distinctes par pompe.'],
      ]),
      ...pm.quiz('pm3-sortie', [
        [`${pm.fig('sortie', [0, 0, 1, 1, 0, 0, 0, 0])}Les médicaments sont prêts, la lettre non. Que peut-on jouer ?`, ['<code>secrétariat</code> seulement', '<code>remise</code>', '<code>secrétariat</code> ou <code>remise</code>', '<code>pharmacie</code>'], 0, '<code>remise</code> attend les deux places.'],
        ['Combien de situations sans suite dans la sortie d’hospitalisation ?', ['1 : la chambre est libérée', '2 : une par mode de retour', '0', '3'], 0, 'Les deux branches du choix se rejoignent dans <code>parti</code> avant la libération.'],
      ]),
      ...pm.quiz('pm3-navette8', [
        ['La navette est au site 1 avec 8 passagers à bord ; 2 passagers attendent sur le quai 1. <code>monter_1</code> est :', ['non activable : <code>sièges_libres</code> est vide', 'activable', 'activable une fois', 'activable si la navette roule'], 0, 'Trois entrées : le quai, la navette au site, un siège libre. La troisième manque.'],
        ['$m(\\text{sièges\\_libres})=3$. Combien de passagers à bord ?', ['5', '3', '8', '11'], 0, 'Invariant : $m(\\text{à\\_bord})=8-3=5$.'],
      ]),
    ],
    gens: {
      'pm3-ambulances': [g.count(['ambulances-1', 'ambulances-2']), g.enabled(['ambulances-1', 'ambulances-2'])],
      'pm3-abstrait': [g.after(['cycle-abstrait']), g.count(['cycle-abstrait'])],
      'pm3-sterilisation': [g.enabled(['sterilisation']), g.after(['sterilisation']), g.count(['sterilisation'])],
      'pm3-urgences': [g.enabled(['urgences']), g.after(['urgences'])],
      'pm3-catalogue': [g.enabled(['motif-and-split', 'motif-and-join', 'motif-xor-split', 'motif-xor-join']), g.after(['motif-and-split', 'motif-and-join'])],
      'pm3-reveil': [g.enabled(['reveil']),
        () => { const N = rnd(2, 6), k = rnd(0, N); return { q: `Une salle de réveil compte $${N}$ lits, modélisée avec la place ressource <code>lits_libres</code>. On observe $m(\\text{en\\_réveil})=${k}$. Que vaut $m(\\text{lits\\_libres})$ ?`, a: N - k, tol: 0, unit: 'pions', expl: `Invariant : $m(\\text{en\\_réveil})+m(\\text{lits\\_libres})=${N}$, donc $${N}-${k}=${N - k}$.` }; }],
      'pm3-sang': [g.enabled(['sang']), g.after(['sang']),
        () => { const [a, b] = pick([[1, 0], [1, 1], [2, 0], [2, 1], [2, 2], [2, 3], [3, 3], [3, 4]]), what = pick(['stock', 'libres']); const stock = 3 * a - 2 * b;
          return { q: `Poches de sang (lots de 3, transfusion de 2 poches, réfrigérateur de 6 emplacements, vide au départ). Après $${a}$ livraison${a > 1 ? 's' : ''} et $${b}$ transfusion${b > 1 ? 's' : ''}, que vaut $m(\\text{${what}})$ ?`, a: what === 'stock' ? stock : 6 - stock, tol: 0, unit: 'pions',
            expl: `Stock : $3\\times${a}-2\\times${b}=${stock}$. Emplacements libres : $6-${stock}=${6 - stock}$ (invariant $m(\\text{stock})+m(\\text{libres})=6$).` }; }],
      'pm3-pompes': [g.enabled(['pompes-a', 'pompes-c']), g.after(['pompes-c'])],
      'pm3-sortie': [g.enabled(['sortie']), g.after(['sortie'])],
      'pm3-navette8': [() => { const k = rnd(0, 8); return { q: `Navette à 8 sièges. On observe $m(\\text{à\\_bord})=${k}$. Combien de pions dans <code>sièges_libres</code> ?`, a: 8 - k, tol: 0, unit: 'pions', expl: `$m(\\text{à\\_bord})+m(\\text{sièges\\_libres})=8$, donc $${8 - k}$.` }; }],
    },
  });
})();
