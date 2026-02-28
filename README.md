<div align="center">
  <h2> KitaGuard - Your Personal AI Scam Defender</h2>
  <img src="extension/icon.png" alt="KitaGuard Logo" width="150"/>
  <br><br>
  
  [![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
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
- **SDG 9 (Industry, Innovation & Infrastructure)**
  <br>Building resilient digital infrastructure through advanced AI, multimodal OCR and automated threat detection.
- **SDG 16 (Peace, Justice & Strong Institutions)**
  <br>Combats cybercrime, fraud and the spread of malicious disinformation to protect citizens and their financial well-being.

### Short Description of the Solution
KitaGuard uses Google's Gemini 1.5 Multimodal AI and OSINT APIs to instantly analyze suspicious links, phone numbers and scam posters. With seamless drag-and-drop capabilities and context-menu integration, KitaGuard provides instant, traffic-light verdicts (SAFE, CAUTION, DANGER) without interrupting your web browsing experience.

---

## 3. Key Features

- **Multimodal Scam Detection:** Upload, paste, or drag-and-drop scam posters for AI-powered OCR (Optical Character Recognition) and visual manipulation detection.
- **Real-Time Domain Intelligence:** Built-in protection against typosquatting (e.g., fake bank domains) backed by VirusTotal scanning.
- **Official Database Cross-Referencing:** Automatically queries the `Sebenarnya.my` registry and official `.gov.my` databases.
- **Passive Web Scanning:** Automatically highlights suspicious Malaysian phone numbers (01x/0x) on webpages for one-click verification.
- **Community-Driven Reporting:** Users can flag missed scams, which instantly updates a global, real-time database to protect other users.
- **Seamless Browser Integration:** Right-click any image, link, or text to "Scan with KitaGuard" via the Chrome context menu.

## 4. Overview of Technologies used

### ☁️ Google Cloud Technologies (Core Infrastructure & AI)

| Technology | Purpose |
| :--- | :--- |
| [![Gemini API](https://img.shields.io/badge/Gemini%201.5%20Flash-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)](https://ai.google.dev/) <br>**Google Gemini 1.5 Flash** | Powers the core reasoning, OCR extraction, and multilingual (Malay/English) contextual analysis. |
| [![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com) <br>**Google Cloud Vertex AI** | Custom search engine utilized to index and query official government data stores. |
| [![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)](https://firebase.google.com/) <br>**Firebase Firestore** | A scalable NoSQL cloud database managing real-time community scam reports and threat counters. |
| [![VirusTotal](https://img.shields.io/badge/VirusTotal-3949AB?style=for-the-badge&logo=virustotal&logoColor=white)](https://www.virustotal.com/) <br>**VirusTotal API (Google Cloud Security)** | Provides enterprise-grade, real-time URL and domain scanning to detect typosquatting and malicious links. |

### 🛠️ Supporting Tools & Libraries

| Technology | Purpose |
| :--- | :--- |
| [![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)](https://www.python.org/) [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/) <br>**Backend Engine** | High-performance asynchronous API layer handling core business logic, routing and external integrations. |
| [![Uvicorn](https://img.shields.io/badge/Uvicorn-499848?style=for-the-badge&logo=gunicorn&logoColor=white)](https://www.uvicorn.org/) <br>**API Infrastructure & Security** | Powered by **Uvicorn** (ASGI server) for deployment, **SlowAPI** for rate-limiting to prevent abuse and **python-dotenv** for secure environment configurations. |
| [![BeautifulSoup](https://img.shields.io/badge/BeautifulSoup-2B5B84?style=for-the-badge&logo=python&logoColor=white)](https://www.crummy.com/software/BeautifulSoup/) [![Pillow](https://img.shields.io/badge/Pillow-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python-pillow.org/) <br>**Data Extraction & Processing** | Utilizes **BeautifulSoup4** for web scraping, **Pillow** for image processing and OCR preparation and **RapidFuzz** for fuzzy string matching. |
| [![Chrome Extension](https://img.shields.io/badge/Chrome_Extension-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://developer.chrome.com/docs/extensions/) <br>**Google Chrome Extension API (Manifest V3)** | The native browser framework powering our frontend interface and real-time execution. |
| [![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)](https://developer.mozilla.org/en-US/docs/Web/JavaScript) [![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)](https://en.wikipedia.org/wiki/HTML5) [![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)](https://en.wikipedia.org/wiki/CSS3) <br>**Frontend & Extension UI** | Standard web stack utilized for rendering the extension popup, responsive layouts and interactive dashboard elements. |

## 5. Implementation Details & Innovation

### System Architecture

### Workflow

## 6. Challenges Faced

- **Handling Asynchronous OSINT Bottlenecks** <br>Scraping live government sites (like Sebenarnya.my) occasionally resulted in timeout errors. We overcame this by implementing strict 5-second connection timeouts and graceful try-except fallbacks, ensuring that if one OSINT layer fails, Vertex AI and Gemini can still deliver a highly accurate verdict.
- **Upgrading from Custom Search API to Enterprise Vertex AI:** Initially, we utilized the standard Google Custom Search API to cross-reference user queries with the web. However, we quickly realized Google Custom Search JSON API is closed to new customers. We made the  decision to pivot to **Google Cloud Vertex AI Search** to build a custom Data Store strictly indexing official `*.gov.my` and `sebenarnya.my` domains.

## 7. Installation & Setup


## 8. Future Roadmap

- **WhatsApp Companion Bot:** Porting the FastAPI backend to interface with WhatsApp for mobile-first users who do not use desktop browsers.
- **On-Device Machine Learning:** Integrating a lightweight TensorFlow.js model directly into the Chrome Extension to detect basic phishing keywords offline.
- **Automated MCMC Reporting:** A feature to automatically package and forward high-confidence danger alerts directly to the relevant Malaysian authorities.
