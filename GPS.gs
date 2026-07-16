/**
 * Configuration globale de l'application.
 * @constant {Object}
 */
const CONFIG = {
  NOM_FEUILLE: "Sites",
  LIGNE_DEPART: 2,
  COLONNE_DEPARTEMENT: 1, // Colonne A
  COLONNE_ADRESSE: 2,     // Colonne B
  COLONNE_RESULTAT: 3,    // Colonne C
  URL_API: "https://data.geopf.fr/geocodage/search", 
  DELAI_PAUSE_MS: 100,
  MESSAGE_INTROUVABLE: "Introuvable",
  MESSAGE_ERREUR: "Erreur",
  MESSAGE_VIDE: ""
};

/**
 * Interroge l'API pour récupérer les coordonnées GPS et le département.
 * @param {string} adresse - L'adresse postale à rechercher.
 * @returns {Object} Un objet contenant les propriétés {gps, departement}.
 */
const obtenirDonneesGeographiques = (adresse) => {
  const reponseVide = { gps: CONFIG.MESSAGE_VIDE, departement: CONFIG.MESSAGE_VIDE };
  const reponseIntrouvable = { gps: CONFIG.MESSAGE_INTROUVABLE, departement: CONFIG.MESSAGE_INTROUVABLE };
  const reponseErreur = { gps: CONFIG.MESSAGE_ERREUR, departement: CONFIG.MESSAGE_ERREUR };

  if (!adresse || adresse.toString().trim() === "") {
    return reponseVide;
  }

  try {
    const url = `${CONFIG.URL_API}?q=${encodeURIComponent(adresse)}&limit=1`;
    Utilities.sleep(CONFIG.DELAI_PAUSE_MS); 
    
    const reponse = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    
    if (reponse.getResponseCode() !== 200) {
      return reponseErreur;
    }

    const donnees = JSON.parse(reponse.getContentText());
    
    if (donnees.features && donnees.features.length > 0) {
      const feature = donnees.features[0];
      
      const [longitude, latitude] = feature.geometry.coordinates;
      const contexte = feature.properties.context || "";
      const elementsContexte = contexte.split(",");
      
      const departement = elementsContexte.length >= 2 
        ? `${elementsContexte[0].trim()} - ${elementsContexte[1].trim()}` 
        : contexte;

      return {
        gps: `${latitude}, ${longitude}`,
        departement: departement
      };
    } 
    
    return reponseIntrouvable;

  } catch (erreur) {
    return reponseErreur;
  }
};

/**
 * Automatisation à la volée : Déclenché automatiquement par l'installable trigger (onEdit).
 * Nécessite un trigger installable pour utiliser UrlFetchApp.
 */
function gererEditionAutomatique(e) {
  if (!e || !e.range) return;
  const feuille = e.range.getSheet();
  
  if (feuille.getName() !== CONFIG.NOM_FEUILLE) return;
  
  const colonne = e.range.getColumn();
  const ligne = e.range.getRow();
  
  if (colonne === CONFIG.COLONNE_ADRESSE && ligne >= CONFIG.LIGNE_DEPART) {
    const adresse = e.range.getValue();
    
    // Si la cellule est vidée, on nettoie
    if (!adresse || adresse.toString().trim() === "") {
      feuille.getRange(ligne, CONFIG.COLONNE_DEPARTEMENT).clearContent();
      feuille.getRange(ligne, CONFIG.COLONNE_RESULTAT).clearContent();
      return;
    }
    
    feuille.getRange(ligne, CONFIG.COLONNE_RESULTAT).setValue("⏳ Calcul...");
    
    const donnees = obtenirDonneesGeographiques(adresse);
    feuille.getRange(ligne, CONFIG.COLONNE_DEPARTEMENT).setValue(donnees.departement);
    feuille.getRange(ligne, CONFIG.COLONNE_RESULTAT).setValue(donnees.gps);
  }
}

/**
 * Traitement global avec calcul différentiel.
 * Met à jour uniquement les lignes qui n'ont pas encore de GPS valide.
 */
function calculerGps() {
  const interfaceUtilisateur = SpreadsheetApp.getUi();
  
  try {
    const classeur = SpreadsheetApp.getActiveSpreadsheet();
    const feuille = classeur.getSheetByName(CONFIG.NOM_FEUILLE);
    
    if (!feuille) throw new Error(`L'onglet "${CONFIG.NOM_FEUILLE}" est introuvable.`);
    
    const derniereLigne = feuille.getLastRow();
    
    if (derniereLigne < CONFIG.LIGNE_DEPART) {
      interfaceUtilisateur.alert("Information", "Aucune adresse à traiter.", interfaceUtilisateur.ButtonSet.OK);
      return;
    }
    
    const nombreDeLignes = derniereLigne - CONFIG.LIGNE_DEPART + 1;
    const maxColonne = Math.max(CONFIG.COLONNE_DEPARTEMENT, CONFIG.COLONNE_ADRESSE, CONFIG.COLONNE_RESULTAT);
    const plageComplete = feuille.getRange(CONFIG.LIGNE_DEPART, 1, nombreDeLignes, maxColonne).getValues();
    
    const nouveauxGps = [];
    const nouveauxDeps = [];
    let modifications = 0;
    
    plageComplete.forEach(ligne => {
      const depExistant = ligne[CONFIG.COLONNE_DEPARTEMENT - 1];
      const adresse = ligne[CONFIG.COLONNE_ADRESSE - 1];
      const gpsExistant = ligne[CONFIG.COLONNE_RESULTAT - 1];
      
      const besoinDeCalcul = adresse && (!gpsExistant || gpsExistant === CONFIG.MESSAGE_ERREUR || gpsExistant === CONFIG.MESSAGE_INTROUVABLE || String(gpsExistant).includes("Calcul"));
      
      if (!besoinDeCalcul) {
        nouveauxDeps.push([depExistant]);
        nouveauxGps.push([gpsExistant]);
      } else {
        const donnees = obtenirDonneesGeographiques(adresse);
        nouveauxDeps.push([donnees.departement]);
        nouveauxGps.push([donnees.gps]);
        modifications++;
      }
    });
    
    if (modifications > 0) {
      feuille.getRange(CONFIG.LIGNE_DEPART, CONFIG.COLONNE_DEPARTEMENT, nombreDeLignes, 1).setValues(nouveauxDeps);
      feuille.getRange(CONFIG.LIGNE_DEPART, CONFIG.COLONNE_RESULTAT, nombreDeLignes, 1).setValues(nouveauxGps);
      classeur.toast(`${modifications} site(s) ont été mis à jour de manière différentielle.`, "Mise à jour terminée", 5);
    } else {
      classeur.toast("Toutes les adresses possèdent déjà des coordonnées valides.", "Aucune mise à jour requise", 4);
    }
    
  } catch (erreur) {
    console.error(`Erreur critique : ${erreur.stack}`);
    interfaceUtilisateur.alert("Erreur d'exécution", erreur.message, interfaceUtilisateur.ButtonSet.OK);
  }
}