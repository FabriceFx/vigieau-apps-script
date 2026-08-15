/**
 * Module de cartographie interactive des restrictions d'eau.
 */

/**
 * Échappe les caractères spéciaux HTML.
 * @param {string} str - La chaîne à échapper.
 * @returns {string} La chaîne échappée.
 */
function echapperHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}

/**
 * Prépare les données en croisant les coordonnées GPS et le dernier état connu.
 * Borde la lecture de la BDD pour éviter la saturation de mémoire sur les gros historiques.
 * @returns {Array<Object>} Tableau d'objets contenant les infos de chaque point.
 */
const preparerDonneesCarte = () => {
  const classeur = SpreadsheetApp.getActiveSpreadsheet();
  const feuilleSites = classeur.getSheetByName(CONFIG_APP.ONGLETS.SITES);
  const feuilleSuivi = classeur.getSheetByName(CONFIG_APP.ONGLETS.BDD);
  
  if (!feuilleSites || !feuilleSuivi) {
    throw new Error("Onglets sources introuvables pour générer la carte.");
  }

  const dernierEtatParSite = new Map();
  const derniereLigneSuivi = feuilleSuivi.getLastRow();

  // 1. Récupération du dernier état de chaque site dans "BDD" (lecture bornée aux N dernières lignes)
  if (derniereLigneSuivi >= CONFIG_APP.LIGNE_DEPART_DONNEES) {
    const nbLignesDisponibles = derniereLigneSuivi - CONFIG_APP.LIGNE_DEPART_DONNEES + 1;
    const nbLignesALire = Math.min(nbLignesDisponibles, CONFIG_APP.MAX_LIGNES_HISTORIQUE_LECTURE);
    const premiereLigneALire = derniereLigneSuivi - nbLignesALire + 1;

    const colSite = CONFIG_APP.COLONNES_BDD.SITE;
    const colEtat = CONFIG_APP.COLONNES_BDD.ETAT;
    const maxColBdd = Math.max(colSite, colEtat);

    const donneesSuivi = feuilleSuivi.getRange(premiereLigneALire, 1, nbLignesALire, maxColBdd).getValues();

    // Parcours inversé pour capter le statut le plus récent
    for (let i = donneesSuivi.length - 1; i >= 0; i--) {
      const nomSite = donneesSuivi[i][colSite - 1];
      const etat = donneesSuivi[i][colEtat - 1];

      if (nomSite && !dernierEtatParSite.has(nomSite)) {
        dernierEtatParSite.set(nomSite, etat);
      }
    }
  }
  
  // 2. Croisement avec les coordonnées GPS dans "Sites"
  const derniereLigneSites = feuilleSites.getLastRow();
  if (derniereLigneSites < CONFIG_APP.LIGNE_DEPART_DONNEES) {
    return [];
  }

  const colSiteSites = CONFIG_APP.COLONNES_SITES.ADRESSE;
  const colGpsSites = CONFIG_APP.COLONNES_SITES.GPS;
  const maxColSites = Math.max(colSiteSites, colGpsSites);

  const donneesSites = feuilleSites.getRange(
    CONFIG_APP.LIGNE_DEPART_DONNEES, 
    1, 
    derniereLigneSites - CONFIG_APP.LIGNE_DEPART_DONNEES + 1, 
    maxColSites
  ).getValues();

  const pointsCarte = [];
  
  for (const ligne of donneesSites) {
    const nomSite = ligne[colSiteSites - 1];
    const gpsBrut = ligne[colGpsSites - 1];
    const coords = parserCoordonnees(gpsBrut);
    
    // Validation stricte via l'utilitaire centralisé
    if (nomSite && coords) {
      // Par défaut "Inconnu" pour éviter les faux négatifs si un site n'a pas encore de relevé récent
      const etat = dernierEtatParSite.get(nomSite) || "Inconnu";
      
      pointsCarte.push({
        nom: echapperHtml(nomSite.toString()),
        lat: coords.lat,
        lon: coords.lon,
        etat: echapperHtml(etat.toString())
      });
    }
  }
  
  return pointsCarte;
};

/**
 * Génère et affiche la fenêtre modale contenant la carte interactive.
 */
function afficherCarteVigilance() {
  const interfaceUtilisateur = SpreadsheetApp.getUi();
  
  try {
    const donnees = preparerDonneesCarte();
    
    if (donnees.length === 0) {
      interfaceUtilisateur.alert(
        t("INFO_TITLE"), 
        t("NO_DATA_MAP"), 
        interfaceUtilisateur.ButtonSet.OK
      );
      return;
    }
    
    const template = HtmlService.createTemplateFromFile("Carte");
    template.donneesCarto = JSON.stringify(donnees);
    
    const pageHtml = template.evaluate()
      .setWidth(CONFIG_APP.FENETRE_CARTE.LARGEUR)
      .setHeight(CONFIG_APP.FENETRE_CARTE.HAUTEUR)
      .setTitle(t("MODAL_MAP_TITLE"));
      
    interfaceUtilisateur.showModalDialog(pageHtml, t("MODAL_MAP_TITLE"));
    
  } catch (erreur) {
    console.error(`Erreur d'affichage de la carte : ${erreur.stack}`);
    interfaceUtilisateur.alert(
      t("ERROR_TECHNICAL"), 
      t("ERROR_MAP_OPEN") + erreur.message, 
      interfaceUtilisateur.ButtonSet.OK
    );
  }
}