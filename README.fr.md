# n8n-nodes-france-datagouv

Nœud communautaire n8n pour les API ouvertes de l'État français (data.gouv.fr), exposées par un nœud unique **France Data.gouv** dont les opérations sont regroupées par ressource — **une ressource par API**. Il couvre aujourd'hui l'[API Recherche d'Entreprises](https://www.data.gouv.fr/dataservices/api-recherche-dentreprises) (toute entreprise, association ou service public immatriculé en France) et l'[API Jours fériés](https://www.data.gouv.fr/dataservices/jours-feries) (le calendrier des jours fériés français, par zone).

**L'interface du nœud est en français**, au plus près du vocabulaire de l'API elle-même (`code_postal`, `dirigeants`, `tranche_effectif_salarie`…).

[n8n](https://n8n.io/) est une plateforme d'automatisation de workflows sous [licence fair-code](https://docs.n8n.io/reference/license/).

Autres langues : [English](README.md) · [Español](README.es.md) · [Deutsch](README.de.md)

[Installation](#installation)
[Ressources et opérations](#ressources-et-opérations)
[Credentials](#credentials)
[Compatibilité](#compatibilité)
[Utilisation](#utilisation)
[Ressources](#ressources)
[Historique des versions](#historique-des-versions)
[Développement](#développement)

## Installation

Suivez le [guide d'installation](https://docs.n8n.io/integrations/community-nodes/installation/) de la documentation n8n sur les nœuds communautaires.

## Ressources et opérations

Les opérations se rangent sous un sélecteur **Ressource** — **une ressource par API** — afin que d'autres API data.gouv.fr puissent être ajoutées plus tard sans encombrer une liste unique.

### Ressource : Recherche d'entreprise

- **Rechercher** — recherche textuelle sur la dénomination, l'adresse, les dirigeants et les élus. Un SIREN (9 chiffres) ou un SIRET (14 chiffres) peut être passé en requête pour une recherche directe. Plus de 40 filtres sont disponibles : code d'activité (NAF/APE), nature juridique, état administratif, tranche d'effectif, catégorie d'entreprise, plages de chiffre d'affaires et de résultat net, géographie (code postal, commune, département, région, EPCI, collectivité territoriale), nom et date de naissance d'une personne, et une vingtaine d'indicateurs de label ou de certification (bio, RGE, Qualiopi, ESS, EPV, Alim'Confiance, FINESS, UAI, SIAE, entre autres).
- **Rechercher à proximité** — tous les établissements dans un rayon (jusqu'à 50 km) autour d'une latitude/longitude, éventuellement restreints par code ou section d'activité.

Les deux opérations produisent **un item n8n par entreprise**, en conservant telle quelle la structure de réponse de l'API (`siren`, `nom_complet`, `siege`, `dirigeants`, `finances`, `matching_etablissements`, `complements`, …). Les noms des paramètres du nœud reprennent volontairement ceux de la query string de l'API, afin que la [documentation officielle](https://recherche-entreprises.api.gouv.fr/docs/) puisse être lue en parallèle du nœud.

### Ressource : Jour férié

- **Lister** — tous les jours fériés d'une zone sur toute la période couverte par l'API : 20 ans dans le passé, 5 ans dans le futur.
- **Lister par année** — les jours fériés d'une seule année.

Un sélecteur **Zone** porte les 13 zones de l'API : l'Alsace-Moselle ajoute le Vendredi saint et la Saint-Étienne, l'outre-mer ses dates d'abolition de l'esclavage. L'API répond par un dictionnaire `date → nom`, que le nœud déplie en **un item n8n par jour férié** (`date`, `nom`, `annee`, `zone`). Ni pagination ni limite de débit documentée ici : cette ressource n'expose donc pas de champ *Tout retourner* ni *Limite*.

Dans le panneau de nœuds de n8n, le nœud est classé sous **Data & Storage** (auquel s'ajoute *Custom Nodes* lorsqu'il est chargé depuis un dossier custom plutôt qu'installé depuis npm), et il répond aux alias de recherche `SIREN`, `SIRET`, `INSEE`, `entreprise`, `jours fériés` ou `data.gouv`. Chaque API dispose de son propre sous-groupe dans le codex : le regroupement reste d'une API par groupe à mesure que d'autres s'ajoutent.

## Credentials

Aucune. L'API est totalement ouverte : ni clé, ni compte, ni en-tête d'authentification.

## Compatibilité

Nécessite une version de n8n supportant `n8nNodesApiVersion` 1 et Node.js >= 20.15. Le nœud est marqué `usableAsTool`, il peut donc être rattaché directement à un nœud AI Agent.

Limites imposées par l'API Recherche d'Entreprises, toutes prises en charge par le nœud :

- **25 résultats par requête.** Le nœud pagine pour vous : activez *Tout retourner*, ou mettez une *Limite* supérieure à 25, et il parcourt les pages.
- **`page × per_page` ne peut pas dépasser 10 000.** Aucune recherche ne peut être paginée au-delà de 10 000 résultats ; *Tout retourner* s'arrête là.
- **7 requêtes/seconde par adresse IP** (et 30/seconde par ASN). Le nœud espace ses appels paginés pour rester en dessous. Faire converger de nombreux items d'entrée vers le nœud dans des workflows parallèles peut malgré tout dépasser cette limite.

L'API Jours fériés n'a aucune de ces limites — ni pagination, ni débit documenté — mais ne couvre que 20 ans dans le passé et 5 ans dans le futur.

Données absentes de l'API Recherche d'Entreprises, donc de ce nœud : les entreprises non-diffusibles (`statut_diffusion`), celles qui se sont vu refuser leur immatriculation au RCS, et la fiche Sirene complète. Il s'agit d'une API de *recherche* — voir [quelle API Sirene utiliser](https://api.gouv.fr/guides/quelle-api-sirene) si vous avez besoin des données complètes.

## Utilisation

Ajoutez le nœud, gardez la ressource **Recherche d'entreprise**, choisissez une opération, remplissez la requête :

- *Trouver une entreprise par nom dans un département* — **Rechercher**, Requête `boulangerie`, Filtres → Code de département `33`.
- *Résoudre un SIREN* — **Rechercher**, Requête `552049447`, Limite 1.
- *Lister toutes les entreprises informatiques actives du 1er arrondissement de Paris* — **Rechercher**, Filtres → Code postal `75001`, Section d'activité `J`, État administratif `Active`, Tout retourner activé. Le champ Requête peut rester vide dès qu'au moins un filtre est renseigné.
- *Tout ce qui se trouve dans un rayon de 500 m autour d'un point* — **Rechercher à proximité**, Latitude `48.8566`, Longitude `2.3522`, Rayon `0.5`.

Dans **Options**, *Réponse minimale* retire les blocs secondaires de chaque résultat pour alléger la réponse ; *Champs à inclure* en réintègre certains par-dessus (et exige que *Réponse minimale* soit activé — sinon le nœud échoue immédiatement avec un message explicite). À noter : le bloc `tva` n'est accepté que par **Rechercher**, pas par **Rechercher à proximité**.

Pour les jours fériés, basculez **Ressource** sur *Jour férié* :

- *Les jours fériés de l'année en métropole* — **Lister par année**, Zone `Métropole`, Année `2026` (11 items).
- *Tout ce que l'API connaît pour La Réunion* — **Lister**, Zone `La Réunion` (2006 → 2031, dont l'*Abolition de l'esclavage*).

Les erreurs de l'API Recherche d'Entreprises sont remontées telles quelles : un code de département invalide ou un rayon hors bornes indique donc exactement quelles valeurs sont admises. L'API Jours fériés, elle, répond un 404 nu : le nœud le remplace par un message qui rappelle les bornes réelles.

## Ressources

- [API Recherche d'Entreprises sur data.gouv.fr](https://www.data.gouv.fr/dataservices/api-recherche-dentreprises)
- [Documentation interactive de l'API (OpenAPI)](https://recherche-entreprises.api.gouv.fr/docs/)
- [Documentation n8n sur les nœuds communautaires](https://docs.n8n.io/integrations/#community-nodes)
- [Nomenclature NAF/APE de l'INSEE](https://www.insee.fr/fr/information/2406147)
- [API Jours fériés sur data.gouv.fr](https://www.data.gouv.fr/dataservices/jours-feries) — [spécification OpenAPI](https://calendrier.api.gouv.fr/jours-feries/openapi.yml)

## Historique des versions

- 0.1.0 — version initiale : nœud **France Data.gouv** avec les ressources *Recherche d'entreprise* (opérations `Rechercher` et `Rechercher à proximité`) et *Jour férié* (opérations `Lister` et `Lister par année`), interface en français, pagination automatique, jeu de filtres complet.

## Développement

```bash
npm install
npm run lint     # même commande que la CI
npm run build    # compile vers dist/, copie les icônes et les fichiers codex
```

Il n'y a pas de suite de tests dans ce dépôt ; la CI n'exécute que le lint et le build.

### Tester localement dans n8n

Deux options :

- **Symlink (boucle de dev rapide)**
  ```bash
  npm run build
  npm link
  cd ~/.n8n/custom   # ou le dossier custom de votre instance n8n
  npm link n8n-nodes-france-datagouv
  ```
  Redémarrez ensuite n8n. Le nœud apparaît dans la liste des nœuds.

- **Installation directe**
  Copiez ce dossier (après `npm run build`) dans le répertoire `custom` de votre instance n8n, ou publiez-le sur npm et installez-le via *Community Nodes* dans l'interface n8n.

### Publication sur npm

La publication passe par GitHub Actions, qui joint une attestation de provenance npm — n8n l'exige pour les nœuds communautaires. N'exécutez pas `npm publish` à la main.

```bash
npm run release   # lint, build, bump de version, tag et push
```

Le push du tag déclenche `.github/workflows/publish.yml`. Voir les commentaires en tête de ce fichier pour la configuration npm initiale. Gardez `repository.url` dans `package.json` aligné sur [ce dépôt](https://github.com/tsnaketech/n8n-nodes-france-datagouv) — l'attestation de provenance npm vérifie que le paquet publié en vient bien.
