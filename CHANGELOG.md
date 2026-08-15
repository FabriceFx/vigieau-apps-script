# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

## [1.3.0] - 2026-08-15
### Ajouté
- **Alerte sur changement de niveau** (`Transitions.gs`) : un email est expédié dès qu'un site change de niveau de restriction, et uniquement dans ce cas. L'alerte couvre les aggravations (prévenir dès `Alerte renforcée` plutôt qu'une fois la crise installée) comme les levées de restriction (qui conditionnent la reprise des usages). La détection compare l'état mesuré au dernier état archivé dans la BDD : aucun appel supplémentaire à l'API n'est nécessaire.
  - Les aggravations sont classées en tête de l'email, puis par gravité décroissante ; l'en-tête passe au vert lorsque l'actualité ne comporte que des allègements.
  - Un relevé en erreur n'est jamais présenté comme une transition, et les états d'erreur archivés sont ignorés lors de la reconstitution de l'état antérieur : une panne réseau de la veille ne produit donc pas de fausse alerte « Erreur d'API → Crise » le lendemain.
  - Un site relevé pour la première fois n'est signalé qu'à partir du niveau `Alerte` (`CONFIG_APP.SEUIL_NOUVEAU_SITE_POIDS`), pour ne pas noyer la première synchronisation d'un classeur.
  - L'envoi est postérieur à l'archivage et isolé dans son propre `try` : un échec d'expédition ne peut pas faire perdre les relevés.
- **Paramètre `Alerte sur changement`** dans l'onglet `Configuration` (Activé / Désactivé, activé par défaut), avec `assurerParametreConfig` qui ajoute la ligne aux classeurs créés avant son introduction — sans quoi l'option serait restée invisible et non modifiable pour eux.
- Le bilan de synchronisation signale le nombre de changements détectés (clé `BILAN_TRANSITIONS`).
- `poidsDeLEtat` centralise la conversion libellé → gravité ; `estEtatFiable` en dérive désormais.

## [1.2.0] - 2026-08-15
### Corrigé
- **Perte silencieuse de données** : en cas de panne réseau, `executerRequetesAvecRetry` renvoyait un tableau creux dont les indices manquants étaient ignorés par `forEach`. Les sites concernés n'étaient ni écrits dans la BDD, ni signalés — la synchronisation semblait avoir réussi. Le tableau est désormais initialisé avec `fill(null)` et chaque échec est tracé puis reporté dans la colonne État.
- **Faux négatif sur réponse inattendue** : une réponse HTTP 200 au corps non conforme était interprétée comme « Pas de restriction », puis mise en cache 6 heures. `extraireNiveauMax` distingue maintenant un tableau vide (aucune restriction réelle) d'un corps invalide (« Réponse API invalide »), et les états d'erreur ne sont plus mis en cache.
- **Écritures dupliquées** : `synchroniserVigilanceEau` et `envoyerRapportCrise` sont protégées par `LockService`, un lancement manuel pouvant auparavant chevaucher un déclencheur horaire.
- **Collage multi-lignes ignoré** : le déclencheur `onEdit` ne traitait que la première cellule d'un collage ; les lignes suivantes restaient sans coordonnées sans aucun signal. La plage complète est désormais géocodée (au-delà de 25 lignes, l'utilisateur est renvoyé vers le menu pour éviter la limite des 6 minutes).
- **Recalcul GPS dépendant de la langue** : le calcul différentiel comparait les cellules à des messages d'erreur traduits, si bien qu'un classeur rempli en français n'était jamais recalculé par un utilisateur anglophone. La validation porte maintenant sur la forme des coordonnées (`estCoordonneeValide`).
- **Lien Maps dépendant des conventions régionales** : la formule `=HYPERLINK(...; ...)` est remplacée par un lien en texte enrichi (`RichTextValue`), insensible au séparateur d'arguments.
- **Configuration non validée** : les valeurs de l'onglet `Configuration` partaient telles quelles dans l'URL de l'API ou dans `atHour()` (`NaN` en cas de saisie libre). Chaque valeur est validée contre sa liste, l'heure est bornée à 00–23, l'email est contrôlé, et les libellés sont reconnus sans tenir compte de la casse ni des espaces.
- **`.clasp.json`** : `rootDir` pointait vers un dossier absent, ce qui empêchait tout `clasp push`. Remplacé par `"."`.
- **Code mort et lenteur d'initialisation** : suppression de l'appel direct à `Session.getActiveUser()` au chargement du projet dans `Mail.gs`.

### Ajouté
- **Centralisation dans `Config.gs`** : Création d'un module unique `CONFIG_APP` harmonisant les noms d'onglets et les index de colonnes en 1-based pour tout le projet, éliminant les risques d'incohérence entre modules.
- **Scalabilité du géocodage GPS** : `calculerGps()` exécute désormais les requêtes en parallèle par lots (`UrlFetchApp.fetchAll`) avec système de retry et gestion de backoff, permettant de traiter des centaines d'adresses sans risque de dépassement de quota (6 minutes).
- **Initialisation automatique de la BDD** : `initialiserFeuilleBdd` crée et formate automatiquement la feuille `BDD` avec des en-têtes Material Design (bleu `#1a73e8`, texte blanc gras, volets figés) dès la première synchronisation si elle est vierge.
- **Détection des conflits de planification** : avertissement bilingue explicite dans `Planification.gs` si `heureEmail <= heureSync` pour prévenir l'expédition d'un rapport avant la synchronisation (marge de ±15 min des triggers Google).
- **Lectures BDD bornées** : `Cato.gs` et `Mail.gs` limitent désormais la lecture aux N dernières lignes (`MAX_LIGNES_HISTORIQUE_LECTURE`), évitant la saturation mémoire sur les historiques volumineux.
- Le bilan de synchronisation signale explicitement le nombre de sites non récupérés (nouvelles clés `LOCK_BUSY`, `AUTO_TOO_MANY_ROWS`, `BILAN_ERREUR`, `PLANIF_WARNING_SCHEDULE_CONFLICT` dans `Lang.gs`).
- Contrôles d'intégrité (SRI) sur Leaflet, et message explicite si la bibliothèque cartographique ne peut pas être chargée.
- Journalisation détaillée (`console.warn` / `console.error`) des codes HTTP et échecs de géocodage.

### Modifié
- Les lignes écrites dans la BDD respectent fidèlement l'ordre de l'onglet `Sites`, que l'état provienne du cache ou de l'API.
- Les noms de sites et les états sont échappés dans le corps HTML du rapport email.

## [1.1.0] - 2026-07-18
### Ajouté
- Support complet du bilinguisme (Français / Anglais) via le dictionnaire centralisé `Lang.gs`. La langue de l'interface s'adapte automatiquement à la langue du compte Google de l'utilisateur.
- Modale "À propos" accessible depuis le menu Google Sheets.
- Version anglaise complète dans le `README.md`.

### Modifié
- Sécurisation renforcée : Les noms de sites sont désormais systématiquement échappés (anti-XSS) avant d'être injectés dans les templates HTML (carte interactive).
- Respect strict du principe du moindre privilège pour les scopes OAuth. Les permissions ont été limitées dans le `appsscript.json` (spreadsheets, script.external_request, script.locale, script.scriptapp, script.send_mail, userinfo.email, script.container.ui).
- Prévention des dépassements de quotas : Vérification de la limite d'envoi d'emails (`MailApp.getRemainingDailyQuota()`) avant tout envoi de rapport.
