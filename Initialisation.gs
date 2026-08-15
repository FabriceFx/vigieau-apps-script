/**
 * Préparation du classeur au premier démarrage.
 *
 * Les onglets étaient jusqu'ici créés au fil de l'eau, chacun par la fonction qui en
 * avait besoin : l'utilisateur devait deviner l'ordre des opérations et découvrait la
 * structure attendue au fur et à mesure. Ce module la met en place en une fois.
 */

/**
 * Noms attribués par Google à la feuille créée avec un classeur vierge, selon la
 * langue de l'interface. Seule une feuille portant l'un de ces noms ET totalement
 * vide peut être supprimée : une feuille contenant quoi que ce soit ne l'est jamais.
 */
const MOTIF_FEUILLE_PAR_DEFAUT = /^(feuille|sheet|hoja|foglio|blatt|tabellenblatt|folha|blad|ark|arkusz|list|лист)\s*\d*$/i;

/**
 * Applique la présentation commune à une ligne d'en-tête.
 * @param {SpreadsheetApp.Sheet} feuille - La feuille concernée.
 * @param {number} nbColonnes - Nombre de colonnes à mettre en forme.
 */
const formaterEnTetes = (feuille, nbColonnes) => {
  feuille.getRange(1, 1, 1, nbColonnes)
    .setFontWeight("bold")
    .setFontColor("#ffffff")
    .setBackground("#1a73e8")
    .setHorizontalAlignment("center");

  feuille.setFrozenRows(1);
};

/**
 * Crée ou met à niveau l'onglet Sites, seul onglet réellement saisi par l'utilisateur.
 * Un onglet existant n'est jamais réécrit : on se contente d'ajouter les colonnes
 * facultatives manquantes et d'appliquer la mise en forme de l'en-tête.
 * @param {SpreadsheetApp.Spreadsheet} classeur - Le classeur actif.
 * @returns {SpreadsheetApp.Sheet} L'onglet Sites prêt à l'emploi.
 */
const initialiserFeuilleSites = (classeur) => {
  let feuille = classeur.getSheetByName(CONFIG_APP.ONGLETS.SITES);

  if (!feuille) {
    feuille = classeur.insertSheet(CONFIG_APP.ONGLETS.SITES);
  }

  if (feuille.getLastRow() === 0) {
    feuille.getRange(1, 1, 1, 5).setValues([[
      "Département",
      "Adresse",
      "GPS",
      CONFIG_APP.LIBELLE_COLONNE_RESSOURCES,
      CONFIG_APP.LIBELLE_COLONNE_PROFIL
    ]]);

    feuille.setColumnWidth(CONFIG_APP.COLONNES_SITES.DEPARTEMENT, 180);
    feuille.setColumnWidth(CONFIG_APP.COLONNES_SITES.ADRESSE, 320);
    feuille.setColumnWidth(CONFIG_APP.COLONNES_SITES.GPS, 180);
    feuille.setColumnWidth(CONFIG_APP.COLONNES_SITES.RESSOURCES, 140);
    feuille.setColumnWidth(CONFIG_APP.COLONNES_SITES.PROFIL, 130);
  } else {
    assurerColonnesSites(feuille);
  }

  formaterEnTetes(feuille, Math.max(feuille.getLastColumn(), 5));

  // Les colonnes facultatives ne sont explicites qu'accompagnées de leurs valeurs
  // admises : la note reste visible sans encombrer la feuille.
  feuille.getRange(1, CONFIG_APP.COLONNES_SITES.RESSOURCES).setNote(t("SETUP_NOTE_RESSOURCES"));
  feuille.getRange(1, CONFIG_APP.COLONNES_SITES.PROFIL).setNote(t("SETUP_NOTE_PROFIL"));

  const lignesDisponibles = feuille.getMaxRows() - 1;
  if (lignesDisponibles > 0) {
    feuille.getRange(CONFIG_APP.LIGNE_DEPART_DONNEES, CONFIG_APP.COLONNES_SITES.PROFIL, lignesDisponibles, 1)
      .setDataValidation(
        SpreadsheetApp.newDataValidation().requireValueInList(CONFIG_APP.PROFILS, true).build()
      );
  }

  return feuille;
};

/**
 * Supprime la feuille vierge créée automatiquement par Google avec le classeur.
 * Trois conditions cumulatives : ce n'est pas un onglet de l'outil, son nom est celui
 * d'une feuille par défaut, et elle est entièrement vide. Sans quoi on n'y touche pas.
 * @param {SpreadsheetApp.Spreadsheet} classeur - Le classeur actif.
 * @returns {string} Le nom de la feuille supprimée, ou une chaîne vide.
 */
