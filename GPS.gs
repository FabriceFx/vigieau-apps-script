/**
 * Module de géocodage et calcul des coordonnées GPS des sites.
 * Utilise l'API nationale de géocodage (data.geopf.fr).
 */

/**
 * Extrait les coordonnées GPS et le département depuis un objet GeoJSON de l'API Géocodage.
 * @param {Object} donneesJson - Données retournées par l'API.
 * @returns {Object} { gps: string, departement: string }
 */
const extraireInfosGeoJson = (donneesJson) => {
  if (donneesJson && donneesJson.features && donneesJson.features.length > 0) {
    const feature = donneesJson.features[0];
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
  return {
    gps: t("NOT_FOUND"),
    departement: t("NOT_FOUND")
  };
};

/**
 * Interroge l'API pour récupérer les coordonnées GPS et le département d'une adresse unique.
 * Utilisé principalement par le déclencheur instantané (onEdit).
 * @param {string} adresse - L'adresse postale à rechercher.
 * @returns {Object} Un objet contenant les propriétés {gps, departement}.
 */
const obtenirDonneesGeographiques = (adresse) => {
  const reponseVide = { gps: "", departement: "" };
  const reponseErreur = { gps: t("ERROR_GPS"), departement: t("ERROR_GPS") };

  if (!adresse || adresse.toString().trim() === "") {
    return reponseVide;
  }

  try {
    const url = `${CONFIG_APP.API.GEOCODAGE}?q=${encodeURIComponent(adresse)}&limit=1`;
    const reponse = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const code = reponse.getResponseCode();

    if (code !== 200) {
      console.error(`Géocodage HTTP ${code} pour "${adresse}" : ${reponse.getContentText().substring(0, 200)}`);
      return reponseErreur;
    }

    const donnees = JSON.parse(reponse.getContentText());
    return extraireInfosGeoJson(donnees);

  } catch (erreur) {
    console.error(`Géocodage impossible pour "${adresse}" : ${erreur.stack}`);
    return reponseErreur;
  }
};

/**
 * Automatisation à la volée : Déclenché automatiquement par l'installable trigger (onEdit).
 * Nécessite un trigger installable pour utiliser UrlFetchApp.
 * @param {Object} e - Événement d'édition fourni par Google Sheets.
 */
function gererEditionAutomatique(e) {
  if (!e || !e.range) return;
  const feuille = e.range.getSheet();

  if (feuille.getName() !== CONFIG_APP.ONGLETS.SITES) return;

  const colAdresse = CONFIG_APP.COLONNES_SITES.ADRESSE;
  const colGps = CONFIG_APP.COLONNES_SITES.GPS;
  const colDep = CONFIG_APP.COLONNES_SITES.DEPARTEMENT;
  const ligneDepart = CONFIG_APP.LIGNE_DEPART_DONNEES;

  // Vérifier si la modification touche la colonne Adresse
  if (e.range.getColumn() > colAdresse || e.range.getLastColumn() < colAdresse) return;

  const premiereLigne = Math.max(e.range.getRow(), ligneDepart);
  const derniereLigne = e.range.getLastRow();
  if (derniereLigne < premiereLigne) return;

  const nombreDeLignes = derniereLigne - premiereLigne + 1;

  // Garde-fou pour éviter d'épuiser le quota de temps lors de collages massifs
  if (nombreDeLignes > CONFIG_APP.MAX_LIGNES_AUTO_GPS) {
    feuille.getParent().toast(t("AUTO_TOO_MANY_ROWS"), t("INFO_TITLE"), 8);
    return;
  }

  const adresses = feuille.getRange(premiereLigne, colAdresse, nombreDeLignes, 1).getValues();

  // Retour visuel immédiat
  const enAttente = adresses.map(([adresse]) =>
    [adresse && adresse.toString().trim() !== "" ? t("CALCULATING") : ""]
  );
  feuille.getRange(premiereLigne, colGps, nombreDeLignes, 1).setValues(enAttente);
  SpreadsheetApp.flush();

  const departements = [];
  const coordonnees = [];

  for (const [adresse] of adresses) {
    if (!adresse || adresse.toString().trim() === "") {
      departements.push([""]);
      coordonnees.push([""]);
      continue;
    }

    const donnees = obtenirDonneesGeographiques(adresse);
    departements.push([donnees.departement]);
    coordonnees.push([donnees.gps]);
  }

  feuille.getRange(premiereLigne, colDep, nombreDeLignes, 1).setValues(departements);
  feuille.getRange(premiereLigne, colGps, nombreDeLignes, 1).setValues(coordonnees);
}

/**
 * Traitement global avec calcul différentiel et parallélisation par lots (UrlFetchApp.fetchAll).
 * Écriture progressive par lot pour garantir la persistance des résultats et prévention du timeout.
 */
function calculerGps() {
  const interfaceUtilisateur = SpreadsheetApp.getUi();

  try {
    const debutExecution = Date.now();
    const classeur = SpreadsheetApp.getActiveSpreadsheet();
    const feuille = classeur.getSheetByName(CONFIG_APP.ONGLETS.SITES);

    if (!feuille) throw new Error(`L'onglet "${CONFIG_APP.ONGLETS.SITES}" est introuvable.`);

    const ligneDepart = CONFIG_APP.LIGNE_DEPART_DONNEES;
    const derniereLigne = feuille.getLastRow();

    if (derniereLigne < ligneDepart) {
      interfaceUtilisateur.alert(t("INFO_TITLE"), t("NO_ADDRESS_TO_PROCESS"), interfaceUtilisateur.ButtonSet.OK);
      return;
    }

    const colDep = CONFIG_APP.COLONNES_SITES.DEPARTEMENT;
    const colAdresse = CONFIG_APP.COLONNES_SITES.ADRESSE;
    const colGps = CONFIG_APP.COLONNES_SITES.GPS;

    const nombreDeLignes = derniereLigne - ligneDepart + 1;
    const maxColonne = Math.max(colDep, colAdresse, colGps);
    const plageComplete = feuille.getRange(ligneDepart, 1, nombreDeLignes, maxColonne).getValues();

    const elementsATraiter = []; // { index, adresse }

    plageComplete.forEach((ligne, index) => {
      const adresse = ligne[colAdresse - 1];
      const gpsExistant = ligne[colGps - 1];

      if (adresse && !estCoordonneeValide(gpsExistant)) {
        elementsATraiter.push({
          index: index,
          adresse: adresse.toString().trim()
        });
      }
    });

    if (elementsATraiter.length === 0) {
      classeur.toast(t("ALL_VALID"), t("NO_UPDATE_REQUIRED"), 4);
      return;
    }

    classeur.toast(`Calcul en cours pour ${elementsATraiter.length} site(s)...`, t("INFO_TITLE"), 5);

    const tailleLot = CONFIG_APP.TAILLE_LOT_BATCH_GPS;
    let sitesMisAJour = 0;

    // Traitement par lots parallèles avec écriture immédiate par lot
    for (let i = 0; i < elementsATraiter.length; i += tailleLot) {
      const lot = elementsATraiter.slice(i, i + tailleLot);
      const requetes = lot.map(item => ({
        url: `${CONFIG_APP.API.GEOCODAGE}?q=${encodeURIComponent(item.adresse)}&limit=1`,
        muteHttpExceptions: true
      }));

      const reponses = executerRequetesAvecRetry(requetes, CONFIG_APP.MAX_RETRIES);

      // Mise à jour cellule par cellule dans la feuille pour le lot traité
      lot.forEach((item, lotIndex) => {
        const reponse = reponses[lotIndex];
        let donneesGeo = { gps: t("ERROR_GPS"), departement: t("ERROR_GPS") };

        if (reponse) {
          const code = reponse.getResponseCode();
          if (code === 200) {
            try {
              donneesGeo = extraireInfosGeoJson(JSON.parse(reponse.getContentText()));
            } catch (err) {
              console.error(`Réponse JSON invalide pour "${item.adresse}" : ${err.message}`);
            }
          } else {
            console.error(`Erreur HTTP ${code} pour "${item.adresse}"`);
          }
        } else {
          console.error(`Échec réseau total après retries pour "${item.adresse}"`);
        }

        const ligneFeuille = ligneDepart + item.index;
        feuille.getRange(ligneFeuille, colDep).setValue(donneesGeo.departement);
        feuille.getRange(ligneFeuille, colGps).setValue(donneesGeo.gps);
        sitesMisAJour++;
      });

      SpreadsheetApp.flush();

      // Garde-fou temporel : arrêt propre si l'on approche la limite des 6 minutes
      const tempsEcoule = Date.now() - debutExecution;
      if (tempsEcoule > CONFIG_APP.MAX_DUREE_EXECUTION_MS && (i + tailleLot) < elementsATraiter.length) {
        console.warn(`Calcul GPS interrompu préventivement : ${tempsEcoule}ms écoulés.`);
        classeur.toast(
          `Temps limite atteint : ${sitesMisAJour}/${elementsATraiter.length} sites traités. Relancez pour poursuivre.`, 
          t("INFO_TITLE"), 
          8
        );
        return;
      }
    }

    classeur.toast(`${sitesMisAJour} ${t("SITES_UPDATED")}`, t("UPDATE_FINISHED"), 5);

  } catch (erreur) {
    console.error(`Erreur critique dans calculerGps : ${erreur.stack}`);
    interfaceUtilisateur.alert(t("ERROR_EXECUTION"), erreur.message, interfaceUtilisateur.ButtonSet.OK);
  }
}