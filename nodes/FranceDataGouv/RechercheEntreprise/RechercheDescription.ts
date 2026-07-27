/*
 * Interface en français : les règles désactivées ci-dessous encodent des
 * conventions rédactionnelles anglaises (title case, « Whether … », libellés
 * imposés mot pour mot) inapplicables à des libellés français. Voir AGENTS.md.
 */
/* eslint-disable n8n-nodes-base/node-param-display-name-miscased */
/* eslint-disable n8n-nodes-base/node-param-description-boolean-without-whether */
import type { INodeProperties } from 'n8n-workflow';

import { sectionOptions, trancheEffectifOptions } from './Options';

const showForRecherche = {
	show: {
		resource: ['rechercheEntreprise'],
		operation: ['recherche'],
	},
};

/**
 * Les noms de paramètres reprennent volontairement les noms de la query string
 * de l'API, pour que la documentation officielle se lise en parallèle du nœud.
 * https://recherche-entreprises.api.gouv.fr/docs/
 */
export const rechercheFields: INodeProperties[] = [
	{
		displayName: 'Requête',
		name: 'q',
		type: 'string',
		default: '',
		displayOptions: showForRecherche,
		placeholder: 'boulangerie paris',
		description:
			"Recherche en texte libre sur la dénomination, l'adresse, les dirigeants et les élus. Un SIREN (9 chiffres) ou un SIRET (14 chiffres) peut être saisi ici pour une consultation directe. Peut rester vide si au moins un filtre est renseigné.",
	},
	{
		displayName: 'Filtres',
		name: 'filters',
		type: 'collection',
		placeholder: 'Ajouter un filtre',
		default: {},
		displayOptions: showForRecherche,
		options: [
			{
				displayName: "Catégorie d'entreprise",
				name: 'categorie_entreprise',
				type: 'multiOptions',
				default: [],
				options: [
					{ name: 'ETI (entreprise de taille intermédiaire)', value: 'ETI' },
					{ name: 'GE (grande entreprise)', value: 'GE' },
					{ name: 'PME (petite ou moyenne entreprise)', value: 'PME' },
				],
				description: "Catégorie de taille INSEE de l'unité légale",
			},
			{
				displayName: "Chiffre d'affaires max",
				name: 'ca_max',
				type: 'number',
				default: 0,
				description: "Chiffre d'affaires annuel maximum de l'entreprise, en euros",
			},
			{
				displayName: "Chiffre d'affaires min",
				name: 'ca_min',
				type: 'number',
				default: 0,
				description: "Chiffre d'affaires annuel minimum de l'entreprise, en euros",
			},
			{
				displayName: 'Code commune (INSEE)',
				name: 'code_commune',
				type: 'string',
				default: '',
				placeholder: '75101,69381',
				description:
					'Code commune INSEE à cinq caractères. Filtre sur les établissements et accepte une liste séparée par des virgules.',
			},
			{
				displayName: "Code d'activité (NAF/APE)",
				name: 'activite_principale',
				type: 'string',
				default: '',
				placeholder: '01.12Z,28.15Z',
				description:
					"Code d'activité NAF/APE de l'INSEE. Accepte une liste séparée par des virgules. Porte sur l'unité légale, pas sur ses établissements.",
			},
			{
				displayName: 'Code de collectivité territoriale',
				name: 'code_collectivite_territoriale',
				type: 'string',
				default: '',
				description:
					'Code d\'une collectivité territoriale : code INSEE pour une commune, SIREN pour un EPCI, code INSEE suivi de "D" pour un département, code INSEE pour une région',
			},
			{
				displayName: 'Code de département',
				name: 'departement',
				type: 'string',
				default: '',
				placeholder: '75,2A',
				description:
					'Code de département à deux ou trois caractères. Filtre sur les établissements et accepte une liste séparée par des virgules.',
			},
			{
				displayName: 'Code de région',
				name: 'region',
				type: 'string',
				default: '',
				placeholder: '11,84',
				description:
					'Code de région à deux chiffres. Filtre sur les établissements et accepte une liste séparée par des virgules.',
			},
			{
				displayName: 'Code EPCI',
				name: 'epci',
				type: 'string',
				default: '',
				description:
					"Code d'un établissement public de coopération intercommunale. Filtre sur les établissements et accepte une liste séparée par des virgules.",
			},
			{
				displayName: 'Code postal',
				name: 'code_postal',
				type: 'string',
				default: '',
				placeholder: '75001,69001',
				description:
					'Code postal à cinq chiffres. Filtre sur les établissements et accepte une liste séparée par des virgules.',
			},
			{
				displayName: 'Convention collective renseignée',
				name: 'convention_collective_renseignee',
				type: 'boolean',
				default: true,
				description:
					'Ne renvoyer que les entreprises dont au moins un établissement a une convention collective renseignée',
			},
			{
				displayName: 'Date de naissance max',
				name: 'date_naissance_personne_max',
				type: 'string',
				default: '',
				placeholder: '1990-12-31',
				description:
					"Date de naissance la plus tardive d'un dirigeant ou d'un élu de l'entreprise, au format AAAA-MM-JJ",
			},
			{
				displayName: 'Date de naissance min',
				name: 'date_naissance_personne_min',
				type: 'string',
				default: '',
				placeholder: '1960-01-01',
				description:
					"Date de naissance la plus ancienne d'un dirigeant ou d'un élu de l'entreprise, au format AAAA-MM-JJ",
			},
			{
				displayName: 'Est certifiée bio',
				name: 'est_bio',
				type: 'boolean',
				default: true,
				description:
					"Ne renvoyer que les entreprises ayant un établissement certifié par l'Agence Bio",
			},
			{
				displayName: 'Est certifiée Qualiopi',
				name: 'est_qualiopi',
				type: 'boolean',
				default: true,
				description: 'Ne renvoyer que les entreprises détenant la certification Qualiopi',
			},
			{
				displayName: "Est contrôlée Alim'Confiance",
				name: 'est_alim_confiance',
				type: 'boolean',
				default: true,
				description:
					"Ne renvoyer que les entreprises ayant un établissement avec un résultat de contrôle sanitaire Alim'Confiance",
			},
			{
				displayName: "Est de l'économie sociale et solidaire (ESS)",
				name: 'est_ess',
				type: 'boolean',
				default: true,
				description: "Ne renvoyer que les entreprises de l'économie sociale et solidaire",
			},
			{
				displayName: 'Est du secteur sanitaire et social (FINESS)',
				name: 'est_finess',
				type: 'boolean',
				default: true,
				description:
					'Ne renvoyer que les entités du secteur sanitaire et social, sur les identifiants FINESS géographiques comme juridiques',
			},
			{
				displayName: 'Est enregistrée UAI',
				name: 'est_uai',
				type: 'boolean',
				default: true,
				description:
					"Ne renvoyer que les entreprises ayant un établissement doté d'un identifiant UAI",
			},
			{
				displayName: 'Est entrepreneur de spectacle',
				name: 'est_entrepreneur_spectacle',
				type: 'boolean',
				default: true,
				description:
					"Ne renvoyer que les entreprises titulaires d'une licence d'entrepreneur de spectacle",
			},
			{
				displayName: 'Est entrepreneur individuel',
				name: 'est_entrepreneur_individuel',
				type: 'boolean',
				default: true,
				description: 'Ne renvoyer que les entrepreneurs individuels',
			},
			{
				displayName: 'Est entreprise du patrimoine vivant (EPV)',
				name: 'est_patrimoine_vivant',
				type: 'boolean',
				default: true,
				description: 'Ne renvoyer que les entreprises labellisées Entreprise du Patrimoine Vivant',
			},
			{
				displayName: 'Est labellisée achats responsables (RFAR)',
				name: 'est_achats_responsables',
				type: 'boolean',
				default: true,
				description:
					'Ne renvoyer que les entreprises labellisées Relations Fournisseurs et Achats Responsables',
			},
			{
				displayName: 'Est organisme de formation',
				name: 'est_organisme_formation',
				type: 'boolean',
				default: true,
				description:
					'Ne renvoyer que les entreprises ayant un établissement déclaré comme organisme de formation',
			},
			{
				displayName: "Est reconnue garant de l'environnement (RGE)",
				name: 'est_rge',
				type: 'boolean',
				default: true,
				description: "Ne renvoyer que les entreprises reconnues garant de l'environnement",
			},
			{
				displayName: 'Est une administration',
				name: 'est_administration',
				type: 'boolean',
				default: true,
				description:
					'Ne renvoyer que les administrations publiques. La liste sous-jacente est non exhaustive, des faux positifs sont possibles.',
			},
			{
				displayName: 'Est une association',
				name: 'est_association',
				type: 'boolean',
				default: true,
				description:
					"Ne renvoyer que les entités ayant un identifiant d'association ou une nature juridique d'association",
			},
			{
				displayName: 'Est une collectivité territoriale',
				name: 'est_collectivite_territoriale',
				type: 'boolean',
				default: true,
				description: 'Ne renvoyer que les collectivités territoriales',
			},
			{
				displayName: 'Est une société à mission',
				name: 'est_societe_mission',
				type: 'boolean',
				default: true,
				description: 'Ne renvoyer que les entreprises enregistrées comme société à mission',
			},
			{
				displayName: "Est une structure d'insertion (SIAE)",
				name: 'est_siae',
				type: 'boolean',
				default: true,
				description: "Ne renvoyer que les structures d'insertion par l'activité économique",
			},
			{
				displayName: 'État administratif',
				name: 'etat_administratif',
				type: 'options',
				default: 'A',
				options: [
					{ name: 'Active', value: 'A' },
					{ name: 'Cessée', value: 'C' },
				],
				description: "État administratif de l'unité légale",
			},
			{
				displayName: 'Identifiant de convention collective',
				name: 'id_convention_collective',
				type: 'string',
				default: '',
				description: "Identifiant de convention collective d'un établissement",
			},
			{
				displayName: 'Identifiant FINESS',
				name: 'id_finess',
				type: 'string',
				default: '',
				description: "Identifiant FINESS géographique d'un établissement, à neuf chiffres",
			},
			{
				displayName: 'Identifiant RGE',
				name: 'id_rge',
				type: 'string',
				default: '',
				description: "Identifiant RGE d'un établissement",
			},
			{
				displayName: 'Identifiant UAI',
				name: 'id_uai',
				type: 'string',
				default: '',
				description: "Identifiant UAI d'un établissement",
			},
			{
				displayName: 'Index Egapro renseigné',
				name: 'egapro_renseignee',
				type: 'boolean',
				default: true,
				description:
					"Ne renvoyer que les entreprises ayant un index Egapro d'égalité professionnelle renseigné",
			},
			{
				displayName: 'Nature juridique',
				name: 'nature_juridique',
				type: 'string',
				default: '',
				placeholder: '5710,5499',
				description:
					"Code de catégorie juridique INSEE de l'unité légale. Accepte une liste séparée par des virgules.",
			},
			{
				displayName: 'Nom de la personne',
				name: 'nom_personne',
				type: 'string',
				default: '',
				description: "Nom de famille d'un dirigeant ou d'un élu de l'entreprise",
			},
			{
				displayName: 'Prénoms de la personne',
				name: 'prenoms_personne',
				type: 'string',
				default: '',
				description: "Prénom(s) d'un dirigeant ou d'un élu de l'entreprise",
			},
			{
				displayName: 'Résultat net max',
				name: 'resultat_net_max',
				type: 'number',
				default: 0,
				description: "Résultat net maximum de l'entreprise, en euros",
			},
			{
				displayName: 'Résultat net min',
				name: 'resultat_net_min',
				type: 'number',
				default: 0,
				description: "Résultat net minimum de l'entreprise, en euros",
			},
			{
				displayName: "Section d'activité",
				name: 'section_activite_principale',
				type: 'multiOptions',
				default: [],
				options: sectionOptions,
				description: "Section d'activité INSEE de premier niveau de l'unité légale",
			},
			{
				displayName: "Tranche d'effectif salarié",
				name: 'tranche_effectif_salarie',
				type: 'multiOptions',
				default: [],
				options: trancheEffectifOptions,
				description: "Tranche d'effectif salarié INSEE de l'entreprise",
			},
			{
				displayName: 'Type de personne',
				name: 'type_personne',
				type: 'options',
				default: 'dirigeant',
				options: [
					{ name: 'Dirigeant', value: 'dirigeant' },
					{ name: 'Élu', value: 'elu' },
				],
				description: 'Rôle de la personne recherchée via les filtres de nom et de prénoms',
			},
		],
	},
];
