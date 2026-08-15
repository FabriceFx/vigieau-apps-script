# 💧 Vigieau Tracker (Google Apps Script)

[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google-apps-script&logoColor=white)](#)
[![Vigieau API](https://img.shields.io/badge/API-Vigieau-blue?style=for-the-badge)](#)
[![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[🇫🇷 Français](#-français) | [🇬🇧 English](#-english)

---

## 🇫🇷 Français

### 🎯 Pourquoi Vigieau Tracker ?

Suivre le risque sécheresse sur un parc multi-sites est un casse-tête opérationnel : scruter quotidiennement des dizaines d'arrêtés préfectoraux disparates, décoder des zonages administratifs complexes et risquer une mise en demeure ou une interruption d'activité faute d'avoir réagi à temps lors d'un passage en *Alerte renforcée* ou en *Crise*.

**Vigieau Tracker** transforme cette contrainte réglementaire en un **pilote automatique 100% hébergé sur Google Sheets et Google Apps Script** : chaque adresse est géocodée, chaque restriction d'usage est traduite en consigne d'exploitation concrète et chaque arrêté officiel est accessible en un clic.

L'application s'interface directement avec l'API officielle de l'État [Vigieau](https://api.vigieau.beta.gouv.fr/) et l'API nationale de géocodage [GeoPF (IGN / data.gouv.fr)](https://data.geopf.fr/geocodage/search).

---

### ✨ Fonctionnalités clés

* 📍 **Géocodage haute performance** : 
  * Saisie intuitive : tapez une adresse dans l'onglet `Sites`, le script calcule automatiquement les coordonnées GPS en arrière-plan via un déclencheur `onEdit`.
  * Calcul massif : parallélisation par lots via `UrlFetchApp.fetchAll` pour traiter des centaines de sites en quelques secondes sans risque de timeout.
* 🔄 **Synchronisation & Historique d'archivage (BDD)** :
  * Relevé automatique des niveaux de gravité (*Vigilance*, *Alerte*, *Alerte renforcée*, *Crise*).
  * Journal chronologique *append-only* horodaté avec liens Google Maps dynamiques en texte enrichi (indépendants des formats régionaux).
* 💧 **Ressources et profil déclarés par site** :
  * Chaque site déclare les ressources sur lesquelles il prélève (`AEP` réseau, `SOU` souterraine, `SUP` superficielle) : un site industriel combine couramment réseau et forage, dont les restrictions diffèrent.
  * Un relevé par ressource, le niveau le plus contraignant étant retenu. L'onglet `Configuration` ne fournit plus que les valeurs par défaut.
  * Si une ressource ne répond pas, le relevé est marqué partiel et exclu du différentiel : une donnée manquante ne peut pas passer pour un allègement.
* 📜 **Instantané des restrictions d'usages & Arrêtés officiels** :
  * L'onglet **Restrictions** détaille avec précision ce qui est interdit ou restreint (arrosage, lavage, process, remplissage).
  * Filtrage automatique selon votre profil métier configuré (*Entreprise*, *Collectivité*, *Exploitant agricole*, *Particulier*).
  * Liens directs vers les documents PDF officiels de l'arrêté préfectoral et de l'arrêté cadre.
* 🚨 **Détection proactive des transitions de niveau** :
  * Notification par email envoyée **dès qu'un changement de niveau survient** sur un site (aggravation ou levée de restriction).
  * Email dynamique Material Design avec en-tête contextuel (rouge en cas d'escalade, vert en cas d'allègement), flèches d'évolution (`↑` / `↓`) et lien direct vers l'arrêté.
  * Zéro faux positif : les pannes de réseau ou erreurs d'API temporaires sont exclues du différentiel.
* ✉️ **Rapports de crise planifiés** :
  * Expédition automatique d'un rapport consolidé listant l'ensemble des sites au niveau maximal de *Crise*.
* 🗺️ **Carte interactive Leaflet (*Glassmorphism*)** :
  * Modale plein écran intégrée à Google Sheets avec fond cartographique OpenStreetMap.
  * Filtrage instantané par niveau de restriction et animations CSS (pulsation radar sur les sites en crise).
* ⚙️ **Concurrence & Autonomie totale** :
  * Verrouillage anti-doublons via `LockService`.
  * Détection préventive des conflits d'horaires entre synchronisation et expédition d'emails (marge de ±15 min des triggers Google).
  * Bilinguisme natif (Français / Anglais) adaptatif.

---

### 📂 Organisation du classeur

| Onglet | Rôle | Mode de mise à jour |
| :--- | :--- | :--- |
| **`Sites`** | Répertoire de votre flotte (Département, Adresse, Coordonnées GPS). | Manuel / Saisie automatique |
| **`BDD`** | Journal d'archivage chronologique de toutes les mesures historiques. | Ajout continu (*Append-only*) |
| **`Restrictions`** | Synthèse des règles d'usages en vigueur aujourd'hui et arrêtés PDF. | Instantané réécrit (*Snapshot*) |
| **`Configuration`** | Paramètres personnalisables (Profil, Type de zone, Fréquences, Email). | Administrateur |

---

### 🚀 Installation et déploiement

#### Méthode 1 : Déploiement rapide via Clasp (Recommandée)
```bash
# 1. Cloner le projet Apps Script
clasp clone <VOTRE_SCRIPT_ID>

# 2. Synchroniser les fichiers de ce dépôt
clasp push
```

#### Méthode 2 : Installation manuelle (Copier-Coller)
1. Dans votre Google Sheets, rendez-vous dans **Extensions** > **Apps Script**.
2. Dans les paramètres du projet (icône roue dentée), cochez **"Afficher le fichier manifeste 'appsscript.json' dans l'éditeur"**.
3. Copiez le contenu de `appsscript.json` pour configurer les autorisations de sécurité minimales.
4. Créez les **11 fichiers Script (`.gs`)** :
   - `Config.gs`, `Code.gs`, `Initialisation.gs`, `VigiEau.gs`, `GPS.gs`, `Restrictions.gs`, `Transitions.gs`, `Cato.gs`, `Mail.gs`, `Planification.gs`, `Lang.gs`.
5. Créez les **3 fichiers HTML (`.html`)** :
   - `Carte.html`, `Bilan.html`, `Aide.html`.
6. Collez-y le code correspondant issu de ce dépôt et enregistrez (`Ctrl + S` / `Cmd + S`).

---

### 📋 Guide de démarrage rapide

1. Rechargez le classeur (ou exécutez `onOpen()`) pour faire apparaître le menu **📍 Géolocalisation & eau**.
2. Cliquez sur **`🚀 Configurer le classeur`** : les onglets `Sites`, `BDD`, `Restrictions` et `Configuration` sont créés et mis en forme, et la feuille vierge par défaut est retirée si elle est vide. L'onglet `Sites` a alors la structure suivante :
   - Colonne A : `Département`
   - Colonne B : `Adresse`
   - Colonne C : `GPS`
   - Colonne D : `Ressources` *(facultatif)* — ressources prélevées, séparées par une virgule : `AEP`, `SOU`, `SUP`. Vide = valeur par défaut de l'onglet `Configuration`.
   - Colonne E : `Profil` *(facultatif)* — `particulier`, `entreprise`, `collectivite` ou `agriculteur`. Vide = valeur par défaut.
3. Renseignez vos adresses postales en Colonne B.
4. Cliquez sur **`1. Calculer les données géographiques`** pour renseigner automatiquement les coordonnées GPS.
5. Cliquez sur **`2. Récupérer l'état Vigieau (Archivage)`** pour archiver les niveaux et relever les restrictions en vigueur.
6. Ajustez vos préférences dans l'onglet `Configuration`, puis cliquez sur **`⏳ Appliquer les planifications`** pour rendre le suivi 100% autonome.

> 💡 Le menu **`❓ Comment ça marche`** ouvre une fenêtre détaillant le rôle de chaque onglet et le fonctionnement des alertes.

---

## 🇬🇧 English

### 🎯 Why Vigieau Tracker?

Monitoring drought risk across multiple facilities is an operational burden: sifting through dozens of prefectural decrees, decoding fragmented administrative zoning, and risking regulatory fines or forced operational shutdowns due to delayed responses during *Alert* or *Crisis* escalations.

**Vigieau Tracker** turns this regulatory burden into an **automated compliance engine 100% hosted on Google Sheets and Google Apps Script**: every address is geocoded, every usage restriction is translated into actionable operational guidelines, and every legal order is accessible in one click.

The application interfaces directly with the official French Government API [Vigieau](https://api.vigieau.beta.gouv.fr/) and the national geocoding API [GeoPF (IGN / data.gouv.fr)](https://data.geopf.fr/geocodage/search).

---

### ✨ Key Features

* 📍 **High-Performance Geocoding**:
  * Seamless on-the-fly calculation: enter an address in the `Sites` tab, GPS coordinates are calculated in the background via an `onEdit` trigger.
  * Mass batch processing: parallel execution via `UrlFetchApp.fetchAll` to process hundreds of locations in seconds without timeouts.
* 🔄 **Synchronization & Immutable Archiving (BDD)**:
  * Automatic retrieval of drought restriction levels (*Vigilance*, *Alert*, *Reinforced Alert*, *Crisis*).
  * Chronological *append-only* audit log with locale-agnostic Google Maps rich text links.
* 💧 **Per-Site Resources & Profile**:
  * Each site declares the resources it draws from (`AEP` mains, `SOU` groundwater, `SUP` surface water): an industrial site commonly combines mains supply and a borehole, whose restrictions differ.
  * One reading per resource, keeping the most restrictive level. The `Configuration` tab now only provides default values.
  * If a resource fails to respond, the reading is flagged as partial and excluded from the differential: missing data can never look like an easing of restrictions.
* 📜 **Live Restrictions Snapshot & Official Decrees**:
  * The **Restrictions** tab outlines exactly what is restricted or prohibited (watering, cleaning, manufacturing, filling).
  * Filtered by profile (*Company*, *Local Authority*, *Farmer*, *Individual*).
  * Direct links to official PDF prefectural orders and framework decrees.
* 🚨 **Proactive Level Transition Alerts**:
  * Real-time email notifications **as soon as a site's restriction level changes** (tightening or lifting).
  * Modern Material Design email layout with adaptive styling (crimson for escalations, forest green for easings), directional indicators (`↑` / `↓`), and direct links to decrees.
  * Zero false positives: network outages or temporary API glitches are filtered out.
* ✉️ **Scheduled Crisis Reports**:
  * Automated delivery of consolidated reports listing all facilities currently at maximum *Crisis* level.
* 🗺️ **Interactive Leaflet Map (*Glassmorphism*)**:
  * Embedded full-screen modal in Google Sheets powered by OpenStreetMap and Leaflet.js.
  * Real-time level filtering and CSS radar pulse animations highlighting crisis areas.
* ⚙️ **Concurrency & Autonomy**:
  * Concurrency locking powered by `LockService`.
  * Preventive schedule conflict detection (accounting for Google's ±15 min trigger window).
  * Full native bilingual support (French / English).

---

### 📂 Spreadsheet Structure

| Sheet | Role | Update Mechanism |
| :--- | :--- | :--- |
| **`Sites`** | Directory of your locations (Department, Address, GPS coordinates). | Manual / Automated on-edit |
| **`BDD`** | Chronological historical audit log of all synchronization runs. | Continuous *Append-only* |
| **`Restrictions`** | Snapshot of current restricted uses and official PDF decree links. | Replaced *Snapshot* |
| **`Configuration`** | User-defined parameters (Profile, Zone type, Schedules, Target email). | Administrator |

---

### 🚀 Installation & Setup

#### Method 1: Fast deployment via Clasp (Recommended)
```bash
# 1. Clone your Apps Script project
clasp clone <YOUR_SCRIPT_ID>

# 2. Push repository files
clasp push
```

#### Method 2: Manual Installation (Copy & Paste)
1. In Google Sheets, open **Extensions** > **Apps Script**.
2. In Project Settings (gear icon), check **"Show 'appsscript.json' manifest file in editor"**.
3. Paste the contents of `appsscript.json` to configure the required OAuth permissions.
4. Create the **11 Script files (`.gs`)**:
   - `Config.gs`, `Code.gs`, `Initialisation.gs`, `VigiEau.gs`, `GPS.gs`, `Restrictions.gs`, `Transitions.gs`, `Cato.gs`, `Mail.gs`, `Planification.gs`, `Lang.gs`.
5. Create the **3 HTML files (`.html`)**:
   - `Carte.html`, `Bilan.html`, `Aide.html`.
6. Paste the respective code and save (`Ctrl + S` / `Cmd + S`).

---

### 📋 Quickstart

1. Reload the spreadsheet (or run `onOpen()`) to display the **📍 Géolocalisation & eau** menu.
2. Click **`🚀 Configurer le classeur`**: the `Sites`, `BDD`, `Restrictions` and `Configuration` tabs are created and formatted, and the default blank sheet is removed if empty. The `Sites` tab then has the following structure:
   - Column A: `Département`
   - Column B: `Adresse`
   - Column C: `GPS`
   - Column D: `Ressources` *(optional)* — resources drawn from, comma-separated: `AEP`, `SOU`, `SUP`. Empty = default value from the `Configuration` tab.
   - Column E: `Profil` *(optional)* — `particulier`, `entreprise`, `collectivite` or `agriculteur`. Empty = default value.
3. Add your postal addresses in Column B.
4. Click **`1. Calculer les données géographiques`** to geocode all addresses.
5. Click **`2. Récupérer l'état Vigieau (Archivage)`** to archive the levels and collect the restrictions in force.
6. Configure your preferences in `Configuration` and click **`⏳ Appliquer les planifications`** to activate autonomous background tracking.

> 💡 The **`❓ Comment ça marche`** menu opens a window detailing the role of each tab and how alerts work.

---

## 🛠 Technologies & Architecture

* **Runtime:** JavaScript V8 Google Apps Script.
* **Services Google:** `SpreadsheetApp`, `UrlFetchApp` (Batching), `CacheService`, `LockService`, `MailApp`, `HtmlService`.
* **Frontend:** HTML5, CSS3 Glassmorphism, Leaflet.js, OpenStreetMap.
* **External APIs:**
  * Vigieau Zones & Restrictions API (`api.vigieau.beta.gouv.fr/api/zones`)
  * French National Geocoding API (`data.geopf.fr/geocodage/search`)

---

## 👨‍💻 Auteur / Author

Développé avec passion par **[Fabrice Faucheux](https://faucheux.bzh)**.

---

## 📄 Licence / License

Ce projet est distribué sous licence libre **MIT**. Les données environnementales proviennent des services publics de l'État français.
