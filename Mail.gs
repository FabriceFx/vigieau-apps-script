/**
 * Module d'alerte et d'envoi du rapport d'état hydrique par email.
 */

/**
 * Filtre les données de l'onglet de suivi pour récupérer les sites en crise du jour.
 * Borde la lecture aux N dernières lignes pour préserver les performances sur les gros volumes.
 * @returns {Array<Array>} Tableau contenant les noms des sites et les états.
 */
const extraireSitesEnCriseDuJour = () => {
  const classeur = SpreadsheetApp.getActiveSpreadsheet();
  const feuilleSuivi = classeur.getSheetByName(CONFIG_APP.ONGLETS.BDD);
  
  if (!feuilleSuivi) {
    throw new Error(`L'onglet "${CONFIG_APP.ONGLETS.BDD}" est introuvable.`);
  }

  const derniereLigne = feuilleSuivi.getLastRow();
  if (derniereLigne < CONFIG_APP.LIGNE_DEPART_DONNEES) return [];

  const nbLignesDisponibles = derniereLigne - CONFIG_APP.LIGNE_DEPART_DONNEES + 1;
  const nbLignesALire = Math.min(nbLignesDisponibles, CONFIG_APP.MAX_LIGNES_HISTORIQUE_LECTURE);
  const premiereLigneALire = derniereLigne - nbLignesALire + 1;

  const colDate = CONFIG_APP.COLONNES_BDD.DATE;
  const colSite = CONFIG_APP.COLONNES_BDD.SITE;
  const colEtat = CONFIG_APP.COLONNES_BDD.ETAT;
  const maxCol = Math.max(colDate, colSite, colEtat);

  const donnees = feuilleSuivi.getRange(premiereLigneALire, 1, nbLignesALire, maxCol).getValues();
  const dateAujourdhui = new Date().toDateString();

  // Filtrage intelligent avec dédoublonnage (parcours inversé pour garder le statut le plus récent)
  const sitesVus = new Set();
  const donneesFiltrees = [];
  
  for (let i = donnees.length - 1; i >= 0; i--) {
    const ligne = donnees[i];
    const dateBrute = ligne[colDate - 1];
    const nomSite = ligne[colSite - 1];
    const etat = ligne[colEtat - 1];
    
    if (!dateBrute || !nomSite) continue;
    
    let correspondAujourdhui = false;
    
    // Google Sheets renvoie parfois un objet Date, parfois une chaîne formatée
    if (dateBrute instanceof Date) {
      correspondAujourdhui = dateBrute.toDateString() === dateAujourdhui;
    } else {
      const stringDate = dateBrute.toString();
      const jourStr = new Date().getDate().toString().padStart(2, '0');
      const moisStr = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const anneeStr = new Date().getFullYear().toString();
      
      correspondAujourdhui = stringDate.startsWith(`${jourStr}/${moisStr}/${anneeStr}`);
    }
    
    if (correspondAujourdhui) {
      if (!sitesVus.has(nomSite)) {
        sitesVus.add(nomSite);
        
        if (etat === CONFIG_APP.ETAT_CRISE) {
          donneesFiltrees.unshift(ligne); // Préserve l'ordre chronologique
        }
      }
    }
  }
  
  return donneesFiltrees;
};

/**
 * Génère un code HTML stylisé (Material Design) pour l'email.
 * @param {Array<Array>} sitesEnCrise - Les données des sites en crise.
 * @returns {string} Le corps du mail en HTML sécurisé.
 */
