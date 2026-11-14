// Exercices des séances 1 et 2 (extraits du cours du Prof. van der Aalst). Un exercice par notion : énoncé, schéma, solution repliée.
// Les énoncés ne sont pas accompagnés d'un corrigé officiel : les solutions de modélisation (1.3 à 1.6, 2.1, 2.2) sont des propositions,
// vérifiées en les jouant et par leur graphe d'accessibilité (verif/test_petri.mjs, verif/graphes.mjs).
(function () {
  const R = String.raw, u = COURSE.u, pm = COURSE.pm, g = pm.gens;
  const atelier = 'Tape ton réseau dans l’<a class="link" href="#project">Atelier</a>, puis compare-le à la solution proposée.';
  const prop = '<p class="muted small">Solution proposée (l’énoncé n’a pas de corrigé officiel) : d’autres modèles corrects existent. Compare les propriétés, pas le dessin.</p>';

  // ================================================================== Séance 1
  COURSE.add({
    id: 'pmx1', kind: 'Séance d’exercices 1',
    title: 'Exercices, séance 1 : définir, analyser, modéliser',
    short: 'Exercices 1',
    source: 'Exercices - Seance1.pdf · exercices 1.1 à 1.6',
    pitch: 'Dessiner un réseau à partir de (P, T, F, m0), l’analyser complètement (presets, marquages accessibles, terminaux, choix), puis modéliser quatre énoncés : chaîne de production, dentiste, grenouilles, ferrys.',
    sections: [
      {
        id: 'pmx1-11', title: 'Exercice 1.1 : dessiner un réseau donné par (P, T, F, m0)', slides: 'ex. 1.1',
        summary: 'On place les ronds et les carrés, puis on trace une flèche par couple de F : le réseau se révèle être deux cycles qui partagent la place p4.',
        fiche: R`
${pm.enonce(R`Dessinez le réseau de Petri défini par $P=\{p_1,\dots,p_7\}$, $T=\{t_1,\dots,t_6\}$,<br>$F=\{(p_1,t_1),(p_2,t_2),(p_3,t_3),(p_4,t_1),(p_4,t_4),(p_5,t_5),(p_6,t_6),(p_7,t_4),(t_1,p_2),(t_2,p_3),(t_3,p_1),(t_3,p_4),(t_4,p_5),(t_5,p_6),(t_6,p_4),(t_6,p_7)\}$<br>et $m_0=[p_1,p_4,p_7]$.`)}
${pm.todo(`<p>Méthode : (1) écris pour chaque transition son preset et son postset ; (2) suis les chaînes $p\to t\to p$ pour trouver les cycles ; (3) dessine les cycles, puis les flèches restantes. ${atelier}</p>`)}
${pm.sol('Presets et postsets', pm.table(['', '$\\bullet t$', '$t\\bullet$'], [['$t_1$', '$\\{p_1,p_4\\}$', '$\\{p_2\\}$'], ['$t_2$', '$\\{p_2\\}$', '$\\{p_3\\}$'], ['$t_3$', '$\\{p_3\\}$', '$\\{p_1,p_4\\}$'], ['$t_4$', '$\\{p_4,p_7\\}$', '$\\{p_5\\}$'], ['$t_5$', '$\\{p_5\\}$', '$\\{p_6\\}$'], ['$t_6$', '$\\{p_6\\}$', '$\\{p_4,p_7\\}$']]))}
${pm.sol('Le dessin, à jouer', R`
${u.petri('ex11', { sec: 'pmx1-11', pion: 'un jeton abstrait. $m_0=[p_1,p_4,p_7]$ : un pion dans chacune de ces trois places.' })}
<p>Deux cycles symétriques : à gauche $t_1\to p_2\to t_2\to p_3\to t_3$, à droite $t_4\to p_5\to t_5\to p_6\to t_6$. Ils partagent $p_4$ : $t_1$ et $t_4$ la prennent, $t_3$ et $t_6$ la rendent. $p_4$ joue le rôle d’une <b>place ressource</b> : un seul des deux cycles tourne à la fois.</p>
<p>Graphe d’accessibilité : 5 marquages, aucun sans suite. En $m_0$, $t_1$ et $t_4$ sont toutes deux activables (choix).</p>`)}
${pm.traps(['Tracer une flèche dans le mauvais sens : $(p_4,t_1)$ va de $p_4$ vers $t_1$.', 'Lire $m_0=[p_1,p_4,p_7]$ comme un vecteur de trois nombres : c’est la liste des places marquées.', 'Chercher une disposition « officielle » : seule la structure compte.'])}
${pm.recap(['Un couple = une flèche, dans l’ordre du couple.', 'Commencer par les presets et postsets aide à voir les cycles.', '$p_4$ partagée = exclusion mutuelle entre les deux cycles.'])}`,
      },
      {
        id: 'pmx1-12', title: 'Exercice 1.2 : analyser un réseau de A à Z', slides: 'ex. 1.2',
        summary: 'À partir de la figure : le quadruplet, les presets et postsets, les transitions activables, les 7 marquages accessibles, le marquage terminal [0,0,0,2], les choix, et l’effet de la suppression d’une place.',
        fiche: R`
${pm.enonce('Soit le réseau de Petri défini par la figure 1. (1) Définissez ce réseau à l’aide du quadruplet $(P,T,F,m_0)$. (2) Donnez le preset et le postset de chaque transition. (3) Quelles sont les transitions activables au marquage $m_0$ ? (4) Déterminez tous les marquages accessibles. (5) Y a-t-il des marquages terminaux ? (6) Y a-t-il un marquage accessible pour lequel un choix non déterministe doit être posé ? (7) Le nombre de marquages accessibles augmente-t-il ou diminue-t-il si l’on supprime la place $p_1$ et ses arcs, puis si l’on supprime la place $p_3$ et ses arcs ?')}
${u.petri('ex12', { ask: 'enabled', sec: 'pmx1-12', pion: 'un jeton abstrait.', axes: [['Deux flèches entre $p_4$ et $t_3$', 'une dans chaque sens : $t_3$ prend un pion à $p_4$ et le lui rend.']] })}
${pm.todo('<p>Réponds aux sept questions sur papier avant d’ouvrir les solutions. Pour la question 4, applique la marche à suivre du problème 4.</p>')}
${pm.sol('1 et 2. Quadruplet, presets, postsets', R`
<p>$P=\{p_1,p_2,p_3,p_4\}$, $T=\{t_1,t_2,t_3\}$, $m_0=[p_1,p_3,p_4,p_4]$, soit le vecteur $[1,0,1,2]$.</p>
<p>$F=\{(p_1,t_1),(p_4,t_1),(t_1,p_2),(p_2,t_2),(t_2,p_3),(t_2,p_4),(p_3,t_3),(p_4,t_3),(t_3,p_4)\}$</p>
${pm.table(['', '$\\bullet t$', '$t\\bullet$'], [['$t_1$', '$\\{p_1,p_4\\}$', '$\\{p_2\\}$'], ['$t_2$', '$\\{p_2\\}$', '$\\{p_3,p_4\\}$'], ['$t_3$', '$\\{p_3,p_4\\}$', '$\\{p_4\\}$']])}`)}
${pm.sol('3. Transitions activables en m0', '<p>$t_1$ ($p_1$ et $p_4$ sont marquées) et $t_3$ ($p_3$ et $p_4$ sont marquées). $t_2$ ne l’est pas : $p_2$ est vide.</p>')}
${pm.sol('4, 5 et 6. Marquages accessibles, terminaux, choix', R`
${pm.table(['', '$(p_1,p_2,p_3,p_4)$', 'tirs possibles'], [['$M_0$', '$[1,0,1,2]$', '$t_1\\to M_1$, $t_3\\to M_2$'], ['$M_1$', '$[0,1,1,1]$', '$t_2\\to M_3$, $t_3\\to M_4$'], ['$M_2$', '$[1,0,0,2]$', '$t_1\\to M_4$'], ['$M_3$', '$[0,0,2,2]$', '$t_3\\to M_5$'], ['$M_4$', '$[0,1,0,1]$', '$t_2\\to M_5$'], ['$M_5$', '$[0,0,1,2]$', '$t_3\\to M_6$'], ['$M_6$', '$[0,0,0,2]$', 'aucun']])}
<p><b>7 marquages accessibles.</b> Un seul marquage terminal : $M_6=[0,0,0,2]$. Tout déroulement y aboutit (le graphe n’a pas de cycle).</p>
<p><b>Choix non déterministe</b> : en $M_0$ ($t_1$ ou $t_3$) et en $M_1$ ($t_2$ ou $t_3$).</p>
<p>Ouvre « Graphe d’accessibilité » sous le plateau pour voir ce tableau dessiné.</p>`)}
${pm.sol('7. Supprimer p1, puis p3', R`
<p><b>Sans $p_1$</b> : $t_1$ n’a plus que $p_4$ en entrée. Le cycle $t_1,t_2$ rend son pion à $p_4$ et ajoute chaque fois un pion dans $p_3$, que rien n’oblige à vider. Le réseau devient <b>non borné</b> : le nombre de marquages <b>augmente</b> (il devient infini).</p>
${u.petri('ex12-sans-p1', { ask: 'bounded', sec: 'pmx1-12', noAxes: true })}
<p><b>Sans $p_3$</b> : $t_3$ ne fait plus que prendre et rendre un pion à $p_4$, et $t_2$ ne produit plus que dans $p_4$. Il reste <b>3 marquages</b> : $[1,0,2]$, $[0,1,1]$, $[0,0,2]$ sur $(p_1,p_2,p_4)$. Le nombre <b>diminue</b>. Aucun n’est terminal : $t_3$ reste jouable indéfiniment.</p>
${u.petri('ex12-sans-p3', { ask: 'count', sec: 'pmx1-12', noAxes: true })}
<p>Morale : retirer une place d’<b>entrée</b> enlève une contrainte (plus de comportements) ; ici retirer $p_3$ enlève surtout un compteur (moins de situations distinctes).</p>`)}
${pm.traps(['Oublier le deuxième pion de $p_4$ dans $m_0$.', 'Mettre $p_4$ seulement dans $\\bullet t_3$ : elle est aussi dans $t_3\\bullet$.', 'Question 7 : répondre par intuition (« moins de places donc moins de marquages »). Supprimer $p_1$ donne une infinité de marquages.'])}
${pm.recap(['7 marquages, un terminal $[0,0,0,2]$, deux marquages avec choix.', 'Sans $p_1$ : non borné. Sans $p_3$ : 3 marquages.', 'Supprimer une place d’entrée relâche une contrainte.'])}`,
      },
      {
        id: 'pmx1-13', title: 'Exercice 1.3 : la chaîne de production', slides: 'ex. 1.3',
        summary: 'Une séquence meuler, fraiser, puis un choix après le test (livrer ou jeter) ; une place ressource impose qu’un seul objet soit en production à la fois.',
        fiche: R`
${pm.enonce('Sur une chaîne de production, un objet est usiné par deux techniques successives : le meulage (événement m) et le fraisage (événement f). Après l’étape de fraisage, l’objet est testé. Si le résultat du test est positif, l’objet est livré au client et la production de l’objet suivant peut commencer. Si le résultat du test est négatif, l’objet est jeté et la production recommence à nouveau. Les objets peuvent être dans les états suivants : en attente, meulé, fraisé, à livrer, livré, jeté. Modélisez ce processus en considérant que deux objets se trouvent dans l’état en attente.')}
${pm.todo(`<p>Repère : les six états donnés sont les places ; « successives » = séquence ; « si positif… si négatif » = XOR-split ; « la production de l’objet suivant peut commencer » = un seul objet à la fois. ${atelier}</p>`)}
${pm.sol('Voir une solution et la jouer', R`${prop}
${u.petri('ex13', { sec: 'pmx1-13', pion: 'dans les six places d’état : un <b>objet</b> ; dans <code>chaîne_libre</code> : la chaîne est disponible pour l’objet suivant.' })}
<ul><li><b>Séquence</b> : en_attente → <code>meuler</code> → meulé → <code>fraiser</code> → fraisé.</li>
<li><b>XOR-split</b> sur la place <code>fraisé</code> : <code>test_positif</code> (vers à_livrer) ou <code>test_négatif</code> (vers jeté).</li>
<li><b>Un objet à la fois</b> : <code>chaîne_libre</code> (1 pion) est prise par <code>meuler</code> et rendue par <code>livrer</code> ou par <code>test_négatif</code>.</li></ul>
<p>15 marquages accessibles, 3 sans suite : deux objets livrés, un livré et un jeté, deux jetés.</p>
<p><b>Lecture de « la production recommence »</b> : ici, un objet jeté est perdu et on passe au suivant de la file. Si l’on comprend que le <b>même</b> objet est refait, <code>test_négatif</code> doit aussi remettre un pion dans <code>en_attente</code> ; mais alors l’état « jeté » accumule des pions sans limite et le réseau n’est plus borné. Dis toujours quelle lecture tu as choisie.</p>`)}
${pm.traps(['Faire du test une transition à deux sorties : l’objet serait livré <b>et</b> jeté.', 'Oublier la contrainte « l’objet suivant peut commencer » : sans place ressource, les deux objets sont usinés en même temps.', 'Créer d’autres états que ceux imposés par l’énoncé.'])}
${pm.recap(['États de l’énoncé = places ; événements = transitions.', 'Résultat d’un test = XOR-split sur la place « testé ».', 'Une interprétation de l’énoncé se dit explicitement.'])}`,
      },
      {
        id: 'pmx1-14', title: 'Exercice 1.4 : le cabinet dentaire', slides: 'ex. 1.4',
        summary: 'Quatre acteurs (patient, dentiste, infirmière, secrétaire), chacun avec son cycle d’états ; les quatre événements sont des transitions partagées qui les synchronisent.',
        fiche: R`
${pm.enonce('Le patient a cinq états : à la maison (p_maison), en salle d’attente (p_attente), en consultation (en_consultation), consultation terminée (p_fini), parti (p_parti). Quatre événements : le patient entre dans le cabinet (entrer), la consultation commence (commencer), le traitement est documenté dans le logiciel (documenter), la consultation se termine (terminer). Le dentiste : d_libre, d_occupé, d_docu. L’infirmière : inf_libre, inf_occupée ; elle est impliquée dans commencer (elle est alors occupée) et documenter (elle devient libre). La secrétaire est soit à la réception (s_réception), soit elle aide le dentiste à documenter (s_docu) ; pour la documentation, deux événements sont pertinents : documenter et terminer. Lorsqu’un patient entre, la secrétaire doit être à la réception. Au départ : trois patients à la maison, dentiste et infirmière libres, secrétaire à la réception.')}
${pm.todo(`<p>Fais un tableau : une ligne par événement, une colonne par acteur, et note « état avant → état après ». Chaque case remplie donne une flèche entrante et une flèche sortante. ${atelier}</p>`)}
${pm.sol('Le tableau des événements', pm.table(['Événement', 'Patient', 'Dentiste', 'Infirmière', 'Secrétaire'], [
  ['<code>entrer</code>', 'p_maison → p_attente', '', '', 's_réception (exigée, inchangée)'],
  ['<code>commencer</code>', 'p_attente → en_consultation', 'd_libre → d_occupé', 'inf_libre → inf_occupée', ''],
  ['<code>documenter</code>', 'en_consultation → p_fini', 'd_occupé → d_docu', 'inf_occupée → inf_libre', 's_réception → s_docu'],
  ['<code>terminer</code>', 'p_fini → p_parti', 'd_docu → d_libre', '', 's_docu → s_réception']]))}
${pm.sol('Voir une solution et la jouer', R`${prop}
${u.petri('ex14', { sec: 'pmx1-14', pion: 'rangée du milieu : un <b>patient</b>. Les autres pions : l’<b>état d’un membre du personnel</b> (un pion par personne).', axes: [['Double flèche <code>entrer</code> ↔ <code>s_réception</code>', 'la secrétaire doit être à la réception, et elle y reste.']] })}
<p>22 marquages accessibles, un seul sans suite : les trois patients partis, tout le personnel revenu à son état de départ. Pendant qu’elle documente, la secrétaire n’est pas à la réception : aucun patient ne peut entrer.</p>`)}
${pm.traps(['Consommer <code>s_réception</code> dans <code>entrer</code> sans la rendre : la secrétaire disparaîtrait de la réception.', 'Donner à la secrétaire un troisième état : l’énoncé en donne deux.', 'Oublier qu’un seul pion représente chaque membre du personnel.'])}
${pm.recap(['Un acteur = un cycle d’états, un pion.', 'Un événement = une transition qui relie les cycles de tous les acteurs concernés.', 'Le tableau événement × acteur donne toutes les flèches.'])}`,
      },
      {
        id: 'pmx1-15', title: 'Exercice 1.5 : les grenouilles et la princesse', slides: 'ex. 1.5',
        summary: 'Un cycle (pont, ruisseau, bord, pont) avec un choix entre deux bords ; « une grenouille sur trois » se compte avec un arc de poids 3, ou exactement avec un compteur cyclique à trois places.',
        fiche: R`
${pm.enonce('À partir d’un pont, des grenouilles sautent dans un ruisseau, nagent vers un des deux bords du ruisseau choisi aléatoirement, remontent sur le pont et recommencent à tour de rôle. Une princesse ramasse une grenouille sur trois qui a sauté dans le ruisseau et l’embrasse pour la remettre sur le pont. Modélisez ce conte, en considérant que 3 grenouilles se trouvent sur le pont initialement.')}
${pm.todo(`<p>Commence par les grenouilles sans la princesse (un cycle avec un XOR-split). Puis demande-toi comment compter « une sur trois ». ${atelier}</p>`)}
${pm.sol('Solution 1 : un compteur et un arc de poids 3', R`${prop}
${u.petri('ex15', { ask: 'bounded', sec: 'pmx1-15', pion: 'dans <code>pont</code>, <code>ruisseau</code>, <code>bord_g</code>, <code>bord_d</code> : une <b>grenouille</b> ; dans <code>sauts</code> : un saut compté.' })}
<p>Chaque <code>sauter</code> ajoute un pion dans <code>sauts</code>. <code>embrasser</code> prend <b>3</b> pions de <code>sauts</code> et une grenouille du ruisseau, et la remet sur le pont.</p>
<p><b>Limite, visible dans le simulateur</b> : rien n’oblige la princesse à agir. Si elle n’embrasse jamais, <code>sauts</code> grandit sans fin : ce réseau n’est <b>pas borné</b>. Il dit « au plus une sur trois », pas « exactement ».</p>`)}
${pm.sol('Solution 2 : exactement une sur trois', R`
<p>Un compteur cyclique à trois places <code>c0</code>, <code>c1</code>, <code>c2</code> (un seul pion) et trois transitions de saut : les deux premiers sauts envoient la grenouille dans le ruisseau, le troisième l’envoie à la princesse.</p>
${u.petri('ex15-strict', { sec: 'pmx1-15', pion: 'dans <code>c0</code>, <code>c1</code>, <code>c2</code> : le <b>compteur</b> (combien de sauts depuis le dernier baiser). Ailleurs : une grenouille.' })}
<p>93 marquages accessibles, aucun sans suite, réseau borné. Le prix : trois transitions de saut au lieu d’une.</p>`)}
${pm.traps(['« Choisi aléatoirement » ne demande rien de spécial : un XOR-split suffit, le réseau ne choisit pas.', 'Mettre le poids 3 sur la flèche <code>ruisseau → embrasser</code> : la princesse ramasserait trois grenouilles.', 'Ne pas vérifier le caractère borné de son modèle.'])}
${pm.recap(['Compter = une place compteur, lue avec un arc pondéré.', 'Le réseau à compteur simple est non borné.', '« Exactement une sur trois » demande un compteur cyclique.'])}`,
      },
      {
        id: 'pmx1-16', title: 'Exercice 1.6 : les ferrys CityCat', slides: 'ex. 1.6',
        summary: 'Un arrêt de capacité un = une place ressource par arrêt ; aux arrêts B et C il faut retenir le sens (aller ou retour), puisque le demi-tour n’est permis qu’en A et D.',
        fiche: R`
${pm.enonce('Le système Brisbane CityCat transporte des personnes sur le fleuve à l’aide de ferrys. Quatre arrêts A, B, C et D. Un ferry suit le chemin aller (A, B, C, D) puis le chemin retour (D, C, B, A). On considère cinq ferrys, initialement dans un port X. Selon la charge de travail, les ferrys sont mis en service (de X à A) ou retirés du service (de A à X). Mouvements possibles : X,A,B,C,D,C,B,A,X ; X,A,B,C,D,C,B,A,B,C,D,C,B,A,X. Un ferry peut seulement faire demi-tour aux arrêts A et D : un mouvement X,A,B,A,X n’est pas permis. Les arrêts n’ont une capacité que d’un ferry. Le fleuve est assez large pour accueillir plusieurs ferrys entre deux arrêts.')}
${pm.todo(`<p>Trois difficultés : (1) la capacité d’un ferry par arrêt ; (2) pas de limite entre deux arrêts ; (3) interdire le demi-tour en B et C. Pour la troisième : que faut-il savoir d’un ferry qui est à l’arrêt B ? ${atelier}</p>`)}
${pm.sol('Les idées de la solution', R`${prop}
<ul><li><b>Capacité 1 par arrêt</b> : une place ressource <code>A_libre</code>, <code>B_libre</code>, <code>C_libre</code>, <code>D_libre</code> (1 pion chacune). Arriver à un arrêt la consomme, le quitter la rend.</li>
<li><b>Entre deux arrêts</b> : des places sans limite, une par tronçon <b>et par sens</b> : <code>AB</code>, <code>BC</code>, <code>CD</code>, <code>DC</code>, <code>CB</code>, <code>BA</code>.</li>
<li><b>Pas de demi-tour en B et C</b> : on dédouble l’arrêt selon le sens, <code>B_aller</code> / <code>B_retour</code> et <code>C_aller</code> / <code>C_retour</code>. Les deux partagent la même ressource <code>B_libre</code> (un seul ferry à l’arrêt, quel que soit le sens). De <code>B_aller</code> on ne peut partir que vers <code>BC</code>.</li>
<li><b>Demi-tour en A et D</b> : une seule place <code>A</code> et une seule place <code>D</code>. De <code>A</code>, on repart vers B ou on est retiré (XOR-split).</li>
<li><b>Port</b> : <code>port_X</code> avec 5 pions ; <code>mise_en_service</code> : X → A ; <code>retrait</code> : A → X.</li></ul>
${pm.table(['Transition', 'Consomme', 'Produit'], [
  ['<code>mise_en_service</code>', 'port_X, A_libre', 'A'], ['<code>retrait</code>', 'A', 'port_X, A_libre'], ['<code>quitter_A</code>', 'A', 'AB, A_libre'], ['<code>arriver_B_aller</code>', 'AB, B_libre', 'B_aller'], ['<code>quitter_B_aller</code>', 'B_aller', 'BC, B_libre'],
  ['<code>arriver_C_aller</code>', 'BC, C_libre', 'C_aller'], ['<code>quitter_C_aller</code>', 'C_aller', 'CD, C_libre'], ['<code>arriver_D</code>', 'CD, D_libre', 'D'], ['<code>quitter_D</code>', 'D', 'DC, D_libre'],
  ['<code>arriver_C_retour</code>', 'DC, C_libre', 'C_retour'], ['<code>quitter_C_retour</code>', 'C_retour', 'CB, C_libre'], ['<code>arriver_B_retour</code>', 'CB, B_libre', 'B_retour'], ['<code>quitter_B_retour</code>', 'B_retour', 'BA, B_libre'], ['<code>arriver_A</code>', 'BA, A_libre', 'A']])}`)}
${pm.sol('Le réseau complet, à jouer (16 places, 14 transitions, dessin automatique)', R`
${u.petri('ex16', { sec: 'pmx1-16', pion: 'dans <code>port_X</code>, les arrêts et les tronçons : un <b>ferry</b> ; dans <code>…_libre</code> : l’arrêt est libre.' })}
<p>Avec 5 ferrys : 3178 marquages accessibles, aucun sans suite. Invariants : $m(\text{A})+m(\text{A\_libre})=1$, $m(\text{B\_aller})+m(\text{B\_retour})+m(\text{B\_libre})=1$, de même pour C et D.</p>
<p><b>Limite de ce modèle</b> : un ferry tout juste mis en service peut être retiré aussitôt (X, A, X), ce que la liste des mouvements ne mentionne pas. Pour l’interdire, il faudrait distinguer « à A, vient d’entrer en service » et « à A, de retour ».</p>`)}
${pm.traps(['Une seule place par arrêt B : on ne sait plus d’où vient le ferry, le demi-tour devient possible.', 'Une place ressource pour les tronçons : le fleuve accueille plusieurs ferrys.', 'Une ressource par sens à l’arrêt B : deux ferrys pourraient s’y trouver.'])}
${pm.recap(['Capacité 1 = une place ressource par arrêt.', 'Quand la suite dépend du passé (le sens), on dédouble la place.', 'Deux places peuvent partager une même ressource.'])}`,
      },
    ],
    cards: [
      ...pm.cards('pmx1-11', [
        ['decide', 'Quelle méthode pour dessiner un réseau donné par $(P,T,F,m_0)$ ?', 'Écrire le preset et le postset de chaque transition, suivre les chaînes pour repérer les cycles, dessiner les cycles, ajouter les flèches restantes, puis placer les pions de $m_0$.'],
        ['why', 'Pourquoi commencer par les presets et postsets ?', 'Ils regroupent les flèches par transition : on voit tout de suite ce que chaque carré consomme et produit, et les cycles apparaissent.'],
        ['read', 'Dans l’exercice 1.1, quel rôle joue $p_4$ ?', `Elle est partagée par les deux cycles : $t_1$ et $t_4$ la prennent, $t_3$ et $t_6$ la rendent. Un seul cycle tourne à la fois (place ressource).${pm.fig('ex11')}`],
        ['trap', '$m_0=[p_1,p_4,p_7]$ : est-ce un vecteur de trois nombres ?', 'Non, c’est la liste des places qui portent un pion. Le vecteur sur $(p_1,\\dots,p_7)$ est $[1,0,0,1,0,0,1]$.'],
      ]),
      ...pm.cards('pmx1-12', [
        ['read', `Exercice 1.2 : donne $\\bullet t_3$ et $t_3\\bullet$.${pm.fig('ex12')}`, '$\\bullet t_3=\\{p_3,p_4\\}$ et $t_3\\bullet=\\{p_4\\}$ : $t_3$ prend un pion à $p_3$, et prend puis rend un pion à $p_4$.'],
        ['read', 'Exercice 1.2 : combien de marquages accessibles, et lesquels sont terminaux ?', '7 marquages ; un seul terminal, $[0,0,0,2]$.'],
        ['why', 'Exercice 1.2 : pourquoi le réseau devient-il non borné quand on supprime $p_1$ ?', '$t_1$ n’est plus limitée par $p_1$ : le cycle $t_1,t_2$ rend son pion à $p_4$ et dépose chaque fois un pion dans $p_3$, qui grandit sans fin.'],
        ['trap', '« Moins de places, donc moins de marquages. » Vrai ?', 'Non. Supprimer une place d’entrée enlève une contrainte : il peut y avoir plus de marquages, voire une infinité (suppression de $p_1$).'],
        ['def', 'Qu’est-ce qu’un choix non déterministe dans un marquage ?', 'Au moins deux transitions sont activables dans ce marquage : rien ne dit laquelle sera tirée. Dans 1.2 : en $[1,0,1,2]$ et en $[0,1,1,1]$.'],
      ]),
      ...pm.cards('pmx1-13', [
        ['decide', 'Comment modéliser « si le test est positif… si négatif… » ?', 'Un XOR-split : la place <code>fraisé</code> a deux transitions de sortie, <code>test_positif</code> et <code>test_négatif</code>.'],
        ['decide', 'Comment imposer qu’un seul objet soit en production à la fois ?', 'Une place ressource <code>chaîne_libre</code> à un pion, prise par <code>meuler</code>, rendue quand l’objet est livré ou jeté.'],
        ['why', 'Pourquoi dire explicitement comment on lit « la production recommence » ?', 'L’énoncé est ambigu (objet suivant, ou même objet refait). Les deux lectures donnent des réseaux différents ; l’une est non bornée.'],
        ['trap', 'Le test peut-il être une transition avec deux places de sortie ?', 'Non : ce serait un AND-split, l’objet serait à la fois à livrer et jeté.'],
      ]),
      ...pm.cards('pmx1-14', [
        ['decide', 'Quelle méthode pour le cabinet dentaire ?', 'Un tableau événement × acteur avec « état avant → état après ». Chaque case donne une flèche entrante et une sortante de la transition.'],
        ['why', 'Pourquoi <code>entrer</code> a-t-elle une flèche dans chaque sens avec <code>s_réception</code> ?', 'La secrétaire doit être à la réception pour qu’un patient entre, mais elle y reste : la place est exigée puis rendue.'],
        ['read', 'Cabinet dentaire : pourquoi aucun patient ne peut-il entrer pendant la documentation ?', 'La secrétaire est alors en <code>s_docu</code> : <code>s_réception</code> est vide et <code>entrer</code> n’est pas activable.'],
        ['trap', 'Combien de pions pour le dentiste, qui a trois états ?', 'Un seul : le pion indique son état courant.'],
      ]),
      ...pm.cards('pmx1-15', [
        ['decide', 'Comment compter « une grenouille sur trois » ?', 'Une place compteur incrémentée à chaque saut et un arc de poids 3 vers <code>embrasser</code> ; ou, pour l’exactitude, un compteur cyclique à trois places.'],
        ['why', 'Pourquoi le modèle à compteur simple n’est-il pas borné ?', 'Rien n’oblige <code>embrasser</code> à être jouée : les sauts s’accumulent indéfiniment dans <code>sauts</code>.'],
        ['trap', '« Choisi aléatoirement » demande-t-il des probabilités ?', 'Non : un XOR-split suffit. Le réseau dit que les deux bords sont possibles.'],
        ['link', 'Quelle notion du problème 3 sert à compter trois sauts d’un coup ?', 'L’arc pondéré : $w(\\text{sauts},\\text{embrasser})=3$.'],
      ]),
      ...pm.cards('pmx1-16', [
        ['decide', 'Comment limiter chaque arrêt à un ferry ?', 'Une place ressource par arrêt (<code>A_libre</code>…), consommée à l’arrivée, rendue au départ.'],
        ['decide', 'Comment interdire le demi-tour à l’arrêt B ?', 'Dédoubler la place : <code>B_aller</code> et <code>B_retour</code>. De <code>B_aller</code>, la seule sortie mène vers C.'],
        ['why', 'Pourquoi <code>B_aller</code> et <code>B_retour</code> partagent-elles <code>B_libre</code> ?', 'La capacité d’un ferry vaut pour l’arrêt entier, quel que soit le sens.'],
        ['trap', 'Faut-il une ressource pour les tronçons entre deux arrêts ?', 'Non : le fleuve accueille plusieurs ferrys entre deux arrêts.'],
      ]),
    ],
    quiz: [
      ...pm.quiz('pmx1-11', [
        [`${pm.fig('ex11')}Quelles transitions sont activables dans la situation dessinée ?`, ['$t_1$ et $t_4$', '$t_1$ seulement', '$t_1$, $t_3$, $t_4$ et $t_6$', 'aucune'], 0, '$t_1$ a besoin de $p_1$ et $p_4$ ; $t_4$ de $p_4$ et $p_7$. Les autres ont une entrée vide.'],
        [`${pm.fig('ex11', [0, 1, 0, 0, 0, 0, 1])}Après $t_1$, la transition $t_4$ est-elle encore activable ?`, ['Non : $p_4$ est vide', 'Oui', 'Oui, car $p_7$ est marquée', 'Seulement après $t_2$'], 0, '$t_1$ a pris le pion de $p_4$ ; il ne reviendra qu’avec $t_3$.'],
      ]),
      ...pm.quiz('pmx1-12', [
        [`${pm.fig('ex12', [0, 1, 1, 1])}Situation $[0,1,1,1]$. Quelles transitions sont activables ?`, ['$t_2$ et $t_3$', '$t_2$ seulement', '$t_1$ et $t_2$', '$t_1$, $t_2$ et $t_3$'], 0, '$t_1$ exige $p_1$ (vide). $t_2$ exige $p_2$. $t_3$ exige $p_3$ et $p_4$.'],
        [`${pm.fig('ex12', [0, 0, 0, 2])}Pourquoi cette situation est-elle terminale ?`, ['Chaque transition a une entrée vide', 'Parce que $p_4$ contient 2 pions', 'Parce que tous les pions sont dans la même place', 'Elle ne l’est pas : $t_3$ est activable'], 0, '$t_1$ manque de $p_1$, $t_2$ de $p_2$, $t_3$ de $p_3$.'],
        ['Dans 1.2, on supprime $p_3$ et ses arcs. Le nombre de marquages accessibles :', ['diminue (3)', 'augmente (infini)', 'reste 7', 'tombe à 1'], 0, '$[1,0,2]$, $[0,1,1]$, $[0,0,2]$.'],
      ]),
      ...pm.quiz('pmx1-13', [
        [`${pm.fig('ex13', [1, 0, 0, 1, 0, 0, 0])}Un objet est fraisé. Que peut-on jouer ?`, ['<code>test_positif</code> ou <code>test_négatif</code>', '<code>meuler</code>', '<code>test_positif</code> seulement', '<code>meuler</code> ou un test'], 0, 'Le deuxième objet attend : <code>chaîne_libre</code> est vide.'],
        ['Combien de marquages sans suite dans la solution proposée (deux objets) ?', ['3', '1', '2', '4'], 0, 'Deux livrés, un livré et un jeté, deux jetés.'],
      ]),
      ...pm.quiz('pmx1-14', [
        ['Dans le cabinet dentaire, le preset de <code>commencer</code> est :', ['$\\{\\text{p\\_attente},\\ \\text{d\\_libre},\\ \\text{inf\\_libre}\\}$', '$\\{\\text{p\\_attente}\\}$', '$\\{\\text{p\\_attente},\\ \\text{s\\_réception}\\}$', '$\\{\\text{d\\_libre},\\ \\text{inf\\_libre}\\}$'], 0, 'Un patient qui attend, le dentiste libre et l’infirmière libre.'],
        ['Deux patients sont en salle d’attente. Peuvent-ils être en consultation en même temps ?', ['Non : il n’y a qu’un pion dans le cycle du dentiste', 'Oui', 'Oui, si l’infirmière est libre', 'Seulement après <code>documenter</code>'], 0, '<code>commencer</code> consomme <code>d_libre</code>, qui ne revient qu’avec <code>terminer</code>.'],
      ]),
      ...pm.quiz('pmx1-15', [
        ['Dans la solution à compteur, <code>embrasser</code> est activable quand :', ['$m(\\text{sauts})\\ge 3$ et $m(\\text{ruisseau})\\ge 1$', '$m(\\text{sauts})\\ge 1$', '$m(\\text{ruisseau})\\ge 3$', '$m(\\text{pont})=0$'], 0, 'Arc de poids 3 sur <code>sauts</code>, de poids 1 sur <code>ruisseau</code>.'],
        ['Pourquoi préférer le compteur cyclique si l’on veut « exactement une sur trois » ?', ['Il force la troisième grenouille à passer par la princesse et garde le réseau borné', 'Il a moins de transitions', 'Il supprime le choix du bord', 'Il évite les arcs'], 0, 'Le troisième saut est une transition distincte qui envoie la grenouille à la princesse.'],
      ]),
      ...pm.quiz('pmx1-16', [
        ['Un ferry est en <code>B_aller</code>. Où peut-il aller ensuite ?', ['Vers le tronçon BC seulement', 'Vers BC ou vers BA', 'Vers BA seulement', 'Vers le port'], 0, 'Seule <code>quitter_B_aller</code> sort de cette place, vers <code>BC</code>.'],
        ['Deux ferrys arrivent de sens opposés à l’arrêt C. Que se passe-t-il ?', ['Un seul peut s’arrêter : ils se disputent <code>C_libre</code>', 'Les deux s’arrêtent', 'Aucun ne peut s’arrêter', 'Le réseau se bloque définitivement'], 0, 'L’autre attend sur son tronçon que <code>C_libre</code> soit rendue.'],
      ]),
    ],
    gens: {
      'pmx1-11': [g.enabled(['ex11']), g.after(['ex11']), g.preset(['ex11'])],
      'pmx1-12': [g.enabled(['ex12']), g.after(['ex12']), g.preset(['ex12']), g.count(['ex12', 'ex12-sans-p3'])],
      'pmx1-13': [g.enabled(['ex13']), g.after(['ex13'])],
      'pmx1-14': [g.enabled(['ex14']), g.after(['ex14'])],
      'pmx1-15': [g.enabled(['ex15']), g.after(['ex15'])],
      'pmx1-16': [g.enabled(['accueil-borne', 'reveil'])],
    },
  });

  // ================================================================== Séance 2
  COURSE.add({
    id: 'pmx2', kind: 'Séance d’exercices 2',
    title: 'Exercices, séance 2 : ressources, bornes, graphe, dépliage',
    short: 'Exercices 2',
    source: 'Exercices - Seance2.pdf · exercices 2.1 à 2.5',
    pitch: 'Assembler un vélo avec des machines partagées, organiser les cours d’un institut, décider si un réseau est borné, trouver un interblocage dans un algorithme de communication, déplier une place de capacité 2.',
    sections: [
      {
        id: 'pmx2-21', title: 'Exercice 2.1 : la production d’un vélo', slides: 'ex. 2.1',
        summary: 'Trois assemblages successifs, chacun consommant deux pièces (arcs de poids 2) et occupant une machine pendant sa durée ; les machines A et B sont des places ressources à 3 et 7 pions.',
        fiche: R`
${pm.enonce('Plusieurs éléments du vélo (le cadre, les pédales, les roues, les freins) sont achetés chez différents fournisseurs. La production se déroule en trois étapes. Une machine de type B assemble le cadre et deux pédales pour aboutir à un produit semi-fini. Ensuite, une machine de type A assemble le produit semi-fini à deux roues pour aboutir à un nouveau produit semi-fini. Ce dernier est finalement assemblé à deux freins par une machine B pour obtenir le vélo final. L’entreprise possède trois machines de type A et sept machines de type B. Chaque machine a une capacité de un. Modélisez ce processus en considérant qu’initialement, l’entreprise possède quatre versions de chaque élément du vélo.')}
${pm.todo(`<p>Trois ingrédients déjà vus : les arcs pondérés (deux pédales, deux roues, deux freins), la place ressource (les machines) et l’action qui dure (début, en cours, fin). ${atelier}</p>`)}
${pm.sol('Voir une solution et la jouer', R`${prop}
${u.petri('ex21', { ask: 'enabled', m: [2, 0, 0, 1, 2, 1, 0, 4, 0, 0, 7, 2], sec: 'pmx2-21', pion: 'dans <code>cadre</code>, <code>pédales</code>, <code>roues</code>, <code>freins</code> : une <b>pièce</b> ; dans <code>en_étape_i</code>, <code>semi_fini_i</code>, <code>vélo</code> : un <b>produit</b> ; dans <code>A_libre</code>, <code>B_libre</code> : une <b>machine libre</b>.', axes: [['Chiffre 2 sur une flèche', 'l’étape prend <b>deux</b> pièces d’un coup.']] })}
<ul><li><b>Chaque étape dure</b> : <code>début_i</code>, place <code>en_étape_i</code>, <code>fin_i</code>. La machine est prise au début, rendue à la fin.</li>
<li><b>Machines</b> : <code>B_libre</code> (7 pions) sert aux étapes 1 et 3 ; <code>A_libre</code> (3 pions) à l’étape 2.</li>
<li><b>Pièces</b> : poids 2 pour les pédales, les roues et les freins ; poids 1 pour le cadre.</li></ul>
<p>28 marquages accessibles. Le jeu se termine avec <b>2 vélos</b> et 2 cadres inutilisés : quatre pédales ne font que deux vélos. Les machines ne sont jamais le facteur limitant ici (au plus 2 produits en cours).</p>`)}
${pm.traps(['Une seule transition par étape : la machine serait prise et rendue dans le même tir, donc jamais occupée.', 'Deux places ressources B distinctes pour les étapes 1 et 3 : ce sont les <b>mêmes</b> sept machines.', 'Oublier le poids 2 : un vélo n’aurait qu’une pédale.'])}
${pm.recap(['Plusieurs pièces identiques = un arc pondéré.', 'Machine de capacité un = un pion de ressource par machine.', 'Une ressource peut être partagée par deux étapes.'])}`,
      },
      {
        id: 'pmx2-22', title: 'Exercice 2.2 : l’institut de langues', slides: 'ex. 2.2',
        summary: 'On modélise d’abord l’étudiant (dehors, inscrit, a choisi un cours), puis le cours (ouvert, en cours, terminé) ; une place de places libres limite le cours, et l’état du cours conditionne les transitions des étudiants.',
        fiche: R`
${pm.enonce('Un institut de langues vivantes propose trois cours : Anglais, Allemand et Français. Avant de pouvoir rejoindre un cours, un étudiant doit s’inscrire à l’institut. Les étudiants inscrits peuvent choisir l’un des trois cours. Chaque cours a une durée qui lui est propre et un nombre limité d’étudiants : maximum 20 pour l’Anglais, 10 pour l’Allemand et le Français. Si un cours est ouvert, les étudiants peuvent le choisir. Dès qu’un cours a démarré, les étudiants ne l’ayant pas choisi ne peuvent plus y prendre part. Un étudiant ne peut pas abandonner un cours. Dès qu’un étudiant a terminé un cours, il a le loisir d’en suivre un autre (sans devoir se réinscrire et avec la possibilité de suivre le même cours), ou bien de se désinscrire et de quitter l’institut. Conseil : modélisez d’abord les étudiants puis les cours.')}
${pm.todo(`<p>Suis le conseil : (1) le cycle de l’étudiant ; (2) le cycle d’un cours ; (3) les liens : quand un étudiant peut-il choisir ? quand peut-il sortir du cours ? ${atelier}</p>`)}
${pm.sol('Voir une solution pour un cours (l’Anglais) et la jouer', R`${prop}
${u.petri('ex22', { sec: 'pmx2-22', pion: 'rangée du haut : un <b>étudiant</b> ; <code>places_libres</code> : une place disponible dans le cours ; rangée du bas : l’<b>état du cours</b> (un seul pion).', axes: [['Double flèche avec <code>ouvert</code> ou <code>terminé</code>', 'l’état du cours est une <b>condition</b> : exigé, puis rendu.'], ['Poids 20', '<code>rouvrir</code> exige que les 20 places soient revenues : tous les étudiants ont quitté le cours.']] })}
<ul><li><b>Étudiant</b> : dehors → <code>s_inscrire</code> → inscrit → <code>choisir</code> → a_choisi → <code>quitter_le_cours</code> → inscrit ; <code>se_désinscrire</code> : inscrit → dehors.</li>
<li><b>Cours</b> : ouvert → <code>démarrer</code> → en_cours → <code>terminer</code> → terminé → <code>rouvrir</code> → ouvert.</li>
<li><b>Choisir seulement si le cours est ouvert</b> : <code>ouvert</code> est entrée et sortie de <code>choisir</code>. Une fois démarré, le pion n’y est plus : plus personne ne peut choisir.</li>
<li><b>Maximum 20</b> : <code>places_libres</code> (20 pions), une prise par <code>choisir</code>, rendue par <code>quitter_le_cours</code>.</li>
<li><b>Pas d’abandon</b> : la seule sortie de <code>a_choisi</code> exige que le cours soit <code>terminé</code>.</li></ul>
<p><b>Le modèle complet</b> : trois copies de la partie cours (Anglais 20, Allemand 10, Français 10), toutes reliées à la <b>même</b> place <code>inscrit</code>. C’est un XOR-split sur <code>inscrit</code> : choisir l’un des trois cours, ou se désinscrire.</p>
<p>Avec trois étudiants et un seul cours : 30 marquages accessibles, aucun sans suite.</p>`)}
${pm.traps(['Consommer <code>ouvert</code> dans <code>choisir</code> : un seul étudiant pourrait choisir.', 'Faire sortir les étudiants avec la transition <code>terminer</code> du cours : une transition ne peut pas vider une place « de tous ses pions ». Chaque étudiant sort par son propre tir.', 'Rouvrir le cours alors que des étudiants ne sont pas sortis : d’où le poids 20.'])}
${pm.recap(['Modéliser chaque acteur à part, puis relier.', 'Un état qui conditionne sans être modifié = double flèche.', '« Tous sont revenus » = un arc dont le poids est la capacité.'])}`,
      },
      {
        id: 'pmx2-23', title: 'Exercice 2.3 : ce réseau est-il borné ?', slides: 'ex. 2.3',
        summary: 'Un réseau est k-borné si aucune place ne dépasse k pions dans aucun marquage accessible ; ici le cycle de gauche dépose un pion dans p3 à chaque tour : le réseau n’est pas borné.',
        fiche: R`
${pm.enonce('Un indicateur servant à l’analyse d’un réseau de Petri est son caractère borné ou non. Un réseau de Petri est $k$-borné si et seulement s’il n’y a aucune place $p\\in P$ contenant plus de $k$ jetons à chaque marquage accessible. Déterminez, en vous aidant du graphe d’accessibilité, le caractère borné du réseau de la figure 1.')}
${u.petri('ex23', { ask: 'bounded', sec: 'pmx2-23', pion: 'un jeton abstrait.' })}
<div class="def"><b>$k$-borné</b> : dans tout marquage accessible, chaque place contient au plus $k$ pions. <b>Borné</b> : $k$-borné pour un certain $k$. Un réseau 1-borné est aussi appelé <b>sauf</b>.</div>
${pm.todo('<p>Commence le graphe d’accessibilité depuis $[0,1,0,1,0]$ sur $(p_1,p_2,p_3,p_4,p_5)$. Arrête-toi dès qu’un marquage en contient un précédent du même chemin.</p>')}
${pm.sol('Corrigé', R`
<p>$M_0=[0,1,0,1,0]$. $t_1$ : $[1,0,0,1,0]$. Puis $t_2$ : $[0,1,\mathbf 1,1,0]$.</p>
<p>Ce marquage est $M_0$ <b>avec un pion de plus dans $p_3$</b>. On peut donc rejouer $t_1,t_2$ autant de fois qu’on veut : $[0,1,2,1,0]$, $[0,1,3,1,0]$… $p_3$ n’a pas de borne.</p>
<p><b>Le réseau n’est pas borné</b> (il n’est $k$-borné pour aucun $k$) ; son graphe d’accessibilité est infini.</p>
<p>Explication par la structure : le cycle de gauche ($p_2,t_1,p_1,t_2$) tourne librement et <b>produit</b> dans $p_3$ à chaque tour. Le cycle de droite <b>consomme</b> dans $p_3$ (par $t_3$), mais rien ne l’oblige à suivre le rythme.</p>`)}
${pm.ex(`<p>Les autres places, elles, sont bornées : $m(p_1)+m(p_2)=1$ et $m(p_4)+m(p_5)=1$ dans tout marquage accessible. Un réseau est non borné dès qu’<b>une</b> place l’est.</p>`, 'Remarque')}
${pm.traps(['Dire « borné » parce que $t_3$ vide $p_3$ : il suffit qu’un déroulement fasse grandir la place.', 'Continuer le graphe à la main sans voir la répétition.', 'Confondre borné et sans blocage : ce réseau ne se bloque jamais et n’est pas borné.'])}
${pm.recap(['$k$-borné : jamais plus de $k$ pions dans une place.', 'Signe du non-borné : un marquage qui en contient strictement un précédent du même chemin.', 'Ici : $[0,1,1,1,0]$ contient $[0,1,0,1,0]$.'])}`,
      },
      {
        id: 'pmx2-24', title: 'Exercice 2.4 : l’algorithme de communication', slides: 'ex. 2.4',
        summary: 'Le graphe d’accessibilité a 14 marquages et un marquage terminal : si les deux côtés envoient en même temps, chacun attend une réponse que l’autre ne peut plus donner.',
        fiche: R`
${pm.enonce('Dessinez le graphe d’accessibilité du réseau de Petri défini à la figure 2 (un algorithme de communication). Ce réseau peut-il atteindre un marquage terminal ?')}
${u.petri('ex24', { ask: 'dead', sec: 'pmx2-24', pion: 'dans $p_1$ et $p_8$ : le côté gauche, le côté droit, <b>au repos</b>. Dans $p_5$, $p_6$ : un <b>message</b> en route ; dans $p_4$, $p_7$ : un <b>accusé de réception</b> ; les autres : un côté qui attend.' })}
<h4>Comprendre le réseau avant de calculer</h4>
<ul><li><b>Send_Left</b> : la gauche envoie un message ($p_5$) et attend ($p_2$).</li><li><b>Respond_Right</b> : la droite, au repos ($p_8$), reçoit le message, renvoie un accusé ($p_4$) et passe en $p_9$.</li><li><b>Finish_Left</b> : la gauche reçoit l’accusé et revient au repos. <b>Done_Right</b> : la droite revient au repos.</li><li>Le tout est symétrique dans l’autre sens.</li></ul>
${pm.todo('<p>Construis le graphe depuis $M_0$ ($p_1$ et $p_8$ marquées). Indice : que se passe-t-il si <code>Send_Left</code> et <code>Send_Right</code> sont jouées toutes les deux ?</p>')}
${pm.sol('Corrigé', R`
<p><b>14 marquages accessibles</b> ; ouvre le graphe sous le plateau.</p>
<p><b>Oui, un marquage terminal est accessible</b> : après <code>Send_Left</code> puis <code>Send_Right</code> (ou l’inverse), les places marquées sont $p_2,p_5,p_6,p_{10}$.</p>
<ul><li><code>Respond_Right</code> exige $p_5$ <b>et</b> $p_8$ : mais la droite n’est plus au repos ($p_8$ vide).</li><li><code>Respond_Left</code> exige $p_6$ <b>et</b> $p_1$ : la gauche n’est plus au repos.</li><li><code>Finish_Left</code> et <code>Finish_Right</code> attendent des accusés qui ne viendront pas.</li></ul>
<p>Chaque côté attend la réponse de l’autre : c’est un <b>interblocage</b>, de même nature que celui de l’échographe. Dans les 13 autres marquages, le protocole peut toujours continuer, et il revient à $M_0$ si un seul côté envoie à la fois.</p>`)}
${pm.traps(['Tester seulement « la gauche envoie, la droite répond » : le problème n’apparaît que si les deux envoient.', 'Oublier que <code>Respond</code> a deux entrées (le message <b>et</b> le repos du destinataire).', 'Répondre « non » parce que le réseau a des cycles : un réseau cyclique peut aussi avoir un marquage terminal.'])}
${pm.recap(['14 marquages, 1 terminal : $p_2,p_5,p_6,p_{10}$ marquées.', 'Deux envois simultanés = interblocage.', 'Le graphe d’accessibilité trouve les blocages que les essais manquent.'])}`,
      },
      {
        id: 'pmx2-25', title: 'Exercice 2.5 : déplier une place de capacité k', slides: 'ex. 2.5',
        summary: 'Une place de capacité k est remplacée par k + 1 places de capacité 1 qui disent combien de jetons elle contenait ; chaque transition qui la touche est recopiée pour chaque niveau possible.',
        fiche: R`
${pm.enonce('Tout réseau de Petri ayant des places de capacité finie $k>1$ peut être transformé en un réseau où ces places sont de capacité $k=1$. Une technique dite de « dépliage » consiste à remplacer chaque place de capacité finie $k>1$ par $k+1$ places de capacité $k=1$. Ce dépliage des places entraîne un dépliage des transitions. Dépliez le réseau de la figure 3, qui caractérise l’impression d’étiquettes dans un hôpital. Conseil : utilisez les nouvelles places pour modéliser le nombre de jetons présents dans les places de capacité $k>1$.')}
${u.petri('ex25', { sec: 'pmx2-25', pion: 'dans <code>vide</code> : une <b>étiquette à imprimer</b> ; <code>en_impression</code> ; <code>imprimé</code> ; dans <code>libre</code> : une <b>imprimante libre</b> (deux imprimantes).' })}
${pm.why(`<p>Certains outils d’analyse ne traitent que des réseaux où une place contient 0 ou 1 jeton. Le dépliage montre qu’on ne perd rien : un <b>nombre</b> de jetons peut toujours être remplacé par un <b>état</b>.</p>`)}
<div class="def"><b>L’idée (le conseil de l’énoncé)</b> : la place <code>libre</code>, de capacité 2, peut contenir 0, 1 ou 2 jetons. On la remplace par <b>trois</b> places <code>libre=0</code>, <code>libre=1</code>, <code>libre=2</code>. Une seule est marquée à la fois : elle indique <b>combien</b> de jetons l’ancienne place contenait.</div>
<p><b>Les transitions se déplient aussi.</b> <code>démarre</code> retirait un jeton de <code>libre</code> : elle devient « passer de 2 à 1 » et « passer de 1 à 0 », soit deux transitions. <code>termine</code> en ajoutait un : « de 0 à 1 » et « de 1 à 2 ».</p>
${pm.todo('<p>Dessine d’abord le dépliage de la seule place <code>libre</code>. Combien de places ? Combien de transitions ?</p>')}
${pm.sol('Dépliage de la place libre', R`
${u.petri('ex25-libre', { sec: 'pmx2-25', pion: 'dans <code>libre=j</code> : un seul pion, qui dit « il y a $j$ imprimantes libres ». Les autres places ne sont pas encore dépliées.', axes: [['<code>démarre[2]</code>, <code>démarre[1]</code>', 'les deux copies de <code>démarre</code> : le nombre entre crochets est le nombre d’imprimantes libres <b>avant</b> le tir.']] })}
<p>Même comportement que l’original : 9 marquages accessibles dans les deux cas, un seul sans suite. Et <code>libre=0</code>, <code>libre=1</code>, <code>libre=2</code> ne contiennent jamais plus d’un pion.</p>`)}
${pm.sol('Dépliage complet (toutes les places)', R`
<p>On applique la même idée à <code>vide</code> (capacité 3 : 4 places), <code>en_impression</code> (2 : 3 places) et <code>imprimé</code> (3 : 4 places). Total : $4+3+3+4=14$ places, chacune avec au plus un pion.</p>
<p>Chaque transition est recopiée pour chaque combinaison de niveaux des places qu’elle touche. Par exemple <code>démarre</code> avec « 3 vides, 2 libres, 0 en impression » : elle prend les pions de <code>vide=3</code>, <code>libre=2</code>, <code>en_impression=0</code> et marque <code>vide=2</code>, <code>libre=1</code>, <code>en_impression=1</code>.</p>
<p>Comme $m(\text{libre})+m(\text{en\_impression})=2$ dans l’original, seules les combinaisons cohérentes servent : 6 copies de <code>démarre</code> et 6 de <code>termine</code>.</p>
${u.petri('ex25-deplie', { sec: 'pmx2-25', noAxes: true })}
<p>Le simulateur confirme : 9 marquages accessibles, comme l’original, et jamais plus d’un pion par place. (Le dessin est automatique et chargé : c’est le prix du dépliage.)</p>`)}
${pm.traps(['Remplacer une place de capacité $k$ par $k$ places : il en faut $k+1$, car « 0 jeton » est aussi un état.', 'Oublier de déplier les transitions.', 'Marquer plusieurs places <code>libre=j</code> à la fois : une seule, celle du niveau courant.'])}
${pm.recap(['Capacité $k$ → $k+1$ places, une seule marquée.', 'Une transition par changement de niveau possible.', 'Le réseau déplié a le même graphe d’accessibilité, mais il est beaucoup plus gros.'])}`,
      },
    ],
    cards: [
      ...pm.cards('pmx2-21', [
        ['decide', 'Comment modéliser « assemble le cadre et deux pédales » ?', 'Une transition avec une flèche de poids 1 depuis <code>cadre</code> et une flèche de poids 2 depuis <code>pédales</code>.'],
        ['decide', 'Comment modéliser sept machines B de capacité un, utilisées à deux étapes ?', 'Une seule place <code>B_libre</code> à 7 pions, prise au début des étapes 1 et 3, rendue à leur fin.'],
        ['why', 'Pourquoi couper chaque étape en début et fin ?', 'Pour que la machine soit occupée pendant l’assemblage. Avec une seule transition, elle serait prise et rendue dans le même tir.'],
        ['read', 'Avec quatre exemplaires de chaque élément, combien de vélos en fin de jeu ?', '2 : chaque vélo demande deux pédales, deux roues, deux freins. Il reste 2 cadres.'],
      ]),
      ...pm.cards('pmx2-22', [
        ['decide', 'Comment dire « on ne peut choisir un cours que s’il est ouvert » ?', 'La place <code>ouvert</code> est entrée et sortie de <code>choisir</code> : exigée puis rendue.'],
        ['decide', 'Comment limiter un cours à 20 étudiants ?', 'Une place <code>places_libres</code> à 20 pions : <code>choisir</code> en prend une, <code>quitter_le_cours</code> la rend.'],
        ['why', 'Pourquoi <code>rouvrir</code> a-t-elle un arc de poids 20 avec <code>places_libres</code> ?', 'Pour n’être jouable que lorsque tous les étudiants ont quitté le cours : les 20 places sont revenues.'],
        ['trap', 'La transition <code>terminer</code> du cours peut-elle faire sortir tous les étudiants ?', 'Non : une transition déplace un nombre fixe de pions. Chaque étudiant sort par son propre tir, conditionné par l’état <code>terminé</code>.'],
      ]),
      ...pm.cards('pmx2-23', [
        ['def', 'Quand un réseau est-il $k$-borné ?', 'Quand, dans tout marquage accessible, aucune place ne contient plus de $k$ jetons.'],
        ['read', `Le réseau de l’exercice 2.3 est-il borné ?${pm.fig('ex23')}`, 'Non. Après $t_1,t_2$ on retrouve le marquage initial avec un pion de plus dans $p_3$ : on peut recommencer sans fin.'],
        ['why', 'Pourquoi suffit-il de trouver un marquage qui en contient un précédent ?', 'La suite de coups qui mène de l’un à l’autre reste jouable (il y a au moins autant de pions partout) : elle se répète et fait grandir une place indéfiniment.'],
        ['trap', 'Un réseau qui ne se bloque jamais est-il forcément borné ?', 'Non : ce sont deux propriétés indépendantes. Le réseau 2.3 ne se bloque pas et n’est pas borné.'],
      ]),
      ...pm.cards('pmx2-24', [
        ['read', 'Exercice 2.4 : combien de marquages, et y a-t-il un marquage terminal ?', '14 marquages ; oui, un terminal : $p_2$, $p_5$, $p_6$, $p_{10}$ marquées (les deux côtés ont envoyé).'],
        ['why', 'Pourquoi le protocole se bloque-t-il quand les deux côtés envoient ?', 'Répondre exige que le destinataire soit au repos ($p_1$ ou $p_8$). Or chacun attend son accusé : personne ne peut répondre.'],
        ['link', 'À quel exemple du cours ce blocage ressemble-t-il ?', 'À l’échographe et l’infirmière : chacun tient quelque chose et attend ce que l’autre doit donner.'],
        ['trap', 'Un réseau qui a des cycles peut-il avoir un marquage terminal ?', 'Oui. Les cycles existent dans certains déroulements, le blocage dans d’autres.'],
      ]),
      ...pm.cards('pmx2-25', [
        ['def', 'En quoi consiste le dépliage d’une place de capacité $k$ ?', 'La remplacer par $k+1$ places de capacité 1 (« 0 jeton », « 1 jeton », …, « $k$ jetons »), dont une seule est marquée, et recopier les transitions pour chaque changement de niveau.'],
        ['why', 'Pourquoi $k+1$ places et non $k$ ?', 'Parce que la place peut contenir de 0 à $k$ jetons : cela fait $k+1$ états, « vide » compris.'],
        ['read', `Dépliage de <code>libre</code> (capacité 2) : combien de copies de <code>démarre</code> ?${pm.fig('ex25-libre')}`, 'Deux : de 2 à 1 imprimante libre, et de 1 à 0.'],
        ['trap', 'Le réseau déplié a-t-il un comportement différent ?', 'Non : même graphe d’accessibilité (9 marquages). Il est seulement plus gros.'],
      ]),
    ],
    quiz: [
      ...pm.quiz('pmx2-21', [
        [`${pm.fig('ex21')}Au départ, quelles transitions sont activables ?`, ['<code>début_1</code> seulement', '<code>début_1</code>, <code>début_2</code> et <code>début_3</code>', '<code>début_1</code> et <code>fin_1</code>', 'toutes'], 0, 'Les étapes 2 et 3 ont besoin d’un produit semi-fini, qui n’existe pas encore.'],
        ['Il reste 1 pédale et 2 cadres. <code>début_1</code> est :', ['non activable : il faut 2 pédales', 'activable', 'activable si une machine B est libre', 'activable deux fois'], 0, '$m(\\text{pédales})\\ge w(\\text{pédales},\\text{début\\_1})=2$ n’est pas vérifié.'],
      ]),
      ...pm.quiz('pmx2-22', [
        [`${pm.fig('ex22', [1, 1, 1, 19, 0, 1, 0])}Le cours a démarré. L’étudiant inscrit peut-il encore le choisir ?`, ['Non : <code>ouvert</code> est vide', 'Oui', 'Oui, il reste 19 places', 'Oui, après <code>terminer</code>'], 0, '<code>choisir</code> exige le pion de <code>ouvert</code>, parti avec <code>démarrer</code>.'],
        ['Dans le modèle complet à trois cours, la place <code>inscrit</code> a combien de transitions de sortie ?', ['4 : trois <code>choisir</code> et <code>se_désinscrire</code>', '1', '3', '2'], 0, 'C’est un XOR-split : un des trois cours, ou quitter l’institut.'],
      ]),
      ...pm.quiz('pmx2-23', [
        [`${pm.fig('ex23', [0, 1, 2, 0, 1])}Quelles transitions sont activables ?`, ['$t_1$ et $t_3$', '$t_1$ seulement', '$t_3$ seulement', '$t_1$, $t_3$ et $t_4$'], 0, '$t_1$ exige $p_2$ ; $t_3$ exige $p_3$ et $p_5$ ; $t_4$ exige $p_4$ (vide).'],
        ['Comment rendre le réseau 2.3 borné ?', ['Ajouter une place ressource que $t_2$ consomme et que $t_3$ rend', 'Retirer le pion de $p_4$', 'Ajouter un pion dans $p_3$', 'Supprimer $t_4$'], 0, 'Elle limite le nombre de pions en attente dans $p_3$, comme <code>chaises_libres</code> pour l’accueil.'],
      ]),
      ...pm.quiz('pmx2-24', [
        [`${pm.fig('ex24', [0, 1, 0, 0, 1, 0, 0, 1, 0, 0])}La gauche a envoyé. Quelles transitions sont activables ?`, ['<code>Respond_Right</code> et <code>Send_Right</code>', '<code>Respond_Right</code> seulement', '<code>Finish_Left</code>', '<code>Send_Right</code> seulement'], 0, 'La droite est au repos : elle peut répondre, ou envoyer à son tour (et provoquer le blocage).'],
        ['Quelle modification simple empêcherait le blocage ?', ['Empêcher les deux côtés d’envoyer en même temps, par une place ressource « canal libre »', 'Ajouter un pion dans $p_1$', 'Supprimer les accusés de réception', 'Ajouter un pion dans $p_5$'], 0, 'Un jeton unique pris par <code>Send</code> et rendu à la fin de l’échange impose un seul échange à la fois.'],
      ]),
      ...pm.quiz('pmx2-25', [
        ['Une place de capacité 3 est dépliée en combien de places ?', ['4', '3', '2', '6'], 0, '$k+1$ : les états 0, 1, 2 et 3 jetons.'],
        [`${pm.fig('ex25-libre', [2, 1, 0, 0, 1, 0])}Une étiquette est en impression. Quelles transitions sont activables ?`, ['<code>démarre[1]</code> et <code>termine[1]</code>', '<code>démarre[2]</code>', '<code>démarre[1]</code> seulement', 'toutes'], 0, 'Le niveau courant est <code>libre=1</code> : seules les copies qui partent de ce niveau sont jouables.'],
      ]),
    ],
    gens: {
      'pmx2-21': [g.enabled(['ex21']), g.after(['ex21'])],
      'pmx2-22': [g.enabled(['ex22'])],
      'pmx2-23': [g.enabled(['ex23']), g.after(['ex23'])],
      'pmx2-24': [g.enabled(['ex24']), g.after(['ex24'])],
      'pmx2-25': [g.enabled(['ex25', 'ex25-libre']), g.after(['ex25', 'ex25-libre']), g.count(['ex25'])],
    },
  });
})();
