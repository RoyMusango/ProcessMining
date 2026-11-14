// Problème 1 : Un deuxième box de vaccination ? (F. Lecron, I-MANA-223, slides 1 à 12)
// Les notes reprennent les annotations manuscrites du PDF distribué.
(function () {
  const R = String.raw, u = COURSE.u, pm = COURSE.pm, g = pm.gens;
  const VACC = ['vacc-naif', 'vacc-corrige', 'vacc-corrige-bleu', 'vacc-2box'];

  COURSE.add({
    id: 'pm1', kind: 'Problème 1',
    title: 'Un deuxième box de vaccination ?',
    short: 'Pb 1 · La règle du jeu',
    source: 'Probleme1_Slides_distribuees.pdf · 12 slides',
    pitch: 'On découvre le réseau de Petri en le jouant : quand un carré peut être joué, ce qu’il fait aux pions, comment lire un plateau, comment interdire une situation sans toucher à la règle.',
    sections: [
      {
        id: 'pm1-regle', title: 'La règle du jeu', slides: '5-6',
        summary: 'Un carré est jouable quand chacun de ses ronds d’entrée contient un pion ; le jouer retire un pion de chaque entrée et en dépose un dans chaque sortie.',
        fiche: R`
${pm.why(`<p>Le cours part d’une question de direction : faut-il ouvrir un deuxième box de vaccination ? Pour y répondre sans discuter dans le vide, il faut une description du centre que tout le monde <b>joue de la même façon</b>. Le réseau de Petri est cette description : un plateau, des pions, et une seule règle.</p>`)}
<h4>La règle, en deux phrases</h4>
<div class="def"><b>Quand</b> : un carré peut être joué si <b>chaque</b> rond relié à lui par une flèche entrante contient au moins un pion.<br>
<b>Quoi</b> : le jouer <b>retire un pion de chaque rond d’entrée</b> et <b>dépose un pion dans chaque rond de sortie</b>. Rien d’autre ne bouge.</div>
<p>Les quatre cas de la slide 5. Réponds avant de jouer : le plateau ne se débloque qu’après ta prédiction.</p>
${u.petri('regle-A', { caption: 'Cas A : une entrée, une sortie', ask: 'after', t: 't', sec: 'pm1-regle', noAxes: true })}
${u.petri('regle-B', { caption: 'Cas B : deux entrées, une sortie', ask: 'after', t: 't', sec: 'pm1-regle', noAxes: true })}
${u.petri('regle-C', { caption: 'Cas C : une des deux entrées est vide', ask: 'enabled', sec: 'pm1-regle', noAxes: true })}
${u.petri('regle-D', { caption: 'Cas D : une entrée à trois pions, deux sorties', ask: 'after', t: 't', sec: 'pm1-regle', pion: 'un <b>jeton</b>. Ici il ne représente encore rien : on apprend seulement la règle.' })}
<h4>Le nombre de pions n’est pas conservé</h4>
<p>Dans le cas B, deux pions entrent et un seul sort : il y a un pion de moins sur le plateau. Dans le cas D, un pion entre et deux sortent : un de plus. Un carré ne « déplace » pas des pions, il en <b>consomme</b> et en <b>produit</b>.</p>
${pm.ex(`<p>Slide 6 : deux entrées (2 pions et 1 pion), deux sorties (1 pion et 0). On joue le carré : chaque entrée perd un pion (il reste 1 et 0), chaque sortie en gagne un (2 et 1). Peut-on rejouer ? Non : la deuxième entrée est vide, et il faut un pion dans <b>chaque</b> entrée.</p>`)}
${u.petri('regle-6', { caption: 'Slide 6 : peut-on jouer ce carré deux fois de suite ?', ask: 'twice', t: 't', sec: 'pm1-regle', noAxes: true })}
${pm.traps(['« Il reste un pion dans une entrée, donc on peut rejouer » : non, il en faut dans <b>toutes</b> les entrées.', 'Croire qu’un pion « traverse » le carré : s’il y a deux sorties, chacune reçoit un pion ; s’il y a deux entrées, chacune en perd un.', 'Un carré jouable n’est pas obligé d’être joué : la règle dit ce qui est <b>possible</b>, pas ce qui arrive.'])}
${pm.recap(['Jouable = un pion au moins dans chaque entrée.', 'Jouer = −1 par entrée, +1 par sortie.', 'Le total des pions peut monter ou descendre.'])}`,
        notes: [{ p: 6, t: 'Le # de jetons n’est pas forcément conservé' }],
      },
      {
        id: 'pm1-lecture', title: 'Lire le plateau : le centre de vaccination', slides: '7',
        summary: 'Les ronds sont les lieux ou états des patients, les pions sont les patients, les carrés sont les actions ; ce premier plateau autorise pourtant une suite de coups impossible dans le vrai centre.',
        fiche: R`
${pm.why(`<p>Un plateau n’a de sens que si l’on sait ce que chaque élément représente. Et un modèle se juge en le jouant : s’il autorise un coup que la réalité interdit, il est faux, même s’il « ressemble » au centre.</p>`)}
<p>Le centre : <i>une personne attend, entre dans le box, est vaccinée, puis sort du box</i>. Le plateau de la slide 7, avec trois personnes dans la file :</p>
${u.petri('vacc-naif', { sec: 'pm1-lecture', pion: 'un <b>patient</b>. Le rond où il se trouve dit où il en est : dans la file, dans le box, vacciné, sorti.' })}
<div class="def"><b>Ronds</b> : les lieux ou les états des patients. <b>Pions</b> : les patients. <b>Carrés</b> : les transitions, c’est-à-dire les décisions prises, les actions posées (entrer, vacciner, sortir).</div>
${pm.ex(`<p><b>Une suite de coups possible sur le plateau, impossible dans le centre :</b> <code>entrer</code>, <code>entrer</code>. Après ces deux coups, la situation est $[1, 2, 0, 0]$ : deux patients dans l’unique box. Rien dans le plateau ne dit que le box n’a qu’une place. Joue-le ci-dessus pour le constater.</p>
<p>On peut même aller jusqu’à $[0, 3, 0, 0]$ : les trois patients dans le box.</p>`)}
<p>La remarque notée en cours ouvre la suite : <b>les ronds peuvent aussi servir à modéliser des conditions</b>, pas seulement des lieux. C’est ce qui permettra de dire « le box est libre ».</p>
${pm.traps(['Juger un modèle à l’œil : il faut le <b>jouer</b> et chercher un coup interdit dans la réalité.', 'Croire que le rond <code>dans_box</code> « contient au plus un patient » parce que c’est un box : un rond accepte autant de pions qu’on y dépose.'])}
${pm.recap(['Rond = lieu, état (ou condition) ; pion = patient ; carré = action.', 'Ce plateau est infidèle : il autorise <code>entrer, entrer</code>.', 'Un modèle faux se repère par une suite de coups que la réalité refuse.'])}`,
        notes: [{ p: 7, t: 'rond = lieux/états des patients, pions = patients, carrés = transitions/décisions prises/actions posées' }, { p: 7, t: 'Les ronds peuvent aussi servir à modéliser des conditions' }],
      },
      {
        id: 'pm1-correction', title: 'Interdire sans changer la règle : la place ressource', slides: '8',
        summary: 'On ajoute un rond box_libre avec un pion : entrer le consomme, une action plus tard le rend ; la règle du jeu reste la même et il n’y a plus jamais deux patients dans le box.',
        fiche: R`
${pm.why(`<p>On veut interdire <code>entrer, entrer</code>. La tentation est d’ajouter une règle spéciale (« pas plus d’un pion dans ce rond »). Le cours l’interdit : la règle du jeu est unique. On corrige donc <b>le plateau</b>, en y ajoutant ce qui manquait : l’information « le box est libre ».</p>`)}
<div class="def"><b>Place ressource</b> : un rond <code>box_libre</code> qui contient un pion quand le box est libre. <code>entrer</code> a maintenant deux entrées : <code>attente</code> <b>et</b> <code>box_libre</code>. Tant que le pion n’a pas été rendu, <code>entrer</code> n’est plus jouable.</div>
<p>Qui rend le pion ? Deux propositions ont été jouées en cours, et « l’un ou l’autre marche ».</p>
${u.petri('vacc-corrige', { caption: 'Variante rouge : le box est rendu par sortir', ask: 'twice', t: 'entrer', sec: 'pm1-correction', pion: 'dans <code>attente</code>, <code>dans_box</code>, <code>vacciné</code>, <code>sorti</code> : un patient. Dans <code>box_libre</code> : <b>pas une personne</b>, mais le fait que le box soit libre.' })}
${u.petri('vacc-corrige-bleu', { caption: 'Variante bleue : le box est rendu par vacciner', sec: 'pm1-correction', noAxes: true })}
<h4>Les deux marchent, elles ne disent pas la même chose</h4>
${pm.table(['', 'Rendu par <code>sortir</code>', 'Rendu par <code>vacciner</code>'], [
  ['Ce que ça affirme', 'le box reste occupé tant que le patient vacciné n’en est pas sorti', 'dès la piqûre faite, le suivant peut entrer'],
  ['Jamais deux pions dans <code>dans_box</code>', 'oui', 'oui'],
  ['Un patient <code>vacciné</code> et un autre <code>dans_box</code> en même temps', 'impossible', 'possible'],
  ['Situations accessibles (3 personnes)', '10', '16'],
])}
<p>Si « vacciné » veut dire « encore assis dans le box », seule la variante rouge est fidèle. Le choix dépend de ce que les ronds représentent, pas de la technique.</p>
${pm.traps(['Changer la règle (« ce rond est limité à un pion ») au lieu de corriger le plateau.', 'Oublier de <b>rendre</b> le pion : sans flèche de retour, un seul patient entrerait, puis plus jamais personne.', 'Lire le pion de <code>box_libre</code> comme un patient.'])}
${pm.recap(['Une contrainte de capacité = une place ressource avec autant de pions que de places.', 'L’action d’entrée consomme la ressource, une action de sortie la rend.', 'Où l’on rend le pion change ce que le modèle affirme.'])}`,
        notes: [{ p: 8, t: 'L’un ou l’autre marche', fix: 'Les deux empêchent deux patients dans le box, mais la variante bleue autorise un patient vacciné pas encore sorti pendant qu’un autre entre.' }],
      },
      {
        id: 'pm1-choix', title: 'Qui décide du prochain coup ?', slides: '9',
        summary: 'Quand plusieurs carrés sont jouables, rien dans le réseau ne désigne celui qui sera joué : le choix est arbitraire a priori.',
        fiche: R`
${pm.why(`<p>Dans le vrai centre, quelqu’un décide (l’infirmière appelle le suivant, ou finit d’abord la piqûre). Le réseau, lui, ne modélise pas cette décision. Il faut le savoir pour ne pas lui faire dire plus qu’il ne dit.</p>`)}
<p>Situation de départ après un premier <code>entrer</code> :</p>
${u.petri('vacc-naif', { m: [2, 1, 0, 0], ask: 'enabled', sec: 'pm1-choix', pion: 'un patient.' })}
<div class="def"><b>Quels carrés sont jouables ?</b> <code>entrer</code> (il reste des patients en attente) et <code>vacciner</code> (un patient est dans le box).<br><b>Lequel sera joué ?</b> Rien ne le dit : c’est <b>arbitraire a priori</b>. Le réseau décrit tous les déroulements possibles, pas un déroulement.</div>
<p>Clique plusieurs fois sur « Coup au hasard » puis « Recommencer » : tu obtiens des histoires différentes à partir de la même situation. On appelle cela le <b>non-déterminisme</b>.</p>
${pm.ex(`<p>Dans le plateau corrigé (avec <code>box_libre</code>), après un premier <code>entrer</code> la situation est $[2,0,1,0,0]$ : seul <code>vacciner</code> est jouable. La correction a supprimé un choix, pas le non-déterminisme en général : dans la variante bleue, après <code>entrer, vacciner</code>, on peut jouer <code>sortir</code> <b>ou</b> <code>entrer</code>.</p>`)}
${pm.traps(['Supposer un ordre « logique » (de gauche à droite, le premier dessiné) : le réseau n’a pas de priorité.', 'Croire qu’un carré jouable finira forcément par être joué : rien ne l’impose.', 'Confondre « plusieurs carrés jouables » et « joués en même temps » : on joue un carré à la fois.'])}
${pm.recap(['Plusieurs carrés jouables = un choix que le réseau ne tranche pas.', 'Le réseau donne l’ensemble des déroulements possibles.', 'Pour garantir quelque chose, il faut que ce soit vrai dans <b>tous</b> les déroulements (problème 4).'])}`,
        notes: [{ p: 9, t: 'Rien, c’est arbitraire à priori' }],
      },
      {
        id: 'pm1-deuxbox', title: 'Et avec deux box ?', slides: '10',
        summary: 'On garde le même plateau et on met deux pions dans box_libre ; le modèle reste petit, mais il ne dit plus quel patient est dans quel box, et il ne sait rien du temps.',
        fiche: R`
${pm.why(`<p>C’est la question de la direction. Elle montre l’intérêt de la place ressource : passer de un à deux box ne demande pas de redessiner le centre.</p>`)}
<div class="def"><b>Que faut-il changer ?</b> Rien dans le dessin : on met <b>$n$ pions</b> dans <code>box_libre</code>, où $n$ est le nombre de box. Ici $n=2$.</div>
${u.petri('vacc-2box', { ask: 'twice', t: 'entrer', sec: 'pm1-deuxbox', pion: 'dans <code>box_libre</code> : un box libre (2 pions = 2 box libres). Ailleurs : un patient.' })}
<h4>Ce qu’on gagne, ce qu’on perd</h4>
<p>L’autre solution serait de <b>recopier</b> le circuit : <code>entrer2</code>, <code>dans_box2</code>, <code>vacciner2</code>… On saurait alors <b>quel patient est passé dans quel box</b>. Avec les pions, on perd cette information, mais le modèle ne grossit pas, même pour 12 box.</p>
${pm.table(['Question de la direction', 'Le modèle répond ?'], [
  ['Peut-il y avoir trois personnes dans les box en même temps ?', '<b>Oui, il répond : non.</b> $m(\\text{dans\\_box})$ ne dépasse jamais 2.'],
  ['Deux patients peuvent-ils être vaccinés en parallèle ?', 'Oui, il répond : oui.'],
  ['Combien de temps attend-on en moyenne ?', '<b>Il ne répond pas</b> : aucune durée dans le modèle.'],
  ['Le box 2 est-il plus utilisé que le box 1 ?', 'Il ne répond pas : les box ne sont pas distingués.'],
  ['Un deuxième box est-il rentable ?', 'Il ne répond pas : ni coûts, ni cadence d’arrivée.'],
])}
${pm.traps(['Recopier tout le circuit par réflexe : ce n’est utile que si l’on doit distinguer les box.', 'Demander au modèle une durée ou une fréquence : il ne connaît que ce qui est <b>possible</b>.'])}
${pm.recap(['$n$ ressources identiques = $n$ pions dans la même place ressource.', 'Pions anonymes : modèle compact, mais plus d’identité.', 'Un modèle répond à certaines questions et pas à d’autres : le dire fait partie de la réponse.'])}`,
        notes: [{ p: 10, t: 'On peut garder le même schéma qu’avant sauf qu’au lieu de mettre 1 jeton dans « box_libre », on mettrait par exemple n jetons, où n représente le nombre total de box de vaccination différents. Alors certes on perd l’information de quel patient est passé dans quel box (qu’on aurait pu avoir si on avait répliqué le modèle en partant de attente, et en ajoutant entrer2, dans_box2, etc.) mais au moins on n’a pas à faire un modèle très volumineux et complexe à dessiner.' }],
      },
      {
        id: 'pm1-brancardier', title: 'À vous : les déplacements d’un brancardier', slides: '12',
        summary: 'Trois lieux, un seul pion qui dit où est le brancardier, une transition par déplacement possible ; la première transition tirée n’est pas déterminée.',
        fiche: R`
${pm.enonce('Un brancardier circule entre les urgences, l’imagerie et le bloc opératoire. Il se trouve aux urgences. Modélisez ses déplacements. Quelle transition sera tirée en premier ?')}
${pm.todo('<p>Dessine le réseau avant d’ouvrir la solution : combien de ronds, combien de pions, combien de carrés ? Tu peux ensuite le taper dans l’<a class="link" href="#project">Atelier</a> et le comparer à « Le brancardier ».</p>')}
${pm.sol('Voir une solution et la jouer', `
<p><b>Ronds</b> : les trois lieux. <b>Pion</b> : le brancardier, un seul, dans <code>urgences</code>. <b>Carrés</b> : un par déplacement, donc six si l’on peut aller de n’importe quel lieu à n’importe quel autre.</p>
${u.petri('brancardier', { sec: 'pm1-brancardier', pion: 'le <b>brancardier</b>. Le rond marqué dit où il se trouve.' })}
<p><b>Quelle transition sera tirée en premier ?</b> On ne peut pas le dire : <code>u_vers_i</code> et <code>u_vers_b</code> sont toutes deux jouables, et le réseau ne choisit pas. On peut seulement dire que ce sera l’une des deux, puisque les quatre autres partent d’un lieu vide.</p>
<p>Le graphe d’accessibilité n’a que <b>3 situations</b> (le pion dans l’un des trois lieux) et aucune sans suite : le brancardier peut toujours repartir.</p>`)}
${pm.traps(['Mettre un pion par lieu : il n’y a qu’un brancardier, donc un seul pion.', 'Une seule transition « se déplacer » reliée à tout : elle ne dirait pas d’où l’on part ni où l’on arrive.', 'Répondre « il ira à l’imagerie » : rien dans l’énoncé ni dans le réseau ne le dit.'])}
${pm.recap(['Un objet qui est dans un état parmi plusieurs = un pion, un rond par état.', 'Un carré par changement d’état possible.', 'Si l’énoncé impose un sens de tournée, on ne garde que trois carrés.'])}`,
      },
    ],
    cards: [
      ...pm.cards('pm1-regle', [
        ['def', 'Quand un carré (une transition) peut-il être joué ?', 'Quand <b>chacun</b> de ses ronds d’entrée contient au moins un pion.'],
        ['def', 'Que se passe-t-il quand on joue un carré ?', 'Chaque rond d’entrée perd un pion, chaque rond de sortie en gagne un. Les autres ronds ne changent pas.'],
        ['why', 'Pourquoi le nombre de pions n’est-il pas forcément conservé ?', 'Parce qu’un carré consomme un pion par entrée et en produit un par sortie : s’il a 2 entrées et 1 sortie, le total baisse de 1 ; 1 entrée et 2 sorties, il monte de 1.'],
        ['trap', 'Un carré a deux entrées : l’une contient 5 pions, l’autre 0. Est-il jouable ?', 'Non. Peu importe combien il y en a d’un côté : il en faut au moins un dans <b>chaque</b> entrée.'],
        ['read', 'Deux entrées (2 et 1 pions), deux sorties (1 et 0). Situation après le coup ? Peut-on rejouer ?', 'Entrées : 1 et 0. Sorties : 2 et 1. On ne peut pas rejouer : la deuxième entrée est vide.'],
      ]),
      ...pm.cards('pm1-lecture', [
        ['def', 'Dans le plateau du centre de vaccination, que représentent les ronds, les pions, les carrés ?', 'Ronds : lieux ou états des patients. Pions : les patients. Carrés : les actions ou décisions (entrer, vacciner, sortir).'],
        ['why', 'Pourquoi le premier plateau du centre est-il infidèle ?', 'Il autorise <code>entrer, entrer</code> : deux patients dans l’unique box. Rien dans le plateau ne limite le rond <code>dans_box</code>.'],
        ['decide', 'Comment vérifier qu’un modèle est fidèle à la réalité ?', 'Le jouer et chercher une suite de coups possible sur le plateau mais impossible en réalité (et l’inverse : une chose possible en réalité que le plateau interdit).'],
        ['link', 'À quoi un rond peut-il servir, en plus de représenter un lieu ou un état ?', 'À modéliser une <b>condition</b> ou une ressource (« le box est libre »). C’est la clé de la correction du plateau.'],
      ]),
      ...pm.cards('pm1-correction', [
        ['def', 'Qu’est-ce qu’une place ressource ?', 'Un rond dont les pions représentent des ressources disponibles (un box libre). L’action d’entrée en consomme un, une action de sortie le rend.'],
        ['why', 'Pourquoi ajouter <code>box_libre</code> plutôt qu’une règle « un pion maximum dans dans_box » ?', 'Parce que la règle du jeu est unique et doit le rester : on corrige le plateau, pas la règle. L’outil joue alors n’importe quel réseau avec les deux mêmes fonctions.'],
        ['decide', 'Rendre le box par <code>sortir</code> ou par <code>vacciner</code> : comment choisir ?', 'Selon ce qui est vrai dans le centre : si le patient vacciné occupe encore le box, on le rend à <code>sortir</code>. À <code>vacciner</code>, on affirme que le suivant peut entrer dès la piqûre faite.'],
        ['trap', 'Que se passe-t-il si l’on oublie la flèche qui rend le pion à <code>box_libre</code> ?', 'Un seul patient peut entrer ; ensuite <code>box_libre</code> reste vide et <code>entrer</code> n’est plus jamais jouable.'],
        ['read', 'Dans <code>box_libre</code>, que représente le pion ?', 'Pas une personne : le fait que le box soit libre. Tous les pions n’ont pas le même rôle.'],
      ]),
      ...pm.cards('pm1-choix', [
        ['def', 'Qu’appelle-t-on non-déterminisme dans un réseau de Petri ?', 'Le fait que, lorsque plusieurs carrés sont jouables, rien dans le réseau ne dit lequel sera joué.'],
        ['why', 'Pourquoi le réseau ne dit-il pas quel carré sera joué ?', 'Il ne modélise pas la décision (qui appelle le suivant, dans quel ordre). Il décrit tous les déroulements possibles, pas un seul.'],
        ['trap', 'Premier plateau, après un <code>entrer</code>. « C’est vacciner qui sera joué, c’est logique. » Vrai ?', 'Non : <code>entrer</code> et <code>vacciner</code> sont tous deux jouables et le choix est arbitraire a priori.'],
        ['link', 'Quelle conséquence a le non-déterminisme quand on veut garantir une propriété ?', 'Il faut qu’elle soit vraie dans <b>tous</b> les déroulements, donc dans toutes les situations accessibles : c’est le rôle du graphe d’accessibilité (problème 4).'],
      ]),
      ...pm.cards('pm1-deuxbox', [
        ['decide', 'Le centre passe de 1 à 2 box. Que changer dans le modèle ?', 'Mettre 2 pions dans <code>box_libre</code>. Avec $n$ box : $n$ pions. Le dessin ne change pas.'],
        ['why', 'Pourquoi préférer $n$ pions à $n$ copies du circuit ?', 'Le modèle reste petit et lisible quel que soit $n$. On n’accepte les copies que si l’on doit savoir quel patient est dans quel box.'],
        ['trap', 'Avec deux pions dans <code>box_libre</code>, sait-on quel box un patient occupe ?', 'Non : les pions sont anonymes. On sait combien de box sont occupés, pas lesquels.'],
        ['read', 'Cite une question à laquelle le modèle à deux box répond et une à laquelle il ne répond pas.', 'Il répond : « peut-il y avoir trois personnes dans les box ? » (non). Il ne répond pas : « combien de temps attend-on ? » (pas de temps dans le modèle).'],
      ]),
      ...pm.cards('pm1-brancardier', [
        ['decide', 'Comment modéliser un brancardier qui circule entre trois lieux ?', 'Trois ronds (les lieux), un seul pion (le brancardier, là où il se trouve), une transition par déplacement possible : six si tous les trajets sont permis.'],
        ['why', 'Pourquoi une transition par trajet et pas une seule transition « se déplacer » ?', 'Une transition a des entrées et des sorties fixes : elle doit dire d’où part le pion et où il arrive.'],
        ['trap', 'Le brancardier est aux urgences. Quelle transition sera tirée en premier ?', 'On ne peut pas le savoir : <code>u_vers_i</code> et <code>u_vers_b</code> sont jouables, le choix n’est pas déterminé.'],
        ['read', 'Combien de situations accessibles dans le réseau du brancardier ?', 'Trois : le pion dans <code>urgences</code>, dans <code>imagerie</code> ou dans <code>bloc</code>. Aucune n’est sans suite.'],
      ]),
    ],
    quiz: [
      ...pm.quiz('pm1-regle', [
        ['Un carré a trois ronds d’entrée contenant 2, 1 et 0 pions. Que peut-on dire ?', ['Il n’est pas jouable', 'Il est jouable une fois', 'Il est jouable, et retirera 2 pions du premier rond', 'Il est jouable si l’on déplace un pion vers le rond vide'], 0, 'Il faut au moins un pion dans <b>chaque</b> entrée. Un rond vide suffit à bloquer le carré.'],
        ['Un carré a 1 entrée et 3 sorties. Avant le coup, le plateau compte 4 pions. Après ?', ['6', '4', '7', '3'], 0, 'Il consomme 1 pion et en produit 3 : $4-1+3=6$.'],
        ['Un rond est à la fois entrée et sortie du même carré et contient 1 pion. Après le coup, il contient…', ['1 pion', '0 pion', '2 pions', 'le carré n’est pas jouable'], 0, 'Il perd un pion (entrée) et en regagne un (sortie) : inchangé. C’est le cas de $p_3$ pour $t_3$ dans le problème 2.'],
      ]),
      ...pm.quiz('pm1-lecture', [
        ['Dans le premier plateau (3 patients en attente), quelle situation est accessible mais absurde pour le centre ?', ['$[1,2,0,0]$ : deux patients dans le box', '$[3,0,0,0]$ : tout le monde attend', '$[0,0,0,3]$ : tout le monde est sorti', '$[2,0,1,0]$ : un patient vacciné'], 0, 'Après <code>entrer, entrer</code>, deux pions sont dans <code>dans_box</code> alors qu’il n’y a qu’un box.'],
        ['Que veut dire « ce modèle est infidèle » ?', ['Il autorise un déroulement impossible dans la réalité (ou en interdit un possible)', 'Il contient trop de ronds', 'Il ne mentionne pas le nom des patients', 'Il n’est pas dessiné de gauche à droite'], 0, 'On juge un modèle sur les comportements qu’il autorise, pas sur son apparence.'],
      ]),
      ...pm.quiz('pm1-correction', [
        ['Plateau corrigé (box rendu par <code>sortir</code>), situation de départ $[3,1,0,0,0]$. Après <code>entrer</code>, quels carrés sont jouables ?', ['<code>vacciner</code> seulement', '<code>entrer</code> et <code>vacciner</code>', '<code>entrer</code> seulement', 'aucun'], 0, 'La situation est $[2,0,1,0,0]$ : <code>box_libre</code> est vide, donc <code>entrer</code> est bloqué ; <code>dans_box</code> a un pion, donc <code>vacciner</code> est jouable.'],
        ['Dans la variante où le box est rendu par <code>vacciner</code>, laquelle de ces situations devient possible ?', ['Un patient vacciné pas encore sorti et un autre dans le box', 'Deux patients dans le box', 'Un patient sorti sans avoir été vacciné', 'Deux pions dans <code>box_libre</code>'], 0, 'Le pion revient dès la piqûre : un deuxième patient peut entrer alors que le premier est encore dans l’état <code>vacciné</code>. Il n’y a jamais deux pions dans <code>dans_box</code>.'],
        ['Pourquoi dit-on que la correction se fait « sans changer la règle » ?', ['On ajoute un rond et des flèches, la règle de tir reste exactement la même', 'On ajoute une priorité entre carrés', 'On limite par convention un rond à un pion', 'On interdit de jouer deux fois le même carré'], 0, 'La place ressource fait porter la contrainte par le plateau. L’outil continue à jouer avec la même règle.'],
      ]),
      ...pm.quiz('pm1-choix', [
        ['Plateau corrigé, variante bleue (box rendu par <code>vacciner</code>), après <code>entrer, vacciner</code>. Que peut-on jouer ?', ['<code>entrer</code> ou <code>sortir</code>, au choix', '<code>sortir</code> seulement', '<code>entrer</code> seulement', '<code>vacciner</code> seulement'], 0, 'Situation $[2,1,0,1,0]$ : <code>box_libre</code> a retrouvé son pion et il reste des patients (<code>entrer</code>), un patient est vacciné (<code>sortir</code>).'],
        ['« Le réseau est non déterministe » signifie :', ['Dans certaines situations plusieurs carrés sont jouables et rien ne désigne le prochain', 'Les pions se déplacent au hasard entre les ronds', 'La règle de tir change d’un coup à l’autre', 'On ne peut pas calculer la situation après un coup'], 0, 'Le résultat d’un coup donné est parfaitement déterminé ; c’est le <b>choix</b> du coup qui ne l’est pas.'],
      ]),
      ...pm.quiz('pm1-deuxbox', [
        ['La direction veut savoir si le box 2 sert autant que le box 1. Quel modèle faut-il ?', ['Un circuit recopié par box (<code>entrer1</code>, <code>entrer2</code>…)', 'Deux pions dans <code>box_libre</code>', 'Un pion de plus dans <code>attente</code>', 'Aucun réseau de Petri ne peut distinguer les box'], 0, 'Avec des pions anonymes on ne distingue pas les box. Il faut un rond (et des transitions) par box. Et même ainsi, « autant » demanderait des fréquences que le modèle n’a pas.'],
        ['Avec 2 pions dans <code>box_libre</code> et 3 patients, combien de patients au maximum dans <code>dans_box</code> ?', ['2', '3', '1', 'Cela dépend de l’ordre des coups'], 0, 'Chaque <code>entrer</code> consomme un pion de <code>box_libre</code> : au plus 2 avant qu’un <code>sortir</code> n’en rende un.'],
      ]),
      ...pm.quiz('pm1-brancardier', [
        ['On ajoute un deuxième brancardier, lui aussi aux urgences. Que changer ?', ['Mettre 2 pions dans <code>urgences</code>', 'Doubler tous les ronds et tous les carrés', 'Ajouter une place ressource', 'Ajouter un carré « deuxième brancardier »'], 0, 'Si l’on n’a pas besoin de savoir lequel est où, un pion de plus suffit (comme les ambulances du problème 3, modèle 2).'],
        ['Dans le réseau à six transitions, le brancardier est au bloc. Quelles transitions sont jouables ?', ['<code>b_vers_u</code> et <code>b_vers_i</code>', 'Les six', '<code>u_vers_b</code> et <code>i_vers_b</code>', 'Aucune'], 0, 'Seules les transitions dont l’entrée est <code>bloc</code> ont un pion en entrée.'],
      ]),
    ],
    gens: {
      'pm1-regle': [g.enabled(['regle-B', 'regle-C', 'regle-D', 'regle-6']), g.after(['regle-B', 'regle-D', 'regle-6'])],
      'pm1-lecture': [g.after(['vacc-naif']), g.enabled(['vacc-naif'])],
      'pm1-correction': [g.enabled(['vacc-corrige', 'vacc-corrige-bleu']), g.after(['vacc-corrige', 'vacc-corrige-bleu'])],
      'pm1-choix': [g.enabled(VACC)],
      'pm1-deuxbox': [g.enabled(['vacc-2box']), g.after(['vacc-2box'])],
      'pm1-brancardier': [g.enabled(['brancardier']), g.count(['brancardier'])],
    },
  });
})();
