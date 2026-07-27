/*
 * Interface en français : les règles désactivées ci-dessous encodent des
 * conventions rédactionnelles anglaises (title case, « Whether … », libellés
 * imposés mot pour mot) inapplicables à des libellés français. Voir AGENTS.md.
 */
/* eslint-disable n8n-nodes-base/node-param-display-name-miscased */
import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { executeJoursFeries } from './JoursFeries/execute';
import { joursFeriesFields } from './JoursFeries/JoursFeriesDescription';
import { executeRechercheEntreprise } from './RechercheEntreprise/execute';
import { rechercheEntrepriseFields } from './RechercheEntreprise/RechercheEntrepriseDescription';

export class FranceDataGouv implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'France Data.gouv',
		name: 'franceDataGouv',
		// Le logo Marianne des API de l'État, un bitmap opaque encapsulé en SVG.
		// La variante sombre reprend la même image aux coins arrondis, pour que la
		// plaque blanche ne se lise pas comme un carré dur sur l'éditeur sombre.
		icon: {
			light: 'file:../../icons/franceDataGouv.svg',
			dark: 'file:../../icons/franceDataGouv.dark.svg',
		},
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: "Interroge les API ouvertes de l'État français (data.gouv.fr)",
		defaults: {
			name: 'France Data.gouv',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Ressource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						// Singulier : n8n nomme une ressource par l'entité qu'elle produit,
						// et une sortie de cette ressource est un jour férié.
						name: 'Jour férié',
						value: 'joursFeries',
						description: "Calendrier des jours fériés français, par zone, via l'API Jours fériés",
					},
					{
						name: "Recherche d'entreprise",
						value: 'rechercheEntreprise',
						description:
							"Entreprises, associations et services publics via l'API Recherche d'Entreprises",
					},
				],
				default: 'rechercheEntreprise',
			},
			...rechercheEntrepriseFields,
			...joursFeriesFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let results;

				if (resource === 'rechercheEntreprise') {
					results = await executeRechercheEntreprise.call(this, operation, i);
				} else if (resource === 'joursFeries') {
					results = await executeJoursFeries.call(this, operation, i);
				} else {
					throw new NodeOperationError(this.getNode(), `Ressource inconnue « ${resource} »`, {
						itemIndex: i,
					});
				}

				returnData.push(
					...results.map((result) => ({
						json: result,
						pairedItem: { item: i },
					})),
				);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
