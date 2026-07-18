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
    
    ABOUT_TITLE: "À propos de Vigieau Tracker",
    ABOUT_CONTENT: "Vigieau Tracker automatise le suivi des restrictions d'eau.\n\nDéveloppé par : Fabrice Faucheux\nPlus d'informations sur : https://faucheux.bzh",
    
    // Code.gs
    AUTO_ALREADY_ACTIVE: "L'automatisation magique est déjà active sur ce document.",
    AUTO_SUCCESS: "L'automatisation est activée !\n\nTapez maintenant une adresse dans l'onglet Sites et validez avec Entrée, le GPS se calculera tout seul.",
    AUTO_ERROR: "Impossible de créer le déclencheur. Veuillez vérifier vos permissions.\n\n",
    
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
    PLANIF_ERROR: "Impossible d'appliquer la planification : ",
    
    // VigiEau.gs
    MODAL_BILAN_TITLE: "📍 Bilan de synchronisation",
    NO_VALID_COORDS: "Aucune coordonnée valide.",
    
    // Bilan.html
    BILAN_UPDATE_FINISHED: "Mise à jour terminée ✨",
    BILAN_SYNC_DONE: "La BDD a été synchronisée avec Vigieau",
    BILAN_CRISE: "Crise",
    BILAN_ALERTE: "Alerte",
    BILAN_VIGILANCE: "Vigilance",
    BILAN_NORMAL: "Normal",
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
    
    ABOUT_TITLE: "About Vigieau Tracker",
    ABOUT_CONTENT: "Vigieau Tracker automates the monitoring of water restrictions.\n\nDeveloped by: Fabrice Faucheux\nMore information on: https://faucheux.bzh",
    
    // Code.gs
    AUTO_ALREADY_ACTIVE: "The magic automation is already active on this document.",
    AUTO_SUCCESS: "Automation is activated!\n\nNow type an address in the Sites tab and press Enter, the GPS will be calculated automatically.",
    AUTO_ERROR: "Unable to create the trigger. Please check your permissions.\n\n",
    
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
    PLANIF_ERROR: "Unable to apply schedule: ",
    
    // VigiEau.gs
    MODAL_BILAN_TITLE: "📍 Synchronization summary",
    NO_VALID_COORDS: "No valid coordinates.",
    
    // Bilan.html
    BILAN_UPDATE_FINISHED: "Update finished ✨",
    BILAN_SYNC_DONE: "The DB has been synchronized with Vigieau",
    BILAN_CRISE: "Crisis",
    BILAN_ALERTE: "Alert",
    BILAN_VIGILANCE: "Vigilance",
    BILAN_NORMAL: "Normal",
    BILAN_CLOSE: "Close dashboard",
    
    // Carte.html
    CARTE_SYNTHESE: "📍 Sites summary",
    CARTE_TOUS: "All"
  }
};

/**
 * Fonction de traduction.
 * @param {string} cle - La clé de traduction.
 * @returns {string} Le texte traduit.
 */
function t(cle) {
  let locale = "fr";
  try {
    const userLocale = Session.getActiveUserLocale();
    if (userLocale && userLocale.startsWith("en")) {
      locale = "en";
    }
  } catch (e) {
    // Par défaut 'fr' si Session non disponible
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
