<div align="center">
  <h1> KitaGuard - Your Personal AI Scam Defender</h1>
  <img src="extension/icon.png" alt="KitaGuard Logo" width="150"/>
  <br><br>
  
  [![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
![Python](https://img.shields.io/badge/Python%20|%203.9+-3776AB?logo=python&logoColor=white)  ![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-4285F4?logo=googlechrome&logoColor=white)
  ![HTML](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
  ![CSS](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
  ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

</div>

---

## 1. Repository Overview & Team Introduction

**KitaGuard** is a browser extension and backend service designed to protect users from online scams, phishing attempts, and fraudulent URLs.  

**Team Members:**  
- **Choo Tian Long** – Frontend & Backend Integration
- **Lee Jia Quan** - Frontend & Backend Integration
- **Tan Hong Ye** - Documentation Specialist
- **Wang Kok Ming** - Documentation Specialist

*Built Specifically for KitaHack 2026*  

---

## 2. Project Overview

### Problem Statement
In Malaysia, online fraud is a rapidly growing national problem. Over 67,000 online crime cases were reported in the country in 2025 alone, resulting in massive financial losses exceeding RM 2.7 billion. Cybercriminals are using complex social engineering techniques on SMS, WhatsApp and Telegram, targeting everything from young adults caught in e-commerce fraud to retirees targeted by fraudulent investment schemes.

### SDG Alignment

|[![SDG 9](https://img.shields.io/badge/SDG_9-Industry,_Innovation_&_Infrastructure-FD6925?style=for-the-badge)](https://sdgs.un.org/goals/goal9)|
| :-- |
|Building resilient digital infrastructure through advanced AI, multimodal OCR and automated threat detection.|

|[![SDG 16](https://img.shields.io/badge/SDG_16-Peace,_Justice_&_Strong_Institutions-00689D?style=for-the-badge)](https://sdgs.un.org/goals/goal16)|
| :-- |
|Combats cybercrime, fraud and the spread of malicious disinformation to protect citizens and their financial well-being.|

### Short Description of the Solution
KitaGuard uses Google's Gemini 1.5 Multimodal AI and OSINT APIs to instantly analyze suspicious links, phone numbers and scam posters. With seamless drag-and-drop capabilities and context-menu integration, KitaGuard provides instant, traffic-light verdicts (SAFE, SUSPICIOUS, DANGER) without interrupting your web browsing experience.

---

## 3. Key Features

| Feature | Description |
| :--- | :--- |
| 🖼️ **Multimodal Scam Detection** | Upload, paste, or drag-and-drop scam posters for AI-powered OCR (Optical Character Recognition) and visual manipulation detection. |
| 🌐 **Real-Time Domain Intelligence** | Built-in protection against typosquatting (e.g., fake bank domains rnaybank2u.com) backed by VirusTotal scanning. |
| 🏛️ **Official Database Cross-Referencing** | Automatically queries the Sebenarnya.my registry and official .gov.my databases. |
| 🔍 **Passive Web Scanning** | Automatically highlights suspicious Malaysian phone numbers (01x/0x) on webpages for one-click verification. |
| 👥 **Community-Driven Reporting** | Users can flag missed scams, which instantly updates a global, real-time database to protect other users. |
| 🖱️ **Seamless Browser Integration** | Right-click any image, link, or text to "Scan with KitaGuard" via the Chrome context menu. |

---

## 4. Overview of Technologies used

### ☁️ Google Cloud Technologies (Core Infrastructure & AI)

| Technology | Purpose |
| :--- | :--- |
| [![Gemini API](https://img.shields.io/badge/Gemini%201.5%20Flash-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)](https://ai.google.dev/) <br>**Google Gemini 1.5 Flash** | Powers the core reasoning, OCR extraction, and multilingual (Malay/English) contextual analysis. |
| [![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com) <br>**Google Cloud Vertex AI** | Custom search engine utilized to index and query official government data stores. |
| [![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)](https://firebase.google.com/) <br>**Firebase Firestore Database** | A scalable NoSQL cloud database managing real-time community scam reports and threat counters. |
| [![VirusTotal](https://img.shields.io/badge/VirusTotal-3949AB?style=for-the-badge&logo=virustotal&logoColor=white)](https://www.virustotal.com/) <br>**VirusTotal API (Google Cloud Security)** | Provides enterprise-grade, real-time URL and domain scanning to detect typosquatting and malicious links. |

### 🛠️ Supporting Tools & Libraries

| Technology | Purpose |
| :--- | :--- |
| [![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)](https://www.python.org/) [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/) <br>**Backend Engine** | High-performance asynchronous API layer handling core business logic, routing and external integrations. |
| [![Uvicorn](https://img.shields.io/badge/Uvicorn-499848?style=for-the-badge&logo=gunicorn&logoColor=white)](https://www.uvicorn.org/) <br>**API Infrastructure & Security** | Powered by **Uvicorn** (ASGI server) for deployment, **SlowAPI** for rate-limiting to prevent abuse and **python-dotenv** for secure environment configurations. |
| [![BeautifulSoup](https://img.shields.io/badge/BeautifulSoup-2B5B84?style=for-the-badge&logo=python&logoColor=white)](https://www.crummy.com/software/BeautifulSoup/) [![Pillow](https://img.shields.io/badge/Pillow-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python-pillow.org/) <br>**Data Extraction & Processing** | Utilizes **BeautifulSoup4** for web scraping, **Pillow** for image processing and OCR preparation and **RapidFuzz** for fuzzy string matching. |
| [![Chrome Extension](https://img.shields.io/badge/Chrome_Extension-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://developer.chrome.com/docs/extensions/) <br>**Google Chrome Extension API (Manifest V3)** | The native browser framework powering our frontend interface and real-time execution. |
| [![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)](https://developer.mozilla.org/en-US/docs/Web/JavaScript) [![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)](https://en.wikipedia.org/wiki/HTML5) [![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)](https://en.wikipedia.org/wiki/CSS3) <br>**Frontend & Extension UI** | Standard web stack utilized for rendering the extension popup, responsive layouts and interactive dashboard elements. |

---

## 5. Implementation Details & Innovation

### System Architecture


### Workflow

---

## 6. Challenges Faced

- **Handling Asynchronous OSINT Bottlenecks** <br>Scraping live government sites (like Sebenarnya.my) occasionally resulted in timeout errors. We overcame this by implementing strict 5-second connection timeouts and graceful try-except fallbacks, ensuring that if one OSINT layer fails, Vertex AI and Gemini can still deliver a highly accurate verdict.
- **Upgrading from Custom Search API to Enterprise Vertex AI** <br>Initially, we utilized the standard Google Custom Search API to cross-reference user queries with the web. However, we quickly realized Google Custom Search JSON API is closed to new customers. We made the  decision to pivot to **Google Cloud Vertex AI Search** to build a custom Data Store strictly indexing official `*.gov.my` and `sebenarnya.my` domains.

---

## 7. Installation & Setup

### 🔐 API Configuration

#### Create the `.env` file:
Inside the `backend/` folder, create a file named exactly `.env` and add the following keys:
```ini
# --- KITAGUARD API CONFIGURATION ---
# Replace the placeholder text below with your actual API keys.
# DO NOT share your real .env file or upload it to GitHub.

# 1. Google Vertex AI Search (For checking official government sites)
GOOGLE_CLOUD_PROJECT_ID=paste_your_google_cloud_project_id_here
DATA_STORE_ID=paste_your_datastore_id_here

# 2. Google Gemini (The AI Brain)
GEMINI_API_KEY=paste_your_gemini_api_key_here

# 3. VirusTotal (For scanning global malware threats)
VIRUSTOTAL_API_KEY=paste_your_virustotal_api_key_here

```

#### 🔑 How to obtain your API Keys & Credentials?

To run KitaGuard locally, you will need to set up free accounts for Google Cloud, Google AI Studio, and VirusTotal. Follow these steps to generate your keys:

**Step 1: Get the Google Gemini API Key**
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. On the left sidebar, click **Get API key**.
4. Click the **Create API key** button.
5. In the dialog box, you can either select an existing Google Cloud project from the search bar and click **Create key**.
6. Copy this key. You will paste this as your `GEMINI_API_KEY`.

**Step 2: Get the VirusTotal API Key**
1. Go to [VirusTotal](https://www.virustotal.com/) and create a free account.
2. Once logged in, click your profile picture in the top right corner.
3. Select **API key** from the dropdown menu.
4. Copy the alphanumeric string provided. You will paste this as your `VIRUSTOTAL_API_KEY`.

**Step 3: Get Firebase Credentials (`firebase_credentials.json`)**
1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **Create a new Firebase project** (or open an existing one).
2. In the left-hand sidebar, expand the "Build" menu, select **Firestore Database**, and click **Create database** to initialize and enable it.
3. In the setup menu, select the **Standard edition** and set your location to **asia-southeast1 (Singapore)**
4. Choose to **Start in test mode** and click **Create** to finish enabling the database. (Note: Test mode allows open reads and writes for 30 days)
5. Once the database setup is complete, click the **Gear Icon** ⚙️ next to "Project Overview" in the top left sidebar and select **Project settings**.
6. Navigate to the **Service accounts** tab.
7. Scroll down to the "Admin SDK configuration snippet", select `Python` and click the **Generate new private key** button.
8. This will download a `.json` file to your computer. Remember to rename this file to exactly **`firebase_credentials.json`** and move it inside your `backend/` folder.

**Step 4: Get Vertex AI Search Credentials (`vertex_credentials.json`)**

**Part A: Project ID & Data Store ID**

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Your **Google Cloud Project ID** is listed on your dashboard (e.g., `my-project-12345`). Save this as your `GOOGLE_CLOUD_PROJECT_ID`.
3. In the top search bar, search for **Agent Builder** and go for **Vertex AI Search** in the top search bar.
4. Click `Create` for **Custom search (general)**
5. In the configuration menu, tick **Enterprise edition features** and **Advanced LLM features** (or Generative features). Enter your app name, company name and choose **global (Global)** as your location. Click **Continue**.
6. Click **Data Stores** in the left menu, then **Create Data Store**.
7. Select **Website Content** and add `*.gov.my/*`, `*.sebenarnya.my/`, `*.pdrm.gov.my/*` and `*.bnm.gov.my/*`. Keep advanced indexing disabled for standard pricing, and name the data store `Malaysian-Official-Sources`.
9. Once created with **General pricing**, click on your new Data Store. You will find the **Data Store ID** on the configuration page. Save this as your `DATA_STORE_ID`.

**Part B: The JSON Key**

1. In the Google Cloud Console, search for **Service Accounts** (under IAM & Admin).
2. Click **Create service account**, name it `kitaguard-vertex-search`, and click **Create and Continue**.
3. Under **Permissions (optional)**, select the role: **Discovery Engine Viewer**. Click Continue. Skip **Principals with access (optional)**
4. Click on your newly created Service Account, navigate to the **Keys** tab.
5. Click **Add Key** -> **Create new key** -> select **JSON** and click Create.
6. Rename the downloaded file to exactly **`vertex_credentials.json`** and place it inside your `backend/` folder.

---

#### Add the JSON Credential Files:
You must place two specific Google Service Account files directly into your `backend/` folder alongside `main.py`:
* `firebase_credentials.json` (For connecting to the Firestore database).
* `vertex_credentials.json` (For authenticating the Vertex AI Search engine).

> [!IMPORTANT]
> Never upload your `.env` or `.json` credential files to GitHub! Make sure they are listed in your `.gitignore` file.

### ⚙️ Backend Setup

Ensure you have Python installed (Python 3.9+ recommended). Open your terminal and run the following commands:
```bash
# 1. Navigate to the backend folder
cd backend

# 2. (Optional but Recommended) Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the FastAPI server
python -m uvicorn main:app --reload

```

### 🧩 Extension Installation

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** in the top right corner.
3. Click **Load unpacked** and select the `extension/` directory of this repository.
4. Pin KitaGuard to your toolbar and start scanning!

---

## 8. Future Roadmap

- **WhatsApp Companion Bot:** Porting the FastAPI backend to interface with WhatsApp for mobile-first users who do not use desktop browsers.
- **Voice Scam Detector:** Analyze real-time phone calls or voice messages using speech-to-text and LLMs to detect AI-generated voice cloning and deepfakes.
- **On-Device Machine Learning:** Integrating a lightweight TensorFlow.js model directly into the Chrome Extension to detect basic phishing keywords offline.
- **Automated MCMC Reporting:** A feature to automatically package and forward high-confidence danger alerts directly to the relevant Malaysian authorities.
