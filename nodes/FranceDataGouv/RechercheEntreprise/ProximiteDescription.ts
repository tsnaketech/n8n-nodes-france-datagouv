/*
 * Interface en français : les règles désactivées ci-dessous encodent des
 * conventions rédactionnelles anglaises (title case, « Whether … », libellés
 * imposés mot pour mot) inapplicables à des libellés français. Voir AGENTS.md.
 */
/* eslint-disable n8n-nodes-base/node-param-display-name-miscased */
import type { INodeProperties } from 'n8n-workflow';

import { sectionOptions } from './Options';

const showForProximite = {
	show: {
		resource: ['rechercheEntreprise'],
		operation: ['proximite'],
	},
};

export const proximiteFields: INodeProperties[] = [
	{
		displayName: 'Latitude',
		name: 'lat',
		type: 'number',
		default: 0,
		required: true,
		typeOptions: {
			numberPrecision: 6,
		},
		displayOptions: showForProximite,
		description: 'Latitude du point de recherche, en degrés décimaux',
	},
	{
		displayName: 'Longitude',
		name: 'long',
		type: 'number',
		default: 0,
		required: true,
		typeOptions: {
			numberPrecision: 6,
		},
		displayOptions: showForProximite,
		description: 'Longitude du point de recherche, en degrés décimaux',
	},
	{
		displayName: 'Rayon (km)',
		name: 'radius',
		type: 'number',
		default: 5,
		typeOptions: {
			minValue: 0,
			maxValue: 50,
		},
		displayOptions: showForProximite,
		description: "Rayon de recherche en kilomètres, jusqu'à 50",
	},
	{
		displayName: 'Filtres',
		name: 'proximiteFilters',
		type: 'collection',
		placeholder: 'Ajouter un filtre',
		default: {},
		displayOptions: showForProximite,
		options: [
			{
				displayName: "Code d'activité (NAF/APE)",
				name: 'activite_principale',
				type: 'string',
				default: '',
				placeholder: '01.12Z,28.15Z',
				description:
					"Code d'activité NAF/APE de l'INSEE. Accepte une liste séparée par des virgules.",
			},
			{
				displayName: "Section d'activité",
				name: 'section_activite_principale',
				type: 'multiOptions',
				default: [],
				options: sectionOptions,
				description: "Section d'activité INSEE de premier niveau de l'unité légale",
			},
		],
	},
];