const supprimerFeuilleParDefaut = (classeur) => {
  const feuilles = classeur.getSheets();

  // Un classeur doit conserver au moins une feuille.
  if (feuilles.length <= 1) return "";

  const ongletsOutil = [
    CONFIG_APP.ONGLETS.SITES,
    CONFIG_APP.ONGLETS.BDD,
    CONFIG_APP.ONGLETS.CONFIG,
    CONFIG_APP.ONGLETS.RESTRICTIONS
  ];

  for (const feuille of feuilles) {
    const nom = feuille.getName();

    if (ongletsOutil.indexOf(nom) !== -1) continue;
    if (!MOTIF_FEUILLE_PAR_DEFAUT.test(nom.trim())) continue;

    // Garde-fou : aucune suppression si la feuille contient la moindre donnée.
    if (feuille.getLastRow() !== 0 || feuille.getLastColumn() !== 0) continue;

    classeur.deleteSheet(feuille);
    console.info(`Feuille par défaut "${nom}" supprimée (vide).`);
    return nom;
  }

  return "";
};

/**
 * Range les onglets de l'outil dans l'ordre d'utilisation.
 * @param {SpreadsheetApp.Spreadsheet} classeur - Le classeur actif.
 */
const ordonnerOnglets = (classeur) => {
  const ordre = [
    CONFIG_APP.ONGLETS.SITES,
    CONFIG_APP.ONGLETS.BDD,
    CONFIG_APP.ONGLETS.RESTRICTIONS,
    CONFIG_APP.ONGLETS.CONFIG
  ];

  ordre.forEach((nom, rang) => {
    const feuille = classeur.getSheetByName(nom);
    if (!feuille) return;
    classeur.setActiveSheet(feuille);
    classeur.moveActiveSheet(rang + 1);
  });
};

/**
 * Point d'entrée du menu : prépare l'ensemble du classeur en une opération.
 */
function configurerClasseur() {
  const interfaceUtilisateur = SpreadsheetApp.getUi();

  try {
    const classeur = SpreadsheetApp.getActiveSpreadsheet();

    const ongletsAttendus = [
      CONFIG_APP.ONGLETS.SITES,
      CONFIG_APP.ONGLETS.BDD,
      CONFIG_APP.ONGLETS.RESTRICTIONS,
      CONFIG_APP.ONGLETS.CONFIG
    ];

    // Relevé préalable : seul moyen de distinguer ensuite ce qui a été créé de ce
    // qui existait déjà, les fonctions d'initialisation étant idempotentes.
    const preexistants = {};
    ongletsAttendus.forEach(nom => { preexistants[nom] = classeur.getSheetByName(nom) !== null; });

    initialiserFeuilleSites(classeur);
    initialiserFeuilleBdd(classeur);
    initialiserFeuilleRestrictions(classeur);
    recupererConfigurationUtilisateur(classeur);

    // L'onglet Configuration est créé ailleurs, avec sa propre mise en forme :
    // on l'aligne ici sur les autres pour que les quatre onglets se ressemblent,
    // y compris dans les classeurs antérieurs à cette fonction.
    const feuilleConfig = classeur.getSheetByName(CONFIG_APP.ONGLETS.CONFIG);
    if (feuilleConfig) formaterEnTetes(feuilleConfig, 3);

    const creations = ongletsAttendus.filter(nom => !preexistants[nom]);
    const feuilleSupprimee = supprimerFeuilleParDefaut(classeur);

    // On ne réorganise que lors d'une véritable mise en place : un classeur déjà
    // en service peut avoir un ordre d'onglets voulu par son utilisateur.
    if (creations.length > 0) ordonnerOnglets(classeur);

    const lignes = [];
    ongletsAttendus.forEach(nom => {
      lignes.push(`${preexistants[nom] ? "•" : "✅"} ${nom} — ${preexistants[nom] ? t("SETUP_KEPT") : t("SETUP_CREATED")}`);
    });

    if (feuilleSupprimee) lignes.push(`🗑️ ${feuilleSupprimee} — ${t("SETUP_REMOVED")}`);

    interfaceUtilisateur.alert(
      t("SETUP_TITLE"),
      `${lignes.join("\n")}\n\n${t("SETUP_NEXT")}`,
      interfaceUtilisateur.ButtonSet.OK
    );

  } catch (erreur) {
    console.error(`Erreur de configuration du classeur : ${erreur.stack}`);
    interfaceUtilisateur.alert(t("ERROR_TITLE"), t("SETUP_ERROR") + erreur.message, interfaceUtilisateur.ButtonSet.OK);
  }
}

/**
 * Point d'entrée du menu : fenêtre expliquant le fonctionnement de l'outil.
 */
function afficherAide() {
  const interfaceUtilisateur = SpreadsheetApp.getUi();

  try {
    const pageHtml = HtmlService.createTemplateFromFile("Aide")
      .evaluate()
      .setWidth(CONFIG_APP.FENETRE_AIDE.LARGEUR)
      .setHeight(CONFIG_APP.FENETRE_AIDE.HAUTEUR)
      .setTitle(t("AIDE_TITLE"));

    interfaceUtilisateur.showModalDialog(pageHtml, t("AIDE_TITLE"));
  } catch (erreur) {
    console.error(`Erreur d'affichage de l'aide : ${erreur.stack}`);
    interfaceUtilisateur.alert(t("ERROR_TECHNICAL"), erreur.message, interfaceUtilisateur.ButtonSet.OK);
  }
}
