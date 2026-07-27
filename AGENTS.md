# AGENTS.md

Guide pour les agents IA travaillant sur ce dépôt.

## Contexte du projet

Package de nœuds communautaires n8n, écrit en TypeScript : `n8n-nodes-france-datagouv`.
Il expose un seul nœud, `France Data.gouv` (`franceDataGouv`), pensé comme point
d'entrée vers **plusieurs API ouvertes de l'État**. Ses opérations sont donc
regroupées par **ressource** (paramètre `resource`), et non listées à plat.

Deux ressources existent aujourd'hui :

| `resource` | Libellé | API | Opérations |
| --- | --- | --- | --- |
| `rechercheEntreprise` | Recherche d'entreprise | `recherche-entreprises.api.gouv.fr` | `recherche`, `proximite` |
| `joursFeries` | Jour férié | `calendrier.api.gouv.fr/jours-feries` | `liste`, `annee` |

Ajouter une API voisine = une option de plus dans `resource`, un sous-dossier sous
`nodes/FranceDataGouv/`, un cas dans le `if/else` d'`execute()`, et une entrée dans
les `subcategories` du codex — sans toucher à l'existant. Le libellé d'une ressource
est au **singulier** (règle `node-param-resource-with-plural-option`), d'où « Jour
férié » pour une API qui s'appelle « Jours fériés ».

Ces API sont **totalement ouvertes** : ni clé, ni compte, ni en-tête d'authentification.
Le package ne déclare donc **aucun credential**, et c'est volontaire — ne pas en
réintroduire « par précaution ». Les appels passent par `this.helpers.httpRequest`,
et non par `httpRequestWithAuthentication`.

Dépôt : `https://github.com/tsnaketech/n8n-nodes-france-datagouv` (branche `main`).
`author`, `repository`, `homepage` et `bugs` sont renseignés dans `package.json` ;
l'URL de `repository` doit rester alignée sur le dépôt réel, la provenance npm
signée par `publish.yml` la vérifie.

## Contraintes de l'API Recherche d'Entreprises

Elles sont la source de la plupart des décisions de conception du nœud :

- `per_page` est plafonné à **25**. Le nœud pagine lui-même (`apiRequestAllItems`).
- `page * per_page` ne peut pas dépasser **10 000** — l'API renvoie une 400 au-delà.
  C'est `MAX_TOTAL_RESULTS`, la borne dure de `Return All`.
- **7 requêtes/seconde par IP**, 30/seconde par ASN. D'où le `THROTTLE_MS` de 150 ms
  entre deux pages dans `GenericFunctions.ts` — ne pas le retirer.
- Les erreurs arrivent en 400 avec un corps `{ "erreur": "..." }`. `apiErrorMessage()`
  extrait ce message pour le remonter dans un `NodeApiError` ; ces messages sont très
  explicites (ils listent les valeurs valides), donc les préserver plutôt que de les
  remplacer par un texte générique.
- `include` n'est accepté qu'avec `minimal=True`, et la valeur `tva` n'existe que sur
  `/search`, pas sur `/near_point`. Les deux cas sont validés côté nœud, avant l'appel.
- Une recherche sans aucun critère est rejetée : le nœud l'intercepte aussi.

Spec de référence : `https://recherche-entreprises.api.gouv.fr/openapi.json`.
Contre-vérifier tout ajout de paramètre avec elle plutôt qu'avec la mémoire.

## Contraintes de l'API Jours fériés

Beaucoup plus simple, et c'est ce qui justifie qu'elle ne réutilise rien de
`RechercheEntreprise/` :

- Deux routes seulement, tout en segments de chemin, **aucun paramètre de query** :
  `/{zone}.json` et `/{zone}/{annee}.json`.
- La réponse n'est **pas** une liste mais un dictionnaire `date ISO → nom`
  (`{"2026-01-01": "1er janvier", …}`). `execute.ts` le déplie en un item par jour
  férié (`date`, `nom`, `annee`, `zone`) pour rester sur « un item par entité ».
- Couverture : **20 ans dans le passé, 5 ans dans le futur**. Hors bornes, l'API
  répond 404 sans corps exploitable — d'où le message d'erreur explicite écrit
  côté nœud, contrairement à Recherche d'Entreprises où l'on préserve le message
  de l'API.
- Ni pagination, ni limite de débit documentée : pas de `returnAll`, pas de
  `limit`, pas de throttle. Ne pas en ajouter par symétrie avec l'autre ressource.
- 13 zones (enum `Zone` de la spec) : l'Alsace-Moselle ajoute le Vendredi saint et
  la Saint-Étienne, l'outre-mer ses dates d'abolition de l'esclavage.

Spec de référence : `https://calendrier.api.gouv.fr/jours-feries/openapi.yml`.

## Structure

