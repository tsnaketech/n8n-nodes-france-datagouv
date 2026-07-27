import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { apiRequestAllItems, MAX_TOTAL_RESULTS } from './GenericFunctions';

/**
 * Transforme une collection de paramètres en valeurs de query string : écarte
 * les entrées laissées vides et aplatit les sélections multiples en listes
 * séparées par des virgules, comme l'attend l'API. Les booléens et les zéros
 * sont conservés, ce sont des valeurs de filtre significatives.
 */
function toQueryParams(source: IDataObject): IDataObject {
	const qs: IDataObject = {};

	for (const [key, value] of Object.entries(source)) {
		if (value === undefined || value === null || value === '') continue;

		if (Array.isArray(value)) {
			if (value.length === 0) continue;
			qs[key] = value.join(',');
			continue;
		}

		qs[key] = value;
	}

	return qs;
}

/**
 * Exécute une opération de la ressource « Recherche d'entreprise » pour un item
 * d'entrée, et renvoie une entrée par entreprise trouvée.
 */
export async function executeRechercheEntreprise(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject[]> {
	const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
	const limit = returnAll
		? MAX_TOTAL_RESULTS
		: (this.getNodeParameter('limit', itemIndex) as number);
	const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;

	const include = (options.include as string[] | undefined) ?? [];
	if (include.length > 0 && options.minimal !== true) {
		throw new NodeOperationError(
			this.getNode(),
			"L'option « Champs à inclure » ne s'applique qu'à une réponse minimale",
			{
				description: 'Activez également « Réponse minimale », ou videz « Champs à inclure ».',
				itemIndex,
			},
		);
	}

	let endpoint: string;
	let qs: IDataObject;

	if (operation === 'recherche') {
		const q = this.getNodeParameter('q', itemIndex) as string;
		const filters = this.getNodeParameter('filters', itemIndex, {}) as IDataObject;

		endpoint = '/search';
		qs = { ...toQueryParams({ q }), ...toQueryParams(filters) };

		if (Object.keys(qs).length === 0) {
			throw new NodeOperationError(this.getNode(), 'Renseignez une requête ou au moins un filtre', {
				description: "L'API rejette une recherche qui ne porte aucun critère.",
				itemIndex,
			});
		}
	} else if (operation === 'proximite') {
		if (include.includes('tva')) {
			throw new NodeOperationError(
				this.getNode(),
				"Le champ « TVA » n'est pas supporté par « Rechercher à proximité »",
				{
					description:
						"Retirez-le de « Champs à inclure », ou utilisez l'opération « Rechercher ».",
					itemIndex,
				},
			);
		}

		const filters = this.getNodeParameter('proximiteFilters', itemIndex, {}) as IDataObject;

		endpoint = '/near_point';
		qs = {
			lat: this.getNodeParameter('lat', itemIndex) as number,
			long: this.getNodeParameter('long', itemIndex) as number,
			radius: this.getNodeParameter('radius', itemIndex) as number,
			...toQueryParams(filters),
		};
	} else {
		throw new NodeOperationError(this.getNode(), `Opération inconnue « ${operation} »`, {
			itemIndex,
		});
	}

	return await apiRequestAllItems.call(
		this,
		endpoint,
		{ ...qs, ...toQueryParams(options) },
		returnAll,
		limit,
		itemIndex,
	);
}
