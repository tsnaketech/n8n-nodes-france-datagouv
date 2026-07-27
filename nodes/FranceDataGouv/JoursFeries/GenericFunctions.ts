import type { IExecuteFunctions, IHttpRequestOptions, JsonObject } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export const BASE_URL = 'https://calendrier.api.gouv.fr/jours-feries';

/**
 * Réponse de l'API : un dictionnaire dont les clés sont les dates ISO 8601 et
 * les valeurs le nom du jour férié. Pas de pagination, pas d'enveloppe.
 */
export type IJoursFeriesResponse = Record<string, string>;

export async function apiRequest(
	this: IExecuteFunctions,
	endpoint: string,
	itemIndex: number,
): Promise<IJoursFeriesResponse> {
	const options: IHttpRequestOptions = {
		method: 'GET',
		baseURL: BASE_URL,
		url: endpoint,
		json: true,
	};

	try {
		return (await this.helpers.httpRequest(options)) as IJoursFeriesResponse;
	} catch (error) {
		// L'API répond 404 sans corps exploitable pour une zone ou une année hors
		// périmètre : on rappelle les bornes plutôt que de laisser un 404 nu.
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: 'Aucun jour férié pour cette zone ou cette année',
			description:
				"L'API ne couvre que les 20 années passées et les 5 années à venir. Vérifiez aussi la zone.",
			itemIndex,
		});
	}
}
