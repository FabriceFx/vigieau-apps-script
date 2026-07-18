function onOpen() {
  const interfaceUtilisateur = SpreadsheetApp.getUi();
  
  try {
    interfaceUtilisateur.createMenu(t("MENU_MAIN"))
      .addItem(t("MENU_CALC_GPS"), "calculerGps")
      .addItem(t("MENU_ACTIVER_AUTO"), "installerAutomatisation")
      .addSeparator()
      .addItem(t("MENU_SYNC"), "synchroniserVigilanceEau")
      .addItem(t("MENU_RAPPORT"), "envoyerRapportCrise")
      .addSeparator()
      .addItem(t("MENU_CARTE"), "afficherCarteVigilance")
      .addSeparator()
      .addItem(t("MENU_PLANIF"), "appliquerPlanification")
      .addSeparator()
      .addItem(t("MENU_ABOUT"), "afficherAPropos")
      .addToUi();
      
  } catch (erreur) {
    console.error(`Erreur menu : ${erreur.stack}`);
  }
}

function afficherAPropos() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(t("ABOUT_TITLE"), t("ABOUT_CONTENT"), ui.ButtonSet.OK);
}

function installerAutomatisation() {
  const interfaceUtilisateur = SpreadsheetApp.getUi();
  const nomFonction = "gererEditionAutomatique";
  
  try {
    const triggers = ScriptApp.getProjectTriggers();
    for (const trigger of triggers) {
      if (trigger.getHandlerFunction() === nomFonction) {
        interfaceUtilisateur.alert(t("INFO_TITLE"), t("AUTO_ALREADY_ACTIVE"), interfaceUtilisateur.ButtonSet.OK);
        return;
      }
    }
    
    ScriptApp.newTrigger(nomFonction)
      .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
      .onEdit()
      .create();
      
    interfaceUtilisateur.alert(t("SUCCESS_TITLE"), t("AUTO_SUCCESS"), interfaceUtilisateur.ButtonSet.OK);
  } catch(e) {
    interfaceUtilisateur.alert(t("ERROR_TITLE"), t("AUTO_ERROR") + e.message, interfaceUtilisateur.ButtonSet.OK);
  }
}