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
    
    let message = "✅ Anciens déclencheurs effacés.\n\nCréation des nouvelles planifications :\n\n";
    
    // 2. Création de la planification pour la synchronisation
    if (config.freqSync === "Quotidien") {
      ScriptApp.newTrigger("synchroniserVigilanceEau")
        .timeBased()
        .everyDays(1)
        .atHour(parseInt(config.heureSync))
        .create();
      message += `🔄 Synchronisation : Quotidien à ~${config.heureSync}h00\n`;
    } else if (config.freqSync === "Hebdomadaire") {
      ScriptApp.newTrigger("synchroniserVigilanceEau")
        .timeBased()
        .onWeekDay(ScriptApp.WeekDay.MONDAY)
        .atHour(parseInt(config.heureSync))
        .create();
      message += `🔄 Synchronisation : Hebdomadaire (Lundi) à ~${config.heureSync}h00\n`;
    } else {
      message += `❌ Synchronisation : Désactivée\n`;
    }
    
    message += "\n";
    
    // 3. Création de la planification pour l'envoi d'email
    if (config.freqEmail === "Quotidien") {
      ScriptApp.newTrigger("envoyerRapportCrise")
        .timeBased()
        .everyDays(1)
        .atHour(parseInt(config.heureEmail))
        .create();
      message += `✉️ Rapport Email : Quotidien à ~${config.heureEmail}h00\n`;
    } else if (config.freqEmail === "Hebdomadaire") {
      ScriptApp.newTrigger("envoyerRapportCrise")
        .timeBased()
        .onWeekDay(ScriptApp.WeekDay.MONDAY)
        .atHour(parseInt(config.heureEmail))
        .create();
      message += `✉️ Rapport Email : Hebdomadaire (Lundi) à ~${config.heureEmail}h00\n`;
    } else {
      message += `❌ Rapport Email : Désactivé\n`;
    }
    
    interfaceUtilisateur.alert("Planification réussie 🎉", message, interfaceUtilisateur.ButtonSet.OK);
    
  } catch (erreur) {
    interfaceUtilisateur.alert("Erreur", `Impossible d'appliquer la planification : ${erreur.message}`, interfaceUtilisateur.ButtonSet.OK);
  }
}
