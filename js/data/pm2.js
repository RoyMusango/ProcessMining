// Problème 2 : Expliquer le modèle à un ordinateur (F. Lecron, I-MANA-223, slides 1 à 10)
(function () {
  const R = String.raw, u = COURSE.u, pm = COURSE.pm, g = pm.gens;

  COURSE.add({
    id: 'pm2', kind: 'Problème 2',
    title: 'Expliquer le modèle à un ordinateur',
    short: 'Pb 2 · Le réseau en formules',
    source: 'Probleme2_Slides_distribuees.pdf · 10 slides',
    pitch: 'L’outil ne voit pas nos dessins : il lui faut des listes, des couples et des nombres. On en tire la définition d’un réseau, le marquage, le preset et le postset, et les deux formules qui font tout le jeu.',
    sections: [
      {
        id: 'pm2-message', title: 'Décrire un réseau sans dessin : P, T, F et m', slides: '2',
        summary: 'Un réseau se décrit complètement par l’ensemble des places P, l’ensemble des transitions T, les flèches F (des couples) et la situation m ; positions, couleurs et noms parlants sont superflus.',
        fiche: R`
${pm.why(`<p>L’outil joue nos modèles à notre place, mais son fichier ne contient que du texte. L’exercice du cours (décrire un réseau à un autre groupe sans dessin ni phrase) force à trouver ce qui est <b>indispensable</b>.</p>`)}
<div class="def"><b>Indispensable</b> :
<ul><li>$P$ : l’ensemble des <b>places</b> (les ronds) ;</li>
<li>$T$ : l’ensemble des <b>transitions</b> (les carrés) ;</li>
<li>$F\subseteq (P\times T)\cup(T\times P)$ : les <b>flèches</b>, chacune écrite comme un couple (départ, arrivée) ;</li>
<li>$m$ : la <b>situation actuelle</b> (où sont les pions).</li></ul>
<b>Superflu</b> : la position des éléments, les couleurs, la forme des flèches, des noms parlants.</div>
<p>$F\subseteq (P\times T)\cup(T\times P)$ dit une chose simple : une flèche va <b>d’une place vers une transition</b> ou <b>d’une transition vers une place</b>, jamais d’un rond à un rond ni d’un carré à un carré.</p>
${pm.ex(`<p>Le centre de vaccination corrigé, écrit pour l’outil :</p>
<p>$P=\{\text{attente},\text{box\_libre},\text{dans\_box},\text{vacciné},\text{sorti}\}$, $T=\{\text{entrer},\text{vacciner},\text{sortir}\}$,</p>
<p>$F=\{(\text{attente},\text{entrer}),(\text{box\_libre},\text{entrer}),(\text{entrer},\text{dans\_box}),(\text{dans\_box},\text{vacciner}),(\text{vacciner},\text{vacciné}),(\text{vacciné},\text{sortir}),(\text{sortir},\text{sorti}),(\text{sortir},\text{box\_libre})\}$</p>
<p>Le dessin ci-dessous est entièrement reconstruit à partir de ces trois ensembles et de $m$.</p>`)}
${u.petri('vacc-corrige', { sec: 'pm2-message', pion: 'un patient, sauf dans <code>box_libre</code> (le box est libre).', axes: [['Couple $(a,b)\\in F$', 'une flèche de $a$ vers $b$. $(\\text{attente},\\text{entrer})$ : flèche du rond <code>attente</code> vers le carré <code>entrer</code>.']] })}
<p>Dans l’<a class="link" href="#project">Atelier</a>, tu tapes exactement ce message et le plateau se dessine.</p>
${pm.traps(['Écrire un couple (place, place) ou (transition, transition) : ce n’est pas une flèche valide.', 'Inverser un couple : $(\\text{entrer},\\text{attente})$ voudrait dire qu’entrer <b>produit</b> un patient en attente.', 'Oublier la situation : sans $m$, on a le plateau mais pas la partie en cours.'])}
${pm.recap(['Un réseau = $(P, T, F)$ plus un marquage.', 'Une flèche = un couple, toujours entre une place et une transition.', 'Le dessin n’ajoute aucune information.'])}`,
      },
      {
        id: 'pm2-marquage', title: 'Représenter la situation : le marquage', slides: '4',
        summary: 'La situation n’est pas la liste des places marquées mais une fonction m qui donne à chaque place son nombre de pions, écrite comme un vecteur dans l’ordre de P.',
        fiche: R`
${pm.why(`<p>L’outil a besoin de deux fonctions valables pour n’importe quel réseau : <code>activable(t, m)</code>, qui répond oui ou non, et <code>tirer(t, m)</code>, qui renvoie la nouvelle situation. Les deux reçoivent $m$ : il faut donc une forme mathématique précise pour « la situation ».</p>`)}
<p><b>Première idée</b> : $m$ = l’ensemble des places qui ont un pion. Le cours prévient : « attention au réseau B ». Dans ce réseau, une place contient <b>plusieurs</b> pions, et un ensemble ne sait pas dire « deux fois ».</p>
<div class="def"><b>Marquage</b> : une fonction $m : P\to\mathbb N$ qui associe à chaque place son nombre de pions. $m(p)$ se lit « le nombre de pions dans $p$ ».<br>
En pratique on l’écrit comme un <b>vecteur</b>, une case par place, dans l’ordre de $P$.</div>
${u.petri('reveil', { sec: 'pm2-marquage', pion: 'dans <code>opéré</code>, <code>en_réveil</code>, <code>en_chambre</code> : un patient ; dans <code>lits_libres</code> : un lit libre.', axes: [['$m(\\text{opéré})=4$', 'la première case du vecteur. Un ensemble $\\{\\text{opéré},\\text{lits\\_libres}\\}$ perdrait le 4 et le 3.']] })}
${pm.ex(`<p>Deux écritures se rencontrent dans le cours et dans les exercices :</p>
<ul><li><b>vecteur</b> : $m=[4,3,0,0]$ pour $P=(\text{opéré},\text{lits\_libres},\text{en\_réveil},\text{en\_chambre})$ ;</li>
<li><b>liste des pions</b> : $m_0=[p_1,p_4,p_7]$ (exercice 1.1) veut dire « un pion dans $p_1$, un dans $p_4$, un dans $p_7$ ». Avec deux pions dans $p_4$ on écrit $[p_4,p_4]$ : la place est répétée.</li></ul>
<p>Le message du problème 2, $m=[p_1,p_2,p_3]$, se réécrit donc $[1,1,1]$.</p>`)}
${pm.traps(['Un ensemble de places marquées : il oublie les quantités.', 'Un vecteur sans dire l’ordre des places : $[3,1,0]$ ne veut rien dire seul.', 'Confondre $[p_1,p_2,p_3]$ (un pion dans chaque) avec le vecteur $[1,2,3]$.'])}
${pm.recap(['$m : P\\to\\mathbb N$, $m(p)$ = nombre de pions dans $p$.', 'On l’écrit en vecteur, dans l’ordre de $P$.', '$[p_4,p_4]$ et $m(p_4)=2$ disent la même chose.'])}`,
      },
      {
        id: 'pm2-preset', title: 'Preset et postset', slides: '4',
        summary: 'Le preset •t est l’ensemble des places d’entrée de t, le postset t• celui de ses places de sortie ; on les lit directement dans F.',
        fiche: R`
${pm.why(`<p>Pour répondre à <code>activable(t, m)</code>, l’outil doit savoir <b>dans quelles places regarder</b> : celles qui pointent vers $t$. Pour <code>tirer</code>, il doit aussi savoir lesquelles reçoivent des pions. Ces deux ensembles se calculent à partir du message.</p>`)}
<div class="def"><b>Preset</b> de $t$ (ses entrées) : $\ \bullet t=\{p\in P : (p,t)\in F\}$.<br>
<b>Postset</b> de $t$ (ses sorties) : $\ t\bullet=\{p\in P : (t,p)\in F\}$.</div>
<p>Moyen de s’en souvenir : le point est du côté où se trouvent les places. $\bullet t$ : les places <b>avant</b> $t$. $t\bullet$ : les places <b>après</b> $t$.</p>
${pm.ex(R`<p>Dans le centre corrigé : $\bullet\text{entrer}=\{\text{attente},\text{box\_libre}\}$ et $\text{entrer}\bullet=\{\text{dans\_box}\}$ ; $\bullet\text{sortir}=\{\text{vacciné}\}$ et $\text{sortir}\bullet=\{\text{sorti},\text{box\_libre}\}$.</p>
<p>Méthode : pour $\bullet t$, parcours $F$ et garde les couples dont le <b>deuxième</b> élément est $t$ ; pour $t\bullet$, ceux dont le <b>premier</b> élément est $t$.</p>`)}
${u.petri('vacc-corrige', { sec: 'pm2-preset', pion: 'un patient, sauf dans <code>box_libre</code>.', axes: [['$\\bullet t$', 'les ronds d’où part une flèche <b>vers</b> le carré $t$.'], ['$t\\bullet$', 'les ronds où arrive une flèche <b>depuis</b> le carré $t$.']] })}
<p>Une place peut être dans les deux : dans le message du problème 2, $p_3\in\bullet t_3$ et $p_3\in t_3\bullet$ (une flèche dans chaque sens).</p>
${pm.traps(['Inverser preset et postset : le point est du côté des places.', 'Croire que $\\bullet t$ et $t\\bullet$ sont toujours disjoints.', 'Chercher le preset dans le dessin et oublier une flèche : dans $F$, on ne peut pas en oublier.'])}
${pm.recap(['$\\bullet t$ = entrées de $t$ ; $t\\bullet$ = sorties de $t$.', 'Les deux se lisent dans $F$.', 'On définit de même $\\bullet p$ et $p\\bullet$ pour une place (les transitions avant et après).'])}`,
      },
      {
        id: 'pm2-formules', title: 'Les règles du jeu en deux formules', slides: '5',
        summary: 'Activable : m(p) ≥ 1 pour toute place du preset. Tirer : m′(p) = m(p) − [p ∈ •t] + [p ∈ t•], une seule formule qui couvre les quatre cas.',
        fiche: R`
${pm.why(`<p>La règle « en deux phrases » du problème 1 suffit à un humain. L’outil a besoin de formules sans ambiguïté, valables pour tout réseau, y compris quand une place est à la fois entrée et sortie.</p>`)}
<div class="thm"><b>Activation</b> : $\ \text{activable}(t,m)\iff \forall p\in\bullet t,\ m(p)\ge 1$.<br>
<b>Tir</b> : pour <b>toute</b> place $p$, $\ m'(p)=m(p)-[p\in\bullet t]+[p\in t\bullet]$,<br>où $[\,\text{condition}\,]$ vaut 1 si la condition est vraie et 0 sinon.</div>
<p>La formule unique couvre les quatre cas demandés par la slide 5 :</p>
${pm.table(['$p$ est…', '$[p\\in\\bullet t]$', '$[p\\in t\\bullet]$', '$m\'(p)$'], [
  ['entrée seulement', '1', '0', '$m(p)-1$'], ['sortie seulement', '0', '1', '$m(p)+1$'], ['entrée <b>et</b> sortie', '1', '1', '$m(p)$ : inchangé'], ['ni l’une ni l’autre', '0', '0', '$m(p)$ : inchangé']])}
${pm.ex(R`<p><b>Test sur $t_3$</b> (message du problème 2) : $\bullet t_3=\{p_2,p_3\}$, $t_3\bullet=\{p_3\}$, $m=[1,1,1]$.</p>
<ul><li>$p_1$ : ni entrée ni sortie, $m'(p_1)=1$ ;</li><li>$p_2$ : entrée, $m'(p_2)=1-1=0$ ;</li><li>$p_3$ : entrée et sortie, $m'(p_3)=1-1+1=1$.</li></ul>
<p>Donc $m'=[1,0,1]$. Vérifie sur le plateau.</p>`)}
${u.petri('message-pb2', { ask: 'after', t: 't3', sec: 'pm2-formules', pion: 'un jeton sans signification particulière : le réseau est abstrait.', axes: [['Double flèche $p_3\\leftrightarrow t_3$', '$p_3$ est entrée <b>et</b> sortie de $t_3$ : $t_3$ exige un pion dans $p_3$ mais le lui rend.']] })}
<p>Remarque : une place entrée et sortie n’est pas inutile. Elle ne change pas, mais elle <b>conditionne</b> le tir : sans pion dans $p_3$, $t_3$ n’est pas activable.</p>
${pm.traps(['Écrire deux formules séparées (entrées, sorties) et oublier le cas « les deux ».', 'Tester l’activation sur les places de sortie : seules les entrées comptent.', 'Appliquer le tir sans avoir vérifié l’activation : $m\'(p)$ deviendrait négatif.'])}
${pm.recap(['Activable : $m(p)\\ge 1$ pour tout $p\\in\\bullet t$.', 'Tir : $m\'(p)=m(p)-[p\\in\\bullet t]+[p\\in t\\bullet]$.', 'Avec des arcs pondérés (problème 3), les 1 deviennent les poids.'])}`,
      },
      {
        id: 'pm2-test', title: 'Vos formules fonctionnent-elles sur ce message ?', slides: '6',
        summary: 'Sur le message P = {p1, p2, p3}, on calcule à la main presets, postsets, transitions activables et marquage après chaque tir : t1 donne [0,2,2], t2 donne [2,0,1], t3 donne [1,0,1].',
        fiche: R`
${pm.enonce(R`$P=\{p_1,p_2,p_3\}$, $T=\{t_1,t_2,t_3\}$, $m=[p_1,p_2,p_3]$<br>$F=\{(p_1,t_1),(t_1,p_2),(t_1,p_3),(p_2,t_2),(t_2,p_1),(p_2,t_3),(p_3,t_3),(t_3,p_3)\}$<br>Sur papier : donnez les places d’entrée et de sortie de chaque transition, les transitions activables, et le marquage obtenu par le tir de chacune.`)}
${pm.todo('<p>Fais-le entièrement sur papier, sans dessin, comme l’outil. Puis ouvre le corrigé.</p>')}
${pm.sol('Corrigé pas à pas', R`
${pm.table(['', '$\\bullet t$ (entrées)', '$t\\bullet$ (sorties)', 'activable en $[1,1,1]$ ?', 'marquage après le tir'], [
  ['$t_1$', '$\\{p_1\\}$', '$\\{p_2,p_3\\}$', 'oui', '$[0,2,2]$'], ['$t_2$', '$\\{p_2\\}$', '$\\{p_1\\}$', 'oui', '$[2,0,1]$'], ['$t_3$', '$\\{p_2,p_3\\}$', '$\\{p_3\\}$', 'oui', '$[1,0,1]$']])}
<p>Détail pour $t_1$ : $p_1$ est entrée ($1-1=0$), $p_2$ et $p_3$ sont sorties ($1+1=2$).</p>
<p>Les trois tirs partent tous de $[1,1,1]$ : ce sont trois coups possibles, pas trois coups successifs.</p>`)}
<p>Le plateau reconstruit à partir du message. Prédis d’abord ce que donne $t_1$.</p>
${u.petri('message-pb2', { ask: 'after', t: 't1', sec: 'pm2-test', pion: 'un jeton abstrait.' })}
${pm.ex(`<p><b>Aller plus loin.</b> Ouvre le graphe d’accessibilité de ce plateau : la marche à suivre ne s’arrête pas. Après $t_1$ puis $t_2$, on est en $[1,1,2]$ : la situation de départ avec un pion de plus dans $p_3$. On peut recommencer sans fin : $p_3$ grandit indéfiniment. Ce réseau est <b>non borné</b> (voir le problème 4).</p>`, 'Lien avec le problème 4')}
${pm.traps(['Enchaîner les trois tirs au lieu de repartir chaque fois de $[1,1,1]$.', 'Oublier que $t_1$ a <b>deux</b> sorties : elle produit deux pions pour un consommé.', 'Pour $t_3$, écrire $m\'(p_3)=0$ : $p_3$ est aussi une sortie.'])}
${pm.recap(['Presets et postsets se lisent dans $F$, sans dessin.', 'Chaque tir se calcule place par place avec la formule unique.', 'Ce petit réseau est déjà non borné.'])}`,
      },
      {
        id: 'pm2-sas', title: 'À vous : le sas du bloc opératoire', slides: '8',
        summary: 'Une porte = deux places (ouverte, fermée) et deux transitions ; deux portes = deux copies ; la règle de stérilité = une place ressource sas_fermé que chaque ouverture consomme et que chaque fermeture rend.',
        fiche: R`
${pm.enonce('Le sas a deux portes, l’une vers le couloir, l’autre vers le bloc. Chaque porte est ouverte ou fermée. Modélisez (a) une porte ; (b) les deux portes ; (c) la règle de stérilité : les deux portes ne peuvent jamais être ouvertes en même temps.')}
${pm.todo('<p>Dessine (a), (b), (c) sur papier. Pour (c), pense à la correction du centre de vaccination : comment interdire une situation sans changer la règle ?</p>')}
${pm.sol('(a) Une porte', `<p>Un objet avec deux états : deux places, un pion, deux transitions.</p>${u.petri('sas-porte', { sec: 'pm2-sas', pion: 'l’<b>état de la porte</b> : le rond marqué dit si elle est ouverte ou fermée.' })}`)}
${pm.sol('(b) Deux portes', `<p>Deux copies indépendantes. Rien n’empêche d’ouvrir les deux : joue <code>ouvrir_1</code> puis <code>ouvrir_2</code>.</p>${u.petri('sas-2portes', { sec: 'pm2-sas', pion: 'l’état d’une porte (un pion par porte).' })}<p>Quatre situations accessibles, dont $[0,1,0,1]$ : les deux portes ouvertes.</p>`)}
${pm.sol('(c) La règle de stérilité', R`<p>On ajoute une place ressource <code>sas_fermé</code> avec un pion (« aucune porte n’est ouverte »). Chaque <code>ouvrir</code> la consomme, chaque <code>fermer</code> la rend.</p>
${u.petri('sas', { ask: 'twice', t: 'ouvrir_1', sec: 'pm2-sas', pion: 'dans <code>sas_fermé</code> : la condition « aucune porte ouverte ». Ailleurs : l’état d’une porte.' })}
<p>Il ne reste que <b>3 situations</b> accessibles (tout fermé, porte 1 ouverte, porte 2 ouverte). Et dans chacune : $m(\text{ouverte\_1})+m(\text{ouverte\_2})+m(\text{sas\_fermé})=1$, donc jamais deux portes ouvertes.</p>`)}
${pm.traps(['Une seule place « porte » avec un pion quand elle est ouverte : on ne peut plus exiger « la porte est fermée » comme condition.', 'Relier directement <code>ouverte_1</code> à <code>ouvrir_2</code> : cela exigerait que la porte 1 soit ouverte pour ouvrir la 2, l’inverse de ce qu’on veut.', 'Oublier de rendre le pion de <code>sas_fermé</code> à la fermeture.'])}
${pm.recap(['Un objet à deux états = deux places, un pion.', 'Une exclusion mutuelle = une place ressource à un pion.', 'L’égalité $m(\\text{ouverte\\_1})+m(\\text{ouverte\\_2})+m(\\text{sas\\_fermé})=1$ prouve la règle.'])}`,
      },
      {
        id: 'pm2-pharmacie', title: 'À vous : le guichet de la pharmacie', slides: '9',
        summary: 'Deux cycles de vie (le patient, le pharmacien) synchronisés par des transitions communes : commencer à servir demande un patient qui attend et un pharmacien libre.',
        fiche: R`
${pm.enonce('Le pharmacien est libre, en train de servir un patient, ou en train d’enregistrer la délivrance dans le dossier. Un patient attend, est servi, puis est parti. Trois événements : le pharmacien commence à servir ; il a fini de servir et commence l’enregistrement ; il a fini l’enregistrement.')}
${pm.todo('<p>Repère d’abord les états (ce seront les ronds) et les événements (les carrés). Pour chaque événement : qui change d’état ?</p>')}
${pm.sol('Voir une solution et la jouer', R`
${pm.table(['Événement', 'Le patient', 'Le pharmacien'], [
  ['<code>commencer</code> (à servir)', 'attend → servi', 'libre → sert'], ['<code>fin_service</code>', 'servi → parti', 'sert → enregistre'], ['<code>fin_enregistrement</code>', '(rien)', 'enregistre → libre']])}
${u.petri('pharmacie', { sec: 'pm2-pharmacie', pion: 'rangée du haut : un <b>patient</b> ; rangée du bas : le <b>pharmacien</b> (un seul pion, qui dit ce qu’il fait).' })}
<p>Avec deux patients : 7 situations accessibles, une seule sans suite, $[0,0,2,1,0,0]$ (les deux patients partis, le pharmacien libre). Le deuxième patient ne peut être servi qu’après <code>fin_enregistrement</code> : c’est le pion <code>libre</code> qui l’impose.</p>`)}
${pm.traps(['Un seul circuit pour tout : on ne voit plus que le pharmacien n’est pas disponible pendant l’enregistrement.', 'Trois places pour le pharmacien <b>et</b> trois pions : il n’y a qu’un pharmacien, donc un seul pion dans son cycle.', 'Faire partir le patient à <code>fin_enregistrement</code> : l’énoncé dit qu’il part quand le service est fini.'])}
${pm.recap(['Un acteur = un cycle d’états avec ses pions.', 'Un événement qui concerne deux acteurs = une transition qui a une entrée dans chaque cycle.', 'Ici la transition commune <b>synchronise</b> patient et pharmacien.'])}`,
      },
      {
        id: 'pm2-navette', title: 'À vous : la navette inter-sites', slides: '10',
        summary: 'La navette est un pion qui tourne entre trois places ; monter et descendre à un site exigent que la navette y soit, sans la déplacer : une flèche dans chaque sens.',
        fiche: R`
${pm.enonce('Une navette relie en boucle les trois sites de l’hôpital. À chaque site, des passagers peuvent monter ou descendre, mais uniquement lorsque la navette est à l’arrêt. Elle compte 8 sièges.')}
${pm.todo('<p>Trois questions à te poser : comment dire où est la navette ? Comment exiger « la navette est ici » sans la faire bouger ? Et les 8 sièges ? (La limite des sièges est reprise au problème 3 : commence sans.)</p>')}
${pm.sol('Voir une solution et la jouer (sans la limite de sièges)', R`
<ul><li><b>La navette</b> : trois places <code>à_S1</code>, <code>à_S2</code>, <code>à_S3</code>, un seul pion, trois transitions <code>rouler_12</code>, <code>rouler_23</code>, <code>rouler_31</code> (la boucle).</li>
<li><b>Monter au site $i$</b> : <code>monter_i</code> prend un passager dans <code>quai_i</code> et le met dans <code>à_bord</code>. Elle a aussi <code>à_Si</code> en entrée <b>et</b> en sortie : la navette doit être là, et elle y reste.</li>
<li><b>Descendre au site $i$</b> : <code>descendre_i</code> prend un passager dans <code>à_bord</code>, avec la même double flèche sur <code>à_Si</code>.</li></ul>
${u.petri('navette', { sec: 'pm2-navette', pion: 'dans <code>à_S1…3</code> : la <b>navette</b> ; dans <code>quai_i</code> et <code>à_bord</code> : un <b>passager</b>.', axes: [['Double flèche carré ↔ <code>à_Si</code>', 'la navette est une <b>condition</b> du coup : exigée, puis aussitôt rendue.']] })}
<p>Rien ne limite encore <code>à_bord</code> : avec assez de passagers, on dépasserait 8. La correction (une place <code>sièges_libres</code> à 8 pions) est dans le <a class="link" href="#course/pm3-navette8">problème 3</a>.</p>`)}
${pm.traps(['Faire consommer le pion de la navette par <code>monter</code> sans le rendre : la navette disparaîtrait.', 'Une seule transition <code>monter</code> pour les trois sites : elle ne saurait pas où la navette doit être.', 'Autoriser <code>rouler</code> dans les deux sens : l’énoncé dit « en boucle ».'])}
${pm.recap(['« Seulement quand X est là » = X en entrée <b>et</b> en sortie de la transition.', 'Une place peut conditionner un tir sans être modifiée (cas « les deux » de la formule).', 'Une capacité (8 sièges) = une place ressource, comme <code>box_libre</code>.'])}`,
      },
    ],
    cards: [
      ...pm.cards('pm2-message', [
        ['def', 'Quels sont les trois ensembles qui définissent un réseau de Petri ?', '$P$ (les places), $T$ (les transitions), $F\\subseteq(P\\times T)\\cup(T\\times P)$ (les flèches). On y ajoute un marquage pour décrire la situation.'],
        ['def', 'Que signifie $F\\subseteq(P\\times T)\\cup(T\\times P)$ ?', 'Chaque flèche est un couple (place, transition) ou (transition, place) : jamais deux places, jamais deux transitions.'],
        ['why', 'Pourquoi décrire un réseau avec des listes et des couples plutôt qu’un dessin ?', 'Parce que l’outil ne lit que du texte, et parce que cela montre ce qui est indispensable : $P$, $T$, $F$, $m$. Tout le reste (positions, couleurs) est superflu.'],
        ['trap', 'Que voudrait dire le couple $(\\text{entrer},\\text{attente})$ ?', 'Une flèche du carré <code>entrer</code> vers le rond <code>attente</code> : entrer <b>produirait</b> un patient en attente. L’ordre du couple est le sens de la flèche.'],
      ]),
      ...pm.cards('pm2-marquage', [
        ['def', 'Qu’est-ce qu’un marquage ?', 'Une fonction $m:P\\to\\mathbb N$ : à chaque place, son nombre de pions. On l’écrit en vecteur, dans l’ordre de $P$.'],
        ['why', 'Pourquoi un ensemble de places marquées ne suffit-il pas à décrire la situation ?', 'Un ensemble ne dit pas <b>combien</b> de pions une place contient. Dès qu’une place en a deux (le « réseau B »), l’information est perdue.'],
        ['read', 'Dans l’exercice 1.1, que veut dire $m_0=[p_1,p_4,p_7]$ ?', 'Un pion dans $p_1$, un dans $p_4$, un dans $p_7$, zéro ailleurs. En vecteur sur $(p_1,\\dots,p_7)$ : $[1,0,0,1,0,0,1]$.'],
        ['trap', 'On lit $m=[2,0,1]$. Que manque-t-il pour pouvoir le comprendre ?', 'L’ordre des places. Sans savoir à quelle place correspond chaque case, le vecteur ne dit rien.'],
      ]),
      ...pm.cards('pm2-preset', [
        ['def', 'Définis le preset $\\bullet t$ et le postset $t\\bullet$.', '$\\bullet t=\\{p:(p,t)\\in F\\}$ : les places d’entrée de $t$. $t\\bullet=\\{p:(t,p)\\in F\\}$ : ses places de sortie.'],
        ['why', 'À quoi sert le preset pour l’outil ?', 'C’est l’ensemble des places à regarder pour savoir si $t$ est activable. Le postset dit lesquelles recevront un pion.'],
        ['read', 'Dans le centre corrigé (box rendu par <code>sortir</code>), que valent $\\bullet\\text{entrer}$ et $\\text{sortir}\\bullet$ ?', '$\\bullet\\text{entrer}=\\{\\text{attente},\\text{box\\_libre}\\}$ ; $\\text{sortir}\\bullet=\\{\\text{sorti},\\text{box\\_libre}\\}$.'],
        ['trap', 'Une place peut-elle être à la fois dans $\\bullet t$ et dans $t\\bullet$ ?', 'Oui : $p_3$ pour $t_3$ dans le message du problème 2, ou <code>à_S1</code> pour <code>monter_1</code> dans la navette. Elle conditionne le tir sans être modifiée.'],
      ]),
      ...pm.cards('pm2-formules', [
        ['def', 'Écris la condition d’activation d’une transition $t$ dans un marquage $m$.', '$\\forall p\\in\\bullet t,\\ m(p)\\ge 1$.'],
        ['def', 'Écris la formule unique du tir.', '$m\'(p)=m(p)-[p\\in\\bullet t]+[p\\in t\\bullet]$ pour toute place $p$, où $[\\cdot]$ vaut 1 si la condition est vraie, 0 sinon.'],
        ['why', 'Pourquoi une formule unique plutôt que « −1 pour les entrées, +1 pour les sorties » ?', 'Elle traite sans cas particulier la place qui est entrée <b>et</b> sortie ($-1+1=0$) et celle qui n’est ni l’une ni l’autre ($0$).'],
        ['trap', '$p$ est entrée et sortie de $t$ et contient 0 pion. $t$ est-elle activable ?', 'Non : $p\\in\\bullet t$ et $m(p)=0$. Le fait que $t$ lui rende un pion ensuite ne compte pas.'],
        ['link', 'Que deviennent les deux formules avec des arcs pondérés (problème 3) ?', 'Activable : $m(p)\\ge w(p,t)$. Tir : $m\'(p)=m(p)-w(p,t)+w(t,p)$, avec $w=0$ quand il n’y a pas de flèche.'],
      ]),
      ...pm.cards('pm2-test', [
        ['read', 'Message du problème 2, $m=[1,1,1]$. Marquage après $t_1$ ?', '$[0,2,2]$ : $p_1$ perd un pion, $p_2$ et $p_3$ en gagnent un.'],
        ['read', 'Message du problème 2, $m=[1,1,1]$. Marquage après $t_3$ ?', '$[1,0,1]$ : $p_2$ perd un pion, $p_3$ est entrée et sortie donc inchangée.'],
        ['why', 'Pourquoi le réseau du message est-il non borné ?', 'Après $t_1$ puis $t_2$, on est en $[1,1,2]$ : la situation de départ plus un pion dans $p_3$. On peut répéter : $p_3$ grandit sans fin.'],
        ['trap', 'Dans l’exercice, faut-il jouer $t_1$, puis $t_2$, puis $t_3$ à la suite ?', 'Non : on demande le marquage obtenu par le tir de <b>chacune</b> à partir de $[1,1,1]$. Ce sont trois réponses indépendantes.'],
      ]),
      ...pm.cards('pm2-sas', [
        ['decide', 'Comment modéliser une porte ouverte ou fermée ?', 'Deux places (<code>ouverte</code>, <code>fermée</code>), un seul pion, deux transitions (<code>ouvrir</code>, <code>fermer</code>).'],
        ['decide', 'Comment imposer « jamais les deux portes ouvertes » ?', 'Une place ressource <code>sas_fermé</code> à un pion : chaque <code>ouvrir</code> la consomme, chaque <code>fermer</code> la rend.'],
        ['why', 'Pourquoi deux places par porte et pas une seule ?', 'Pour pouvoir exiger l’état « fermée » comme entrée d’une transition. Avec une seule place, « pas de pion » ne peut pas servir de condition.'],
        ['read', 'Quelle égalité est vraie dans toutes les situations du sas corrigé ?', '$m(\\text{ouverte\\_1})+m(\\text{ouverte\\_2})+m(\\text{sas\\_fermé})=1$ : au plus une porte ouverte.'],
      ]),
      ...pm.cards('pm2-pharmacie', [
        ['decide', 'Comment modéliser un événement qui concerne deux acteurs à la fois ?', 'Une seule transition, avec une entrée (et une sortie) dans le cycle de chaque acteur : elle n’est jouable que si les deux sont dans le bon état.'],
        ['why', 'Pourquoi le deuxième patient doit-il attendre la fin de l’enregistrement ?', 'Parce que <code>commencer</code> exige un pion dans <code>libre</code>, et que ce pion n’y revient qu’avec <code>fin_enregistrement</code>.'],
        ['trap', 'Le pharmacien a trois états. Combien de pions dans son cycle ?', 'Un seul : il n’y a qu’un pharmacien. Le pion dit dans quel état il est.'],
        ['read', 'Guichet avec deux patients : dans quelle situation le jeu s’arrête-t-il ?', '$[0,0,2,1,0,0]$ sur (attend, servi, parti, libre, sert, enregistre) : les deux patients partis, le pharmacien libre.'],
      ]),
      ...pm.cards('pm2-navette', [
        ['decide', 'Comment dire « on ne monte que si la navette est à ce site » ?', 'La place <code>à_Si</code> est entrée <b>et</b> sortie de <code>monter_i</code> : la navette est exigée puis rendue.'],
        ['why', 'Pourquoi une flèche dans chaque sens entre <code>à_Si</code> et <code>monter_i</code> ?', 'Avec une seule flèche entrante, monter ferait disparaître la navette. La flèche retour la remet à sa place.'],
        ['trap', 'Une seule transition <code>monter</code> pour les trois sites convient-elle ?', 'Non : ses entrées sont fixes. Il faut une transition par site, chacune liée à la place du site.'],
        ['link', 'Quelle construction du problème 1 sert à limiter la navette à 8 passagers ?', 'La place ressource : <code>sièges_libres</code> avec 8 pions, consommée par <code>monter</code>, rendue par <code>descendre</code>.'],
      ]),
    ],
    quiz: [
      ...pm.quiz('pm2-message', [
        ['Lequel de ces couples ne peut pas appartenir à $F$ ?', ['$(p_1,p_2)$', '$(p_1,t_1)$', '$(t_1,p_2)$', '$(t_2,p_1)$'], 0, 'Une flèche relie toujours une place et une transition. $(p_1,p_2)$ relie deux places.'],
        ['Deux groupes décrivent le même réseau ; l’un nomme les places $a,b,c$, l’autre « file, box, sortie ». Pour l’outil :', ['Les deux messages décrivent le même jeu', 'Seul le second est valide', 'Seul le premier est valide', 'Aucun : il manque les positions'], 0, 'Les noms parlants sont superflus pour jouer. Ils servent aux humains.'],
        [`${pm.fig('message-pb2')}Combien de couples contient $F$ pour ce réseau ?`, ['8', '6', '3', '9'], 0, 'Un couple par flèche. La double flèche entre $p_3$ et $t_3$ compte pour deux : $(p_3,t_3)$ et $(t_3,p_3)$.'],
      ]),
      ...pm.quiz('pm2-marquage', [
        [`${pm.fig('ex12')}Écris le marquage dessiné sous forme de vecteur sur $(p_1,p_2,p_3,p_4)$.`, ['$[1,0,1,2]$', '$[1,0,1,1]$', '$[1,1,1,2]$', '$[1,3,4]$'], 0, '$p_1$ : 1 pion, $p_2$ : 0, $p_3$ : 1, $p_4$ : 2.'],
        ['$P=(p_1,p_2,p_3,p_4)$ et $m=[p_2,p_4,p_4]$. Le vecteur est :', ['$[0,1,0,2]$', '$[0,1,0,1]$', '$[2,4,4]$', '$[0,1,2,0]$'], 0, 'Un pion dans $p_2$, deux dans $p_4$ (la place est répétée).'],
      ]),
      ...pm.quiz('pm2-preset', [
        [`${pm.fig('ex12')}Que vaut $\\bullet t_3$ ?`, ['$\\{p_3,p_4\\}$', '$\\{p_4\\}$', '$\\{p_3\\}$', '$\\{p_2,p_3\\}$'], 0, 'Deux flèches arrivent sur $t_3$ : depuis $p_3$ et depuis $p_4$. La double flèche avec $p_4$ fait que $p_4$ est aussi dans $t_3\\bullet$.'],
        ['$F=\\{(a,t),(b,t),(t,c),(t,a)\\}$. Que vaut $t\\bullet$ ?', ['$\\{c,a\\}$', '$\\{a,b\\}$', '$\\{c\\}$', '$\\{a,b,c\\}$'], 0, 'Les couples dont le premier élément est $t$ : $(t,c)$ et $(t,a)$.'],
      ]),
      ...pm.quiz('pm2-formules', [
        ['$\\bullet t=\\{a,b\\}$, $t\\bullet=\\{b,c\\}$, $m=(a{:}2,\\ b{:}1,\\ c{:}0)$. Après le tir de $t$ :', ['$(a{:}1,\\ b{:}1,\\ c{:}1)$', '$(a{:}1,\\ b{:}0,\\ c{:}1)$', '$(a{:}1,\\ b{:}2,\\ c{:}1)$', '$t$ n’est pas activable'], 0, '$a$ : entrée, $2-1$. $b$ : entrée et sortie, $1-1+1$. $c$ : sortie, $0+1$.'],
        ['Avec les mêmes $\\bullet t=\\{a,b\\}$, $t\\bullet=\\{b,c\\}$ et $m=(a{:}3,\\ b{:}0,\\ c{:}5)$ :', ['$t$ n’est pas activable', 'après le tir : $(2,0,6)$', 'après le tir : $(2,1,6)$', 'après le tir : $(2,-1,6)$'], 0, '$b\\in\\bullet t$ et $m(b)=0$. La formule du tir ne s’applique que si $t$ est activable.'],
        ['Pourquoi l’outil n’a-t-il besoin que de deux fonctions ?', ['Parce que la règle est la même pour tous les réseaux : seules les données $(P,T,F,m)$ changent', 'Parce qu’il ne traite que de petits réseaux', 'Parce que chaque réseau fournit ses propres règles', 'Parce que les transitions sont toujours jouées dans l’ordre'], 0, '<code>activable</code> et <code>tirer</code> ne dépendent que de $\\bullet t$, $t\\bullet$ et $m$.'],
      ]),
      ...pm.quiz('pm2-test', [
        [`${pm.fig('message-pb2')}Depuis $[1,1,1]$, on joue $t_2$. Situation obtenue ?`, ['$[2,0,1]$', '$[2,1,1]$', '$[1,0,1]$', '$[0,2,2]$'], 0, '$\\bullet t_2=\\{p_2\\}$, $t_2\\bullet=\\{p_1\\}$ : $p_2$ perd un pion, $p_1$ en gagne un.'],
        [`${pm.fig('message-pb2', [0, 2, 2])}Situation dessinée : $[0,2,2]$. Quelles transitions sont activables ?`, ['$t_2$ et $t_3$', '$t_1$, $t_2$ et $t_3$', '$t_3$ seulement', '$t_1$ seulement'], 0, '$t_1$ exige $p_1$, qui est vide. $t_2$ exige $p_2$ ; $t_3$ exige $p_2$ et $p_3$.'],
      ]),
      ...pm.quiz('pm2-sas', [
        [`${pm.fig('sas', [0, 1, 1, 0, 0])}La porte 1 est ouverte. Que peut-on jouer ?`, ['<code>fermer_1</code> seulement', '<code>fermer_1</code> ou <code>ouvrir_2</code>', '<code>ouvrir_2</code> seulement', 'rien'], 0, '<code>ouvrir_2</code> exige un pion dans <code>sas_fermé</code>, qui est vide tant que la porte 1 est ouverte.'],
        ['Combien de situations accessibles pour les deux portes <b>sans</b> la règle de stérilité ?', ['4', '3', '2', '8'], 0, 'Chaque porte est ouverte ou fermée indépendamment : $2\\times 2=4$. La règle en supprime une.'],
      ]),
      ...pm.quiz('pm2-pharmacie', [
        [`${pm.fig('pharmacie', [1, 0, 1, 0, 0, 1])}Un patient est parti, le pharmacien enregistre, un patient attend. Que peut-on jouer ?`, ['<code>fin_enregistrement</code> seulement', '<code>commencer</code>', '<code>commencer</code> ou <code>fin_enregistrement</code>', '<code>fin_service</code>'], 0, '<code>commencer</code> exige <code>libre</code>, vide pour l’instant.'],
        ['On engage un deuxième pharmacien. Que changer ?', ['Mettre 2 pions dans <code>libre</code>', 'Ajouter une place <code>libre_2</code> sans transitions', 'Supprimer <code>fin_enregistrement</code>', 'Mettre 2 pions dans <code>sert</code>'], 0, 'Si l’on ne distingue pas les pharmaciens, deux pions dans leur cycle suffisent.'],
      ]),
      ...pm.quiz('pm2-navette', [
        ['Dans la navette, <code>monter_2</code> a pour preset :', ['$\\{\\text{quai\\_2},\\ \\text{à\\_S2}\\}$', '$\\{\\text{quai\\_2}\\}$', '$\\{\\text{à\\_S2}\\}$', '$\\{\\text{quai\\_2},\\ \\text{à\\_bord}\\}$'], 0, 'Un passager sur le quai 2 <b>et</b> la navette au site 2. <code>à_bord</code> est dans le postset.'],
        ['La navette est au site 3 et un passager attend au quai 1. Peut-il monter ?', ['Non, tant que la navette n’a pas roulé jusqu’au site 1', 'Oui, à tout moment', 'Oui, si <code>à_bord</code> est vide', 'Non, jamais'], 0, '<code>monter_1</code> exige un pion dans <code>à_S1</code> : il faut d’abord <code>rouler_31</code>.'],
      ]),
    ],
    gens: {
      'pm2-message': [g.preset(['vacc-corrige', 'message-pb2'])],
      'pm2-marquage': [g.after(['reveil', 'ex12'])],
      'pm2-preset': [g.preset(['vacc-corrige', 'message-pb2', 'ex12', 'sterilisation', 'pharmacie', 'sas'])],
      'pm2-formules': [g.after(['message-pb2', 'ex12', 'sas', 'pharmacie']), g.enabled(['message-pb2', 'ex12'])],
      'pm2-test': [g.after(['message-pb2']), g.enabled(['message-pb2'])],
      'pm2-sas': [g.enabled(['sas', 'sas-2portes']), g.count(['sas', 'sas-2portes', 'sas-porte'])],
      'pm2-pharmacie': [g.enabled(['pharmacie']), g.after(['pharmacie'])],
      'pm2-navette': [g.enabled(['navette'])],
    },
  });
})();
