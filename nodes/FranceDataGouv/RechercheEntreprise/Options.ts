/*
 * Interface en français : les règles désactivées ci-dessous encodent des
 * conventions rédactionnelles anglaises (title case, « Whether … », libellés
 * imposés mot pour mot) inapplicables à des libellés français. Voir AGENTS.md.
 */
/* eslint-disable n8n-nodes-base/node-param-display-name-miscased */
import type { INodePropertyOptions } from 'n8n-workflow';

/**
 * Sections d'activité INSEE (NAF niveau 1).
 * https://www.insee.fr/fr/information/2120875
 */
export const sectionOptions: INodePropertyOptions[] = [
	{ name: 'A - Agriculture, sylviculture et pêche', value: 'A' },
	{ name: 'B - Industries extractives', value: 'B' },
	{ name: 'C - Industrie manufacturière', value: 'C' },
	{ name: "D - Production et distribution d'électricité, de gaz et de vapeur", value: 'D' },
	{ name: "E - Production et distribution d'eau, assainissement et déchets", value: 'E' },
	{ name: 'F - Construction', value: 'F' },
	{ name: 'G - Commerce de gros et de détail, réparation de véhicules', value: 'G' },
	{ name: 'H - Transports et entreposage', value: 'H' },
	{ name: 'I - Hébergement et restauration', value: 'I' },
	{ name: 'J - Information et communication', value: 'J' },
	{ name: "K - Activités financières et d'assurance", value: 'K' },
	{ name: 'L - Activités immobilières', value: 'L' },
	{ name: 'M - Activités spécialisées, scientifiques et techniques', value: 'M' },
	{ name: 'N - Activités de services administratifs et de soutien', value: 'N' },
	{ name: 'O - Administration publique', value: 'O' },
	{ name: 'P - Enseignement', value: 'P' },
	{ name: 'Q - Santé humaine et action sociale', value: 'Q' },
	{ name: 'R - Arts, spectacles et activités récréatives', value: 'R' },
	{ name: 'S - Autres activités de services', value: 'S' },
	{ name: "T - Activités des ménages en tant qu'employeurs", value: 'T' },
	{ name: 'U - Activités extra-territoriales', value: 'U' },
];

/**
 * Tranches d'effectif salarié INSEE (`tranche_effectif_salarie`).
 * https://github.com/annuaire-entreprises-data-gouv-fr/search-api/blob/main/app/labels/tranches-effectifs.json
 */
export const trancheEffectifOptions: INodePropertyOptions[] = [
	{ name: "00 - 0 salarié (ayant employé des salariés plus tôt dans l'année)", value: '00' },
	{ name: '01 - 1 ou 2 salariés', value: '01' },
	{ name: '02 - 3 à 5 salariés', value: '02' },
	{ name: '03 - 6 à 9 salariés', value: '03' },
	{ name: '11 - 10 à 19 salariés', value: '11' },
	{ name: '12 - 20 à 49 salariés', value: '12' },
	{ name: '21 - 50 à 99 salariés', value: '21' },
	{ name: '22 - 100 à 199 salariés', value: '22' },
	{ name: '31 - 200 à 249 salariés', value: '31' },
	{ name: '32 - 250 à 499 salariés', value: '32' },
	{ name: '41 - 500 à 999 salariés', value: '41' },
	{ name: '42 - 1 000 à 1 999 salariés', value: '42' },
	{ name: '51 - 2 000 à 4 999 salariés', value: '51' },
	{ name: '52 - 5 000 à 9 999 salariés', value: '52' },
	{ name: '53 - 10 000 salariés et plus', value: '53' },
	{ name: 'NN - Unité non employeuse', value: 'NN' },
];

/**
 * Blocs secondaires de la réponse, réintégrables par-dessus une réponse minimale.
 * `tva` n'est accepté que par la recherche textuelle.
 */
export const includeOptions: INodePropertyOptions[] = [
	{ name: 'Compléments', value: 'complements' },
	{ name: 'Dirigeants', value: 'dirigeants' },
	{ name: 'Établissements correspondants', value: 'matching_etablissements' },
	{ name: 'Finances', value: 'finances' },
	{ name: 'Score', value: 'score' },
	{ name: 'Siège', value: 'siege' },
	{ name: 'TVA (recherche textuelle uniquement)', value: 'tva' },
];
