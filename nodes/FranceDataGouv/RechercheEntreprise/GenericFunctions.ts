import type { IDataObject, IExecuteFunctions, IHttpRequestOptions, JsonObject } from 'n8n-workflow';
import { NodeApiError, sleep } from 'n8n-workflow';

export const BASE_URL = 'https://recherche-entreprises.api.gouv.fr';

/** L'API refuse tout `per_page` supérieur à 25. */
export const MAX_PER_PAGE = 25;

/**
 * L'API rejette les requêtes où `page * per_page` dépasse 10 000 : aucune
 * recherche ne peut donc être paginée au-delà de ce nombre de résultats.
 */
export const MAX_TOTAL_RESULTS = 10000;

/**
 * L'API autorise 7 requêtes/seconde par adresse IP (et 30/seconde par ASN).
 * Espacer les appels paginés garde une exécution du nœud sous ce plafond.
 */
const THROTTLE_MS = 150;

export interface ISearchResponse {
	results?: IDataObject[];
	total_results?: number;
	page?: number;
	per_page?: number;
	total_pages?: number;
}

/**
 * Extrait le message lisible du corps d'erreur de l'API. Les erreurs arrivent
 * sous la forme `{ "erreur": "..." }` avec un statut 400.
 */
function apiErrorMessage(error: unknown): string | undefined {
	const body = (error as { response?: { body?: unknown }; error?: unknown })?.response?.body;
	const payload = (body ?? (error as { error?: unknown })?.error) as
		| { erreur?: string }
		| undefined;

	return typeof payload?.erreur === 'string' ? payload.erreur : undefined;
}

export async function apiRequest(
	this: IExecuteFunctions,
	endpoint: string,
	qs: IDataObject,
	itemIndex: number,
): Promise<ISearchResponse> {
	const options: IHttpRequestOptions = {
		method: 'GET',
		baseURL: BASE_URL,
		url: endpoint,
		qs,
		json: true,
	};

	try {
		return (await this.helpers.httpRequest(options)) as ISearchResponse;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: apiErrorMessage(error),
			itemIndex,
		});
	}
}

/**
 * Lance une recherche et parcourt les pages jusqu'à collecter `limit`
 * résultats, ou jusqu'à épuisement de l'API quand `returnAll` est actif.
 */
export async function apiRequestAllItems(
	this: IExecuteFunctions,
	endpoint: string,
	qs: IDataObject,
	returnAll: boolean,
	limit: number,
	itemIndex: number,
): Promise<IDataObject[]> {
	const target = returnAll ? MAX_TOTAL_RESULTS : Math.min(limit, MAX_TOTAL_RESULTS);
	const perPage = Math.min(target, MAX_PER_PAGE);
	const results: IDataObject[] = [];

	let page = 1;
	let totalPages = 1;

	do {
		if (page > 1) {
			await sleep(THROTTLE_MS);
		}

		const response = await apiRequest.call(
			this,
			endpoint,
			{ ...qs, page, per_page: perPage },
			itemIndex,
		);
		const batch = response.results ?? [];

		results.push(...batch);
		totalPages = response.total_pages ?? 1;

		// Une page vide signifie que le jeu de résultats est épuisé, quoi qu'annonce total_pages.
		if (batch.length === 0) break;

		page++;
	} while (page <= totalPages && results.length < target && page * perPage <= MAX_TOTAL_RESULTS);

	return results.slice(0, target);
}
