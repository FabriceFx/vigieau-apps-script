/**
 * Détection et notification des changements de niveau de restriction.
 *
 * La BDD étant un journal append-only, l'état antérieur de chaque site y est déjà
 * disponible : la détection ne consomme aucun appel supplémentaire à l'API.
 * L'alerte porte sur les transitions et non sur l'état courant, pour prévenir dès
 * l'aggravation (et non une fois la crise installée) et pour signaler les levées
 * de restriction, qui conditionnent la reprise des usages.
 */

/**
 * Reconstitue le dernier état fiable connu de chaque site, avant la synchronisation courante.
 * Les relevés en erreur sont ignorés et non mémorisés : une panne réseau de la veille
 * ne doit pas produire une fausse transition "Erreur d'API → Crise" le lendemain.
 * @param {SpreadsheetApp.Sheet} feuilleSuivi - L'onglet BDD.
 * @returns {Map<string, string>} Association nom de site → dernier état fiable.
 */
const construireEtatsPrecedents = (feuilleSuivi) => {
  const etats = new Map();
  const derniereLigne = feuilleSuivi.getLastRow();

  if (derniereLigne < CONFIG_APP.LIGNE_DEPART_DONNEES) return etats;

  const nbLignesDisponibles = derniereLigne - CONFIG_APP.LIGNE_DEPART_DONNEES + 1;
  const nbLignesALire = Math.min(nbLignesDisponibles, CONFIG_APP.MAX_LIGNES_HISTORIQUE_LECTURE);
  const premiereLigneALire = derniereLigne - nbLignesALire + 1;

  const colSite = CONFIG_APP.COLONNES_BDD.SITE;
  const colEtat = CONFIG_APP.COLONNES_BDD.ETAT;

  const donnees = feuilleSuivi
    .getRange(premiereLigneALire, 1, nbLignesALire, Math.max(colSite, colEtat))
    .getValues();

  // Parcours inversé : la première occurrence rencontrée est la plus récente.
  for (let i = donnees.length - 1; i >= 0; i--) {
    const nomBrut = donnees[i][colSite - 1];
    const etat = donnees[i][colEtat - 1];

    if (!nomBrut) continue;

    const nom = nomBrut.toString().trim();
    if (etats.has(nom)) continue;

    // On remonte jusqu'au dernier niveau réellement mesuré pour ce site.
    if (!estEtatFiable(etat)) continue;

    etats.set(nom, etat.toString());
  }

  return etats;
};

/**
 * Compare les états mesurés à l'état antérieur de chaque site.
 * @param {Map<string, string>} etatsPrecedents - Sortie de construireEtatsPrecedents.
 * @param {Array<Object>} sitesExtraits - Sites traités lors de cette synchronisation.
 * @param {Array<string>} etatsParSite - États mesurés, indexés comme sitesExtraits.
 * @param {Array<Object>} [donneesParSite] - Zones et arrêtés, mêmes index. Facultatif.
 * @returns {{changements: Array<Object>, nouveaux: Array<Object>}} Transitions détectées.
 */
