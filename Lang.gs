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
    BILAN_CLOSE: "Fermer le tableau de bord",
    
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
    BILAN_CLOSE: "Close dashboard",
    
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
