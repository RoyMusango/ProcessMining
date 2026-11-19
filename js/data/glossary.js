// Glossaire des notations du cours de Process mining. Chaque entrée dit comment lire un symbole et ce qu'il désigne.
// `re` repère le symbole dans le texte source (LaTeX) d'une fiche, d'une carte ou d'un exercice.
// L'app en tire l'encadré « Notations » en tête de chaque fiche et le bouton « Notations » des cartes et exercices.
(function () {
  const R = String.raw;
  const E = (sym, name, def, re, chs = null) => ({ sym, name, def, re: new RegExp(re), chs });

  COURSE.glossary = [
    E(R`P`, 'ensemble des places', R`Les <b>ronds</b> du plateau : lieux, états, conditions ou ressources. Exemple : $P=\{\text{attente},\text{box\_libre},\text{dans\_box}\}$.`, R`P\s?=\s?\\\{|P\\times|\\in P|P\\to|\(P,\s?T|p\\in P`),
    E(R`T`, 'ensemble des transitions', R`Les <b>carrés</b> du plateau : actions, événements. Exemple : $T=\{\text{entrer},\text{vacciner},\text{sortir}\}$.`, R`T\s?=\s?\\\{|\\times T|T\\times|\(P,\s?T`),
    E(R`F`, 'relation de flux', R`L’ensemble des <b>flèches</b>, chacune écrite comme un couple (départ, arrivée). $F\subseteq(P\times T)\cup(T\times P)$ : une flèche relie toujours une place et une transition.`, R`F\s?=\s?\\\{|\\in F|F\\subseteq|T,\s?F`),
    E(R`(a,b)\in F`, 'couple', R`Une flèche de $a$ vers $b$. L’ordre compte : $(p,t)$ va de la place vers la transition.`, R`\\in F|\(p_\d,\s?t_\d\)|\(t_\d,\s?p_\d\)`),
    E(R`m,\ m_0,\ m'`, 'marquage', R`La <b>situation</b> : combien de pions dans chaque place. $m_0$ est la situation de départ, $m'$ la situation après un tir. On l’écrit en vecteur, une case par place.`, R`m_0|m'|m\s?=|\(t,\s?m\)|\bm\(`),
    E(R`m(p)`, 'nombre de pions dans p', R`Le nombre de jetons que contient la place $p$ dans le marquage $m$. Exemple : $m(\text{box\_libre})=1$.`, R`m'?\(`),
    E(R`[3,1,0]`, 'vecteur de marquage', R`Une case par place, <b>dans l’ordre de $P$</b>. Variante des exercices : $[p_1,p_4,p_4]$ liste les pions (un dans $p_1$, deux dans $p_4$).`, R`\[\d+,\s?\d|\[p_\d`),
    E(R`\mathbb N`, 'entiers naturels', R`$0, 1, 2, \dots$ Un nombre de pions est un entier naturel.`, R`\\mathbb N`),
    E(R`\bullet t`, 'preset de t', R`Les <b>places d’entrée</b> de la transition $t$ : $\bullet t=\{p:(p,t)\in F\}$. Le point est du côté des places, avant $t$.`, R`\\bullet\s?[t\\]|\\bullet\\text`),
    E(R`t\bullet`, 'postset de t', R`Les <b>places de sortie</b> de la transition $t$ : $t\bullet=\{p:(t,p)\in F\}$.`, R`[t\}]\\bullet|t_\d\\bullet`),
    E(R`p\bullet`, 'transitions de sortie de p', R`Les transitions qui partent de la place $p$. Si $|p\bullet|\ge 2$, la place est un XOR-split.`, R`p\\bullet`),
    E(R`|\bullet t|,\ |t\bullet|`, 'nombre d’entrées, de sorties', R`Les barres comptent les éléments d’un ensemble : $|t\bullet|\ge 2$ veut dire « $t$ a au moins deux places de sortie ».`, R`\|\\bullet|\\bullet\|`),
    E(R`[\,p\in\bullet t\,]`, 'crochet d’Iverson', R`Vaut 1 si la condition entre crochets est vraie, 0 sinon. Permet d’écrire le tir en une seule formule.`, R`\[p\\in`),
    E(R`w(p,t),\ w(t,p)`, 'poids d’un arc', R`Le nombre de pions qu’une flèche prend ($w(p,t)$) ou dépose ($w(t,p)$) en un tir. Vaut 1 quand rien n’est écrit, 0 s’il n’y a pas de flèche.`, R`w\(`),
    E(R`\forall`, 'pour tout', R`« Pour tout » : $\forall p\in\bullet t$ se lit « pour chaque place d’entrée de $t$ ».`, R`\\forall`),
    E(R`\iff`, 'si et seulement si', R`Les deux côtés sont vrais en même temps ou faux en même temps.`, R`\\iff`),
    E(R`\subseteq,\ \cup,\ \times`, 'inclus dans, union, produit', R`$A\subseteq B$ : tout élément de $A$ est dans $B$. $A\cup B$ : les éléments de $A$ ou de $B$. $P\times T$ : tous les couples (place, transition).`, R`\\subseteq|\\cup|\\times T|T\\times`),
    E(R`m\xrightarrow{\,t\,}m'`, 'passage', R`Le tir de $t$ fait passer de la situation $m$ à la situation $m'$ : une flèche du graphe d’accessibilité.`, R`\\xrightarrow`),
    E(R`M_0, M_1, \dots`, 'marquages numérotés', R`Les sommets du graphe d’accessibilité, numérotés dans l’ordre où la marche à suivre les découvre. $M_0$ est le marquage initial.`, R`M_\d`),
    E(R`k`, 'borne', R`Un réseau est $k$-borné si aucune place ne contient jamais plus de $k$ pions.`, R`k\$?-born|k>1|k=1|k\+1`),
    E(R`N`, 'capacité', R`Le nombre de pions mis au départ dans une place ressource : la capacité maximale (1 box, 3 lits, 8 sièges).`, R`=N\b|N jetons|\$N`),
    // Réseaux colorés et temporisés (problèmes 5 et 6, séance 3)
    E(R`[\text{ana},\ \text{ben},\ 2.\text{cleo}]`, 'multiensemble', R`Le marquage d’une place colorée : la liste de ses valeurs, sans ordre ; « 2.cleo » veut dire deux jetons de valeur cleo. L’outil écrit <code>1&#96;ana++2&#96;cleo</code>.`, R`multiensemble|2\.cleo|\]\s?:|m\(attente\) = \[`, ['pm5', 'pm6', 'pmx3']),
    E(R`\texttt{colset}`, 'type d’une place (sa couleur)', R`L’ensemble des valeurs que peuvent porter ses jetons : string, int, unit, énumération (with a | b), product (couple).`, R`colset`, ['pm5', 'pm6', 'pmx3']),
    E(R`\langle p=\text{ben},\ n=0\rangle`, 'liaison', R`Une valeur choisie pour chaque variable de la transition. Une même variable a la même valeur sur tous les arcs de la transition.`, R`⟨`, ['pm5', 'pm6', 'pmx3']),
    E(R`[\,a<16\,]`, 'garde', R`Une condition sur les variables, écrite entre crochets près de la transition : la liaison n’est tirable que si elle est vraie.`, R`\[a [<≥]|\[q [<>]|\[c [=≠]|\[k = n\]|\[t ?[<>]|\[couv=|garde`, ['pm5', 'pm6', 'pmx3']),
    E(R`x@t`, 'horodatage', R`Le jeton $x$ ne peut pas être consommé avant l’instant $t$ de l’horloge globale. Exemple : ben@5.`, R`@\d|horodat`, ['pm6', 'pmx3']),
    E(R`@+d`, 'délai', R`Sur un arc de sortie : le jeton produit est horodaté « instant du tir + $d$ ». C’est une durée minimale.`, R`@\+`, ['pm6', 'pmx3']),
  ];

  // Notations présentes dans un texte, pour un chapitre donné, dans l'ordre de première apparition
  COURSE.notationsIn = (text, ch) => {
    const out = [];
    for (const g of COURSE.glossary) {
      if (g.chs && !g.chs.includes(ch)) continue;
      const m = g.re.exec(text);
      if (m) out.push({ g, at: m.index });
    }
    const seen = new Set();
    return out.filter(x => { const k = x.g.sym; if (seen.has(k)) return false; seen.add(k); return true; }).sort((a, b) => a.at - b.at).map(x => x.g);
  };
  // Première notion (dans l'ordre du cours, chapitre de la notion) où une notation apparaît
  COURSE.firstUse = (g, ch) => COURSE.chapter(ch).sections.find(id => g.re.test(COURSE.sections[id].fiche + COURSE.sections[id].summary));
})();