```
nodes/FranceDataGouv/
  FranceDataGouv.node.ts                 Description du nœud, sélecteur `resource`, boucle execute()
  FranceDataGouv.node.json               Codex : catégories, un sous-groupe par API, alias de recherche
  RechercheEntreprise/                   Tout ce qui est propre à l'API Recherche d'Entreprises
    RechercheEntrepriseDescription.ts    Opérations + champs communs (Tout retourner, Limite, Options)
    RechercheDescription.ts              Champs de l'opération « Rechercher » (+ collection Filtres)
    ProximiteDescription.ts              Champs de l'opération « Rechercher à proximité »
    Options.ts                           Listes d'options partagées (sections NAF, tranches, include)
    GenericFunctions.ts                  Appel HTTP, pagination, throttle, extraction d'erreur
    execute.ts                           Logique d'exécution de la ressource, pour un item d'entrée
  JoursFeries/                           Tout ce qui est propre à l'API Jours fériés
    JoursFeriesDescription.ts            Opérations + champs Zone et Année
    Options.ts                           Les 13 zones de la spec
    GenericFunctions.ts                  Appel HTTP (deux routes, sans query string)
    execute.ts                           Déplie le dictionnaire date → nom en items
icons/franceDataGouv.svg, .dark.svg
scripts/copy-codex.mjs                   Recopie les `*.node.json` vers dist/ (hook `postbuild`)
.github/workflows/ci.yml                 lint + build sur PR et push sur main
.github/workflows/publish.yml            Publication npm avec provenance sur tag *.*.*
```

Le fichier `.node.ts` garde la boucle sur les items, le `try/catch`, le
`continueOnFail()` et le `pairedItem` — plusieurs règles ESLint ne les cherchent
que là. `execute.ts` ne traite qu'un item et renvoie un tableau de résultats.
Chaque `displayOptions` porte sa `resource` (`['rechercheEntreprise']`,
`['joursFeries']`, …) en plus de l'opération, sinon les champs d'une ressource
fuitent dans une autre — les deux ressources ont par exemple une opération dont
les champs sont propres.

## Codex : un sous-groupe par API

`FranceDataGouv.node.json` déclare le classement du nœud dans le panneau n8n.
**Une API = une entrée de `subcategories`**, plus ses mots-clés dans `alias` :

```json
"categories": ["Data & Storage"],
"subcategories": { "Data & Storage": ["Recherche d'Entreprises", "Jours fériés"] },
"alias": ["SIREN", "SIRET", "Sirene", "INSEE", "entreprise", "jours fériés", "calendrier", …]
```

`resources.primaryDocumentation` liste aussi une URL de spec par API.

Ajouter une API = ajouter son nom au tableau de `subcategories` et ses mots-clés
à `alias`, en parallèle de la nouvelle valeur de `resource`. Le regroupement
visible dans la liste d'actions du panneau, lui, vient des options de `resource`
et des `action` des opérations, pas du codex.

Deux pièges de chargement, tous deux vérifiés dans le code de `n8n-core`
(`directory-loader.js`, `getCodex` / `addCodex`) :

- n8n résout le codex à partir du **JS compilé** : `dist/…/X.node.js` → il fait
  `require('dist/…/X.node.json')`. Or `n8n-node build` ne recopie que les `.png`,
  les `.svg` et les JSON de `__schema__/`. D'où `scripts/copy-codex.mjs`, branché
  sur `postbuild`. Sans lui, aucune erreur : le nœud se range simplement dans la
  seule catégorie « Custom Nodes ». `n8n-node dev` ne déclenche pas ce hook.
- Un nœud chargé depuis `N8N_CUSTOM_EXTENSIONS` (`packageName === 'CUSTOM'`)
  **ignore** un éventuel `description.codex` déclaré en TypeScript : seul le
  fichier `.node.json` est lu. Ne pas déplacer le codex dans le `.node.ts`.
  n8n ajoute de lui-même « Custom Nodes » aux catégories dans ce mode.

`tsconfig.json` compile `nodes/**` vers `dist/`. Le chemin déclaré dans
`package.json` → `n8n.nodes` pointe vers `dist/`, pas vers les sources : **toute
création ou renommage de nœud doit y être répercuté**, sinon n8n ne charge rien
et il n'y a aucune erreur explicite.

## Convention de nommage des paramètres

Les paramètres n8n portent **les noms snake_case de la query string de l'API**
(`code_postal`, `est_bio`, `tranche_effectif_salarie`…), pas des noms camelCase.
C'est délibéré : la doc officielle se lit en parallèle du nœud, et `toQueryParams()`
peut passer les collections directement en query string sans table de correspondance.
Garder cette convention pour tout paramètre ajouté.

Les valeurs de `resource` et d'`operation` échappent à cette règle : elles sont en
français sans accent ni espace (`rechercheEntreprise`, `recherche`, `proximite`,
`joursFeries`, `liste`, `annee`), puisqu'elles ne correspondent à rien dans la
query string.

Même logique côté Jours fériés : cette API n'a aucun paramètre de query, ses deux
variables sont des segments de chemin, et les paramètres du nœud portent leurs
noms tels quels (`zone`, `annee`).

