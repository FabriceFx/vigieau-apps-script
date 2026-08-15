/**
 * Configuration globale et centralisée du projet Vigieau Tracker.
 * Centralise les noms d'onglets, le mapping des colonnes (1-based), les paramètres d'exécution
 * et les utilitaires partagés de parsing de coordonnées.
 * @constant {Object}
 */
const CONFIG_APP = {
  // Noms officiels des onglets du classeur
  ONGLETS: {
    SITES: "Sites",
    BDD: "BDD",
    CONFIG: "Configuration"
  },

  // Index des colonnes (1-based, standard Google Apps Script getRange)
  COLONNES_SITES: {
    DEPARTEMENT: 1, // Colonne A
    ADRESSE: 2,     // Colonne B
    GPS: 3          // Colonne C
  },

  COLONNES_BDD: {
    DATE: 1,        // Colonne A : Date / Horodatage
    SITE: 2,        // Colonne B : Nom du site / Adresse
    ETAT: 3,        // Colonne C : État de vigilance
    SEMAINE: 4,     // Colonne D : Semaine ISO
    JOUR: 5,        // Colonne E : Jour
    MOIS: 6,        // Colonne F : Mois
    MAPS: 7         // Colonne G : Lien Google Maps
  },

  COLONNES_CONFIG: {
    PARAMETRE: 1,   // Colonne A : Nom du paramètre
    VALEUR: 2       // Colonne B : Valeur
  },

  // URLs des services et APIs
  API: {
    GEOCODAGE: "https://data.geopf.fr/geocodage/search",
    VIGIEAU: "https://api.vigieau.beta.gouv.fr/api/zones"
  },

  // Paramètres de résilience, cache et concurrence
  CACHE_DUREE_SECONDES: 21600,       // 6 heures
  ATTENTE_VERROU_MS: 30000,          // 30 secondes
  MAX_RETRIES: 2,                    // Nombre de tentatives sur échec réseau
  DELAI_RETRY_MS: 1000,              // Délai de base pour backoff

  // Performance & limites de traitement
  MAX_LIGNES_AUTO_GPS: 25,           // Plafond pour le géocodage à la volée (onEdit)
  TAILLE_LOT_BATCH_GPS: 30,          // Taille des lots pour UrlFetchApp.fetchAll()
  MAX_LIGNES_HISTORIQUE_LECTURE: 5000, // Nombre max de lignes lues dans la BDD pour synthèse/rapport
  MAX_DUREE_EXECUTION_MS: 300000,    // 5 minutes (marge de sécurité avant limite des 6 min GAS)

  // Alerte sur changement de niveau
  // Un site vu pour la première fois n'est pas une transition : on ne le signale
  // qu'à partir de ce poids de gravité (2 = "Alerte"), pour ne pas noyer la première
  // synchronisation d'un classeur sous des lignes sans intérêt.
  SEUIL_NOUVEAU_SITE_POIDS: 2,

  // Constantes métier
  ETAT_CRISE: "Crise",
  LIBELLE_LIEN_MAPS: "📍 Voir sur Maps",
  LIGNE_DEPART_DONNEES: 2,

  // Dimensions UI
  FENETRE_CARTE: {
    LARGEUR: 1000,
    HAUTEUR: 700
  },
  FENETRE_BILAN: {
    LARGEUR: 450,
    HAUTEUR: 400
  },

  // Couleurs de texte lisibles sur fond blanc (emails d'alerte)
  COULEURS_TEXTE_NIVEAU: {
    "Crise": "#b3261e",
    "Alerte renforcée": "#b06000",
    "Alerte": "#8a6100",
    "Vigilance": "#1a56c4",
    "Pas de restriction": "#137333"
  },

  // Couleurs de fond Material Design pour la BDD
  COULEURS_FOND: {
    "Crise": "#fce8e6",
    "Alerte renforcée": "#fef7e0",
    "Alerte": "#fff9e6",
    "Vigilance": "#e8f0fe",
    "Pas de restriction": "#e6f4ea",
    "Inconnu": "#f1f3f4",
    "Erreur d'API": "#f1f3f4",
    "Réponse API invalide": "#f1f3f4"
  }
};

/**
 * Analyse une valeur brute et extrait un couple de coordonnées GPS validé.
 * Supprime la duplication du parsing GPS dans les différents modules.
 * @param {*} valeur - Contenu d'une cellule ou chaîne GPS (ex: "48.8566, 2.3522").
 * @returns {{ lat: number, lon: number } | null} Les coordonnées validées ou null.
 */
function parserCoordonnees(valeur) {
  if (valeur === null || valeur === undefined) return null;

  const chaine = valeur.toString().trim();
  if (!chaine.includes(",")) return null;

  const parties = chaine.split(",");
  if (parties.length !== 2) return null;

  const latitude = parseFloat(parties[0].trim());
  const longitude = parseFloat(parties[1].trim());

  if (isNaN(latitude) || isNaN(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;

  return { lat: latitude, lon: longitude };
}

/**
 * Détermine si une valeur contient un couple de coordonnées GPS valide.
 * @param {*} valeur - Valeur brute à tester.
 * @returns {boolean} Vrai si les coordonnées sont valides.
 */
function estCoordonneeValide(valeur) {
  return parserCoordonnees(valeur) !== null;
}
