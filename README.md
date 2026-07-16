# 💧 Vigieau Tracker (Google Apps Script)

[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google-apps-script&logoColor=white)](#)
[![Vigieau API](https://img.shields.io/badge/API-Vigieau-blue?style=for-the-badge)](#)
[![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)](#)

**Vigieau Tracker** est une application complète, 100% hébergée sur **Google Sheets & Google Apps Script**, permettant de suivre automatiquement l'état des restrictions d'eau en France pour une flotte de sites (entreprises, collectivités, exploitations agricoles, etc.).

L'outil s'interface avec l'API officielle du gouvernement [Vigieau](https://api.vigieau.beta.gouv.fr/) et avec l'API de géocodage [GeoPF](https://data.geopf.fr/geocodage/search).

## ✨ Fonctionnalités principales

* 📍 **Géocodage magique** : Saisissez une adresse, le script récupère automatiquement les coordonnées GPS en tâche de fond (via Trigger `onEdit`).
* 🔄 **Synchronisation Vigieau** : Interrogation en masse de l'API Vigieau pour connaître le niveau d'alerte sécheresse (Vigilance, Alerte, Alerte renforcée, Crise) de chaque site. 
* 🎨 **Carte interactive premium** : Visualisation HTML/JS (Leaflet) intégrée dans Google Sheets. Design moderne (*Glassmorphism*), filtrage en temps réel et animations CSS (effet pulse radar) sur les sites en crise.
* ✉️ **Rapports automatisés** : Envoi de rapports par email contenant le détail des sites au niveau de restriction maximal (Crise).
* ⚙️ **Tableau de bord et autonomie** : Configuration dynamique depuis le tableur (choix du profil d'entreprise, paramétrage des heures de vérification). Exécution 100% autonome via les déclencheurs (Triggers) Google.

## 🚀 Installation & utilisation

### 1. Installation du code

**Méthode 1 : Classique (Copier-Coller)**
Si vous n'êtes pas familier avec les lignes de commande, c'est la méthode la plus simple :
1. Dans votre Google Sheets, allez dans `Extensions` > `Apps Script`.
2. Créez les 6 fichiers de type Script (`.gs`) : `Code.gs`, `VigiEau.gs`, `GPS.gs`, `Cato.gs`, `Mail.gs`, `Planification.gs`.
3. Créez les 2 fichiers de type HTML (`.html`) : `Carte.html`, `Bilan.html`.
4. Copiez-collez le contenu de chaque fichier de ce répertoire GitHub dans les fichiers correspondants de votre projet.
5. Sauvegardez (`Ctrl+S`).

**Méthode 2 : Avancée (via Clasp)**
Vous pouvez importer ce code dans votre projet Google Apps Script en utilisant [clasp](https://github.com/google/clasp) :
```bash
clasp clone <VOTRE_SCRIPT_ID>
# Copiez les fichiers de ce repo, puis :
clasp push
```

### 2. Configuration du tableur
Le script va automatiquement créer les onglets nécessaires s'ils sont manquants.
1. Créez un onglet nommé **Sites** avec la structure suivante :
   * Colonne A : `Département`
   * Colonne B : `Adresse`
   * Colonne C : `GPS`
2. Lancez la fonction `onOpen()` pour faire apparaître le menu personnalisé **📍 Géolocalisation & Eau** dans Google Sheets.
3. Cliquez sur **2. Récupérer l'état Vigieau (Archivage)** une première fois pour que le script génère l'onglet **Configuration** et l'onglet de destination **BDD**.

### 3. Activer les automatisations
Depuis le menu personnalisé de Google Sheets :
* **Automatisation du géocodage :** Cliquez sur `⚡ Activer l'automatisation de saisie`.
* **Planifications temporelles :** Remplissez l'onglet `Configuration`, puis cliquez sur `⏳ Appliquer les planifications` pour rendre l'outil 100% autonome (synchronisation quotidienne/hebdomadaire).

## 🛠 Technologies utilisées
* **Backend :** JavaScript (V8 Google Apps Script), CacheService, Triggers installables.
* **Frontend :** HTML5, Vanilla CSS, Leaflet.js, Google Apps Script HtmlService.
* **APIs :** 
  * `api.vigieau.beta.gouv.fr/api/zones`
  * `data.geopf.fr/geocodage/search`

## 👨‍💻 Auteur
Développé par [Fabrice Faucheux](https://faucheux.bzh)

## 📄 Licence
Ce projet est open-source et modifiable librement. Les données proviennent des services publics français.
