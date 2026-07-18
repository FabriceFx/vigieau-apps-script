/**
 * Configuration spécifique pour l'API Vigieau et l'onglet de suivi.
 * @constant {Object}
 */
const CONFIG_VIGIEAU = {
  ONGLET_SITES: "Sites",
  COLONNE_NOM_SITE: 2,
  COLONNE_GPS: 3,
  LIGNE_DEPART_SITES: 2,
  
  ONGLET_SUIVI: "BDD",
  ONGLET_CONFIG: "Configuration", // Nouvel onglet pour les réglages utilisateurs
  URL_API: "https://api.vigieau.beta.gouv.fr/api/zones",
  SEPARATEUR_GPS: ",",
  
  // Paramètres de cache et robustesse
  CACHE_DUREE_SECONDES: 21600, // Durée du cache (6 heures)
  MAX_RETRIES: 2,              // Nombre de relances en cas d'erreur de l'API
  
  // Couleurs de fond pour le formatage automatique de la BDD
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
 * Hiérarchie des niveaux de gravité
 */
const NIVEAUX_GRAVITE = {
  "crise": { poids: 4, label: "Crise" },
  "alerte_renforcee": { poids: 3, label: "Alerte renforcée" },
  "alerte": { poids: 2, label: "Alerte" },
  "vigilance": { poids: 1, label: "Vigilance" },
  "normal": { poids: 0, label: "Pas de restriction" }
};

const MOIS_FRANCAIS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const obtenirSemaineISO = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const numJour = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - numJour);
  const debutAnnee = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - debutAnnee) / 86400000) + 1) / 7);
};

const obtenirNomMois = (date) => MOIS_FRANCAIS[date.getMonth()];

const extraireNiveauMax = (zones) => {
  if (!zones || !Array.isArray(zones) || zones.length === 0) {
    return NIVEAUX_GRAVITE["normal"].label;
  }
  
  let poidsMax = -1;
  let labelMax = "Inconnu";
  
  zones.forEach(zone => {
    const gravite = zone.niveauGravite;
    if (gravite && NIVEAUX_GRAVITE[gravite]) {
      if (NIVEAUX_GRAVITE[gravite].poids > poidsMax) {
        poidsMax = NIVEAUX_GRAVITE[gravite].poids;
        labelMax = NIVEAUX_GRAVITE[gravite].label;
      }
    }
  });
  
  return labelMax;
};

const executerRequetesAvecRetry = (requetes, maxRetries) => {
  let tentatives = 0;
  let requetesEnCours = requetes.map((req, index) => ({ requeteOriginale: req, indexOriginal: index }));
  const reponsesFinales = new Array(requetes.length);
  
  while (requetesEnCours.length > 0 && tentatives <= maxRetries) {
    const requetesAExecuter = requetesEnCours.map(r => r.requeteOriginale);
    let reponsesPartielles = [];
    
    try {
      reponsesPartielles = UrlFetchApp.fetchAll(requetesAExecuter);
    } catch (e) {
      console.error("Erreur réseau:", e);
      break; 
    }
    
    const requetesEchouees = [];
    
    reponsesPartielles.forEach((reponse, i) => {
      const code = reponse?.getResponseCode() || 500;
      const meta = requetesEnCours[i];
      
      if (code === 200 || (code >= 400 && code < 500)) {
         reponsesFinales[meta.indexOriginal] = reponse;
      } else {
         if (tentatives < maxRetries) {
            requetesEchouees.push(meta);
         } else {
            reponsesFinales[meta.indexOriginal] = reponse; 
         }
      }
    });
    
    requetesEnCours = requetesEchouees;
    if (requetesEnCours.length > 0) {
       tentatives++;
       Utilities.sleep(1000 * tentatives); 
    }
  }
  
  return reponsesFinales;
};

