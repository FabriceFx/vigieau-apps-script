# Instructions & Règles pour les Agents IA (AGENTS.md)

Ces règles s'appliquent à tout projet Google Apps Script (add-ons Sheets/Docs, scripts autonomes, extensions Chrome liées, webapps GAS), qu'il s'agisse d'un projet neuf ou d'une modification.

---

## 🔒 Sécurité

* **Aucun secret en dur dans le code.** Toute clé API, token ou identifiant est lu/écrit exclusivement via `PropertiesService` (`getUserProperties()` pour un secret propre à l'utilisateur, `getScriptProperties()` pour un secret partagé au niveau du script). Jamais en constante, jamais commité.
* **Exclusion absolue de `.clasp.json` et `.clasprc.json` du suivi Git.** Tout projet clasp/GAS doit disposer d'un `.gitignore` excluant systématiquement `.clasp.json` (qui contient le `scriptId` personnel) et `.clasprc.json` (tokens d'authentification). Ne jamais committer ni pousser ces fichiers sur GitHub afin de protéger les identifiants et de permettre aux tiers de lier leur propre classeur sans conflit de permissions.
* **Échapper systématiquement tout contenu externe inséré dans du HTML.** Dès qu'une variable (saisie utilisateur, réponse d'IA, donnée de feuille) est injectée dans un template HTML (email, dialog, sidebar), elle passe par une fonction d'échappement (`&`, `<`, `>`, `"`). Ne jamais faire d'exception "parce que c'est moi qui saisis la donnée".
* **Champs sensibles masqués côté UI.** Tout champ de type clé API, mot de passe ou token dans une HtmlService doit être en `type="password"`, jamais en `type="text"`.
* **Ne jamais faire confiance uniquement à la validation HTML côté client.** Toute fonction exposée via `google.script.run` doit revalider ses paramètres côté serveur (format, champs requis, bornes), même si le formulaire a déjà `required`/`type="email"`/etc.
* **Pas de secrets dans les logs.** Ne jamais journaliser (`Logger.log`, `console.log`) une clé API, un email personnel, une adresse ou tout contenu de configuration sensible.
* **Préférer les en-têtes aux query strings pour les clés API** quand l'API cible le permet (ex. `x-goog-api-key` plutôt que `?key=...`), pour limiter le risque qu'une clé se retrouve dans des journaux d'exécution.
* **Vérifier les permissions avant toute action destructrice ou d'envoi** (suppression de ligne, envoi d'email, modification de statut) si le classeur/document est susceptible d'être partagé avec d'autres éditeurs.
* **Principe du moindre privilège sur les scopes OAuth.** Dans `appsscript.json`, ne déclarer que les scopes strictement nécessaires (ex. `spreadsheets.currentonly` plutôt que `spreadsheets` si l'accès peut se limiter au classeur courant).
* **Gestion globale des exceptions.** Toute fonction déclenchée par un menu, un `onOpen()` ou un trigger doit être enveloppée dans un `try/catch` qui affiche un message d'erreur clair à l'utilisateur (`SpreadsheetApp.getUi().alert(...)`) plutôt que de planter silencieusement ou d'afficher une stacktrace brute.

---

## 🎨 UI/UX & Esthétique Premium

* **Material Design 3 (MD3) pour les interfaces intégrées.** Les dialogs et sidebars doivent suivre une esthétique MD3 irréprochable : champs "Outlined", typographie *Inter* ou *Roboto*, boutons avec états clairs, pas d'`<input>` ou `ui.prompt` basiques.
* **Toujours un état de chargement visible** pour tout appel `google.script.run` asynchrone — jamais un formulaire ou une liste qui reste vide sans indication pendant le chargement.
* **Feedback explicite après chaque action** (sauvegarde, validation, envoi) : message de succès/échec clair, jamais une fermeture silencieuse de dialog sans confirmation visible.
* **Erreurs précises et actionnables.** Un message d'erreur nomme le champ ou la cause exacte ("Email de contact manquant") plutôt qu'un message générique ("Configuration incomplète").
* **Progression visible sur les flux multi-étapes** : afficher "X / Y" plutôt que de laisser l'utilisateur deviner l'avancement.
* **Dialogs et sidebars responsives.** Prévoir `overflow-y: auto` sur les zones de contenu variable ; ne jamais fixer une hauteur qui coupera du contenu long.
* **Boutons destructifs ou irréversibles désactivés** pendant le traitement, pour éviter les double-clics/doubles envois.
* **Accessibilité (a11y) de base.** Contrastes suffisants, `<label>` associés à chaque champ de formulaire, navigation au clavier.
* **Traductions centralisées.** Le bilinguisme FR/EN d'une interface se fait via un dictionnaire de traduction unique (objet ou fichier de chaînes), jamais en dupliquant des blocs de texte FR et EN dans le code.

---

## ⚙️ Robustesse & Fonctionnalités

* **Gestion de la concurrence avec `LockService`.** Toute synchronisation, écriture de masse ou envoi d'email susceptible de croiser un déclencheur horaire doit être protégé par `LockService.getScriptLock()` avec libération en bloc `finally`.
* **Boucles de génération/traitement résilientes.** Boucle avec plafond de tentatives pour garantir l'atteinte de l'objectif réel plutôt que de subir un échec silencieux.
* **Cohérence entre commentaires/documentation et code réel.**
* **Validation dynamique des données.** Listes déroulantes et règles de saisie étendues dynamiquement, jamais figées sur un nombre de lignes fixe.
* **Distinction des erreurs API.** Distinguer les types d'erreurs (429 rate-limit, 408 timeout, 5xx) et appliquer un retry avec backoff exponentiel.

---

## ⚡ Performance & Quotas Apps Script

* **Lectures/écritures en lot, jamais cellule par cellule.** Utiliser `getValues()`/`setValues()` ou `UrlFetchApp.fetchAll` par lots pour éviter les timeouts (limite des 6 min).
* **Vérification des quotas.** Vérifier `MailApp.getRemainingDailyQuota()` avant tout envoi d'email.
* **Éviter les évaluations coûteuses au chargement global.** Ne jamais exécuter `Session.getActiveUser()`, `SpreadsheetApp.getActiveSpreadsheet()` ou des appels distants dans les déclarations d'objets globaux hors fonctions actives.

---

## 🧪 Qualité de code & Processus

* **Gestion de version avec Clasp et Git.** Le code source est versionné dans Git, `.clasp.json` et `.clasprc.json` sont impérativement ignorés dans `.gitignore`.
* **CHANGELOG.md et README.md bilingues (FR/EN) tenus à jour.**
* **Menu "À propos" systématique.** Mentionne toujours le développeur : **Fabrice Faucheux**, https://faucheux.bzh.
* **Licence explicite (ex. MIT).**

---

## ✅ Checklist avant de committer / publier

- [ ] `.clasp.json` et `.clasprc.json` sont-ils bien exclus via `.gitignore` et absents du suivi Git ?
- [ ] Une variable externe (utilisateur, IA, feuille) est-elle insérée sans échappement dans du HTML ?
- [ ] Une clé, un email ou une donnée sensible apparaît-elle en clair dans un log ou l'UI ?
- [ ] Les commentaires/documentation en tête de fichier correspondent-ils encore au comportement réel ?
- [ ] Le `README.md` bilingue (FR/EN) est-il présent et à jour ?
- [ ] Le menu "À propos" mentionne-t-il bien Fabrice Faucheux et https://faucheux.bzh ?
- [ ] Y a-t-il une boucle `getRange`/`setValue` cellule par cellule qui pourrait être remplacée par un traitement en lot ?
- [ ] Le `CHANGELOG.md` et la licence sont-ils à jour ?
