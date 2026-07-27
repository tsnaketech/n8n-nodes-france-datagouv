import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { apiRequest } from './GenericFunctions';

/**
 * Exécute une opération de la ressource « Jours fériés » pour un item d'entrée.
 *
 * L'API renvoie un dictionnaire `date → nom` ; on le déplie en un item par jour
 * férié, comme le reste du nœud produit un item par entité.
 */
export async function executeJoursFeries(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject[]> {
	const zone = this.getNodeParameter('zone', itemIndex) as string;

	let endpoint: string;

	if (operation === 'liste') {
		endpoint = `/${zone}.json`;
	} else if (operation === 'annee') {
		const annee = this.getNodeParameter('annee', itemIndex) as number;

		endpoint = `/${zone}/${annee}.json`;
	} else {
		throw new NodeOperationError(this.getNode(), `Opération inconnue « ${operation} »`, {
			itemIndex,
		});
	}

	const joursFeries = await apiRequest.call(this, endpoint, itemIndex);

	return Object.entries(joursFeries).map(([date, nom]) => ({
		date,
		nom,
		annee: Number(date.slice(0, 4)),
		zone,
	}));
}