const detecterTransitions = (etatsPrecedents, sitesExtraits, etatsParSite, donneesParSite) => {
  const changements = [];
  const nouveaux = [];
  const zones = donneesParSite || [];

  sitesExtraits.forEach((site, index) => {
    const apres = etatsParSite[index];

    // Une erreur de mesure n'est pas un changement de niveau : la signaler comme tel
    // déclencherait des alertes à chaque incident réseau.
    if (!estEtatFiable(apres)) return;

    // Un relevé partiel ne donne qu'une borne inférieure du niveau : une ressource
    // manquante ferait apparaître un allègement qui n'a peut-être pas eu lieu.
    if (zones[index] && zones[index].incomplet) return;

    const nom = site.nomSite.toString().trim();
    const avant = etatsPrecedents.get(nom);
    const poidsApres = poidsDeLEtat(apres);

    // Site jamais relevé jusqu'ici : ce n'est pas une transition, seulement une
    // première mesure. On ne la remonte qu'au-delà du seuil de gravité.
    if (avant === undefined) {
      if (poidsApres >= CONFIG_APP.SEUIL_NOUVEAU_SITE_POIDS) {
        nouveaux.push({ nom: nom, etat: apres, poids: poidsApres });
      }
      return;
    }

    if (avant === apres) return;

    changements.push({
      nom: nom,
      avant: avant,
      apres: apres,
      poidsApres: poidsApres,
      escalade: poidsApres > poidsDeLEtat(avant),
      // Le lien vers l'arrêté rend l'alerte immédiatement exploitable : le
      // destinataire accède au texte qui fonde la restriction sans rien chercher.
      arreteUrl: arreteDeReference(zones[index])
    });
  });

  // Aggravations en tête, puis par gravité décroissante : l'information la plus
  // urgente doit être lisible sans faire défiler l'email.
  changements.sort((a, b) =>
    (Number(b.escalade) - Number(a.escalade)) ||
    (b.poidsApres - a.poidsApres) ||
    a.nom.localeCompare(b.nom)
  );
  nouveaux.sort((a, b) => (b.poids - a.poids) || a.nom.localeCompare(b.nom));

  return { changements: changements, nouveaux: nouveaux };
};

/**
 * Construit le corps HTML de l'alerte.
 * @param {{changements: Array<Object>, nouveaux: Array<Object>}} transitions - Transitions détectées.
 * @returns {string} Corps du mail en HTML.
 */
const genererHtmlTransitions = (transitions) => {
  const couleurNiveau = (etat) => CONFIG_APP.COULEURS_TEXTE_NIVEAU[etat] || "#5f6368";
  const escalades = transitions.changements.filter(c => c.escalade).length;

  // En-tête rouge dès qu'une aggravation existe, vert si l'actualité n'est faite
  // que de levées de restriction.
  const couleurEntete = escalades > 0 ? "#d93025" : "#137333";
  const titre = escalades > 0 ? t("TRANSITION_TITLE_ESCALADE") : t("TRANSITION_TITLE_DETENTE");

  const styleCellule = "padding: 12px; border-bottom: 1px solid #dadce0; font-size: 14px;";

  // La colonne des arrêtés n'apparaît que si au moins un lien est disponible.
  const avecArrete = transitions.changements.some(c => estUrlSure(c.arreteUrl));

  const celluleArrete = (c) => {
    if (!avecArrete) return "";
    if (!estUrlSure(c.arreteUrl)) return `<td style="${styleCellule}"></td>`;
    return `<td style="${styleCellule}"><a href="${echapperHtml(c.arreteUrl)}" style="color: #1a73e8; text-decoration: none; font-weight: 600;">${t("TRANSITION_COL_ARRETE_LIEN")}</a></td>`;
  };

  const lignesChangements = transitions.changements.map(c => `
    <tr>
      <td style="${styleCellule} color: #3c4043; font-weight: 500;">${echapperHtml(c.nom)}</td>
      <td style="${styleCellule} color: ${couleurNiveau(c.avant)};">${echapperHtml(c.avant)}</td>
      <td style="${styleCellule} color: #5f6368; text-align: center; font-weight: 700;">${c.escalade ? "↑" : "↓"}</td>
      <td style="${styleCellule} color: ${couleurNiveau(c.apres)}; font-weight: 700;">${echapperHtml(c.apres)}</td>
      ${celluleArrete(c)}
    </tr>
  `).join("");

  const tableauChangements = transitions.changements.length === 0 ? "" : `
    <table style="width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 24px;">
      <thead>
        <tr style="background-color: #f1f3f4;">
          <th style="text-align: left; padding: 12px; color: #5f6368; font-weight: 500; font-size: 13px; border-bottom: 2px solid #dadce0;">${t("TRANSITION_COL_SITE")}</th>
          <th style="text-align: left; padding: 12px; color: #5f6368; font-weight: 500; font-size: 13px; border-bottom: 2px solid #dadce0;">${t("TRANSITION_COL_AVANT")}</th>
          <th style="width: 32px; border-bottom: 2px solid #dadce0;"></th>
          <th style="text-align: left; padding: 12px; color: #5f6368; font-weight: 500; font-size: 13px; border-bottom: 2px solid #dadce0;">${t("TRANSITION_COL_APRES")}</th>
          ${avecArrete ? `<th style="text-align: left; padding: 12px; color: #5f6368; font-weight: 500; font-size: 13px; border-bottom: 2px solid #dadce0;">${t("TRANSITION_COL_ARRETE")}</th>` : ""}
        </tr>
      </thead>
      <tbody>${lignesChangements}</tbody>
    </table>
  `;

  const lignesNouveaux = transitions.nouveaux.map(n => `
    <tr>
      <td style="${styleCellule} color: #3c4043; font-weight: 500;">${echapperHtml(n.nom)}</td>
      <td style="${styleCellule} color: ${couleurNiveau(n.etat)}; font-weight: 700;">${echapperHtml(n.etat)}</td>
    </tr>
  `).join("");

  const tableauNouveaux = transitions.nouveaux.length === 0 ? "" : `
    <p style="color: #3c4043; font-size: 15px; font-weight: 600; margin-bottom: 4px;">${t("TRANSITION_NEW_TITLE")}</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 24px;">
      <tbody>${lignesNouveaux}</tbody>
    </table>
  `;

  return `
    <div style="font-family: 'Google Sans', Roboto, Arial, sans-serif; background-color: #f8f9fa; padding: 24px; margin: 0;">
      <div style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #dadce0; overflow: hidden;">

        <div style="background-color: ${couleurEntete}; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 400;">${titre}</h1>
        </div>

        <div style="padding: 32px 24px;">
          <p style="color: #3c4043; font-size: 15px; line-height: 1.5; margin-top: 0;">
            ${t("TRANSITION_INTRO")}
          </p>

          ${tableauChangements}
          ${tableauNouveaux}

          <p style="color: #5f6368; font-size: 13px; line-height: 1.5; margin-bottom: 0;">
            ${t("TRANSITION_FOOTER")}
          </p>
        </div>
      </div>
    </div>
  `;
};

