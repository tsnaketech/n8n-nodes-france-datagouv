# n8n-nodes-france-datagouv

Nodo comunitario de n8n para las API abiertas del Estado francés (data.gouv.fr), expuestas mediante un único nodo **France Data.gouv** cuyas operaciones se agrupan por recurso — **un recurso por API**. Cubre actualmente la [API Recherche d'Entreprises](https://www.data.gouv.fr/dataservices/api-recherche-dentreprises) (cualquier empresa, asociación o servicio público registrado en Francia) y la [API Jours fériés](https://www.data.gouv.fr/dataservices/jours-feries) (el calendario de días festivos franceses, por zona).

**La interfaz del nodo está en francés**, para ceñirse al vocabulario de la propia API (`code_postal`, `dirigeants`, `tranche_effectif_salarie`…). Este README indica entre paréntesis la traducción de cada etiqueta.

[n8n](https://n8n.io/) es una plataforma de automatización de workflows con [licencia fair-code](https://docs.n8n.io/reference/license/).

Otros idiomas: [English](README.md) · [Français](README.fr.md) · [Deutsch](README.de.md)

[Instalación](#instalación)
[Recursos y operaciones](#recursos-y-operaciones)
[Credenciales](#credenciales)
[Compatibilidad](#compatibilidad)
[Uso](#uso)
[Recursos](#recursos)
[Historial de versiones](#historial-de-versiones)
[Desarrollo](#desarrollo)

## Instalación

Sigue la [guía de instalación](https://docs.n8n.io/integrations/community-nodes/installation/) de la documentación de nodos comunitarios de n8n.

## Recursos y operaciones

Las operaciones se agrupan bajo un selector **Ressource** (recurso) — **un recurso por API** — para que más adelante se puedan añadir otras API de data.gouv.fr sin saturar una lista única.

### Recurso: Recherche d'entreprise (búsqueda de empresas)

- **Rechercher** (buscar) — búsqueda de texto libre sobre denominación, dirección, directivos y cargos electos. Se puede pasar un SIREN (9 dígitos) o un SIRET (14 dígitos) como consulta para una búsqueda directa. Hay más de 40 filtros disponibles: código de actividad (NAF/APE), forma jurídica, estado administrativo, tramo de plantilla, categoría de empresa, rangos de facturación y resultado neto, geografía (código postal, municipio, departamento, región, EPCI, entidad territorial), nombre y fecha de nacimiento de una persona, y una veintena de indicadores de etiqueta o certificación (ecológico, RGE, Qualiopi, ESS, EPV, Alim'Confiance, FINESS, UAI, SIAE, entre otros).
- **Rechercher à proximité** (buscar cerca de un punto) — todos los establecimientos dentro de un radio (hasta 50 km) alrededor de una latitud/longitud, opcionalmente acotados por código o sección de actividad.

Ambas operaciones emiten **un item de n8n por empresa**, conservando sin cambios la estructura de respuesta de la API (`siren`, `nom_complet`, `siege`, `dirigeants`, `finances`, `matching_etablissements`, `complements`, …). Los nombres de los parámetros del nodo reproducen deliberadamente los de la query string de la API, para poder leer la [documentación oficial](https://recherche-entreprises.api.gouv.fr/docs/) junto al nodo.

### Recurso: Jour férié (días festivos)

- **Lister** (listar) — todos los días festivos de una zona en todo el periodo que cubre la API: 20 años atrás, 5 años adelante.
- **Lister par année** (listar por año) — los días festivos de un solo año.

Un selector **Zone** contiene las 13 zonas de la API: Alsacia-Mosela añade el Viernes Santo y San Esteban, y las zonas de ultramar sus fechas de abolición de la esclavitud. La API responde con un diccionario `fecha → nombre`, que el nodo despliega en **un item de n8n por día festivo** (`date`, `nom`, `annee`, `zone`). Aquí no hay paginación ni límite de peticiones documentado, así que este recurso no incluye los campos *Tout retourner* ni *Limite*.

En el panel de nodos de n8n, el nodo se clasifica bajo **Data & Storage** (más *Custom Nodes* cuando se carga desde una carpeta custom en lugar de instalarse desde npm), y responde a los alias de búsqueda `SIREN`, `SIRET`, `INSEE`, `entreprise`, `jours fériés` o `data.gouv`. Cada API tiene su propio subgrupo en el codex: la agrupación sigue siendo de una API por grupo a medida que se añaden otras.

## Credenciales

Ninguna. La API es totalmente abierta: sin clave, sin cuenta, sin cabecera de autenticación.

## Compatibilidad

Requiere una versión de n8n compatible con `n8nNodesApiVersion` 1 y Node.js >= 20.15. El nodo está marcado como `usableAsTool`, por lo que puede conectarse directamente a un nodo AI Agent.

Límites impuestos por la API Recherche d'Entreprises, todos gestionados por el nodo:

- **25 resultados por petición.** El nodo pagina por ti: activa *Tout retourner* (devolver todo), o pon una *Limite* (límite) superior a 25, y recorrerá las páginas.
- **`page × per_page` no puede superar 10 000.** Ninguna búsqueda puede paginarse más allá de 10 000 resultados; *Tout retourner* se detiene ahí.
- **7 peticiones/segundo por dirección IP** (y 30/segundo por ASN). El nodo espacia sus llamadas paginadas para mantenerse por debajo. Hacer converger muchos items de entrada hacia el nodo en workflows paralelos puede superar ese límite igualmente.

La API Jours fériés no tiene ninguno de esos límites — ni paginación ni límite de peticiones documentado — pero solo cubre 20 años atrás y 5 años adelante.

Datos ausentes de la API Recherche d'Entreprises, y por tanto de este nodo: las empresas no divulgables (`statut_diffusion`), las que vieron rechazada su inscripción en el RCS, y la ficha Sirene completa. Se trata de una API de *búsqueda* — consulta [qué API Sirene usar](https://api.gouv.fr/guides/quelle-api-sirene) si necesitas los datos completos.

## Uso

Añade el nodo, deja el recurso **Recherche d'entreprise**, elige una operación y rellena la consulta:

- *Encontrar una empresa por nombre en un departamento* — **Rechercher**, Requête `boulangerie`, Filtres → Code de département `33`.
- *Resolver un SIREN* — **Rechercher**, Requête `552049447`, Limite 1.
- *Listar todas las empresas informáticas activas del distrito 1 de París* — **Rechercher**, Filtres → Code postal `75001`, Section d'activité `J`, État administratif `Active`, Tout retourner activado. El campo Requête puede dejarse vacío en cuanto haya al menos un filtro.
- *Todo lo que hay en un radio de 500 m alrededor de un punto* — **Rechercher à proximité**, Latitude `48.8566`, Longitude `2.3522`, Rayon `0.5`.

En **Options**, *Réponse minimale* (respuesta mínima) elimina los bloques secundarios de cada resultado para aligerar la respuesta; *Champs à inclure* (campos a incluir) reincorpora algunos por encima (y exige que *Réponse minimale* esté activado — de lo contrario el nodo falla de inmediato con un mensaje claro). Ten en cuenta que el bloque `tva` solo lo acepta **Rechercher**, no **Rechercher à proximité**.

Para los días festivos, cambia **Ressource** a *Jour férié*:

- *Los días festivos del año en la Francia metropolitana* — **Lister par année**, Zone `Métropole`, Année `2026` (11 items).
- *Todo lo que la API conoce para La Reunión* — **Lister**, Zone `La Réunion` (2006 → 2031, incluida la *Abolition de l'esclavage*).

Los errores de la API Recherche d'Entreprises se propagan tal cual: un código de departamento inválido o un radio fuera de rango indica exactamente qué valores son válidos. La API Jours fériés, en cambio, responde un 404 sin cuerpo: el nodo lo sustituye por un mensaje que recuerda los límites reales.

## Recursos

- [API Recherche d'Entreprises en data.gouv.fr](https://www.data.gouv.fr/dataservices/api-recherche-dentreprises)
- [Documentación interactiva de la API (OpenAPI)](https://recherche-entreprises.api.gouv.fr/docs/)
- [Documentación de nodos comunitarios de n8n](https://docs.n8n.io/integrations/#community-nodes)
- [Nomenclatura NAF/APE del INSEE](https://www.insee.fr/fr/information/2406147)
- [API Jours fériés en data.gouv.fr](https://www.data.gouv.fr/dataservices/jours-feries) — [especificación OpenAPI](https://calendrier.api.gouv.fr/jours-feries/openapi.yml)

## Historial de versiones

- 0.1.0 — versión inicial: nodo **France Data.gouv** con los recursos *Recherche d'entreprise* (operaciones `Rechercher` y `Rechercher à proximité`) y *Jour férié* (operaciones `Lister` y `Lister par année`), interfaz en francés, paginación automática, conjunto completo de filtros.

## Desarrollo

```bash
npm install
npm run lint     # el mismo comando que ejecuta la CI
npm run build    # compila a dist/, copia los iconos y los archivos codex
```

Este repositorio no tiene suite de tests; la CI solo ejecuta lint y build.

### Probar localmente en n8n

Dos opciones:

- **Symlink (ciclo de desarrollo rápido)**
  ```bash
  npm run build
  npm link
  cd ~/.n8n/custom   # o la carpeta custom de tu instancia de n8n
  npm link n8n-nodes-france-datagouv
  ```
  Reinicia n8n. El nodo aparece en la lista de nodos.

- **Instalación directa**
  Copia esta carpeta (tras `npm run build`) en el directorio `custom` de tu instancia de n8n, o publícala en npm e instálala mediante *Community Nodes* en la interfaz de n8n.

### Publicación en npm

La publicación pasa por GitHub Actions, que adjunta una atestación de procedencia de npm — n8n lo exige para los nodos comunitarios. No ejecutes `npm publish` a mano.

```bash
npm run release   # lint, build, incremento de versión, tag y push
```

El push del tag dispara `.github/workflows/publish.yml`. Consulta los comentarios al inicio de ese archivo para la configuración inicial de npm. Mantén `repository.url` en `package.json` apuntando a [este repositorio](https://github.com/tsnaketech/n8n-nodes-france-datagouv) — la atestación de procedencia de npm comprueba que el paquete publicado proviene realmente de él.
