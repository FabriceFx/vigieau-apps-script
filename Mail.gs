/**
 * Configuration spécifique au module d'envoi d'emails.
 * @constant {Object}
 */
const CONFIG_EMAIL = {
  ONGLET_SUIVI: "BDD",
  COLONNE_DATE: 1,
  COLONNE_SITE: 2,
  COLONNE_ETAT: 3,
  ETAT_CRISE: "Crise",
  // Utilise par défaut l'email de la personne qui exécute le script
  DESTINATAIRE: Session.getActiveUser().getEmail(), 
  SUJET: "🚨 Rapport Vigieau : Sites en niveau de Crise"
};

/**
 * Filtre les données de l'onglet de suivi pour récupérer les sites en crise du jour.
 * @returns {Array<Array>} Tableau contenant les noms des sites et les états.
 */
const extraireSitesEnCriseDuJour = () => {
  const classeur = SpreadsheetApp.getActiveSpreadsheet();
  const feuilleSuivi = classeur.getSheetByName(CONFIG_EMAIL.ONGLET_SUIVI);
  
  if (!feuilleSuivi) {
    throw new Error(`L'onglet "${CONFIG_EMAIL.ONGLET_SUIVI}" est introuvable.`);
  }

  const derniereLigne = feuilleSuivi.getLastRow();
  if (derniereLigne < 2) return [];

  // Récupération des données (Horodatage, Site, Etat)
  const donnees = feuilleSuivi.getRange(2, 1, derniereLigne - 1, 3).getValues();
  const dateAujourdhui = new Date().toDateString();

  // Filtrage intelligent avec dédoublonnage (on lit de bas en haut pour garder le statut le plus récent)
  const sitesVus = new Set();
  const donneesFiltrees = [];
  
  for (let i = donnees.length - 1; i >= 0; i--) {
    const ligne = donnees[i];
    const dateBrute = ligne[CONFIG_EMAIL.COLONNE_DATE - 1];
    const nomSite = ligne[CONFIG_EMAIL.COLONNE_SITE - 1];
    const etat = ligne[CONFIG_EMAIL.COLONNE_ETAT - 1];
    
    if (!dateBrute) continue;
    
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
      // Si on n'a pas encore traité ce site aujourd'hui (comme on part de la fin, c'est le plus récent)
      if (!sitesVus.has(nomSite)) {
        sitesVus.add(nomSite);
        
        if (etat === CONFIG_EMAIL.ETAT_CRISE) {
          donneesFiltrees.unshift(ligne); // Ajoute au début pour préserver l'ordre chronologique
        }
      }
    }
  }
  
  return donneesFiltrees;
};

/**
 * Génère un code HTML stylisé (Material Design) pour l'email.
 * @param {Array<Array>} sitesEnCrise - Les données des sites en crise.
 * @returns {string} Le corps du mail en HTML.
 */
const genererTemplateHtmlGoogle = (sitesEnCrise) => {
  // Création dynamique des lignes du tableau HTML
  const lignesHtml = sitesEnCrise.map(ligne => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #dadce0; color: #3c4043; font-weight: 500;">
        ${ligne[CONFIG_EMAIL.COLONNE_SITE - 1]}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #dadce0; color: #d93025; font-weight: bold;">
        ${ligne[CONFIG_EMAIL.COLONNE_ETAT - 1]}
      </td>
    </tr>
  `).join('');

  // Retourne le template complet en utilisant les littéraux de gabarits (Template Literals)
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
            Cet email a été généré automatiquement par Google Apps Script.
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
  
  try {
    const classeur = SpreadsheetApp.getActiveSpreadsheet();
    const configUtilisateur = recupererConfigurationUtilisateur(classeur);
    const emailCible = configUtilisateur.emailDestinataire || Session.getActiveUser().getEmail();

    const sitesEnCrise = extraireSitesEnCriseDuJour();
    
    // Garde-fou : On n'envoie pas d'email s'il n'y a aucune crise
    if (sitesEnCrise.length === 0) {
      if (interfaceUtilisateur) {
        interfaceUtilisateur.alert(
          "Information", 
          "Aucun site n'est actuellement en état de 'Crise' pour la journée en cours.\nAucun email n'a été envoyé.", 
          interfaceUtilisateur.ButtonSet.OK
        );
      }
      return;
    }
    
    const htmlBody = genererTemplateHtmlGoogle(sitesEnCrise);
    
    // Envoi de l'email via le service MailApp de Google
    MailApp.sendEmail({
      to: emailCible,
      subject: CONFIG_EMAIL.SUJET,
      htmlBody: htmlBody
    });
    
    try {
      SpreadsheetApp.getActiveSpreadsheet().toast(
        `L'email a été envoyé avec succès à ${emailCible}.`, 
        "Rapport envoyé", 
        5
      );
    } catch(e) { }
    
  } catch (erreur) {
    console.error(`Erreur lors de l'envoi de l'email : ${erreur.stack}`);
    if (interfaceUtilisateur) {
      interfaceUtilisateur.alert(
        "Erreur d'exécution", 
        `Impossible d'envoyer l'email :\n\n${erreur.message}`, 
        interfaceUtilisateur.ButtonSet.OK
      );
    }
  }
}