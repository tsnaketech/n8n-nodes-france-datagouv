/*
 * Interface en français : les règles désactivées ci-dessous encodent des
 * conventions rédactionnelles anglaises (title case, « Whether … », libellés
 * imposés mot pour mot) inapplicables à des libellés français. Voir AGENTS.md.
 */
/* eslint-disable n8n-nodes-base/node-param-display-name-miscased */
/* eslint-disable n8n-nodes-base/node-param-operation-option-action-miscased */
import type { INodeProperties } from 'n8n-workflow';

import { zoneOptions } from './Options';

const showForJoursFeries = {
	show: {
		resource: ['joursFeries'],
	},
};

export const joursFeriesFields: INodeProperties[] = [
	{
		displayName: 'Opération',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: showForJoursFeries,
		options: [
			{
				name: 'Lister',
				value: 'liste',
				description: "Lister les jours fériés d'une zone sur toute la période couverte par l'API",
				action: 'Lister les jours fériés',
			},
			{
				name: 'Lister par année',
				value: 'annee',
				description: "Lister les jours fériés d'une zone pour une seule année",
				action: 'Lister les jours fériés d une année',
			},
		],
		default: 'liste',
	},
	{
		displayName: 'Zone',
		name: 'zone',
		type: 'options',
		default: 'metropole',
		displayOptions: showForJoursFeries,
		options: zoneOptions,
		description:
			"Zone géographique dont dépend le calendrier. L'Alsace-Moselle et l'outre-mer ont des jours fériés supplémentaires.",
	},
	{
		displayName: 'Année',
		name: 'annee',
		type: 'number',
		default: 2026,
		required: true,
		displayOptions: {
			show: {
				resource: ['joursFeries'],
				operation: ['annee'],
			},
		},
		description: 'Année à quatre chiffres, entre les 20 années passées et les 5 années à venir',
	},
];