const genererTemplateHtmlGoogle = (sitesEnCrise) => {
  const colSite = CONFIG_APP.COLONNES_BDD.SITE;
  const colEtat = CONFIG_APP.COLONNES_BDD.ETAT;

  const lignesHtml = sitesEnCrise.map(ligne => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #dadce0; color: #3c4043; font-weight: 500;">
        ${echapperHtml(ligne[colSite - 1])}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #dadce0; color: #d93025; font-weight: bold;">
        ${echapperHtml(ligne[colEtat - 1])}
      </td>
    </tr>
  `).join('');

  return `
    <div style="font-family: 'Google Sans', Roboto, Arial, sans-serif; background-color: #f8f9fa; padding: 24px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #dadce0; overflow: hidden;">
        
        <div style="background-color: #d93025; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 400;">Alerte de restriction d'eau</h1>
        </div>
        
        <div style="padding: 32px 24px;">
          <p style="color: #3c4043; font-size: 16px; line-height: 1.5; margin-top: 0;">
            Bonjour,
          </p>
          <p style="color: #3c4043; font-size: 16px; line-height: 1.5;">
            Voici le tableau de bord automatisé. Les sites suivants ont été identifiés au niveau maximal de restriction (<strong>Crise</strong>) lors de la dernière synchronisation :
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 24px; margin-bottom: 24px;">
            <thead>
              <tr style="background-color: #f1f3f4;">
                <th style="text-align: left; padding: 12px; color: #5f6368; font-weight: 500; font-size: 14px; border-bottom: 2px solid #dadce0;">Nom du site</th>
                <th style="text-align: left; padding: 12px; color: #5f6368; font-weight: 500; font-size: 14px; border-bottom: 2px solid #dadce0;">État de vigilance</th>
              </tr>
            </thead>
            <tbody>
              ${lignesHtml}
            </tbody>
          </table>
          
          <p style="color: #5f6368; font-size: 14px; line-height: 1.5; margin-bottom: 0;">
            Cet email a été généré automatiquement par Vigieau Tracker.
          </p>
        </div>
      </div>
    </div>
  `;
};

/**
 * Point d'entrée principal : Récupère les données et envoie l'email.
 */
function envoyerRapportCrise() {
  let interfaceUtilisateur = null;
  try {
    interfaceUtilisateur = SpreadsheetApp.getUi();
  } catch (e) {
    // Si exécuté via trigger serveur
  }

  // Évite le double envoi si un lancement manuel croise le déclencheur horaire.
  const verrou = LockService.getScriptLock();
  if (!verrou.tryLock(CONFIG_APP.ATTENTE_VERROU_MS)) {
    console.warn("Envoi de rapport déjà en cours : exécution ignorée.");
    if (interfaceUtilisateur) interfaceUtilisateur.alert(t("INFO_TITLE"), t("LOCK_BUSY"), interfaceUtilisateur.ButtonSet.OK);
    return;
  }

  try {
    const classeur = SpreadsheetApp.getActiveSpreadsheet();
    const configUtilisateur = recupererConfigurationUtilisateur(classeur);
    const emailCible = configUtilisateur.emailDestinataire || Session.getActiveUser().getEmail();

    const sitesEnCrise = extraireSitesEnCriseDuJour();
    
    // Garde-fou : On n'envoie pas d'email s'il n'y a aucune crise
    if (sitesEnCrise.length === 0) {
      if (interfaceUtilisateur) {
        interfaceUtilisateur.alert(
          t("INFO_TITLE"), 
          t("EMAIL_NO_CRISIS"), 
          interfaceUtilisateur.ButtonSet.OK
        );
      }
      return;
    }
    
    // Vérification du quota d'emails
    const quotaRestant = MailApp.getRemainingDailyQuota();
    if (quotaRestant <= 0) {
      throw new Error("Quota d'envoi d'emails quotidien atteint.");
    }
    
    const htmlBody = genererTemplateHtmlGoogle(sitesEnCrise);
    
    // Envoi de l'email via le service MailApp de Google
    MailApp.sendEmail({
      to: emailCible,
      subject: t("EMAIL_SUBJECT"),
      htmlBody: htmlBody
    });
    
    try {
      SpreadsheetApp.getActiveSpreadsheet().toast(
        t("EMAIL_SUCCESS") + emailCible + ".", 
        t("EMAIL_REPORT_SENT"), 
        5
      );
    } catch(e) { }
    
  } catch (erreur) {
    console.error(`Erreur lors de l'envoi de l'email : ${erreur.stack}`);
    if (interfaceUtilisateur) {
      interfaceUtilisateur.alert(
        t("ERROR_EXECUTION"), 
        t("ERROR_EMAIL_SEND") + erreur.message,
        interfaceUtilisateur.ButtonSet.OK
      );
    }
  } finally {
    verrou.releaseLock();
  }
}