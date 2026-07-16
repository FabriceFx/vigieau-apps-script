function onOpen() {
  const interfaceUtilisateur = SpreadsheetApp.getUi();
  
  try {
    interfaceUtilisateur.createMenu("📍 Géolocalisation & Eau")
      .addItem("1. Calculer les données géographiques", "calculerGps")
      .addItem("⚡ Activer l'automatisation de saisie", "installerAutomatisation")
      .addSeparator()
      .addItem("2. Récupérer l'état Vigieau (Archivage)", "synchroniserVigilanceEau")
      .addItem("3. Envoyer le rapport des sites en crise", "envoyerRapportCrise")
      .addSeparator()
      .addItem("🗺️ Afficher la carte interactive", "afficherCarteVigilance")
      .addSeparator()
      .addItem("⏳ Appliquer les planifications", "appliquerPlanification")
      .addToUi();
      
  } catch (erreur) {
    console.error(`Erreur menu : ${erreur.stack}`);
  }
}

function installerAutomatisation() {
  const interfaceUtilisateur = SpreadsheetApp.getUi();
  const nomFonction = "gererEditionAutomatique";
  
  try {
    const triggers = ScriptApp.getProjectTriggers();
    for (const trigger of triggers) {
      if (trigger.getHandlerFunction() === nomFonction) {
        interfaceUtilisateur.alert("Information", "L'automatisation magique est déjà active sur ce document.", interfaceUtilisateur.ButtonSet.OK);
        return;
      }
    }
    
    ScriptApp.newTrigger(nomFonction)
      .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
      .onEdit()
      .create();
      
    interfaceUtilisateur.alert("Succès 🎉", "L'automatisation est activée !\n\nTapez maintenant une adresse dans l'onglet Sites et validez avec Entrée, le GPS se calculera tout seul.", interfaceUtilisateur.ButtonSet.OK);
  } catch(e) {
    interfaceUtilisateur.alert("Erreur", "Impossible de créer le déclencheur. Veuillez vérifier vos permissions.\n\n" + e.message, interfaceUtilisateur.ButtonSet.OK);
  }
}