const comptabiliserStatistiques = (etatVigilance, statsBilan) => {
  if (etatVigilance === "Crise") statsBilan.crise++;
  else if (etatVigilance.includes("Alerte")) statsBilan.alerte++;
  else if (etatVigilance === "Vigilance") statsBilan.vigilance++;
  else if (etatVigilance === "Pas de restriction") statsBilan.normal++;
};

/**
 * Gère la configuration utilisateur directement depuis le tableur Google Sheets
 */
const recupererConfigurationUtilisateur = (classeur) => {
  let feuilleConfig = classeur.getSheetByName(CONFIG_VIGIEAU.ONGLET_CONFIG);
  
  // Si l'onglet de configuration n'existe pas, on le crée avec les valeurs par défaut
  if (!feuilleConfig) {
    feuilleConfig = classeur.insertSheet(CONFIG_VIGIEAU.ONGLET_CONFIG);
    
    const enTetes = [["Paramètre", "Valeur", "Description"]];
    const donnees = [
      ["Profil", "entreprise", "Options : particulier, entreprise, collectivite, agriculteur"],
      ["Type de zone", "AEP", "Options : AEP (Eau potable), SOU (Souterraine), SUP (Superficielle)"],
      ["Email du destinataire", "", "Laissez vide pour envoyer à l'utilisateur courant"],
      ["Fréquence Synchronisation", "Désactivé", "Options : Désactivé, Quotidien, Hebdomadaire"],
      ["Heure Synchronisation", "08", "Heure de 00 à 23"],
      ["Fréquence Email", "Désactivé", "Options : Désactivé, Quotidien, Hebdomadaire"],
      ["Heure Email", "09", "Heure de 00 à 23"]
    ];
    
    const plageEnTetes = feuilleConfig.getRange("A1:C1");
    plageEnTetes.setValues(enTetes).setFontWeight("bold").setBackground("#f3f3f3");
    
    feuilleConfig.getRange("A2:C8").setValues(donnees);
    feuilleConfig.autoResizeColumns(1, 3);
    
    // Ajout des listes déroulantes (Data Validation)
    const regleProfil = SpreadsheetApp.newDataValidation().requireValueInList(["particulier", "entreprise", "collectivite", "agriculteur"], true).build();
    feuilleConfig.getRange("B2").setDataValidation(regleProfil);
    
    const regleZone = SpreadsheetApp.newDataValidation().requireValueInList(["AEP", "SOU", "SUP"], true).build();
    feuilleConfig.getRange("B3").setDataValidation(regleZone);
    
    const regleFreq = SpreadsheetApp.newDataValidation().requireValueInList(["Désactivé", "Quotidien", "Hebdomadaire"], true).build();
    feuilleConfig.getRange("B5").setDataValidation(regleFreq);
    feuilleConfig.getRange("B7").setDataValidation(regleFreq);
    
    const heures = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];
    const regleHeures = SpreadsheetApp.newDataValidation().requireValueInList(heures, true).build();
    feuilleConfig.getRange("B6").setDataValidation(regleHeures);
    feuilleConfig.getRange("B8").setDataValidation(regleHeures);
  }
  
  // Lecture des données actuelles
  const donneesLues = feuilleConfig.getRange("A2:B15").getValues();
  const config = { profil: "entreprise", zoneType: "AEP", emailDestinataire: "", freqSync: "Désactivé", heureSync: "08", freqEmail: "Désactivé", heureEmail: "09" };
  
  for (const ligne of donneesLues) {
    if (ligne[0] === "Profil" && ligne[1]) config.profil = ligne[1].toString().trim();
    if (ligne[0] === "Type de zone" && ligne[1]) config.zoneType = ligne[1].toString().trim();
    if (ligne[0] === "Email du destinataire" && ligne[1]) config.emailDestinataire = ligne[1].toString().trim();
    if (ligne[0] === "Fréquence Synchronisation" && ligne[1]) config.freqSync = ligne[1].toString().trim();
    if (ligne[0] === "Heure Synchronisation" && ligne[1]) config.heureSync = ligne[1].toString().trim();
    if (ligne[0] === "Fréquence Email" && ligne[1]) config.freqEmail = ligne[1].toString().trim();
    if (ligne[0] === "Heure Email" && ligne[1]) config.heureEmail = ligne[1].toString().trim();
  }
  
  return config;
};

