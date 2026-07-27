/*
 * Interface en français : les règles désactivées ci-dessous encodent des
 * conventions rédactionnelles anglaises (title case, « Whether … », libellés
 * imposés mot pour mot) inapplicables à des libellés français. Voir AGENTS.md.
 */
/* eslint-disable n8n-nodes-base/node-param-display-name-miscased */
/* eslint-disable n8n-nodes-base/node-param-operation-option-action-miscased */
/* eslint-disable n8n-nodes-base/node-param-description-boolean-without-whether */
/* eslint-disable n8n-nodes-base/node-param-description-wrong-for-return-all */
/* eslint-disable n8n-nodes-base/node-param-description-wrong-for-limit */
import type { INodeProperties } from 'n8n-workflow';

import { includeOptions } from './Options';
import { proximiteFields } from './ProximiteDescription';
import { rechercheFields } from './RechercheDescription';

const showForRechercheEntreprise = {
	show: {
		resource: ['rechercheEntreprise'],
	},
};

const operations: INodeProperties[] = [
	{
		displayName: 'Opération',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: showForRechercheEntreprise,
		options: [
			{
				name: 'Rechercher',
				value: 'recherche',
				description:
					'Rechercher par dénomination, adresse, dirigeant, élu, SIREN ou SIRET, avec des filtres optionnels',
				action: 'Rechercher des entreprises',
			},
			{
				name: 'Rechercher à proximité',
				value: 'proximite',
				description:
					"Rechercher les établissements dans un rayon autour d'un point en latitude/longitude",
				action: 'Rechercher des entreprises à proximité',
			},
		],
		default: 'recherche',
	},
];

/**
 * Paramètres communs aux deux opérations de la ressource.
 * `page_etablissements`, `include` et consorts passent tels quels en query string.
 */
const communFields: INodeProperties[] = [
	{
		displayName: 'Tout retourner',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: showForRechercheEntreprise,
		description: "Retourner tous les résultats plutôt que de s'arrêter à une limite",
	},
	{
		displayName: 'Limite',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: ['rechercheEntreprise'],
				returnAll: [false],
			},
		},
		description: 'Nombre maximum de résultats à retourner',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Ajouter une option',
		default: {},
		displayOptions: showForRechercheEntreprise,
		options: [
			{
				displayName: 'Champs à inclure',
				name: 'include',
				type: 'multiOptions',
				default: [],
				options: includeOptions,
				description:
					'Blocs secondaires à réintégrer dans une réponse minimale. Nécessite que « Réponse minimale » soit activé.',
			},
			{
				displayName: 'Limite des établissements correspondants',
				name: 'limite_matching_etablissements',
				type: 'number',
				default: 10,
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				description: "Nombre d'établissements joints à chaque résultat, de 1 à 100",
			},
			{
				displayName: 'Page des établissements',
				name: 'page_etablissements',
				type: 'number',
				default: 1,
				typeOptions: {
					minValue: 1,
				},
				description: 'Numéro de page utilisé pour paginer les établissements de chaque résultat',
			},
			{
				displayName: 'Réponse minimale',
				name: 'minimal',
				type: 'boolean',
				default: false,
				description: 'Retirer les champs secondaires de chaque résultat',
			},
			{
				displayName: 'Trier par taille',
				name: 'sort_by_size',
				type: 'boolean',
				default: false,
				description:
					"Trier les résultats par taille d'entreprise, mesurée en nombre d'établissements",
			},
		],
	},
];

export const rechercheEntrepriseFields: INodeProperties[] = [
	...operations,
	...rechercheFields,
	...proximiteFields,
	...communFields,
];
