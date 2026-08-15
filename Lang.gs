/**
 * Dictionnaire de traduction centralisé (FR/EN)
 */
const DICTIONNAIRE = {
  fr: {
    MENU_MAIN: "📍 Géolocalisation & eau",
    MENU_CALC_GPS: "1. Calculer les données géographiques",
    MENU_ACTIVER_AUTO: "⚡ Activer l'automatisation de saisie",
    MENU_SYNC: "2. Récupérer l'état Vigieau (Archivage)",
    MENU_RAPPORT: "3. Envoyer le rapport des sites en crise",
    MENU_CARTE: "🗺️ Afficher la carte interactive",
    MENU_PLANIF: "⏳ Appliquer les planifications",
    MENU_SETUP: "🚀 Configurer le classeur",
    MENU_AIDE: "❓ Comment ça marche",
    MENU_ABOUT: "ℹ️ À propos",
    
    // Alertes et Messages généraux
    INFO_TITLE: "Information",
    ERROR_TITLE: "Erreur",
    SUCCESS_TITLE: "Succès 🎉",
    ERROR_EXECUTION: "Erreur d'exécution",
    ERROR_TECHNICAL: "Erreur technique",
    LOCK_BUSY: "Un traitement est déjà en cours sur ce document.\nRéessayez dans quelques instants.",

    ABOUT_TITLE: "À propos de Vigieau Tracker",
    ABOUT_CONTENT: "Vigieau Tracker automatise le suivi des restrictions d'eau.\n\nDéveloppé par : Fabrice Faucheux\nPlus d'informations sur : https://faucheux.bzh",
    
    // Code.gs
    AUTO_ALREADY_ACTIVE: "L'automatisation magique est déjà active sur ce document.",
    AUTO_SUCCESS: "L'automatisation est activée !\n\nTapez maintenant une adresse dans l'onglet Sites et validez avec Entrée, le GPS se calculera tout seul.",
    AUTO_ERROR: "Impossible de créer le déclencheur. Veuillez vérifier vos permissions.\n\n",
    AUTO_TOO_MANY_ROWS: "Trop de lignes collées d'un coup pour le calcul automatique. Utilisez le menu « 1. Calculer les données géographiques ».",
    
    // Cato.gs
    MODAL_MAP_TITLE: "📍 Carte des restrictions d'eau",
    NO_DATA_MAP: "Aucune donnée géolocalisée à afficher sur la carte.",
    ERROR_MAP_OPEN: "Impossible d'ouvrir la carte :\n\n",
    
    // GPS.gs
    CALCULATING: "⏳ Calcul...",
    NOT_FOUND: "Introuvable",
    ERROR_GPS: "Erreur",
    NO_ADDRESS_TO_PROCESS: "Aucune adresse à traiter.",
    UPDATE_FINISHED: "Mise à jour terminée",
    SITES_UPDATED: "site(s) ont été mis à jour de manière différentielle.",
    NO_UPDATE_REQUIRED: "Aucune mise à jour requise",
    ALL_VALID: "Toutes les adresses possèdent déjà des coordonnées valides.",
    
    // Mail.gs
    EMAIL_SUBJECT: "🚨 Rapport Vigieau : Sites en niveau de crise",
    EMAIL_NO_CRISIS: "Aucun site n'est actuellement en état de 'Crise' pour la journée en cours.\nAucun email n'a été envoyé.",
    EMAIL_SUCCESS: "L'email a été envoyé avec succès à ",
    EMAIL_REPORT_SENT: "Rapport envoyé",
    ERROR_EMAIL_SEND: "Impossible d'envoyer l'email :\n\n",
    
    // Planification.gs
    PLANIF_SUCCESS_TITLE: "Planification réussie 🎉",
    PLANIF_CLEARED: "✅ Anciens déclencheurs effacés.\n\nCréation des nouvelles planifications :\n\n",
    PLANIF_SYNC_DAILY: "🔄 Synchronisation : Quotidien à ~",
    PLANIF_SYNC_WEEKLY: "🔄 Synchronisation : Hebdomadaire (Lundi) à ~",
    PLANIF_SYNC_OFF: "❌ Synchronisation : Désactivée\n",
    PLANIF_EMAIL_DAILY: "✉️ Rapport email : Quotidien à ~",
    PLANIF_EMAIL_WEEKLY: "✉️ Rapport email : Hebdomadaire (Lundi) à ~",
    PLANIF_EMAIL_OFF: "❌ Rapport email : Désactivé\n",
    PLANIF_WARNING_SCHEDULE_CONFLICT: "\n⚠️ Attention : L'heure du rapport email ({heureEmail}h00) est antérieure ou égale à l'heure de synchronisation ({heureSync}h00).\nEn raison de la fenêtre de déclenchement de ±15 min des triggers Google, le rapport risque de partir avant la mise à jour. Il est conseillé de décaler l'email d'au moins 1 heure.\n",
    PLANIF_ERROR: "Impossible d'appliquer la planification : ",
    
    // VigiEau.gs
    MODAL_BILAN_TITLE: "📍 Bilan de synchronisation",
    NO_VALID_COORDS: "Aucune coordonnée valide.",

    // Transitions.gs
    TRANSITION_SUBJECT_ESCALADE: "🚨 Vigieau : aggravation sur {n} site(s)",
    TRANSITION_SUBJECT_DETENTE: "✅ Vigieau : allègement sur {n} site(s)",
    TRANSITION_SUBJECT_NEW: "ℹ️ Vigieau : {n} nouveau(x) site(s) sous restriction",
    TRANSITION_TITLE_ESCALADE: "Aggravation des restrictions d'eau",
    TRANSITION_TITLE_DETENTE: "Allègement des restrictions d'eau",
    TRANSITION_INTRO: "Les niveaux de restriction suivants ont changé depuis la dernière synchronisation :",
    TRANSITION_COL_SITE: "Site",
    TRANSITION_COL_AVANT: "Niveau précédent",
    TRANSITION_COL_APRES: "Nouveau niveau",
    TRANSITION_COL_ARRETE: "Arrêté",
    TRANSITION_COL_ARRETE_LIEN: "📄 Consulter",
    TRANSITION_NEW_TITLE: "Sites relevés pour la première fois",
    TRANSITION_FOOTER: "Seuls les changements sont signalés : l'absence d'email signifie que les niveaux sont inchangés. Message généré automatiquement par Vigieau Tracker.",
    
    // Bilan.html
    BILAN_UPDATE_FINISHED: "Mise à jour terminée ✨",
    BILAN_SYNC_DONE: "La BDD a été synchronisée avec Vigieau",
    BILAN_CRISE: "Crise",
    BILAN_ALERTE: "Alerte",
    BILAN_VIGILANCE: "Vigilance",
    BILAN_NORMAL: "Normal",
    BILAN_ERREUR: "site(s) n'ont pas pu être récupérés (voir la colonne État).",
    BILAN_TRANSITIONS: "changement(s) de niveau détecté(s) — une alerte a été envoyée.",
    BILAN_RESTRICTIONS: "usage(s) restreint(s) recensé(s) dans l'onglet Restrictions.",
    BILAN_INCOMPLET: "site(s) au relevé partiel : une ressource n'a pas répondu, le niveau affiché est une borne inférieure.",
    BILAN_CLOSE: "Fermer le tableau de bord",
    

    // Initialisation.gs
    SETUP_TITLE: "Classeur configuré 🎉",
    SETUP_CREATED: "créé",
    SETUP_KEPT: "déjà présent, conservé tel quel",
    SETUP_REMOVED: "feuille vide par défaut, supprimée",
    SETUP_NEXT: "Saisissez vos adresses en colonne B de l'onglet Sites, puis lancez « 1. Calculer les données géographiques ».\n\nLe menu « ❓ Comment ça marche » détaille le fonctionnement complet.",
    SETUP_ERROR: "Impossible de configurer le classeur : ",
    SETUP_NOTE_RESSOURCES: "Facultatif. Ressources sur lesquelles le site prélève, séparées par une virgule : AEP (réseau d'eau potable), SOU (souterraine), SUP (superficielle).\nExemple : AEP, SOU\nVide = valeur par défaut de l'onglet Configuration.",
    SETUP_NOTE_PROFIL: "Facultatif. Profil du site : particulier, entreprise, collectivite ou agriculteur.\nVide = valeur par défaut de l'onglet Configuration.",

    // Aide.html
    AIDE_TITLE: "Comment fonctionne Vigieau Tracker",
    AIDE_INTRO: "L'outil relève chaque jour le niveau de restriction d'eau applicable à vos sites, en conserve l'historique et vous alerte dès qu'il change.",
    AIDE_DEMARRAGE_TITLE: "Démarrer",
    AIDE_ETAPE1: "Configurer le classeur",
    AIDE_ETAPE1_DETAIL: "Crée les onglets Sites, BDD, Restrictions et Configuration. À ne faire qu'une fois.",
    AIDE_ETAPE2: "Saisir les adresses",
    AIDE_ETAPE2_DETAIL: "Une adresse postale par ligne en colonne B de l'onglet Sites. Les colonnes Ressources et Profil sont facultatives.",
    AIDE_ETAPE3: "Calculer les données géographiques",
    AIDE_ETAPE3_DETAIL: "Convertit les adresses en coordonnées GPS. Seules les lignes sans coordonnée valide sont recalculées.",
    AIDE_ETAPE4: "Récupérer l'état Vigieau",
    AIDE_ETAPE4_DETAIL: "Interroge l'API pour chaque site, archive les niveaux et met à jour les restrictions en vigueur.",
    AIDE_ONGLETS_TITLE: "Les onglets",
    AIDE_ONGLET_SITES: "Le seul que vous remplissez : adresse, et si besoin les ressources prélevées (AEP, SOU, SUP) et le profil du site.",
    AIDE_ONGLET_BDD: "Journal historique. Chaque synchronisation y ajoute une ligne par site, sans jamais rien effacer.",
    AIDE_ONGLET_RESTRICTIONS: "Ce qui s'applique aujourd'hui : usages interdits ou limités, avec le lien vers l'arrêté préfectoral. Réécrit à chaque synchronisation.",
    AIDE_ONGLET_CONFIG: "Profil et ressource par défaut, destinataire des emails, fréquences et heures d'exécution.",
    AIDE_ALERTES_TITLE: "Les alertes par email",
    AIDE_ALERTE_TRANSITION: "Changement de niveau",
    AIDE_ALERTE_TRANSITION_DETAIL: "Envoyée dès qu'un site change de niveau, à l'aggravation comme à la levée. Aucun email si rien ne bouge.",
    AIDE_ALERTE_CRISE: "Rapport des sites en crise",
    AIDE_ALERTE_CRISE_DETAIL: "État des lieux des sites au niveau maximal, à la demande ou selon la planification.",
    AIDE_ENCART_FIABILITE: "Une panne de l'API n'est jamais présentée comme un changement de niveau, et un relevé partiel (une ressource qui n'a pas répondu) est exclu des alertes : le niveau affiché est alors une borne inférieure, signalé comme tel dans le bilan.",
    AIDE_AUTO_TITLE: "Automatiser",
    AIDE_AUTO_SAISIE: "Automatisation de saisie",
    AIDE_AUTO_SAISIE_DETAIL: "Une fois activée, taper une adresse suffit : les coordonnées GPS se calculent seules.",
    AIDE_AUTO_PLANIF: "Planifications",
    AIDE_AUTO_PLANIF_DETAIL: "Réglez les fréquences dans l'onglet Configuration puis appliquez-les. Prévoyez l'email au moins une heure après la synchronisation.",
    AIDE_CLOSE: "Fermer",

    // Carte.html
    CARTE_SYNTHESE: "📍 Synthèse des sites",
    CARTE_TOUS: "Tous"
  },
  en: {
    MENU_MAIN: "📍 Geolocation & water",
    MENU_CALC_GPS: "1. Calculate geographical data",
    MENU_ACTIVER_AUTO: "⚡ Enable input automation",
    MENU_SYNC: "2. Fetch Vigieau status (Archiving)",
    MENU_RAPPORT: "3. Send crisis sites report",
    MENU_CARTE: "🗺️ Display interactive map",
    MENU_PLANIF: "⏳ Apply schedules",
    MENU_SETUP: "🚀 Set up the spreadsheet",
    MENU_AIDE: "❓ How it works",
    MENU_ABOUT: "ℹ️ About",
    
    // Alertes et Messages généraux
    INFO_TITLE: "Information",
    ERROR_TITLE: "Error",
    SUCCESS_TITLE: "Success 🎉",
    ERROR_EXECUTION: "Execution error",
    ERROR_TECHNICAL: "Technical error",
    LOCK_BUSY: "Another task is already running on this document.\nPlease try again in a moment.",

    ABOUT_TITLE: "About Vigieau Tracker",
    ABOUT_CONTENT: "Vigieau Tracker automates the monitoring of water restrictions.\n\nDeveloped by: Fabrice Faucheux\nMore information on: https://faucheux.bzh",
    
    // Code.gs
    AUTO_ALREADY_ACTIVE: "The magic automation is already active on this document.",
    AUTO_SUCCESS: "Automation is activated!\n\nNow type an address in the Sites tab and press Enter, the GPS will be calculated automatically.",
    AUTO_ERROR: "Unable to create the trigger. Please check your permissions.\n\n",
    AUTO_TOO_MANY_ROWS: "Too many rows pasted at once for automatic calculation. Please use the menu \"1. Calculate geographical data\".",
    
    // Cato.gs
    MODAL_MAP_TITLE: "📍 Water restrictions map",
    NO_DATA_MAP: "No geolocated data to display on the map.",
    ERROR_MAP_OPEN: "Unable to open the map:\n\n",
    
    // GPS.gs
    CALCULATING: "⏳ Calculating...",
    NOT_FOUND: "Not found",
    ERROR_GPS: "Error",
    NO_ADDRESS_TO_PROCESS: "No address to process.",
    UPDATE_FINISHED: "Update finished",
    SITES_UPDATED: "site(s) have been differentially updated.",
    NO_UPDATE_REQUIRED: "No update required",
    ALL_VALID: "All addresses already have valid coordinates.",
    
    // Mail.gs
    EMAIL_SUBJECT: "🚨 Vigieau Report: Sites at crisis level",
    EMAIL_NO_CRISIS: "No site is currently at 'Crisis' state for the current day.\nNo email was sent.",
    EMAIL_SUCCESS: "The email has been successfully sent to ",
    EMAIL_REPORT_SENT: "Report sent",
    ERROR_EMAIL_SEND: "Unable to send the email:\n\n",
    
    // Planification.gs
    PLANIF_SUCCESS_TITLE: "Schedule successful 🎉",
    PLANIF_CLEARED: "✅ Old triggers cleared.\n\nCreating new schedules:\n\n",
    PLANIF_SYNC_DAILY: "🔄 Synchronization: Daily at ~",
    PLANIF_SYNC_WEEKLY: "🔄 Synchronization: Weekly (Monday) at ~",
    PLANIF_SYNC_OFF: "❌ Synchronization: Disabled\n",
    PLANIF_EMAIL_DAILY: "✉️ Email report: Daily at ~",
    PLANIF_EMAIL_WEEKLY: "✉️ Email report: Weekly (Monday) at ~",
    PLANIF_EMAIL_OFF: "❌ Email report: Disabled\n",
    PLANIF_WARNING_SCHEDULE_CONFLICT: "\n⚠️ Warning: Email report time ({heureEmail}:00) is earlier than or equal to synchronization time ({heureSync}:00).\nDue to the ±15 min trigger execution window in Google Apps Script, the report may be sent before data update. It is recommended to schedule the email at least 1 hour later.\n",
    PLANIF_ERROR: "Unable to apply schedule: ",
    
    // VigiEau.gs
    MODAL_BILAN_TITLE: "📍 Synchronization summary",
    NO_VALID_COORDS: "No valid coordinates.",

    // Transitions.gs
    TRANSITION_SUBJECT_ESCALADE: "🚨 Vigieau: restrictions tightened on {n} site(s)",
    TRANSITION_SUBJECT_DETENTE: "✅ Vigieau: restrictions eased on {n} site(s)",
    TRANSITION_SUBJECT_NEW: "ℹ️ Vigieau: {n} new site(s) under restriction",
    TRANSITION_TITLE_ESCALADE: "Water restrictions tightened",
    TRANSITION_TITLE_DETENTE: "Water restrictions eased",
    TRANSITION_INTRO: "The following restriction levels have changed since the last synchronization:",
    TRANSITION_COL_SITE: "Site",
    TRANSITION_COL_AVANT: "Previous level",
    TRANSITION_COL_APRES: "New level",
    TRANSITION_COL_ARRETE: "Order",
    TRANSITION_COL_ARRETE_LIEN: "📄 View",
    TRANSITION_NEW_TITLE: "Sites recorded for the first time",
    TRANSITION_FOOTER: "Only changes are reported: no email means levels are unchanged. Message generated automatically by Vigieau Tracker.",
    
    // Bilan.html
    BILAN_UPDATE_FINISHED: "Update finished ✨",
    BILAN_SYNC_DONE: "The DB has been synchronized with Vigieau",
    BILAN_CRISE: "Crisis",
    BILAN_ALERTE: "Alert",
    BILAN_VIGILANCE: "Vigilance",
    BILAN_NORMAL: "Normal",
    BILAN_ERREUR: "site(s) could not be retrieved (see the Status column).",
    BILAN_TRANSITIONS: "level change(s) detected — an alert has been sent.",
    BILAN_RESTRICTIONS: "restricted use(s) listed in the Restrictions tab.",
    BILAN_INCOMPLET: "site(s) partially measured: a resource did not respond, the displayed level is a lower bound.",
    BILAN_CLOSE: "Close dashboard",
    

    // Initialisation.gs
    SETUP_TITLE: "Spreadsheet ready 🎉",
    SETUP_CREATED: "created",
    SETUP_KEPT: "already present, left untouched",
    SETUP_REMOVED: "empty default sheet, removed",
    SETUP_NEXT: "Enter your addresses in column B of the Sites tab, then run \"1. Calculate geographical data\".\n\nThe \"❓ How it works\" menu explains everything in detail.",
    SETUP_ERROR: "Unable to set up the spreadsheet: ",
    SETUP_NOTE_RESSOURCES: "Optional. Resources the site draws from, comma-separated: AEP (mains water), SOU (groundwater), SUP (surface water).\nExample: AEP, SOU\nEmpty = default value from the Configuration tab.",
    SETUP_NOTE_PROFIL: "Optional. Site profile: particulier, entreprise, collectivite or agriculteur.\nEmpty = default value from the Configuration tab.",

    // Aide.html
    AIDE_TITLE: "How Vigieau Tracker works",
    AIDE_INTRO: "The tool checks the water restriction level applying to your sites every day, keeps a history of it and alerts you as soon as it changes.",
    AIDE_DEMARRAGE_TITLE: "Getting started",
    AIDE_ETAPE1: "Set up the spreadsheet",
    AIDE_ETAPE1_DETAIL: "Creates the Sites, BDD, Restrictions and Configuration tabs. Only needed once.",
    AIDE_ETAPE2: "Enter the addresses",
    AIDE_ETAPE2_DETAIL: "One postal address per row in column B of the Sites tab. The Resources and Profile columns are optional.",
    AIDE_ETAPE3: "Calculate geographical data",
    AIDE_ETAPE3_DETAIL: "Converts addresses into GPS coordinates. Only rows without valid coordinates are recalculated.",
    AIDE_ETAPE4: "Fetch the Vigieau status",
    AIDE_ETAPE4_DETAIL: "Queries the API for each site, archives the levels and refreshes the restrictions in force.",
    AIDE_ONGLETS_TITLE: "The tabs",
    AIDE_ONGLET_SITES: "The only one you fill in: address, and if needed the resources drawn from (AEP, SOU, SUP) and the site profile.",
    AIDE_ONGLET_BDD: "History log. Each synchronization appends one row per site and never erases anything.",
    AIDE_ONGLET_RESTRICTIONS: "What applies today: banned or limited uses, with a link to the prefectoral order. Rewritten at each synchronization.",
    AIDE_ONGLET_CONFIG: "Default profile and resource, email recipient, frequencies and execution times.",
    AIDE_ALERTES_TITLE: "Email alerts",
    AIDE_ALERTE_TRANSITION: "Level change",
    AIDE_ALERTE_TRANSITION_DETAIL: "Sent as soon as a site changes level, both when restrictions tighten and when they are lifted. No email if nothing moves.",
    AIDE_ALERTE_CRISE: "Crisis sites report",
    AIDE_ALERTE_CRISE_DETAIL: "Overview of sites at the maximum level, on demand or on a schedule.",
    AIDE_ENCART_FIABILITE: "An API outage is never presented as a level change, and a partial reading (a resource that did not respond) is excluded from alerts: the displayed level is then a lower bound, flagged as such in the summary.",
    AIDE_AUTO_TITLE: "Automating",
    AIDE_AUTO_SAISIE: "Input automation",
    AIDE_AUTO_SAISIE_DETAIL: "Once enabled, typing an address is enough: GPS coordinates are calculated on their own.",
    AIDE_AUTO_PLANIF: "Schedules",
    AIDE_AUTO_PLANIF_DETAIL: "Set the frequencies in the Configuration tab then apply them. Schedule the email at least one hour after the synchronization.",
    AIDE_CLOSE: "Close",

    // Carte.html
    CARTE_SYNTHESE: "📍 Sites summary",
    CARTE_TOUS: "All"
  }
};