/**
 * Compose l'objet du mail à partir du sens dominant des transitions.
 * @param {{changements: Array<Object>, nouveaux: Array<Object>}} transitions - Transitions détectées.
 * @returns {string} Objet du message.
 */
const construireSujetTransitions = (transitions) => {
  const escalades = transitions.changements.filter(c => c.escalade).length;
  const detentes = transitions.changements.length - escalades;

  if (escalades > 0) {
    return t("TRANSITION_SUBJECT_ESCALADE").replace("{n}", escalades);
  }
  if (detentes > 0) {
    return t("TRANSITION_SUBJECT_DETENTE").replace("{n}", detentes);
  }
  return t("TRANSITION_SUBJECT_NEW").replace("{n}", transitions.nouveaux.length);
};

/**
 * Envoie l'alerte de changement de niveau.
 * @param {{changements: Array<Object>, nouveaux: Array<Object>}} transitions - Transitions détectées.
 * @param {string} emailCible - Destinataire.
 * @returns {boolean} Vrai si un email a effectivement été expédié.
 */
const envoyerAlerteTransitions = (transitions, emailCible) => {
  if (transitions.changements.length === 0 && transitions.nouveaux.length === 0) return false;

  if (!emailCible) {
    console.error("Alerte de transition : aucun destinataire déterminé.");
    return false;
  }

  if (MailApp.getRemainingDailyQuota() <= 0) {
    console.error("Alerte de transition : quota d'envoi quotidien atteint, email non expédié.");
    return false;
  }

  MailApp.sendEmail({
    to: emailCible,
    subject: construireSujetTransitions(transitions),
    htmlBody: genererHtmlTransitions(transitions)
  });

  console.info(`Alerte de transition envoyée à ${emailCible} : ${transitions.changements.length} changement(s), ${transitions.nouveaux.length} nouveau(x) site(s).`);
  return true;
};
