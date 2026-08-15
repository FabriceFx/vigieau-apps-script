/**
 * Extraction et restitution des usages réellement restreints.
 *
 * Un niveau de gravité seul n'est pas actionnable : « Alerte renforcée » ne dit pas
 * ce qui est interdit sur un site donné. L'API Vigieau renvoie, pour chaque zone,
 * la liste des usages restreints et le lien vers l'arrêté préfectoral qui les fonde.
 * Ce module conserve cette information et la restitue dans l'onglet Restrictions,
 * qui sert à la fois de consigne d'exploitation et de pièce justificative.
 */

/**
 * Élague la réponse de l'API et ne retient que les usages concernant le profil configuré.
 * @param {*} charge - Corps JSON déjà analysé (tableau de zones attendu).
 * @param {string} profil - Profil configuré (particulier, entreprise, collectivite, agriculteur).
 * @returns {{etat: string, zones: Array<Object>}} Niveau retenu et zones exploitables.
 */
const extraireDonneesZones = (charge, profil) => {
  const etat = extraireNiveauMax(charge);

  if (!Array.isArray(charge)) return { etat: etat, zones: [] };

  // Un profil inconnu ne doit pas faire disparaître toutes les restrictions :
  // on retombe sur l'entreprise, cohérent avec la valeur par défaut de la configuration.
  const champProfil = CONFIG_APP.PROFIL_VERS_CHAMP[profil] || CONFIG_APP.PROFIL_VERS_CHAMP.entreprise;
  const zones = [];

  charge.forEach(zone => {
    if (!zone) return;

    const usagesBruts = Array.isArray(zone.usages) ? zone.usages : [];
    const usages = usagesBruts
      .filter(usage => usage && usage[champProfil])
      .map(usage => ({
        thematique: (usage.thematique || "").toString(),
        nom: (usage.nom || "").toString(),
        description: (usage.description || "").toString()
      }));

    // Une zone sans usage applicable au profil n'a rien à dire à cet utilisateur.
    if (usages.length === 0) return;

    const arrete = zone.arrete || {};
    const niveau = NIVEAUX_GRAVITE[zone.niveauGravite] ? NIVEAUX_GRAVITE[zone.niveauGravite].label : "Inconnu";

    zones.push({
      nom: (zone.nom || "").toString(),
      type: (zone.type || "").toString(),
      niveau: niveau,
      poids: poidsDeLEtat(niveau),
      arreteDate: (arrete.dateDebutValidite || "").toString(),
      arreteUrl: (arrete.cheminFichier || "").toString(),
      arreteCadreUrl: (arrete.cheminFichierArreteCadre || "").toString(),
      usages: usages
    });
  });

  return { etat: etat, zones: zones };
};

/**
 * Sérialise les données de zones pour le cache.
 * Renvoie une chaîne vide si l'objet dépasse la taille admissible par entrée : mieux
 * vaut refaire l'appel demain que de perdre l'écriture de tout le lot.
 * @param {Object} donnees - Sortie de extraireDonneesZones.
 * @returns {string} Valeur à mettre en cache, ou "" pour renoncer.
 */
const ecrireCacheZones = (donnees) => {
  const valeur = JSON.stringify(donnees);

  if (valeur.length > CONFIG_APP.TAILLE_MAX_CACHE_OCTETS) {
    const reduit = JSON.stringify({ etat: donnees.etat, zones: [] });
    console.warn(`Cache : charge de ${valeur.length} o trop volumineuse, seul le niveau est mémorisé.`);
    return reduit.length > CONFIG_APP.TAILLE_MAX_CACHE_OCTETS ? "" : reduit;
  }

  return valeur;
};

/**
 * Relit une entrée de cache en tolérant une valeur corrompue ou d'un format antérieur.
 * @param {string} brut - Valeur brute issue du cache.
 * @returns {{etat: string, zones: Array<Object>}|null} Données exploitables, ou null.
 */
const lireCacheZones = (brut) => {
  if (!brut) return null;

  try {
    const donnees = JSON.parse(brut);
    if (!donnees || !estEtatFiable(donnees.etat)) return null;
    return { etat: donnees.etat, zones: Array.isArray(donnees.zones) ? donnees.zones : [] };
  } catch (e) {
    // Entrée illisible : on la traite comme absente, le site sera simplement réinterrogé.
    return null;
  }
};

