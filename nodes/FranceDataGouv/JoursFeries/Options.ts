/*
 * Interface en français : la règle désactivée ci-dessous impose le title case
 * anglais, qui déformerait les noms officiels des zones (« Polynésie Française »,
 * « Saint-Pierre-Et-Miquelon »). Voir AGENTS.md.
 */
/* eslint-disable n8n-nodes-base/node-param-display-name-miscased */
import type { INodePropertyOptions } from 'n8n-workflow';

/**
 * Zones reconnues par l'API (enum `Zone` de l'OpenAPI). Les jours fériés
 * diffèrent entre elles : l'Alsace-Moselle en compte deux de plus, et
 * l'outre-mer ajoute ses dates d'abolition de l'esclavage.
 * https://calendrier.api.gouv.fr/jours-feries/openapi.yml
 */
export const zoneOptions: INodePropertyOptions[] = [
	{ name: 'Alsace-Moselle', value: 'alsace-moselle' },
	{ name: 'Guadeloupe', value: 'guadeloupe' },
	{ name: 'Guyane', value: 'guyane' },
	{ name: 'La Réunion', value: 'la-reunion' },
	{ name: 'Martinique', value: 'martinique' },
	{ name: 'Mayotte', value: 'mayotte' },
	{ name: 'Métropole', value: 'metropole' },
	{ name: 'Nouvelle-Calédonie', value: 'nouvelle-caledonie' },
	{ name: 'Polynésie française', value: 'polynesie-francaise' },
	{ name: 'Saint-Barthélemy', value: 'saint-barthelemy' },
	{ name: 'Saint-Martin', value: 'saint-martin' },
	{ name: 'Saint-Pierre-et-Miquelon', value: 'saint-pierre-et-miquelon' },
	{ name: 'Wallis-et-Futuna', value: 'wallis-et-futuna' },
];
