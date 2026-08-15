/**
 * Module principal d'interrogation de l'API Vigieau et de synchronisation des restrictions d'eau.
 */

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
  // Un corps de réponse inattendu ne doit JAMAIS être interprété comme une absence
  // de restriction : on renvoie explicitement une erreur, qui ne sera pas mise en cache.
  if (!Array.isArray(zones)) {
    console.warn("Réponse Vigieau inattendue (tableau attendu) : " + JSON.stringify(zones));
    return "Réponse API invalide";
  }

  // Un tableau vide signifie réellement "aucune zone de restriction sur ce point".
  if (zones.length === 0) {
    return NIVEAUX_GRAVITE["normal"].label;
  }

  let poidsMax = -1;
  let labelMax = "Inconnu";

  zones.forEach(zone => {
    const gravite = zone && zone.niveauGravite;
    if (gravite && NIVEAUX_GRAVITE[gravite]) {
      if (NIVEAUX_GRAVITE[gravite].poids > poidsMax) {
        poidsMax = NIVEAUX_GRAVITE[gravite].poids;
        labelMax = NIVEAUX_GRAVITE[gravite].label;
      }
    }
  });

  // Aucun niveau reconnu alors que des zones existent : l'API a probablement évolué.
  if (poidsMax === -1) {
    console.warn("Aucun niveau de gravité reconnu dans la réponse Vigieau : " + JSON.stringify(zones));
  }

  return labelMax;
};

/**
 * Retrouve le poids de gravité associé à un libellé d'état.
 * @param {*} label - Libellé tel qu'écrit dans la BDD (ex : "Alerte renforcée").
 * @returns {number} Le poids (0 à 4), ou -1 si le libellé n'est pas un niveau réel.
 */
const poidsDeLEtat = (label) => {
  const cle = Object.keys(NIVEAUX_GRAVITE).find(k => NIVEAUX_GRAVITE[k].label === label);
  return cle ? NIVEAUX_GRAVITE[cle].poids : -1;
};

/**
 * Vrai uniquement pour les états issus d'une réponse exploitable de l'API.
 * Les états d'erreur ne doivent être ni mis en cache, ni comptabilisés comme un niveau,
 * ni comparés à un état antérieur pour en déduire une transition.
 */
const estEtatFiable = (etat) => poidsDeLEtat(etat) >= 0;

/**
 * Exécute un lot de requêtes HTTP avec retries et backoff exponentiel.
 * Relance sur 429 (rate-limit), 408 (timeout) et 5xx (serveur).
 * @param {Array<Object>} requetes - Tableau de requêtes pour UrlFetchApp.fetchAll.
 * @param {number} maxRetries - Nombre maximum de tentatives.
 * @returns {Array<HTTPResponse|null>} Réponses associées à chaque index d'origine.
 */