/**
 * Retourne le lien vers l'arrêté de la zone la plus contraignante d'un site.
 * Utilisé pour rendre l'alerte de changement directement actionnable.
 * @param {Object} donnees - Sortie de extraireDonneesZones.
 * @returns {string} URL de l'arrêté, ou chaîne vide.
 */
const arreteDeReference = (donnees) => {
  if (!donnees || !Array.isArray(donnees.zones) || donnees.zones.length === 0) return "";

  const zonePrioritaire = donnees.zones.reduce(
    (retenue, zone) => (zone.poids > retenue.poids ? zone : retenue),
    donnees.zones[0]
  );

  return estUrlSure(zonePrioritaire.arreteUrl) ? zonePrioritaire.arreteUrl : "";
};

/**
 * N'accepte comme lien cliquable qu'une URL http(s) : les valeurs inattendues
 * renvoyées par un service tiers ne doivent pas devenir des liens dans le classeur.
 * @param {string} url - URL à contrôler.
 * @returns {boolean} Vrai si l'URL est exploitable.
 */
const estUrlSure = (url) => typeof url === "string" && /^https?:\/\/\S+$/i.test(url);

/**
 * Met à plat les zones de tous les sites en lignes de tableur.
 * @param {Array<Object>} sitesExtraits - Sites traités lors de la synchronisation.
 * @param {Array<Object>} donneesParSite - Sorties de extraireDonneesZones, mêmes index.
 * @param {string} dateFormatee - Horodatage de la synchronisation.
 * @returns {Array<Object>} Lignes prêtes à écrire, avec leurs URL associées.
 */
const construireLignesRestrictions = (sitesExtraits, donneesParSite, dateFormatee) => {
  const lignes = [];

  sitesExtraits.forEach((site, index) => {
    const donnees = donneesParSite[index];
    if (!donnees || !Array.isArray(donnees.zones)) return;

    donnees.zones.forEach(zone => {
      const libelleZone = zone.type ? `${zone.nom} (${zone.type})` : zone.nom;

      zone.usages.forEach(usage => {
        lignes.push({
          valeurs: [
            dateFormatee,
            site.nomSite,
            zone.niveau,
            libelleZone,
            usage.thematique,
            usage.nom,
            usage.description,
            zone.arreteDate,
            CONFIG_APP.LIBELLE_LIEN_ARRETE,
            CONFIG_APP.LIBELLE_LIEN_ARRETE_CADRE
          ],
          niveau: zone.niveau,
          arreteUrl: zone.arreteUrl,
          arreteCadreUrl: zone.arreteCadreUrl
        });
      });
    });
  });

  return lignes;
};

/**
 * Crée l'onglet Restrictions et son en-tête si nécessaire.
 * @param {SpreadsheetApp.Spreadsheet} classeur - Le classeur actif.
 * @returns {SpreadsheetApp.Sheet} La feuille prête à l'emploi.
 */
const initialiserFeuilleRestrictions = (classeur) => {
  let feuille = classeur.getSheetByName(CONFIG_APP.ONGLETS.RESTRICTIONS);

  if (!feuille) {
    feuille = classeur.insertSheet(CONFIG_APP.ONGLETS.RESTRICTIONS);
  }

  if (feuille.getLastRow() === 0) {
    const enTetes = [[
      "Date", "Site", "Niveau", "Zone", "Thématique",
      "Usage", "Restriction", "Arrêté du", "Arrêté", "Arrêté cadre"
    ]];

    feuille.getRange(1, 1, 1, 10).setValues(enTetes)
      .setFontWeight("bold")
      .setFontColor("#ffffff")
      .setBackground("#1a73e8")
      .setHorizontalAlignment("center");

    feuille.setFrozenRows(1);
    feuille.setColumnWidth(1, 150); // Date
    feuille.setColumnWidth(2, 200); // Site
    feuille.setColumnWidth(3, 130); // Niveau
    feuille.setColumnWidth(4, 170); // Zone
    feuille.setColumnWidth(5, 160); // Thématique
    feuille.setColumnWidth(6, 320); // Usage
    feuille.setColumnWidth(7, 380); // Restriction
    feuille.setColumnWidth(8, 100); // Arrêté du
    feuille.setColumnWidth(9, 110); // Arrêté
    feuille.setColumnWidth(10, 120); // Arrêté cadre
  }

  return feuille;
};

