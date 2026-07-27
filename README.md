# n8n-nodes-france-datagouv

An n8n community node for the French government's open APIs (data.gouv.fr), exposed as a single **France Data.gouv** node whose operations are grouped by resource — one resource per API. It currently covers the [API Recherche d'Entreprises](https://www.data.gouv.fr/dataservices/api-recherche-dentreprises) (any company, association or public service registered in France) and the [API Jours fériés](https://www.data.gouv.fr/dataservices/jours-feries) (French public holidays, per zone).

**The node's interface is in French**, to match the API's own vocabulary (`code_postal`, `dirigeants`, `tranche_effectif_salarie`…). This README gives the English gloss of each label in brackets.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

Other languages: [Français](README.fr.md) · [Español](README.es.md) · [Deutsch](README.de.md)

[Installation](#installation)
[Resources and operations](#resources-and-operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Resources](#resources)
[Version history](#version-history)
[Development](#development)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Resources and operations

Operations sit under a **Ressource** (resource) selector — **one resource per API** — so further data.gouv.fr APIs can be added later without crowding a single flat list.

### Ressource: Recherche d'entreprise (company search)

- **Rechercher** (search) — full-text search over company name, address, directors and elected officials. A SIREN (9 digits) or SIRET (14 digits) can be passed as the query for a direct lookup. Over 40 filters are available: activity code (NAF/APE), legal form, administrative state, headcount bracket, company category, revenue and net income ranges, geography (postal code, municipality, department, region, EPCI, local authority), person name and birth date, and around twenty label/certification flags (organic, RGE, Qualiopi, ESS, EPV, Alim'Confiance, FINESS, UAI, SIAE, and others).
- **Rechercher à proximité** (search near point) — every establishment within a radius (up to 50 km) of a latitude/longitude, optionally narrowed by activity code or activity section.

Both operations emit **one n8n item per company**, using the API's response shape unchanged (`siren`, `nom_complet`, `siege`, `dirigeants`, `finances`, `matching_etablissements`, `complements`, …). Node parameter names deliberately mirror the API's query-string names so the [official documentation](https://recherche-entreprises.api.gouv.fr/docs/) can be read alongside the node.

### Ressource: Jour férié (public holidays)

- **Lister** (list) — every public holiday of a zone over the whole period the API covers: 20 years back, 5 years ahead.
- **Lister par année** (list by year) — the public holidays of a single year.

A **Zone** selector carries the 13 zones of the API: Alsace-Moselle adds Good Friday and St Stephen's Day, and the overseas zones add their abolition-of-slavery dates. The API answers with a `date → name` map, which the node unfolds into **one n8n item per public holiday** (`date`, `nom`, `annee`, `zone`). There is no pagination and no documented rate limit here, so this resource carries no *Tout retourner* or *Limite* field.

In the n8n nodes panel the node is filed under **Data & Storage** (plus *Custom Nodes* when it is loaded from a custom folder rather than installed from npm), and it answers to search aliases such as `SIREN`, `SIRET`, `INSEE`, `entreprise`, `jours fériés` or `data.gouv`. Each API gets its own codex subcategory, so the grouping stays one-per-API as more are added.

## Credentials

None. The API is fully open — no key, no account, no authentication header.

## Compatibility

Requires an n8n version supporting `n8nNodesApiVersion` 1 and Node.js >= 20.15. The node is marked `usableAsTool`, so it can be attached directly to an AI Agent node.

Limits imposed by the Recherche d'Entreprises API, all handled by the node:

- **25 results per request.** The node paginates for you; set *Tout retourner* (return all), or a *Limite* (limit) above 25, and it walks the pages.
- **`page × per_page` may not exceed 10 000.** No search can be paginated past 10 000 results; *Tout retourner* stops there.
- **7 requests/second per IP address** (and 30/second per ASN). The node spaces its paginated calls to stay under this. Fanning many input items into the node in parallel workflows can still exceed it.

The Jours fériés API has no such limits — no pagination, no documented rate limit — but only covers 20 years back and 5 years ahead.

Data not exposed by the Recherche d'Entreprises API, and therefore not by this node: non-disclosable companies (`statut_diffusion`), companies refused RCS registration, and the complete Sirene record. This is a *search* API — see [which Sirene API to use](https://api.gouv.fr/guides/quelle-api-sirene) if you need full records.

## Usage

Add the node, keep the **Recherche d'entreprise** resource, pick an operation, and fill the query:

- *Find a company by name in a given department* — **Rechercher**, Requête `boulangerie`, Filtres → Code de département `33`.
- *Resolve a SIREN* — **Rechercher**, Requête `552049447`, Limite 1.
- *List every active IT company in Paris 1er* — **Rechercher**, Filtres → Code postal `75001`, Section d'activité `J`, État administratif `Active`, Tout retourner on. The Requête field may be left empty when at least one filter is set.
- *Everything within 500 m of a point* — **Rechercher à proximité**, Latitude `48.8566`, Longitude `2.3522`, Rayon `0.5`.

Under **Options**, *Réponse minimale* (minimal response) strips the secondary blocks from each result to cut payload size; *Champs à inclure* (include fields) adds chosen blocks back on top of it (and requires *Réponse minimale* to be on — the node fails fast with a clear message otherwise). Note that the `tva` block is only accepted by **Rechercher**, not by **Rechercher à proximité**.

For public holidays, switch **Ressource** to *Jour férié*:

- *This year's holidays in mainland France* — **Lister par année**, Zone `Métropole`, Année `2026` (11 items).
- *Everything the API knows for Réunion* — **Lister**, Zone `La Réunion` (2006 → 2031, including *Abolition de l'esclavage*).

Errors from the Recherche d'Entreprises API are surfaced verbatim, so an invalid department code or an out-of-range radius reports exactly which values are valid. The Jours fériés API answers a bare 404 instead, so the node replaces it with a message naming the actual limits.

## Resources

- [API Recherche d'Entreprises on data.gouv.fr](https://www.data.gouv.fr/dataservices/api-recherche-dentreprises)
- [Interactive API documentation (OpenAPI)](https://recherche-entreprises.api.gouv.fr/docs/)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [INSEE NAF/APE nomenclature](https://www.insee.fr/fr/information/2406147)
- [API Jours fériés on data.gouv.fr](https://www.data.gouv.fr/dataservices/jours-feries) — [OpenAPI spec](https://calendrier.api.gouv.fr/jours-feries/openapi.yml)

## Version history

- 0.1.0 — initial release: **France Data.gouv** node with the *Recherche d'entreprise* resource (`Rechercher` and `Rechercher à proximité` operations) and the *Jour férié* resource (`Lister` and `Lister par année` operations), French interface, automatic pagination, full filter set.

## Development

```bash
npm install
npm run lint     # same command the CI runs
npm run build    # compiles to dist/, copies icons and codex files
```

There is no test suite in this repository; the CI runs lint and build only.

### Testing locally in n8n

Two options:

- **Symlink (fast dev loop)**
  ```bash
  npm run build
  npm link
  cd ~/.n8n/custom   # or your n8n instance's custom folder
  npm link n8n-nodes-france-datagouv
  ```
  Then restart n8n. The node appears in the nodes list.

- **Direct install**
  Copy this folder (after `npm run build`) into your n8n instance's `custom` directory, or publish it to npm and install it via *Community Nodes* in the n8n UI.

### Publishing to npm

Publishing runs through GitHub Actions, which attaches an npm provenance statement — n8n requires this for community nodes. Do not run `npm publish` by hand.

```bash
npm run release   # lints, builds, bumps the version, tags and pushes
```

Pushing the tag triggers `.github/workflows/publish.yml`. See the comments at the top of that file for the one-time npm setup. Keep `repository.url` in `package.json` pointing at [this repository](https://github.com/tsnaketech/n8n-nodes-france-datagouv) — npm provenance checks that the published package really comes from it.
