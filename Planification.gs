/**
 * Module de gestion des chronotâches (Time-driven triggers)
 */

function appliquerPlanification() {
  const interfaceUtilisateur = SpreadsheetApp.getUi();
  
  try {
    const classeur = SpreadsheetApp.getActiveSpreadsheet();
    // Utilise la fonction globale issue de VigiEau.gs
    const config = recupererConfigurationUtilisateur(classeur); 
    
    // 1. Nettoyer les anciens déclencheurs pour éviter les doublons
    const triggers = ScriptApp.getProjectTriggers();
    for (const trigger of triggers) {
      const handler = trigger.getHandlerFunction();
      if (handler === "synchroniserVigilanceEau" || handler === "envoyerRapportCrise") {
        ScriptApp.deleteTrigger(trigger);
      }
    }
    
    let message = t("PLANIF_CLEARED");
    
    // 2. Création de la planification pour la synchronisation
    if (config.freqSync === "Quotidien") {
      ScriptApp.newTrigger("synchroniserVigilanceEau")
        .timeBased()
        .everyDays(1)
        .atHour(parseInt(config.heureSync))
        .create();
      message += t("PLANIF_SYNC_DAILY") + config.heureSync + "h00\n";
    } else if (config.freqSync === "Hebdomadaire") {
      ScriptApp.newTrigger("synchroniserVigilanceEau")
        .timeBased()
        .onWeekDay(ScriptApp.WeekDay.MONDAY)
        .atHour(parseInt(config.heureSync))
        .create();
      message += t("PLANIF_SYNC_WEEKLY") + config.heureSync + "h00\n";
    } else {
      message += t("PLANIF_SYNC_OFF");
    }
    
    message += "\n";
    
    // 3. Création de la planification pour l'envoi d'email
    if (config.freqEmail === "Quotidien") {
      ScriptApp.newTrigger("envoyerRapportCrise")
        .timeBased()
        .everyDays(1)
        .atHour(parseInt(config.heureEmail))
        .create();
      message += t("PLANIF_EMAIL_DAILY") + config.heureEmail + "h00\n";
    } else if (config.freqEmail === "Hebdomadaire") {
      ScriptApp.newTrigger("envoyerRapportCrise")
        .timeBased()
        .onWeekDay(ScriptApp.WeekDay.MONDAY)
        .atHour(parseInt(config.heureEmail))
        .create();
      message += t("PLANIF_EMAIL_WEEKLY") + config.heureEmail + "h00\n";
    } else {
      message += t("PLANIF_EMAIL_OFF");
    }
    
    interfaceUtilisateur.alert(t("PLANIF_SUCCESS_TITLE"), message, interfaceUtilisateur.ButtonSet.OK);
    
  } catch (erreur) {
    interfaceUtilisateur.alert(t("ERROR_TITLE"), t("PLANIF_ERROR") + erreur.message, interfaceUtilisateur.ButtonSet.OK);
  }
}