`toQueryParams()` (dans `RechercheEntreprise/execute.ts`) élimine les chaînes vides et les tableaux vides, et joint les
`multiOptions` par des virgules. Il **conserve** `false` et `0`, qui sont des valeurs
de filtre légitimes pour cette API (`est_bio=false` est une requête valide).

## Commandes

```bash
npm install
npm run build        # n8n-node build → dist/ (JS compilé + icônes copiées)
npm run build:watch  # tsc --watch
npm run dev          # n8n-node dev (boucle de dev avec n8n)
npm run lint         # n8n-node lint — même commande que la CI
npm run lint:fix
npm run release      # release interactive : lint, build, bump, tag, push → déclenche publish.yml
```

La CI n'exécute que `npm ci`, `npm run lint`, `npm run build`. Il n'y a **aucun test**
dans le dépôt et aucun runner de test configuré ; ne pas inventer `npm test`. Pour
vérifier un changement de comportement, le plus rapide est de compiler puis d'exécuter
la classe compilée avec un faux `IExecuteFunctions` (`getInputData`, `getNodeParameter`,
`getNode`, `continueOnFail`, `helpers.httpRequest`) — l'API étant ouverte, les appels
réels fonctionnent sans configuration.

## Conventions de code

- Prettier (`.prettierrc.js`) : **tabulations**, largeur 100, guillemets simples,
  points-virgules, virgules finales partout, fins de ligne LF.
- ESLint : config `@n8n/node-cli/eslint`, non personnalisée, en mode strict compatible
  n8n Cloud. Règles qui mordent en pratique :
  - les options d'une `collection` doivent être **triées alphabétiquement par
    `displayName`** (non auto-corrigeable, le message d'erreur donne l'ordre attendu) ;
  - la description d'un paramètre `boolean` doit commencer par « Whether » ;
  - `setTimeout` est interdit : utiliser `sleep` importé de `n8n-workflow` ;
  - un `throw error` brut est interdit : toujours construire un `NodeOperationError`
    ou un `NodeApiError`.
- TypeScript en `strict`, avec `noUnusedLocals` et `noImplicitReturns`.
- Importer les types depuis `n8n-workflow` en `import type`, et les valeurs
  (`NodeConnectionTypes`, `NodeOperationError`, `NodeApiError`, `sleep`) en import normal.

## Interface en français

Contrairement à la convention n8n, **les libellés et les descriptions de
l'interface sont en français**, comme l'API et la documentation du projet. Casse
de phrase française (« Est une administration », « Code d'activité (NAF/APE) »),
pas de title case anglais.

Cinq règles ESLint encodent des conventions rédactionnelles anglaises et sont
donc désactivées **en tête des fichiers concernés uniquement**, avec un commentaire
qui renvoie ici :

- `node-param-display-name-miscased` — impose le title case anglais, qui produirait
  « Code D'activité » ou « Est Une Administration » ;
- `node-param-operation-option-action-miscased` — passe par `sentence-case`, qui
  supprime les caractères accentués (« à proximité » → « proximit ») ;
- `node-param-description-boolean-without-whether` — exige un début en « Whether … » ;
- `node-param-description-wrong-for-return-all` / `-wrong-for-limit` — imposent mot
  pour mot les descriptions anglaises de `returnAll` et `limit`.

Ne **pas** modifier `eslint.config.mjs` pour cela : `n8n-node lint` compare ce
fichier à la configuration par défaut et refuse de s'exécuter dès qu'il diffère,
tant que `"strict": true` est dans `package.json` (c'est ce drapeau qui conditionne
la compatibilité n8n Cloud). Les désactivations en tête de fichier sont le seul
moyen de garder à la fois le français et le mode strict.

Le reste des règles vaut toujours, notamment le tri alphabétique des options de
`collection` (comparaison `localeCompare`, donc « État » se range après « Est »).

## Patterns n8n à respecter

- Boucle sur les items : itérer `this.getInputData()`, renseigner `pairedItem: { item: i }`
  sur chaque sortie, et honorer `this.continueOnFail()` avant de relancer l'erreur.
- Une recherche produit **un item n8n par entreprise**, pas un item contenant un tableau.
- Le nœud expose `usableAsTool: true` (utilisable par les agents IA n8n) — garder les
  `description` et `action` des opérations lisibles, elles servent de doc à l'agent.

## Documentation

Quatre READMEs traduits (`README.md`, `.fr.md`, `.es.md`, `.de.md`). Un changement visible
par l'utilisateur (nouvelle opération, nouveau filtre, prérequis) doit être répercuté dans
**les quatre**, sinon les traductions divergent silencieusement.

`CLAUDE.md` n'est qu'un pointeur vers ce fichier : ne rien y dupliquer.

## Publication

`publish.yml` se déclenche sur un tag `*.*.*` et publie sur npm avec provenance
(exigence n8n depuis mai 2026). Nécessite `@n8n/node-cli` ≥ 0.23.0. Ne pas publier
manuellement (`npm publish`) : cela produit un package sans attestation de provenance,
que n8n refusera.
