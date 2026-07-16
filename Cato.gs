/**
 * Configuration de la cartographie.
 * @constant {Object}
 */
const CONFIG_CARTO = {
  ONGLET_SITES: "Sites",
  ONGLET_SUIVI: "BDD",
  TITRE_MODALE: "📍 Carte des restrictions d'eau",
  LARGEUR: 1000,
  HAUTEUR: 700,
  
  // Mapping exact des colonnes (Attention: dans un tableau JS, l'index 0 = Colonne A)
  INDEX_SITE_SITES: 1, // Colonne B : Adresse postale (sert de nom de site)
  INDEX_GPS_SITES: 2,  // Colonne C : Code GPS
  
  INDEX_SITE_SUIVI: 1, // Colonne B : Site
  INDEX_ETAT_SUIVI: 2  // Colonne C : Etat de vigilance
};

/**
 * Prépare les données en croisant les coordonnées GPS et le dernier état connu.
 * @returns {Array<Object>} Tableau d'objets contenant les infos de chaque point.
 */
const preparerDonneesCarte = () => {
  const classeur = SpreadsheetApp.getActiveSpreadsheet();
  const feuilleSites = classeur.getSheetByName(CONFIG_CARTO.ONGLET_SITES);
  const feuilleSuivi = classeur.getSheetByName(CONFIG_CARTO.ONGLET_SUIVI);
  
  if (!feuilleSites || !feuilleSuivi) {
    throw new Error("Onglets sources introuvables pour générer la carte.");
  }
  
  // 1. Récupération du dernier état de chaque site dans "BDD Suivi"
  const donneesSuivi = feuilleSuivi.getDataRange().getValues();
  const dernierEtatParSite = new Map();
  
  // Parcours inversé pour capter la dernière mise à jour chronologique
  for (let i = donneesSuivi.length - 1; i > 0; i--) {
    const nomSite = donneesSuivi[i][CONFIG_CARTO.INDEX_SITE_SUIVI]; 
    const etat = donneesSuivi[i][CONFIG_CARTO.INDEX_ETAT_SUIVI];    
    
    if (nomSite && !dernierEtatParSite.has(nomSite)) {
      dernierEtatParSite.set(nomSite, etat);
    }
  }
  
  // 2. Croisement avec les coordonnées GPS dans "Sites"
  const donneesSites = feuilleSites.getDataRange().getValues();
  const pointsCarte = [];
  
  for (let i = 1; i < donneesSites.length; i++) {
    const nomSite = donneesSites[i][CONFIG_CARTO.INDEX_SITE_SITES]; 
    const gps = donneesSites[i][CONFIG_CARTO.INDEX_GPS_SITES];     
    
    // Validation stricte des données
    if (nomSite && gps && typeof gps === 'string' && gps.includes(",")) {
      const [lat, lon] = gps.split(",");
      const etat = dernierEtatParSite.get(nomSite) || "Pas de restriction"; // État par défaut si non trouvé
      
      pointsCarte.push({
        nom: nomSite,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        etat: etat
      });
    }
  }
  
  return pointsCarte;
};

/**
 * Génère et affiche la fenêtre modale contenant la carte interactive.
 * Portée : Globale (appelée par le menu personnalisé)
 */
function afficherCarteVigilance() {
  const interfaceUtilisateur = SpreadsheetApp.getUi();
  
  try {
    const donnees = preparerDonneesCarte();
    
    if (donnees.length === 0) {
      interfaceUtilisateur.alert(
        "Information", 
        "Aucune donnée géolocalisée à afficher sur la carte.", 
        interfaceUtilisateur.ButtonSet.OK
      );
      return;
    }
    
    // Création du template HTML à partir du fichier nommé "Carte.html"
    const template = HtmlService.createTemplateFromFile("Carte");
    
    // Injection des données JSON sécurisées dans le template
    template.donneesCarto = JSON.stringify(donnees);
    
    const pageHtml = template.evaluate()
      .setWidth(CONFIG_CARTO.LARGEUR)
      .setHeight(CONFIG_CARTO.HAUTEUR)
      .setTitle(CONFIG_CARTO.TITRE_MODALE);
      
    // Affichage de la boîte de dialogue modale
    interfaceUtilisateur.showModalDialog(pageHtml, CONFIG_CARTO.TITRE_MODALE);
    
  } catch (erreur) {
    console.error(`Erreur d'affichage de la carte : ${erreur.stack}`);
    interfaceUtilisateur.alert(
      "Erreur technique", 
      `Impossible d'ouvrir la carte :\n\n${erreur.message}`, 
      interfaceUtilisateur.ButtonSet.OK
    );
  }
}