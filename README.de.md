# n8n-nodes-france-datagouv

n8n Community-Node für die offenen APIs des französischen Staates (data.gouv.fr), bereitgestellt als ein einziger Node **France Data.gouv**, dessen Operationen nach Ressource gruppiert sind — **eine Ressource pro API**. Abgedeckt sind derzeit die [API Recherche d'Entreprises](https://www.data.gouv.fr/dataservices/api-recherche-dentreprises) (jedes in Frankreich registrierte Unternehmen, jeder Verein, jede öffentliche Einrichtung) und die [API Jours fériés](https://www.data.gouv.fr/dataservices/jours-feries) (der französische Feiertagskalender, nach Zone).

**Die Oberfläche des Nodes ist auf Französisch**, nah am Vokabular der API selbst (`code_postal`, `dirigeants`, `tranche_effectif_salarie`…). Dieses README nennt die deutsche Entsprechung jeder Beschriftung in Klammern.

[n8n](https://n8n.io/) ist eine Workflow-Automatisierungsplattform unter [Fair-Code-Lizenz](https://docs.n8n.io/reference/license/).

Andere Sprachen: [English](README.md) · [Français](README.fr.md) · [Español](README.es.md)

[Installation](#installation)
[Ressourcen und Operationen](#ressourcen-und-operationen)
[Credentials](#credentials)
[Kompatibilität](#kompatibilität)
[Verwendung](#verwendung)
[Ressourcen](#ressourcen)
[Versionsverlauf](#versionsverlauf)
[Entwicklung](#entwicklung)

## Installation

Folge der [Installationsanleitung](https://docs.n8n.io/integrations/community-nodes/installation/) in der n8n-Dokumentation zu Community-Nodes.

## Ressourcen und Operationen

Die Operationen liegen unter einem Auswahlfeld **Ressource** — **eine Ressource pro API** —, damit später weitere data.gouv.fr-APIs hinzukommen können, ohne eine einzige flache Liste zu überfrachten.

### Ressource: Recherche d'entreprise (Unternehmenssuche)

- **Rechercher** (suchen) — Volltextsuche über Firmenname, Adresse, Geschäftsführung und Mandatsträger. Eine SIREN (9 Ziffern) oder SIRET (14 Ziffern) kann als Suchbegriff für eine direkte Abfrage übergeben werden. Über 40 Filter stehen zur Verfügung: Tätigkeitscode (NAF/APE), Rechtsform, Verwaltungsstatus, Beschäftigtengrößenklasse, Unternehmenskategorie, Umsatz- und Jahresüberschuss-Spannen, Geografie (Postleitzahl, Gemeinde, Departement, Region, EPCI, Gebietskörperschaft), Name und Geburtsdatum einer Person sowie rund zwanzig Label- und Zertifizierungsmerkmale (Bio, RGE, Qualiopi, ESS, EPV, Alim'Confiance, FINESS, UAI, SIAE und weitere).
- **Rechercher à proximité** (in der Nähe suchen) — alle Niederlassungen innerhalb eines Radius (bis 50 km) um einen Breiten-/Längengrad, optional eingegrenzt über Tätigkeitscode oder Tätigkeitsabschnitt.

Beide Operationen liefern **ein n8n-Item pro Unternehmen** und behalten die Antwortstruktur der API unverändert bei (`siren`, `nom_complet`, `siege`, `dirigeants`, `finances`, `matching_etablissements`, `complements`, …). Die Parameternamen des Nodes entsprechen bewusst denen des Query-Strings der API, sodass die [offizielle Dokumentation](https://recherche-entreprises.api.gouv.fr/docs/) parallel zum Node gelesen werden kann.

### Ressource: Jour férié (Feiertage)

- **Lister** (auflisten) — alle Feiertage einer Zone über den gesamten von der API abgedeckten Zeitraum: 20 Jahre zurück, 5 Jahre voraus.
- **Lister par année** (nach Jahr auflisten) — die Feiertage eines einzelnen Jahres.

Ein Auswahlfeld **Zone** enthält die 13 Zonen der API: Elsass-Mosel ergänzt Karfreitag und Stephanstag, die Überseegebiete ihre Daten zur Abschaffung der Sklaverei. Die API antwortet mit einer Zuordnung `Datum → Name`, die der Node zu **einem n8n-Item pro Feiertag** aufklappt (`date`, `nom`, `annee`, `zone`). Hier gibt es weder Paginierung noch ein dokumentiertes Anfragelimit, daher hat diese Ressource kein Feld *Tout retourner* oder *Limite*.

Im n8n-Node-Panel ist der Node unter **Data & Storage** einsortiert (zusätzlich *Custom Nodes*, wenn er aus einem Custom-Ordner statt aus npm geladen wird), und er reagiert auf die Such-Aliase `SIREN`, `SIRET`, `INSEE`, `entreprise`, `jours fériés` oder `data.gouv`. Jede API erhält ihre eigene Codex-Unterkategorie, sodass die Gruppierung auch bei weiteren APIs eine Gruppe pro API bleibt.

## Credentials

Keine. Die API ist vollständig offen: kein Schlüssel, kein Konto, kein Authentifizierungs-Header.

## Kompatibilität

Benötigt eine n8n-Version mit Unterstützung für `n8nNodesApiVersion` 1 und Node.js >= 20.15. Der Node ist als `usableAsTool` markiert und kann daher direkt an einen AI-Agent-Node angehängt werden.

Von der API Recherche d'Entreprises vorgegebene Grenzen, die der Node alle berücksichtigt:

- **25 Ergebnisse pro Anfrage.** Der Node paginiert für dich: Aktiviere *Tout retourner* (alle zurückgeben) oder setze eine *Limite* (Limit) über 25, dann läuft er die Seiten durch.
- **`page × per_page` darf 10 000 nicht überschreiten.** Keine Suche lässt sich über 10 000 Ergebnisse hinaus paginieren; *Tout retourner* endet dort.
- **7 Anfragen/Sekunde pro IP-Adresse** (und 30/Sekunde pro ASN). Der Node staffelt seine paginierten Aufrufe, um darunter zu bleiben. Werden in parallelen Workflows viele Eingabe-Items auf den Node geführt, kann die Grenze dennoch überschritten werden.

Die API Jours fériés kennt keine dieser Grenzen — weder Paginierung noch ein dokumentiertes Anfragelimit —, deckt aber nur 20 Jahre zurück und 5 Jahre voraus ab.

Nicht in der API Recherche d'Entreprises und damit nicht in diesem Node enthalten: nicht offenlegbare Unternehmen (`statut_diffusion`), Unternehmen mit abgelehnter RCS-Eintragung sowie der vollständige Sirene-Datensatz. Dies ist eine *Such*-API — siehe [welche Sirene-API zu verwenden ist](https://api.gouv.fr/guides/quelle-api-sirene), wenn du die vollständigen Daten benötigst.

## Verwendung

Node hinzufügen, Ressource **Recherche d'entreprise** belassen, Operation wählen, Abfrage ausfüllen:

- *Ein Unternehmen nach Namen in einem Departement finden* — **Rechercher**, Requête `boulangerie`, Filtres → Code de département `33`.
- *Eine SIREN auflösen* — **Rechercher**, Requête `552049447`, Limite 1.
- *Alle aktiven IT-Unternehmen im 1. Pariser Arrondissement auflisten* — **Rechercher**, Filtres → Code postal `75001`, Section d'activité `J`, État administratif `Active`, Tout retourner aktiviert. Das Feld Requête darf leer bleiben, sobald mindestens ein Filter gesetzt ist.
- *Alles im Umkreis von 500 m um einen Punkt* — **Rechercher à proximité**, Latitude `48.8566`, Longitude `2.3522`, Rayon `0.5`.

Unter **Options** entfernt *Réponse minimale* (minimale Antwort) die sekundären Blöcke aus jedem Ergebnis, um die Antwort zu verkleinern; *Champs à inclure* (einzuschließende Felder) fügt ausgewählte Blöcke wieder hinzu (und setzt voraus, dass *Réponse minimale* aktiv ist — andernfalls bricht der Node sofort mit einer klaren Meldung ab). Zu beachten: Der Block `tva` wird nur von **Rechercher** akzeptiert, nicht von **Rechercher à proximité**.

Für Feiertage stellst du **Ressource** auf *Jour férié* um:

- *Die Feiertage des Jahres im Mutterland* — **Lister par année**, Zone `Métropole`, Année `2026` (11 Items).
- *Alles, was die API für La Réunion kennt* — **Lister**, Zone `La Réunion` (2006 → 2031, inklusive *Abolition de l'esclavage*).

Fehler der API Recherche d'Entreprises werden unverändert durchgereicht: Ein ungültiger Departement-Code oder ein Radius außerhalb des zulässigen Bereichs nennt daher genau die gültigen Werte. Die API Jours fériés antwortet dagegen mit einem nackten 404 — der Node ersetzt ihn durch eine Meldung, die die tatsächlichen Grenzen nennt.

## Ressourcen

- [API Recherche d'Entreprises auf data.gouv.fr](https://www.data.gouv.fr/dataservices/api-recherche-dentreprises)
- [Interaktive API-Dokumentation (OpenAPI)](https://recherche-entreprises.api.gouv.fr/docs/)
- [n8n-Dokumentation zu Community-Nodes](https://docs.n8n.io/integrations/#community-nodes)
- [NAF/APE-Nomenklatur des INSEE](https://www.insee.fr/fr/information/2406147)
- [API Jours fériés auf data.gouv.fr](https://www.data.gouv.fr/dataservices/jours-feries) — [OpenAPI-Spezifikation](https://calendrier.api.gouv.fr/jours-feries/openapi.yml)

## Versionsverlauf

- 0.1.0 — erste Version: Node **France Data.gouv** mit den Ressourcen *Recherche d'entreprise* (Operationen `Rechercher` und `Rechercher à proximité`) und *Jour férié* (Operationen `Lister` und `Lister par année`), französische Oberfläche, automatische Paginierung, vollständiger Filtersatz.

## Entwicklung

```bash
npm install
npm run lint     # derselbe Befehl, den die CI ausführt
npm run build    # kompiliert nach dist/, kopiert Icons und Codex-Dateien
```

Dieses Repository enthält keine Testsuite; die CI führt nur Lint und Build aus.

### Lokal in n8n testen

Zwei Möglichkeiten:

- **Symlink (schneller Entwicklungszyklus)**
  ```bash
  npm run build
  npm link
  cd ~/.n8n/custom   # oder der custom-Ordner deiner n8n-Instanz
  npm link n8n-nodes-france-datagouv
  ```
  Danach n8n neu starten. Der Node erscheint in der Node-Liste.

- **Direkte Installation**
  Diesen Ordner (nach `npm run build`) in das `custom`-Verzeichnis deiner n8n-Instanz kopieren, oder auf npm veröffentlichen und über *Community Nodes* in der n8n-Oberfläche installieren.

### Veröffentlichung auf npm

Die Veröffentlichung läuft über GitHub Actions, das eine npm-Provenance-Attestierung anhängt — n8n verlangt das für Community-Nodes. Führe `npm publish` nicht von Hand aus.

```bash
npm run release   # Lint, Build, Versionssprung, Tag und Push
```

Der Push des Tags löst `.github/workflows/publish.yml` aus. Die Kommentare am Anfang dieser Datei erklären die einmalige npm-Einrichtung. Halte `repository.url` in `package.json` auf [dieses Repository](https://github.com/tsnaketech/n8n-nodes-france-datagouv) ausgerichtet — die npm-Provenance-Attestierung prüft, dass das veröffentlichte Paket wirklich daher stammt.
