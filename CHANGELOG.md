# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

## [1.1.0] - 2026-07-18
### Ajouté
- Support complet du bilinguisme (Français / Anglais) via le dictionnaire centralisé `Lang.gs`. La langue de l'interface s'adapte automatiquement à la langue du compte Google de l'utilisateur.
- Modale "À propos" accessible depuis le menu Google Sheets.
- Version anglaise complète dans le `README.md`.

### Modifié
- Sécurisation renforcée : Les noms de sites sont désormais systématiquement échappés (anti-XSS) avant d'être injectés dans les templates HTML (carte interactive).
- Respect strict du principe du moindre privilège pour les scopes OAuth. Les permissions ont été limitées dans le `appsscript.json` (spreadsheets, script.external_request, script.locale, script.scriptapp, script.send_mail, userinfo.email, script.container.ui).
- Prévention des dépassements de quotas : Vérification de la limite d'envoi d'emails (`MailApp.getRemainingDailyQuota()`) avant tout envoi de rapport.
