# 💧 Vigieau Tracker (Google Apps Script)

[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google-apps-script&logoColor=white)](#)
[![Vigieau API](https://img.shields.io/badge/API-Vigieau-blue?style=for-the-badge)](#)
[![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)](#)

[🇫🇷 Français](#français) | [🇬🇧 English](#english)

---

## 🇫🇷 Français

**Vigieau Tracker** est une application complète, 100% hébergée sur **Google Sheets & Google Apps Script**, permettant de suivre automatiquement l'état des restrictions d'eau en France pour une flotte de sites (entreprises, collectivités, exploitations agricoles, etc.).

L'outil s'interface avec l'API officielle du gouvernement [Vigieau](https://api.vigieau.beta.gouv.fr/) et avec l'API de géocodage [GeoPF](https://data.geopf.fr/geocodage/search).

### ✨ Fonctionnalités principales

* 📍 **Géocodage magique** : Saisissez une adresse, le script récupère automatiquement les coordonnées GPS en tâche de fond (via Trigger `onEdit`).
* 🔄 **Synchronisation Vigieau** : Interrogation en masse de l'API Vigieau pour connaître le niveau d'alerte sécheresse (Vigilance, Alerte, Alerte renforcée, Crise) de chaque site. 
* 🎨 **Carte interactive premium** : Visualisation HTML/JS (Leaflet) intégrée dans Google Sheets. Design moderne (*Glassmorphism*), filtrage en temps réel et animations CSS (effet pulse radar) sur les sites en crise.
* ✉️ **Rapports automatisés** : Envoi de rapports par email contenant le détail des sites au niveau de restriction maximal (Crise).
* ⚙️ **Tableau de bord et autonomie** : Configuration dynamique depuis le tableur (choix du profil d'entreprise, paramétrage des heures de vérification). Exécution 100% autonome via les déclencheurs (Triggers) Google.

### 🚀 Prérequis et Installation

#### 1. Installation du code

**Méthode 1 : Classique (Copier-Coller)**
Si vous n'êtes pas familier avec les lignes de commande, c'est la méthode la plus simple :
1. Dans votre Google Sheets, allez dans `Extensions` > `Apps Script`.
2. Créez les 7 fichiers de type Script (`.gs`) : `Code.gs`, `VigiEau.gs`, `GPS.gs`, `Cato.gs`, `Mail.gs`, `Planification.gs`, `Lang.gs`.
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

#### 2. Configuration du tableur
Le script va automatiquement créer les onglets nécessaires s'ils sont manquants.
1. Créez un onglet nommé **Sites** avec la structure suivante :
   * Colonne A : `Département`
   * Colonne B : `Adresse`
   * Colonne C : `GPS`
2. Lancez la fonction `onOpen()` pour faire apparaître le menu personnalisé **📍 Géolocalisation & eau** dans Google Sheets.
3. Cliquez sur **2. Récupérer l'état Vigieau (Archivage)** une première fois pour que le script génère l'onglet **Configuration** et l'onglet de destination **BDD**.

#### 3. Activer les automatisations
Depuis le menu personnalisé de Google Sheets :
* **Automatisation du géocodage :** Cliquez sur `⚡ Activer l'automatisation de saisie`.
* **Planifications temporelles :** Remplissez l'onglet `Configuration`, puis cliquez sur `⏳ Appliquer les planifications` pour rendre l'outil 100% autonome (synchronisation quotidienne/hebdomadaire).

---

## 🇬🇧 English

**Vigieau Tracker** is a comprehensive application, 100% hosted on **Google Sheets & Google Apps Script**, allowing you to automatically track the status of water restrictions in France for a fleet of sites (companies, communities, agricultural farms, etc.).

The tool interfaces with the official government API [Vigieau](https://api.vigieau.beta.gouv.fr/) and with the geocoding API [GeoPF](https://data.geopf.fr/geocodage/search).

### ✨ Key Features

* 📍 **Magic Geocoding**: Enter an address, the script automatically retrieves the GPS coordinates in the background (via `onEdit` Trigger).
* 🔄 **Vigieau Synchronization**: Mass querying of the Vigieau API to find out the drought alert level (Vigilance, Alert, Reinforced Alert, Crisis) of each site.
* 🎨 **Premium Interactive Map**: HTML/JS visualization (Leaflet) integrated into Google Sheets. Modern design (*Glassmorphism*), real-time filtering and CSS animations (radar pulse effect) on sites in crisis.
* ✉️ **Automated Reports**: Sending reports by email containing the details of the sites at the maximum restriction level (Crisis).
* ⚙️ **Dashboard and Autonomy**: Dynamic configuration from the spreadsheet (choice of company profile, setting check times). 100% autonomous execution via Google Triggers.

### 🚀 Prerequisites & Installation

#### 1. Code Installation

**Method 1: Classic (Copy-Paste)**
If you are not familiar with command lines, this is the easiest method:
1. In your Google Sheets, go to `Extensions` > `Apps Script`.
2. Create the 7 Script type files (`.gs`): `Code.gs`, `VigiEau.gs`, `GPS.gs`, `Cato.gs`, `Mail.gs`, `Planification.gs`, `Lang.gs`.
3. Create the 2 HTML type files (`.html`): `Carte.html`, `Bilan.html`.
4. Copy-paste the content of each file from this GitHub repository into the corresponding files of your project.
5. Save (`Ctrl+S`).

**Method 2: Advanced (via Clasp)**
You can import this code into your Google Apps Script project using [clasp](https://github.com/google/clasp):
```bash
clasp clone <YOUR_SCRIPT_ID>
# Copy the files from this repo, then:
clasp push
```

#### 2. Spreadsheet Configuration
The script will automatically create the necessary tabs if they are missing.
1. Create a tab named **Sites** with the following structure:
   * Column A: `Département`
   * Column B: `Adresse`
   * Column C: `GPS`
2. Run the `onOpen()` function to bring up the custom menu **📍 Geolocation & water** in Google Sheets.
3. Click on **2. Fetch Vigieau status (Archiving)** for the first time so the script generates the **Configuration** tab and the destination tab **BDD**.

#### 3. Enable Automations
From the custom Google Sheets menu:
* **Geocoding Automation:** Click on `⚡ Enable input automation`.
* **Time Schedules:** Fill out the `Configuration` tab, then click on `⏳ Apply schedules` to make the tool 100% autonomous (daily/weekly synchronization).

---

## 🛠 Technologies
* **Backend:** JavaScript (V8 Google Apps Script), CacheService, Installable Triggers.
* **Frontend:** HTML5, Vanilla CSS, Leaflet.js, Google Apps Script HtmlService.
* **APIs:** 
  * `api.vigieau.beta.gouv.fr/api/zones`
  * `data.geopf.fr/geocodage/search`

## 👨‍💻 Author
Developed by [Fabrice Faucheux](https://faucheux.bzh)

## 📄 License
This project is open-source and freely modifiable. Data comes from French public services.