const executerRequetesAvecRetry = (requetes, maxRetries) => {
  let tentatives = 0;
  let requetesEnCours = requetes.map((req, index) => ({ requeteOriginale: req, indexOriginal: index }));
  // fill(null) est indispensable : un tableau creux ferait sauter les indices manquants
  // à forEach/map côté appelant, faisant disparaître des sites silencieusement.
  const reponsesFinales = new Array(requetes.length).fill(null);

  while (requetesEnCours.length > 0 && tentatives <= maxRetries) {
    const requetesAExecuter = requetesEnCours.map(r => r.requeteOriginale);
    let reponsesPartielles = [];
    
    try {
      reponsesPartielles = UrlFetchApp.fetchAll(requetesAExecuter);
    } catch (e) {
      console.error(`Erreur réseau fetchAll (tentative ${tentatives + 1}/${maxRetries + 1}) : ${e.message}`);
      break; 
    }
    
    const requetesEchouees = [];
    
    reponsesPartielles.forEach((reponse, i) => {
      const code = reponse ? reponse.getResponseCode() : 500;
      const meta = requetesEnCours[i];
      
      // 429 (Too Many Requests), 408 (Request Timeout) et 5xx (Serveur) doivent être relancées avec backoff
      const estErreurTemporaire = code === 429 || code === 408 || code >= 500;

      if (!estErreurTemporaire && reponse !== null) {
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
       Utilities.sleep(CONFIG_APP.DELAI_RETRY_MS * Math.pow(2, tentatives - 1)); 
    }
  }
  
  return reponsesFinales;
};

const comptabiliserStatistiques = (etatVigilance, statsBilan) => {
  if (etatVigilance === "Crise") statsBilan.crise++;
  else if (etatVigilance === "Alerte renforcée" || etatVigilance === "Alerte") statsBilan.alerte++;
  else if (etatVigilance === "Vigilance") statsBilan.vigilance++;
  else if (etatVigilance === "Pas de restriction") statsBilan.normal++;
  else statsBilan.erreur++; // Inconnu, erreur d'API, réponse invalide : jamais silencieux
};

/**
 * Initialise l'onglet BDD avec ses en-têtes et son formatage si nécessaire.
 * @param {SpreadsheetApp.Spreadsheet} classeur - Le classeur actif.
 * @returns {SpreadsheetApp.Sheet} La feuille BDD prête à l'emploi.
 */
const initialiserFeuilleBdd = (classeur) => {
  let feuilleBdd = classeur.getSheetByName(CONFIG_APP.ONGLETS.BDD);
  
  if (!feuilleBdd) {
    feuilleBdd = classeur.insertSheet(CONFIG_APP.ONGLETS.BDD);
  }

  if (feuilleBdd.getLastRow() === 0) {
    const enTetes = [["Date", "Nom du site", "État de vigilance", "Semaine", "Jour", "Mois", "Carte"]];
    const plageEnTetes = feuilleBdd.getRange(1, 1, 1, 7);
    plageEnTetes.setValues(enTetes)
      .setFontWeight("bold")
      .setFontColor("#ffffff")
      .setBackground("#1a73e8")
      .setHorizontalAlignment("center");
    
    feuilleBdd.setFrozenRows(1);
    feuilleBdd.setColumnWidth(1, 160); // Date
    feuilleBdd.setColumnWidth(2, 240); // Site
    feuilleBdd.setColumnWidth(3, 160); // État
    feuilleBdd.setColumnWidth(4, 90);  // Semaine
    feuilleBdd.setColumnWidth(5, 70);  // Jour
    feuilleBdd.setColumnWidth(6, 100); // Mois
    feuilleBdd.setColumnWidth(7, 140); // Carte
  }

  return feuilleBdd;
};

/**
 * Ajoute un paramètre à l'onglet Configuration s'il n'y figure pas encore.
 * Permet d'introduire une option sans que les classeurs existants restent bloqués
 * sur la valeur par défaut, sans possibilité de la changer depuis l'interface.
 * @param {SpreadsheetApp.Sheet} feuilleConfig - L'onglet de configuration.
 * @param {string} libelle - Nom du paramètre en colonne A.
 * @param {string} valeurDefaut - Valeur inscrite en colonne B.
 * @param {string} description - Aide affichée en colonne C.
 * @param {Array<string>} [valeursListe] - Liste déroulante éventuelle.
 */
const assurerParametreConfig = (feuilleConfig, libelle, valeurDefaut, description, valeursListe) => {
  const colParametre = CONFIG_APP.COLONNES_CONFIG.PARAMETRE;
  const colValeur = CONFIG_APP.COLONNES_CONFIG.VALEUR;
  const derniereLigne = feuilleConfig.getLastRow();
  const recherche = libelle.trim().toLowerCase();

  if (derniereLigne >= CONFIG_APP.LIGNE_DEPART_DONNEES) {
    const libelles = feuilleConfig
      .getRange(CONFIG_APP.LIGNE_DEPART_DONNEES, colParametre, derniereLigne - CONFIG_APP.LIGNE_DEPART_DONNEES + 1, 1)
      .getValues();
    if (libelles.some(([valeur]) => valeur && valeur.toString().trim().toLowerCase() === recherche)) return;
  }

  const ligneCible = Math.max(derniereLigne, 1) + 1;
  feuilleConfig.getRange(ligneCible, 1, 1, 3).setValues([[libelle, valeurDefaut, description]]);

  if (valeursListe) {
    feuilleConfig.getRange(ligneCible, colValeur).setDataValidation(
      SpreadsheetApp.newDataValidation().requireValueInList(valeursListe, true).build()
    );
  }

  console.warn(`Configuration : paramètre "${libelle}" ajouté avec la valeur "${valeurDefaut}".`);
};

/**
 * Gère la configuration utilisateur directement depuis le tableur Google Sheets
 * @param {SpreadsheetApp.Spreadsheet} classeur - Le classeur actif.
 * @returns {Object} La configuration active.
 */
const recupererConfigurationUtilisateur = (classeur) => {
  let feuilleConfig = classeur.getSheetByName(CONFIG_APP.ONGLETS.CONFIG);
  
  // Si l'onglet de configuration n'existe pas, on le crée avec les valeurs par défaut
  if (!feuilleConfig) {
    feuilleConfig = classeur.insertSheet(CONFIG_APP.ONGLETS.CONFIG);
    
    const enTetes = [["Paramètre", "Valeur", "Description"]];
    const donnees = [
      ["Profil", "entreprise", "Options : particulier, entreprise, collectivite, agriculteur"],
      ["Type de zone", "AEP", "Options : AEP (Eau potable), SOU (Souterraine), SUP (Superficielle)"],
      ["Email du destinataire", "", "Laissez vide pour envoyer à l'utilisateur courant"],
      ["Fréquence Synchronisation", "Désactivé", "Options : Désactivé, Quotidien, Hebdomadaire"],
      ["Heure Synchronisation", "08", "Heure de 00 à 23"],
      ["Fréquence Email", "Désactivé", "Options : Désactivé, Quotidien, Hebdomadaire"],
      ["Heure Email", "09", "Heure de 00 à 23"],
      ["Alerte sur changement", "Activé", "Options : Activé, Désactivé — email dès qu'un site change de niveau"]
    ];

    const plageEnTetes = feuilleConfig.getRange("A1:C1");
    plageEnTetes.setValues(enTetes).setFontWeight("bold").setBackground("#f3f3f3");

    feuilleConfig.getRange("A2:C9").setValues(donnees);
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

    const regleActivation = SpreadsheetApp.newDataValidation().requireValueInList(["Activé", "Désactivé"], true).build();
    feuilleConfig.getRange("B9").setDataValidation(regleActivation);
  }

  // Les classeurs créés avant l'ajout d'un paramètre n'ont pas la ligne correspondante :
  // sans cette migration, l'option resterait invisible et non modifiable pour eux.
  assurerParametreConfig(
    feuilleConfig,
    "Alerte sur changement",
    "Activé",
    "Options : Activé, Désactivé — email dès qu'un site change de niveau",
    ["Activé", "Désactivé"]
  );

  const colParam = CONFIG_APP.COLONNES_CONFIG.PARAMETRE;
  const colVal = CONFIG_APP.COLONNES_CONFIG.VALEUR;
  const maxLigne = Math.max(feuilleConfig.getLastRow() - 1, 1);
  const donneesLues = feuilleConfig.getRange(2, 1, maxLigne, Math.max(colParam, colVal)).getValues();
  
  const config = { profil: "entreprise", zoneType: "AEP", emailDestinataire: "", freqSync: "Désactivé", heureSync: "08", freqEmail: "Désactivé", heureEmail: "09", alerteTransition: "Activé" };

  // Les libellés sont comparés sans tenir compte de la casse ni des espaces superflus
  const valeursLues = {};
  for (const ligne of donneesLues) {
    const libelleBrut = ligne[colParam - 1];
    if (!libelleBrut) continue;
    const libelle = libelleBrut.toString().trim().toLowerCase();
    const valBrute = ligne[colVal - 1];
    const valeur = valBrute === "" || valBrute === null || valBrute === undefined ? "" : valBrute.toString().trim();
    if (valeur !== "") valeursLues[libelle] = valeur;
  }

  // Une valeur hors liste retombe sur le défaut avec un avertissement
  const validerListe = (libelle, cle, valeursAutorisees) => {
    const valeur = valeursLues[libelle];
    if (valeur === undefined) return;
    if (valeursAutorisees.indexOf(valeur) === -1) {
      console.warn(`Configuration : "${valeur}" est invalide pour "${libelle}". Valeur par défaut "${config[cle]}" utilisée.`);
      return;
    }
    config[cle] = valeur;
  };

  const validerHeure = (libelle, cle) => {
    const valeur = valeursLues[libelle];
    if (valeur === undefined) return;
    const heure = parseInt(valeur, 10);
    if (isNaN(heure) || heure < 0 || heure > 23) {
      console.warn(`Configuration : "${valeur}" est une heure invalide pour "${libelle}". Valeur par défaut "${config[cle]}" utilisée.`);
      return;
    }
    config[cle] = heure.toString().padStart(2, "0");
  };

  const frequences = ["Désactivé", "Quotidien", "Hebdomadaire"];

  validerListe("profil", "profil", ["particulier", "entreprise", "collectivite", "agriculteur"]);
  validerListe("type de zone", "zoneType", ["AEP", "SOU", "SUP"]);
  validerListe("fréquence synchronisation", "freqSync", frequences);
  validerListe("fréquence email", "freqEmail", frequences);
  validerListe("alerte sur changement", "alerteTransition", ["Activé", "Désactivé"]);
  validerHeure("heure synchronisation", "heureSync");
  validerHeure("heure email", "heureEmail");

  const email = valeursLues["email du destinataire"];
  if (email !== undefined) {
    if (/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) {
      config.emailDestinataire = email;
    } else {
      console.warn(`Configuration : "${email}" n'est pas une adresse email valide. L'utilisateur courant sera utilisé.`);
    }
  }

  return config;
};

/**
 * Point d'entrée principal : synchronise les restrictions d'eau pour tous les sites.
 */
function synchroniserVigilanceEau() {
  let interfaceUtilisateur = null;
  try {
    interfaceUtilisateur = SpreadsheetApp.getUi();
  } catch (e) {
    // Échec silencieux si exécuté via trigger serveur
  }

  // Sans verrou, un lancement manuel qui chevauche le déclencheur horaire
  // écrit deux fois le même lot de lignes dans la BDD.
  const verrou = LockService.getScriptLock();
  if (!verrou.tryLock(CONFIG_APP.ATTENTE_VERROU_MS)) {
    console.warn("Synchronisation déjà en cours : exécution ignorée.");
    if (interfaceUtilisateur) interfaceUtilisateur.alert(t("INFO_TITLE"), t("LOCK_BUSY"), interfaceUtilisateur.ButtonSet.OK);
    return;
  }

  try {
    const classeur = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Contrôle préalable de l'onglet source Sites
    const feuilleSites = classeur.getSheetByName(CONFIG_APP.ONGLETS.SITES);
    if (!feuilleSites) throw new Error(`L'onglet source "${CONFIG_APP.ONGLETS.SITES}" est introuvable.`);
    
    const colNomSite = CONFIG_APP.COLONNES_SITES.ADRESSE;
    const colGps = CONFIG_APP.COLONNES_SITES.GPS;
    const ligneDepartSites = CONFIG_APP.LIGNE_DEPART_DONNEES;

    const derniereLigneSites = feuilleSites.getLastRow();
    if (derniereLigneSites < ligneDepartSites) {
      if (interfaceUtilisateur) interfaceUtilisateur.alert(t("INFO_TITLE"), t("NO_ADDRESS_TO_PROCESS"), interfaceUtilisateur.ButtonSet.OK);
      return;
    }
    
    const maxColonne = Math.max(colNomSite, colGps);
    const donneesSites = feuilleSites.getRange(ligneDepartSites, 1, derniereLigneSites - ligneDepartSites + 1, maxColonne).getValues();
    
    // 2. Récupération des paramètres dynamiques depuis l'onglet Configuration
    const parametresVigieau = recupererConfigurationUtilisateur(classeur);
    
    const dateDuJour = new Date();
    const semaineISO = obtenirSemaineISO(dateDuJour);
    const jour = dateDuJour.getDate();
    const mois = obtenirNomMois(dateDuJour);
    const dateFormatee = Utilities.formatDate(dateDuJour, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
    
    const cache = CacheService.getScriptCache();
    const sitesExtraits = [];
    
    for (const ligne of donneesSites) {
      const nomSite = ligne[colNomSite - 1];
      const gps = ligne[colGps - 1];
      const coords = parserCoordonnees(gps);
      
      if (coords) {
        // Clé de cache contextualisée par profil et type de zone
        const cleCache = `${CONFIG_APP.PREFIXE_CACHE}${coords.lat}_${coords.lon}_${parametresVigieau.profil}_${parametresVigieau.zoneType}`;
        sitesExtraits.push({ nomSite: nomSite || "Site Inconnu", lat: coords.lat, lon: coords.lon, cleCache });
      }
    }
    
    if (sitesExtraits.length === 0) {
      if (interfaceUtilisateur) interfaceUtilisateur.alert(t("INFO_TITLE"), t("NO_VALID_COORDS"), interfaceUtilisateur.ButtonSet.OK);
      return;
    }
    
    // 3. Initialisation de la feuille BDD uniquement si des sites valides sont prêts à être synchronisés
    const feuilleSuivi = initialiserFeuilleBdd(classeur);

    // L'état antérieur doit être relevé AVANT l'ajout des lignes du jour, sans quoi
    // la comparaison porterait sur la mesure que l'on vient d'écrire.
    const etatsPrecedents = construireEtatsPrecedents(feuilleSuivi);

    const clesCache = sitesExtraits.map(s => s.cleCache);
    const dictionnaireCache = cache.getAll(clesCache);
    
    const sitesPourAPI = [];
    const requetesApi = [];

    // L'état est mémorisé à l'index du site pour que la BDD conserve strictement l'ordre de
    // l'onglet Sites, que la valeur vienne du cache ou de l'API.
    const etatsParSite = new Array(sitesExtraits.length).fill(null);
    // Usages restreints et arrêté associés, mêmes index : alimentent l'onglet Restrictions.
    const donneesParSite = new Array(sitesExtraits.length).fill(null);

    sitesExtraits.forEach((site, index) => {
      const enCache = lireCacheZones(dictionnaireCache[site.cleCache]);
      if (enCache) {
        etatsParSite[index] = enCache.etat;
        donneesParSite[index] = enCache;
        return;
      }
      sitesPourAPI.push({ site, index });
      const parametres = `lon=${site.lon}&lat=${site.lat}&profil=${encodeURIComponent(parametresVigieau.profil)}&zoneType=${encodeURIComponent(parametresVigieau.zoneType)}`;
      requetesApi.push({
        url: `${CONFIG_APP.API.VIGIEAU}?${parametres}`,
        muteHttpExceptions: true
      });
    });

    if (requetesApi.length > 0) {
      const reponses = executerRequetesAvecRetry(requetesApi, CONFIG_APP.MAX_RETRIES);
      const cacheASauvegarder = {};

      sitesPourAPI.forEach((entree, rang) => {
        const reponse = reponses[rang];
        let etatVigilance = "Erreur d'API";
        let donneesZones = null;

        if (reponse) {
          const code = reponse.getResponseCode();
          if (code === 200) {
            try {
              donneesZones = extraireDonneesZones(JSON.parse(reponse.getContentText()), parametresVigieau.profil);
              etatVigilance = donneesZones.etat;
            } catch (e) {
              etatVigilance = "Réponse API invalide";
              donneesZones = null;
            }
          } else {
            console.error(`Vigieau HTTP ${code} pour "${entree.site.nomSite}" : ${reponse.getContentText().substring(0, 200)}`);
          }
        } else {
          console.error(`Aucune réponse réseau Vigieau pour "${entree.site.nomSite}".`);
        }

        // Seul un état mesuré et fiable est mis en cache
        if (estEtatFiable(etatVigilance)) {
          const valeur = ecrireCacheZones(donneesZones || { etat: etatVigilance, zones: [] });
          if (valeur) cacheASauvegarder[entree.site.cleCache] = valeur;
        }

        etatsParSite[entree.index] = etatVigilance;
        donneesParSite[entree.index] = donneesZones;
      });

      if (Object.keys(cacheASauvegarder).length > 0) {
        cache.putAll(cacheASauvegarder, CONFIG_APP.CACHE_DUREE_SECONDES);
      }
    }

    const nouvellesLignes = [];
    const couleursLignes = [];
    const liensMaps = [];
    const statsBilan = { crise: 0, alerte: 0, vigilance: 0, normal: 0, erreur: 0 };

    sitesExtraits.forEach((site, index) => {
      const etatVigilance = etatsParSite[index] || "Erreur d'API";
      comptabiliserStatistiques(etatVigilance, statsBilan);

      nouvellesLignes.push([dateFormatee, site.nomSite, etatVigilance, semaineISO, jour, mois, CONFIG_APP.LIBELLE_LIEN_MAPS]);
      liensMaps.push(`https://www.google.com/maps/search/?api=1&query=${site.lat},${site.lon}`);

      const couleur = CONFIG_APP.COULEURS_FOND[etatVigilance] || "#ffffff";
      couleursLignes.push(new Array(7).fill(couleur));
    });

    if (nouvellesLignes.length > 0) {
      const derniereLigneSuivi = Math.max(feuilleSuivi.getLastRow(), 1);
      const plageEcriture = feuilleSuivi.getRange(derniereLigneSuivi + 1, 1, nouvellesLignes.length, 7);

      plageEcriture.setValues(nouvellesLignes);
      plageEcriture.setBackgrounds(couleursLignes);

      // Lien inséré en texte enrichi pour éviter les conflits de séparateurs régionaux (; vs ,)
      const valeursEnrichies = liensMaps.map(url => [
        SpreadsheetApp.newRichTextValue()
          .setText(CONFIG_APP.LIBELLE_LIEN_MAPS)
          .setLinkUrl(url)
          .build()
      ]);
      feuilleSuivi.getRange(derniereLigneSuivi + 1, 7, valeursEnrichies.length, 1).setRichTextValues(valeursEnrichies);

      // 4. Alerte sur changement de niveau. Postérieure à l'écriture de la BDD, et
      // isolée dans son propre try : un échec d'envoi ne doit jamais faire perdre
      // les relevés qui viennent d'être archivés.
      // 4. Instantané des usages restreints. Isolé lui aussi : l'archivage des niveaux
      // ne doit pas dépendre de la bonne écriture de cet onglet.
      let nbRestrictions = 0;
      try {
        const lignesRestrictions = construireLignesRestrictions(sitesExtraits, donneesParSite, dateFormatee);
        nbRestrictions = ecrireRestrictions(classeur, lignesRestrictions);
      } catch (erreurRestrictions) {
        console.error(`Onglet Restrictions non mis à jour : ${erreurRestrictions.stack}`);
      }

      let nbTransitions = 0;
      if (parametresVigieau.alerteTransition === "Activé") {
        try {
          const transitions = detecterTransitions(etatsPrecedents, sitesExtraits, etatsParSite, donneesParSite);
          nbTransitions = transitions.changements.length + transitions.nouveaux.length;

          if (nbTransitions > 0) {
            const destinataire = parametresVigieau.emailDestinataire || Session.getActiveUser().getEmail();
            envoyerAlerteTransitions(transitions, destinataire);
          }
        } catch (erreurAlerte) {
          console.error(`Alerte de transition non envoyée : ${erreurAlerte.stack}`);
        }
      }

      if (interfaceUtilisateur) {
        const template = HtmlService.createTemplateFromFile("Bilan");
        template.nbCrise = statsBilan.crise;
        template.nbAlerte = statsBilan.alerte;
        template.nbVigilance = statsBilan.vigilance;
        template.nbNormal = statsBilan.normal;
        template.nbErreur = statsBilan.erreur;
        template.nbTransitions = nbTransitions;
        template.nbRestrictions = nbRestrictions;

        const pageHtml = template.evaluate()
          .setWidth(CONFIG_APP.FENETRE_BILAN.LARGEUR)
          .setHeight(CONFIG_APP.FENETRE_BILAN.HAUTEUR)
          .setTitle(t("MODAL_BILAN_TITLE"));
        interfaceUtilisateur.showModalDialog(pageHtml, t("MODAL_BILAN_TITLE"));
      }
    }

  } catch (erreur) {
    console.error(`Erreur critique synchroniserVigilanceEau : ${erreur.stack}`);
    if (interfaceUtilisateur) interfaceUtilisateur.alert(t("ERROR_EXECUTION"), erreur.message, interfaceUtilisateur.ButtonSet.OK);
  } finally {
    verrou.releaseLock();
  }
}