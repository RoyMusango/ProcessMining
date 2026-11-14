// Problème 4 : Toutes les situations, tous les passages : le graphe d'accessibilité (F. Lecron, I-MANA-223, slides 1 à 8)
// Tous les nombres (9 situations, 2 sans suite, 8 et 1 après correction, 10 pour le centre…) sortent de PETRI.reach (verif/test_petri.mjs).
(function () {
  const R = String.raw, u = COURSE.u, pm = COURSE.pm, g = pm.gens;
  const ECHO = 'dans <code>A_…</code> et <code>B_…</code> : l’<b>avancement d’un service</b> ; dans <code>écho_libre</code> et <code>inf_libre</code> : une <b>ressource disponible</b>.';

  COURSE.add({
    id: 'pm4', kind: 'Problème 4',
    title: 'Le graphe d’accessibilité',
    short: 'Pb 4 · Toutes les situations',
    source: 'Probleme4_Slides_distribuees.pdf · 8 slides',
    pitch: 'Pour répondre avec certitude (« est-ce que ça peut se bloquer ? »), on ne joue plus quelques parties : on construit toutes les situations accessibles et tous les passages entre elles. Et on voit quand cette méthode ne s’arrête pas.',
    sections: [
      {
        id: 'pm4-echo', title: 'Deux services, un échographe, une infirmière', slides: '2-3',
        summary: 'Deux services prennent les deux mêmes ressources dans l’ordre inverse : chacun peut tenir l’une en attendant l’autre, et plus rien n’est possible.',
        fiche: R`
${pm.why(`<p>La direction veut des <b>réponses certaines</b> : combien de situations, les examens finissent-ils toujours, peut-on se bloquer ? Jouer trois parties qui se passent bien ne prouve rien. Il faut regarder <b>toutes</b> les situations.</p>`)}
${pm.enonce('Chaque service doit réaliser une échographie au lit du patient. Il faut l’unique échographe portable de l’étage et l’unique infirmière formée. A va d’abord chercher l’échographe, puis appelle l’infirmière. B appelle d’abord l’infirmière, puis va chercher l’échographe. Après l’examen, les deux sont à nouveau disponibles.')}
${u.petri('echo', { ask: 'dead', sec: 'pm4-echo', pion: ECHO })}
<h4>Les réponses</h4>
<div class="def"><b>(a) Combien de situations ?</b> 9 marquages accessibles.<br>
<b>(b) Les deux examens finissent-ils toujours par être réalisés ?</b> Non.<br>
<b>(c) Peut-il arriver que plus rien ne soit possible ?</b> Oui, dans deux situations : la fin normale (les deux examens faits) et un <b>blocage</b>.</div>
${pm.ex(R`<p><b>Le blocage.</b> A joue <code>A_prend_écho</code> : il tient l’échographe et attend l’infirmière. B joue <code>B_prend_inf</code> : il tient l’infirmière et attend l’échographe. La situation est</p>
<p>$[0,1,0,0,1,0,0,0]$ sur (A_demande, A_attend_inf, A_fini, B_demande, B_attend_écho, B_fini, écho_libre, inf_libre).</p>
<p><code>A_examine</code> exige <code>inf_libre</code> (vide), <code>B_examine</code> exige <code>écho_libre</code> (vide). Chacun attend ce que l’autre tient : <b>interblocage</b>. Joue ces deux coups sur le plateau, dans un ordre ou dans l’autre.</p>`)}
<p>Ce blocage n’apparaît que dans certains déroulements : si A fait ses deux étapes avant que B ne commence, tout se passe bien. C’est pour cela qu’il échappe à l’intuition.</p>
${pm.traps(['Répondre « ça marche » après une partie réussie : le blocage dépend de l’ordre des coups.', 'Compter la fin normale comme un blocage : les deux sont « sans suite », mais seule l’une est un problème.', 'Croire que le blocage vient d’un manque de ressources : il vient de l’<b>ordre</b> dans lequel elles sont prises.'])}
${pm.recap(['Deux acteurs, deux ressources prises dans l’ordre inverse = interblocage possible.', '9 situations, 2 sans suite : la fin et le blocage.', 'Une garantie demande d’examiner toutes les situations.'])}`,
      },
      {
        id: 'pm4-marche', title: 'La marche à suivre qui construit le graphe', slides: '5',
        summary: 'On part du marquage initial ; pour chaque marquage à explorer, on tire chaque transition activable et on ajoute les marquages nouveaux à la liste, jusqu’à ce qu’il n’en reste plus.',
        fiche: R`
${pm.why(`<p>Un graphe dessiné à la main peut oublier une situation. Pour être sûr de n’en oublier aucune, on écrit une <b>marche à suivre</b> applicable à n’importe quel réseau : c’est celle que l’outil exécute.</p>`)}
<div class="def"><b>Graphe d’accessibilité</b> : ses sommets sont tous les marquages accessibles depuis $m_0$ ; il y a une flèche $m\xrightarrow{\,t\,}m'$ chaque fois que le tir de $t$ fait passer de $m$ à $m'$.</div>
<div class="thm"><b>Marche à suivre</b><ol>
<li>Mettre $m_0$ dans la liste <b>à explorer</b> et dans l’ensemble <b>déjà vus</b>.</li>
<li>Tant que la liste à explorer n’est pas vide : en sortir un marquage $m$.</li>
<li>Calculer les transitions <b>activables</b> en $m$.</li>
<li>Pour chacune, calculer $m'=\text{tirer}(t,m)$ et noter la flèche $m\xrightarrow{\,t\,}m'$.</li>
<li>Si $m'$ n’a <b>jamais été vu</b>, l’ajouter aux déjà vus et à la liste à explorer.</li>
<li>Quand la liste est vide, c’est fini : les déjà vus sont tous les marquages accessibles.</li></ol></div>
<p>Un marquage sans transition activable n’a pas de flèche sortante : c’est un marquage <b>sans suite</b> (terminal).</p>
<p>Avant de lancer le calcul sur l’échographe : combien de situations ? Combien sans suite ?</p>
${u.petri('echo', { ask: 'count', sec: 'pm4-marche', pion: ECHO, axes: [['Graphe sous le plateau', 'un rectangle par marquage (M0 = départ, trait épais). Une flèche étiquetée par le carré joué. En orange : les marquages sans suite.']] })}
${pm.ex(R`<p><b>Les premières étapes à la main.</b> $M_0=[1,0,0,1,0,0,1,1]$ : deux transitions activables.</p>
<ul><li><code>A_prend_écho</code> donne $M_1=[0,1,0,1,0,0,0,1]$ (nouveau) ;</li><li><code>B_prend_inf</code> donne $M_2=[1,0,0,0,1,0,1,0]$ (nouveau).</li></ul>
<p>On explore $M_1$ : <code>A_examine</code> donne $[0,0,1,1,0,0,1,1]$ (nouveau) et <code>B_prend_inf</code> donne $[0,1,0,0,1,0,0,0]$ (nouveau : c’est le blocage). On continue jusqu’à ce que plus aucun marquage nouveau n’apparaisse : 9 au total.</p>`)}
${pm.traps(['Oublier l’ensemble des déjà vus : on réexplorerait les mêmes marquages sans fin.', 'Ne tirer qu’une transition par marquage : il faut les tirer <b>toutes</b>, chacune à partir du même $m$.', 'Confondre le graphe d’accessibilité (ses sommets sont des <b>marquages</b>) et le réseau (ses sommets sont des places et des transitions).'])}
${pm.recap(['Sommets = marquages accessibles ; flèches = tirs.', 'Deux listes : à explorer, déjà vus.', 'Sans suite = aucun carré jouable = sommet sans flèche sortante.'])}`,
      },
      {
        id: 'pm4-garantir', title: 'Garantir que les deux examens sont toujours réalisés', slides: '6',
        summary: 'Si les deux services prennent les ressources dans le même ordre, le blocage disparaît : 8 situations, une seule sans suite, la fin normale ; l’outil le prouve.',
        fiche: R`
${pm.why(`<p>Savoir qu’un blocage existe ne suffit pas : il faut changer l’organisation, puis <b>prouver</b> que le blocage a disparu. Le graphe d’accessibilité sert à cette preuve.</p>`)}
<h4>L’idée</h4>
<p>Le blocage vient de ce que A et B prennent les ressources dans l’<b>ordre inverse</b>. On impose le <b>même ordre</b> aux deux : d’abord l’échographe, ensuite l’infirmière. Celui qui a l’échographe est alors sûr d’obtenir l’infirmière, puisque l’autre ne peut pas la prendre sans l’échographe.</p>
${u.petri('echo-ordre', { ask: 'count', sec: 'pm4-garantir', pion: ECHO })}
${pm.table(['', 'Ordres inversés', 'Même ordre'], [['Marquages accessibles', '9', '8'], ['Sans suite', '2 (fin et blocage)', '1 (fin)'], ['Les deux examens toujours réalisés', 'non', '<b>oui</b>']])}
<div class="def"><b>Comment lit-on la garantie ?</b> Le seul marquage sans suite est $[0,0,1,0,0,1,1,1]$ : <code>A_fini</code> et <code>B_fini</code> marqués, les deux ressources libres. Le graphe est fini et sans cycle : tout déroulement finit donc dans ce marquage.</div>
${pm.ex(`<p><b>Autre organisation possible.</b> Réserver les deux ressources d’un seul coup : une place <code>paire_libre</code> à un pion (« l’échographe et l’infirmière sont disponibles ensemble »), prise au début de l’examen, rendue à la fin. Un service ne peut alors plus tenir l’une sans l’autre. C’est plus strict : l’échographe ne peut plus servir seul.</p>`, 'Variante')}
${pm.traps(['Ajouter un deuxième échographe « pour être sûr » : coûteux, et inutile si l’ordre est corrigé.', 'Vérifier la correction en jouant une partie : il faut le graphe complet.', 'Oublier de vérifier que la fin normale reste accessible.'])}
${pm.recap(['Même ordre d’acquisition pour tous = plus d’interblocage.', 'Preuve : 8 marquages, 1 seul sans suite, la fin.', 'Le graphe d’accessibilité sert à prouver, pas seulement à compter.'])}`,
      },
      {
        id: 'pm4-limite', title: 'La limite de la méthode : le réseau non borné', slides: '7',
        summary: 'Si une place peut grandir sans fin, il y a une infinité de marquages et la marche à suivre ne s’arrête jamais ; on borne le réseau en limitant cette place par une ressource.',
        fiche: R`
${pm.why(`<p>La marche à suivre s’arrête quand plus aucun marquage nouveau n’apparaît. Encore faut-il que cela arrive. Ce petit réseau montre que non.</p>`)}
${pm.enonce('Ce réseau modélise l’arrivée de patients dans une salle d’attente. Prédisez ce que donnera la marche à suivre. Comment modifier le réseau pour qu’elle aboutisse ?')}
${u.petri('accueil', { ask: 'bounded', sec: 'pm4-limite', pion: 'dans <code>accueil_ouvert</code> : la <b>condition</b> « l’accueil est ouvert » ; dans <code>salle_d\'attente</code> : un <b>patient</b>.' })}
<p><code>arrivée</code> prend le pion de <code>accueil_ouvert</code> et le rend aussitôt : elle est <b>toujours</b> jouable, et chaque tir ajoute un patient. Les marquages sont $[1,0],[1,1],[1,2],[1,3],\dots$ : une infinité.</p>
<div class="def"><b>Réseau borné</b> : il existe un nombre $k$ tel qu’aucune place ne contient jamais plus de $k$ pions dans un marquage accessible (on dit <b>$k$-borné</b>). Sinon il est <b>non borné</b>, et son graphe d’accessibilité est infini.</div>
${pm.ex(R`<p><b>Comment le repérer sans tourner indéfiniment ?</b> Dès qu’on atteint un marquage $m'$ qui <b>contient</b> un marquage $m$ rencontré plus tôt sur le même chemin (au moins autant de pions partout, et strictement plus quelque part), la suite de coups qui a mené de $m$ à $m'$ peut être rejouée depuis $m'$, encore et encore. Ici $[1,1]$ contient $[1,0]$ dès le premier tir.</p>
<p>C’est le test qu’applique le simulateur : ouvre le graphe ci-dessus.</p>`)}
<h4>Comment borner ?</h4>
<p>Limiter la salle : une place <code>chaises_libres</code> avec $n$ pions, consommée par <code>arrivée</code>.</p>
${u.petri('accueil-borne', { ask: 'count', sec: 'pm4-limite', noAxes: true })}
<p>Avec 3 chaises : 4 marquages, et le dernier, $[1,0,3]$, est sans suite (la salle est pleine). Pour un modèle plus réaliste, on ajouterait une transition « appeler un patient » qui rend la chaise.</p>
${pm.traps(['Croire qu’un petit réseau a forcément un petit graphe : deux places suffisent pour un graphe infini.', 'Confondre « non borné » et « sans blocage » : ce sont deux propriétés différentes.', 'Lancer la marche à suivre à la main sur un réseau non borné sans se rendre compte qu’un marquage en contient un précédent.'])}
${pm.recap(['Non borné = une place peut grandir sans fin = graphe infini.', 'Signe : un marquage qui contient strictement un marquage précédent du même chemin.', 'On borne avec une place ressource.'])}`,
      },
      {
        id: 'pm4-vaccination', title: 'À vous : le graphe du centre de vaccination', slides: '8',
        summary: 'Le centre corrigé (trois personnes, un box) a 10 marquages accessibles ; aucun n’a deux pions dans dans_box, et c’est ainsi qu’on lit qu’il n’y a jamais deux personnes dans le box.',
        fiche: R`
${pm.enonce('Appliquez la marche à suivre au modèle corrigé du problème 1 (trois personnes, un box). Combien de marquages sont accessibles ? Comment y lit-on qu’il n’y a jamais deux personnes dans le box ?')}
${pm.todo('<p>Construis le graphe sur papier : pars de $[3,1,0,0,0]$ sur (attente, box_libre, dans_box, vacciné, sorti). Annonce le nombre de marquages avant de vérifier.</p>')}
${u.petri('vacc-corrige', { ask: 'count', sec: 'pm4-vaccination', pion: 'un patient, sauf dans <code>box_libre</code>.' })}
${pm.sol('Corrigé', R`
<p><b>10 marquages accessibles</b>, un seul sans suite : $[0,1,0,0,3]$ (les trois personnes sorties, le box libre). Le graphe est une simple chaîne : à chaque instant un seul carré est jouable.</p>
<p>$[3,1,0,0,0]\to[2,0,1,0,0]\to[2,0,0,1,0]\to[2,1,0,0,1]\to[1,0,1,0,1]\to[1,0,0,1,1]\to[1,1,0,0,2]\to[0,0,1,0,2]\to[0,0,0,1,2]\to[0,1,0,0,3]$</p>
<p><b>Comment lit-on qu’il n’y a jamais deux personnes dans le box ?</b> On regarde la colonne <code>dans_box</code> (troisième case) des 10 vecteurs : elle ne vaut jamais 2 ou plus. Comme le graphe contient <b>toutes</b> les situations accessibles, c’est une preuve.</p>
<p>Mieux : dans les 10 vecteurs, $m(\text{box\_libre})+m(\text{dans\_box})+m(\text{vacciné})=1$. C’est l’invariant de la place ressource (le box est rendu par <code>sortir</code>, donc un patient vacciné l’occupe encore).</p>`)}
<h4>Comparer avec le plateau non corrigé</h4>
${u.petri('vacc-naif', { ask: 'count', sec: 'pm4-vaccination', noAxes: true })}
<p>Sans <code>box_libre</code> : <b>20 marquages</b>, parmi lesquels $[0,3,0,0]$, trois personnes dans le box. La correction a supprimé la moitié des situations, dont toutes celles qui étaient interdites.</p>
${pm.traps(['Répondre « parce qu’il y a <code>box_libre</code> » : la question demande comment on le <b>lit dans le graphe</b>.', 'Oublier que la preuve repose sur le fait que le graphe est complet.', 'Compter 9 marquages en oubliant le marquage initial.'])}
${pm.recap(['Centre corrigé : 10 marquages, 1 sans suite.', 'Une propriété « jamais » se lit en vérifiant tous les marquages du graphe.', 'Un invariant résume cette vérification en une égalité.'])}`,
      },
    ],
    cards: [
      ...pm.cards('pm4-echo', [
        ['def', 'Qu’est-ce qu’un interblocage ?', 'Une situation où chaque acteur tient une ressource et attend celle que l’autre tient : plus aucun carré n’est jouable alors que le travail n’est pas fini.'],
        ['why', 'Pourquoi le blocage de l’échographe échappe-t-il à l’intuition ?', 'Il n’apparaît que si A prend l’échographe <b>et</b> B l’infirmière avant qu’aucun n’ait fini. Dans les autres déroulements, tout se passe bien.'],
        ['read', 'Échographe : combien de situations, combien sans suite ?', '9 marquages accessibles, 2 sans suite : la fin normale $[0,0,1,0,0,1,1,1]$ et le blocage $[0,1,0,0,1,0,0,0]$.'],
        ['trap', 'Le blocage vient-il d’un manque de ressources ?', 'Non : une seule de chaque suffit si elles sont prises dans le même ordre. Il vient de l’ordre d’acquisition inversé.'],
      ]),
      ...pm.cards('pm4-marche', [
        ['def', 'Qu’est-ce que le graphe d’accessibilité ?', 'Le graphe dont les sommets sont tous les marquages accessibles depuis $m_0$, avec une flèche $m\\to m\'$ étiquetée $t$ quand le tir de $t$ mène de $m$ à $m\'$.'],
        ['def', 'Donne la marche à suivre en une phrase.', 'On explore chaque marquage de la liste : on tire chacune de ses transitions activables, et tout marquage jamais vu rejoint la liste ; on s’arrête quand elle est vide.'],
        ['why', 'Pourquoi tenir un ensemble des marquages déjà vus ?', 'Pour ne pas explorer deux fois le même marquage : sans lui, la marche tournerait en rond dès qu’il y a un cycle.'],
        ['def', 'Qu’est-ce qu’un marquage sans suite (terminal) ?', 'Un marquage où aucune transition n’est activable : dans le graphe, un sommet sans flèche sortante.'],
        ['trap', 'Les sommets du graphe d’accessibilité sont-ils les places du réseau ?', 'Non : ce sont des <b>marquages</b> (des situations entières). Le graphe d’accessibilité et le réseau sont deux objets différents.'],
      ]),
      ...pm.cards('pm4-garantir', [
        ['decide', 'Comment supprimer l’interblocage de l’échographe sans acheter de matériel ?', 'Imposer le même ordre d’acquisition aux deux services : l’échographe d’abord, l’infirmière ensuite.'],
        ['why', 'Pourquoi le même ordre supprime-t-il le blocage ?', 'Celui qui tient l’échographe est sûr d’obtenir l’infirmière : l’autre ne peut pas la prendre sans avoir d’abord l’échographe.'],
        ['read', 'Après correction : combien de marquages, combien sans suite ?', '8 marquages, 1 seul sans suite : la fin normale. Les deux examens sont toujours réalisés.'],
        ['trap', 'Une partie réussie prouve-t-elle que la correction fonctionne ?', 'Non. La preuve est que, dans le graphe complet, le seul marquage sans suite est la fin normale.'],
      ]),
      ...pm.cards('pm4-limite', [
        ['def', 'Qu’est-ce qu’un réseau borné ?', 'Un réseau pour lequel il existe $k$ tel qu’aucune place ne contient plus de $k$ pions dans aucun marquage accessible ($k$-borné). Sinon il est non borné.'],
        ['why', 'Pourquoi la marche à suivre ne s’arrête-t-elle pas sur l’accueil ouvert ?', '<code>arrivée</code> est toujours jouable et ajoute un patient à chaque tir : $[1,0],[1,1],[1,2]\\dots$ Il y a toujours un marquage nouveau.'],
        ['read', 'À quel signe reconnaît-on un réseau non borné pendant la construction du graphe ?', 'On atteint un marquage qui contient strictement un marquage précédent du même chemin : la même suite de coups peut être rejouée sans fin.'],
        ['decide', 'Comment borner l’accueil ouvert ?', 'Ajouter une place ressource <code>chaises_libres</code> à $n$ pions, consommée par <code>arrivée</code>.'],
      ]),
      ...pm.cards('pm4-vaccination', [
        ['read', 'Centre corrigé, trois personnes, un box : combien de marquages accessibles ?', '10, dont un seul sans suite : $[0,1,0,0,3]$.'],
        ['read', 'Comment lit-on dans le graphe qu’il n’y a jamais deux personnes dans le box ?', 'Dans aucun des 10 marquages la case <code>dans_box</code> ne vaut 2 ou plus. Le graphe étant complet, c’est une preuve.'],
        ['why', 'Pourquoi le plateau non corrigé a-t-il 20 marquages contre 10 ?', 'Sans <code>box_libre</code>, les patients avancent indépendamment : toutes les répartitions de 3 pions sur 4 places sont accessibles, y compris $[0,3,0,0]$.'],
        ['trap', '« Il n’y a jamais deux personnes dans le box parce qu’il y a box_libre. » Est-ce la réponse attendue ?', 'Non : on demande comment on le <b>lit dans le graphe</b>. Réponse : aucun des 10 marquages accessibles n’a 2 pions ou plus dans <code>dans_box</code>.'],
        ['link', 'Quel invariant résume la vérification sur les 10 marquages ?', '$m(\\text{box\\_libre})+m(\\text{dans\\_box})+m(\\text{vacciné})=1$.'],
      ]),
    ],
    quiz: [
      ...pm.quiz('pm4-echo', [
        [`${pm.fig('echo', [0, 1, 0, 0, 1, 0, 0, 0])}Que peut-on jouer dans cette situation ?`, ['Rien : c’est le blocage', '<code>A_examine</code>', '<code>B_examine</code>', '<code>A_examine</code> ou <code>B_examine</code>'], 0, 'A attend l’infirmière que B tient, B attend l’échographe que A tient.'],
        [`${pm.fig('echo', [0, 1, 0, 1, 0, 0, 0, 1])}A a pris l’échographe. Quelles transitions sont activables ?`, ['<code>A_examine</code> et <code>B_prend_inf</code>', '<code>A_examine</code> seulement', '<code>B_prend_inf</code> seulement', 'aucune'], 0, 'L’infirmière est libre : A peut l’utiliser pour examiner, ou B peut la prendre (et provoquer le blocage).'],
        ['Parmi les 2 marquages sans suite de l’échographe, lequel est un problème ?', ['Celui où A attend l’infirmière et B l’échographe', 'Celui où A_fini et B_fini sont marqués', 'Les deux', 'Aucun'], 0, 'La fin normale est aussi « sans suite », mais c’est le but. Il faut regarder ce que le marquage veut dire.'],
      ]),
      ...pm.quiz('pm4-marche', [
        ['Dans la marche à suivre, on sort $m$ de la liste et on trouve 3 transitions activables. Combien de tirs calcule-t-on ?', ['3, tous à partir de $m$', '1, celui qu’on préfère', '3, enchaînés l’un après l’autre', 'Cela dépend des marquages déjà vus'], 0, 'On tire chaque transition activable à partir du même $m$. Ce sont trois flèches sortantes.'],
        ['La marche à suivre s’arrête quand :', ['la liste des marquages à explorer est vide', 'on atteint un marquage sans suite', 'on retombe sur $m_0$', 'toutes les transitions ont été tirées une fois'], 0, 'Un marquage sans suite n’arrête que sa branche ; il peut rester d’autres marquages à explorer.'],
        [`${pm.fig('ex12-sans-p3')}Applique la marche à suivre : combien de marquages accessibles ?`, ['3', '2', '4', 'une infinité'], 0, '$[1,0,2]$, $[0,1,1]$ (après $t_1$) et $[0,0,2]$ (après $t_2$). $t_3$ prend et rend un pion à $p_4$ : elle ne change rien.'],
      ]),
      ...pm.quiz('pm4-garantir', [
        ['Avec le même ordre d’acquisition, A tient l’échographe. B peut-il prendre l’infirmière ?', ['Non : B doit d’abord obtenir l’échographe', 'Oui', 'Oui, si A a fini', 'Seulement une fois sur deux'], 0, 'C’est ce qui empêche l’interblocage : personne ne tient l’infirmière sans avoir l’échographe.'],
        ['Qu’est-ce qui prouve que « les deux examens sont toujours réalisés » ?', ['Le seul marquage sans suite du graphe est celui où A_fini et B_fini sont marqués', 'Une partie jouée jusqu’au bout', 'Le fait qu’il y a moins de marquages', 'Le fait que les deux services ont les mêmes transitions'], 0, 'Graphe fini, sans cycle, une seule fin : tout déroulement y aboutit.'],
      ]),
      ...pm.quiz('pm4-limite', [
        [`${pm.fig('message-pb2')}Ce réseau (le message du problème 2) est-il borné ?`, ['Non : $p_3$ peut grandir sans fin', 'Oui, il est 2-borné', 'Oui, il est 1-borné', 'On ne peut pas le savoir'], 0, 'Depuis $[1,1,1]$, $t_1$ puis $t_2$ donnent $[1,1,2]$, qui contient le départ : on peut recommencer.'],
        ['En construisant le graphe, on a sur un même chemin $[1,0,2]$ puis plus loin $[1,1,2]$. Conclusion ?', ['Le réseau n’est pas borné', 'Le réseau se bloque', 'Il faut continuer pour savoir', 'On s’est trompé'], 0, '$[1,1,2]$ contient strictement $[1,0,2]$ : la suite de coups entre les deux peut être répétée, la deuxième place grandit sans fin.'],
        ['Un réseau 1-borné est un réseau où :', ['aucune place ne contient jamais plus d’un pion', 'il n’y a qu’un pion au total', 'il n’y a qu’un marquage accessible', 'chaque transition n’est jouable qu’une fois'], 0, 'La borne porte sur chaque place, dans chaque marquage accessible.'],
      ]),
      ...pm.quiz('pm4-vaccination', [
        ['Centre corrigé avec <b>deux</b> box (2 pions dans box_libre), 3 personnes : le nombre de marquages accessibles est', ['16', '10', '20', '8'], 0, 'Plus de liberté qu’avec un box (10), moins que sans aucune limite (20).'],
        ['Pourquoi le graphe du centre corrigé à un box est-il une simple chaîne ?', ['Dans chaque situation, un seul carré est jouable', 'Parce qu’il n’y a que trois transitions', 'Parce que le réseau est borné', 'Parce que les patients sont anonymes'], 0, 'Tant qu’un patient occupe le box, personne d’autre ne peut avancer : aucun choix.'],
      ]),
    ],
    gens: {
      'pm4-echo': [g.enabled(['echo']), g.after(['echo'])],
      'pm4-marche': [g.count(['sas', 'sterilisation', 'motif-and-split', 'ex12', 'accueil-borne', 'piege1']), g.dead(['echo', 'piege1', 'motif-xor-split', 'sterilisation', 'sas'])],
      'pm4-garantir': [g.enabled(['echo-ordre']), g.dead(['echo', 'echo-ordre'])],
      'pm4-limite': [g.count(['accueil-borne', 'sas-porte', 'ambulances-2']), g.enabled(['accueil-borne'])],
      'pm4-vaccination': [g.count(['vacc-corrige', 'sterilisation', 'reveil-naif']), g.after(['vacc-corrige'])],
    },
  });
})();