/**
 * Point d'entrée principal.
 */
function synchroniserVigilanceEau() {
  let interfaceUtilisateur = null;
  try {
    interfaceUtilisateur = SpreadsheetApp.getUi();
  } catch (e) {
    // Échec silencieux si exécuté via trigger serveur
  }
  
  try {
    const classeur = SpreadsheetApp.getActiveSpreadsheet();
    
    // 0. Récupération des paramètres dynamiques depuis l'onglet Configuration
    const parametresVigieau = recupererConfigurationUtilisateur(classeur);
    
    const feuilleSites = classeur.getSheetByName(CONFIG_VIGIEAU.ONGLET_SITES);
    const feuilleSuivi = classeur.getSheetByName(CONFIG_VIGIEAU.ONGLET_SUIVI);
    
    if (!feuilleSites) throw new Error(`L'onglet source "${CONFIG_VIGIEAU.ONGLET_SITES}" est introuvable.`);
    if (!feuilleSuivi) throw new Error(`L'onglet de destination "${CONFIG_VIGIEAU.ONGLET_SUIVI}" est introuvable.`);
    
    const derniereLigneSites = feuilleSites.getLastRow();
    if (derniereLigneSites < CONFIG_VIGIEAU.LIGNE_DEPART_SITES) {
      if (interfaceUtilisateur) interfaceUtilisateur.alert(t("INFO_TITLE"), t("NO_ADDRESS_TO_PROCESS"), interfaceUtilisateur.ButtonSet.OK);
      return;
    }
    
    const maxColonne = Math.max(CONFIG_VIGIEAU.COLONNE_NOM_SITE, CONFIG_VIGIEAU.COLONNE_GPS);
    const donneesSites = feuilleSites.getRange(CONFIG_VIGIEAU.LIGNE_DEPART_SITES, 1, derniereLigneSites - CONFIG_VIGIEAU.LIGNE_DEPART_SITES + 1, maxColonne).getValues();
    
    const dateDuJour = new Date();
    const semaineISO = obtenirSemaineISO(dateDuJour);
    const jour = dateDuJour.getDate();
    const mois = obtenirNomMois(dateDuJour);
    const dateFormatee = Utilities.formatDate(dateDuJour, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
    
    const cache = CacheService.getScriptCache();
    const sitesExtraits = [];
    
    for (const ligne of donneesSites) {
      const nomSite = ligne[CONFIG_VIGIEAU.COLONNE_NOM_SITE - 1];
      const gps = ligne[CONFIG_VIGIEAU.COLONNE_GPS - 1];
      
      if (gps && typeof gps === 'string' && gps.includes(CONFIG_VIGIEAU.SEPARATEUR_GPS)) {
        const [latStr, lonStr] = gps.split(CONFIG_VIGIEAU.SEPARATEUR_GPS);
        const lat = parseFloat(latStr.trim());
        const lon = parseFloat(lonStr.trim());
        
        if (!isNaN(lat) && !isNaN(lon)) {
          // Utilisation des paramètres utilisateur pour le cache
          const cleCache = `vigieau_${lat}_${lon}_${parametresVigieau.profil}_${parametresVigieau.zoneType}`;
          sitesExtraits.push({ nomSite: nomSite || "Site Inconnu", lat, lon, cleCache });
        }
      }
    }
    
    if (sitesExtraits.length === 0) {
      if (interfaceUtilisateur) interfaceUtilisateur.alert(t("INFO_TITLE"), t("NO_VALID_COORDS"), interfaceUtilisateur.ButtonSet.OK);
      return;
    }
    
    const clesCache = sitesExtraits.map(s => s.cleCache);
    const dictionnaireCache = cache.getAll(clesCache);
    
    const sitesPourAPI = [];
    const requetesApi = [];
    
    const nouvellesLignes = [];
    const couleursLignes = [];
    const statsBilan = { crise: 0, alerte: 0, vigilance: 0, normal: 0 };
    
    const preparerLigne = (site, etatVigilance) => {
      comptabiliserStatistiques(etatVigilance, statsBilan);
      const lienMaps = `=HYPERLINK("https://www.google.com/maps/search/?api=1&query=${site.lat},${site.lon}"; "📍 Voir sur Maps")`;
      nouvellesLignes.push([dateFormatee, site.nomSite, etatVigilance, semaineISO, jour, mois, lienMaps]);
      
      const couleur = CONFIG_VIGIEAU.COULEURS_FOND[etatVigilance] || "#ffffff";
      couleursLignes.push([couleur, couleur, couleur, couleur, couleur, couleur, couleur]);
    };
    
    for (const site of sitesExtraits) {
      if (dictionnaireCache[site.cleCache]) {
        preparerLigne(site, dictionnaireCache[site.cleCache]);
      } else {
        sitesPourAPI.push(site);
        // Utilisation des paramètres utilisateur pour l'API
        const parametres = `lon=${site.lon}&lat=${site.lat}&profil=${parametresVigieau.profil}&zoneType=${parametresVigieau.zoneType}`;
        requetesApi.push({
          url: `${CONFIG_VIGIEAU.URL_API}?${parametres}`,
          muteHttpExceptions: true
        });
      }
    }
    
    if (requetesApi.length > 0) {
      const reponses = executerRequetesAvecRetry(requetesApi, CONFIG_VIGIEAU.MAX_RETRIES);
      const cacheASauvegarder = {};
      
      reponses.forEach((reponse, index) => {
        const site = sitesPourAPI[index];
        let etatVigilance = "Erreur d'API";
        
        if (reponse && reponse.getResponseCode() === 200) {
          try {
            const jsonResponse = JSON.parse(reponse.getContentText());
            etatVigilance = extraireNiveauMax(jsonResponse);
            cacheASauvegarder[site.cleCache] = etatVigilance;
          } catch (e) {
            etatVigilance = "Réponse API invalide";
          }
        }
        
        preparerLigne(site, etatVigilance);
      });
      
      if (Object.keys(cacheASauvegarder).length > 0) {
        cache.putAll(cacheASauvegarder, CONFIG_VIGIEAU.CACHE_DUREE_SECONDES);
      }
    }
    
    if (nouvellesLignes.length > 0) {
      const derniereLigneSuivi = Math.max(feuilleSuivi.getLastRow(), 1);
      const plageEcriture = feuilleSuivi.getRange(derniereLigneSuivi + 1, 1, nouvellesLignes.length, 7);
      
      plageEcriture.setValues(nouvellesLignes);
      plageEcriture.setBackgrounds(couleursLignes);
      
      if (interfaceUtilisateur) {
        const template = HtmlService.createTemplateFromFile("Bilan");
        template.nbCrise = statsBilan.crise;
        template.nbAlerte = statsBilan.alerte;
        template.nbVigilance = statsBilan.vigilance;
        template.nbNormal = statsBilan.normal;
        
        const pageHtml = template.evaluate().setWidth(450).setHeight(400).setTitle(t("MODAL_BILAN_TITLE"));
        interfaceUtilisateur.showModalDialog(pageHtml, t("MODAL_BILAN_TITLE"));
      }
    }
    
  } catch (erreur) {
    console.error(`Erreur critique : ${erreur.stack}`);
    if (interfaceUtilisateur) interfaceUtilisateur.alert(t("ERROR_EXECUTION"), erreur.message, interfaceUtilisateur.ButtonSet.OK);
  }
}