/**
 * Réécrit intégralement l'onglet Restrictions.
 * L'onglet est un instantané de ce qui s'applique maintenant, pas un historique :
 * conserver les relevés passés le rendrait illisible et ferait croire à des
 * restrictions encore en vigueur alors qu'elles ont pu être levées.
 * @param {SpreadsheetApp.Spreadsheet} classeur - Le classeur actif.
 * @param {Array<Object>} lignes - Sortie de construireLignesRestrictions.
 * @returns {number} Nombre de lignes écrites.
 */
const ecrireRestrictions = (classeur, lignes) => {
  const feuilleExistante = classeur.getSheetByName(CONFIG_APP.ONGLETS.RESTRICTIONS);

  // Rien à écrire et aucun onglet : inutile d'encombrer le classeur.
  if (lignes.length === 0 && !feuilleExistante) return 0;

  const feuille = initialiserFeuilleRestrictions(classeur);

  // Purge des restrictions précédentes (contenu et mise en forme).
  const derniereLigne = feuille.getLastRow();
  if (derniereLigne >= CONFIG_APP.LIGNE_DEPART_DONNEES) {
    feuille.getRange(CONFIG_APP.LIGNE_DEPART_DONNEES, 1, derniereLigne - 1, 10).clear();
  }

  if (lignes.length === 0) return 0;

  let lignesAEcrire = lignes;
  if (lignes.length > CONFIG_APP.MAX_LIGNES_RESTRICTIONS) {
    // Une troncature silencieuse laisserait croire à une liste exhaustive.
    console.warn(`Restrictions : ${lignes.length} lignes générées, écriture limitée à ${CONFIG_APP.MAX_LIGNES_RESTRICTIONS}.`);
    lignesAEcrire = lignes.slice(0, CONFIG_APP.MAX_LIGNES_RESTRICTIONS);
  }

  const debut = CONFIG_APP.LIGNE_DEPART_DONNEES;
  const nb = lignesAEcrire.length;

  feuille.getRange(debut, 1, nb, 10).setValues(lignesAEcrire.map(l => l.valeurs));

  // Couleur de la seule colonne Niveau : le tableau reste lisible tout en signalant
  // la gravité, sans repeindre l'intégralité des lignes de texte.
  feuille.getRange(debut, CONFIG_APP.COLONNES_RESTRICTIONS.NIVEAU, nb, 1)
    .setBackgrounds(lignesAEcrire.map(l => [CONFIG_APP.COULEURS_FOND[l.niveau] || "#ffffff"]));

  feuille.getRange(debut, CONFIG_APP.COLONNES_RESTRICTIONS.RESTRICTION, nb, 1).setWrap(true);

  // Liens des arrêtés en texte enrichi, pour ne pas dépendre des conventions
  // régionales des formules et pour rester valides à l'export.
  const enrichir = (url, libelle) => SpreadsheetApp.newRichTextValue()
    .setText(estUrlSure(url) ? libelle : CONFIG_APP.LIBELLE_SANS_LIEN)
    .setLinkUrl(estUrlSure(url) ? url : null)
    .build();

  feuille.getRange(debut, CONFIG_APP.COLONNES_RESTRICTIONS.ARRETE, nb, 1)
    .setRichTextValues(lignesAEcrire.map(l => [enrichir(l.arreteUrl, CONFIG_APP.LIBELLE_LIEN_ARRETE)]));

  feuille.getRange(debut, CONFIG_APP.COLONNES_RESTRICTIONS.ARRETE_CADRE, nb, 1)
    .setRichTextValues(lignesAEcrire.map(l => [enrichir(l.arreteCadreUrl, CONFIG_APP.LIBELLE_LIEN_ARRETE_CADRE)]));

  return nb;
};
