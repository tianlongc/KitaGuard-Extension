import requests
from bs4 import BeautifulSoup
import os
import base64
import firebase_admin
from firebase_admin import credentials, firestore

class MalaysianOSINT:
    def __init__(self):
        self.headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        self.init_firebase()

    # --- FIREBASE SETUP ---
    def init_firebase(self):
        # Check if app is already initialized to prevent double-init errors
        if not firebase_admin._apps:
            # Connection to Firebase using service account key
            cred = credentials.Certificate("firebase_credentials.json")
            firebase_admin.initialize_app(cred)
        
        self.db = firestore.client()
        self.collection = self.db.collection('scam_reports')
        print("✅ Firebase Firestore Connected")

    # --- FIREBASE: REPORTING SYSTEM ---
    def add_report(self, target: str, target_type: str = "url"):
        try:
            # Sanitize target (FireStore IDs cannot contain '/')
            doc_id = target.replace("/", "_").replace(":", "").replace(".", "_")
            
            doc_ref = self.collection.document(doc_id)
            doc = doc_ref.get()

            if doc.exists:
                # Automically increment the count
                doc_ref.update({"report_count": firestore.Increment(1)})
            else:
                # Create new record
                doc_ref.set({
                    "target": target,
                    "type": target_type,
                    "report_count": 1,
                    "last_reported": firestore.SERVER_TIMESTAMP
                })
            return True
        except Exception as e:
            print(f"🔥 Firebase Write Error: {e}")
            return False

    def get_community_flags(self, target: str):
        try:
            doc_id = target.replace("/", "_").replace(":", "").replace(".", "_")
            doc = self.collection.document(doc_id).get()
            if doc.exists:
                return doc.to_dict().get("report_count", 0)
            return 0
        except Exception as e:
            print(f"⚠️ Firebase Read Error: {e}")
            return 0

    # --- OSINT: SEBENARNYA.MY SCRAPER ---
    def check_sebenarnya(self, query: str):
        url = f"https://sebenarnya.my/?s={query.replace(' ', '+')}"
        try:
            resp = requests.get(url, headers=self.headers, timeout=5)
            if resp.status_code != 200: return []
            
            soup = BeautifulSoup(resp.text, 'html.parser')

            articles = []
            for item in soup.select('article h3.entry-title a')[:2]:
                articles.append({
                    "title": item.text.strip(),
                    "link": item['href']
                })
            return articles
        except Exception as e:
            print(f"Sebenarnya Scraper Error: {e}")
            return []

    # --- OSINT: VIRUSTOTAL ---
    def check_virustotal(self, url: str):
        vt_key = os.getenv("VIRUSTOTAL_API_KEY")
        if not vt_key: return "VirusTotal API Key missing."
        
        # VirusTotal requires base64 URL without padding '='
        try:
            url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
            headers = {"x-apikey": vt_key}
            
            resp = requests.get(f"https://www.virustotal.com/api/v3/urls/{url_id}", headers=headers, timeout=5)
            
            if resp.status_code == 200:
                stats = resp.json().get('data', {}).get('attributes', {}).get('last_analysis_stats', {})
                malicious = stats.get('malicious', 0)
                suspicious = stats.get('suspicious', 0)
                
                if malicious > 0 or suspicious > 0:
                    return f"CRITICAL: Flagged by {malicious + suspicious} security vendors."
                return "Clean on VirusTotal."
            elif resp.status_code == 404:
                return "URL not found in VirusTotal database (Unscanned)."
            else:
                return f"VirusTotal Error: {resp.status_code}"
        except Exception as e:
            return f"VirusTotal check failed: {str(e)}"

    # --- OSINT: SEMAK MULE (Simulated logic + Database Check) ---
    def check_semak_mule(self, phone_or_account: str):
        # 1. Check our own community database first
        flags = self.get_community_flags(phone_or_account)
        
        # 2. Logic: If reported > 2 times, flag as High Risk
        if flags > 2:
            return f"HIGH RISK: Reported {flags} times by KitaGuard community."
        elif flags > 0:
            return f"CAUTION: Reported {flags} time(s) previously."
            
        return "No local community reports found."