/**
 * Fonction de traduction centralisée.
 * Détecte la langue en croisant la locale de l'utilisateur et celle du classeur,
 * avec priorité absolue au français par défaut.
 * @param {string} cle - La clé de traduction.
 * @returns {string} Le texte traduit.
 */
function t(cle) {
  let locale = "fr";

  try {
    let userLocale = "";
    try {
      userLocale = (Session.getActiveUserLocale() || "").toLowerCase();
    } catch (e) {}

    let sheetLocale = "";
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      if (ss) sheetLocale = (ss.getSpreadsheetLocale() || "").toLowerCase();
    } catch (e) {}

    // Si l'utilisateur ou le classeur est explicitement en français, on force le français
    if (userLocale.startsWith("fr") || sheetLocale.startsWith("fr")) {
      locale = "fr";
    } else if (userLocale.startsWith("en") && !sheetLocale.startsWith("fr")) {
      // Uniquement en anglais si l'utilisateur est anglophone et que le classeur n'est pas français
      locale = "en";
    }
  } catch (e) {
    locale = "fr";
  }
  
  if (DICTIONNAIRE[locale] && DICTIONNAIRE[locale][cle]) {
    return DICTIONNAIRE[locale][cle];
  }
  // Fallback sur le français
  if (DICTIONNAIRE["fr"] && DICTIONNAIRE["fr"][cle]) {
    return DICTIONNAIRE["fr"][cle];
  }
  return cle;
}
