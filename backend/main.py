import os
import json
import requests
from urllib.parse import urlparse
from functools import lru_cache
from typing import Optional, List

from fastapi import FastAPI, Request, File, UploadFile, Form 
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rapidfuzz import fuzz
import google.generativeai as genai
from dotenv import load_dotenv

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from PIL import Image, ExifTags
import io
from google.cloud import discoveryengine_v1 as discoveryengine

from osint_service import MalaysianOSINT

# --- CONFIGURATION ---
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Vertex AI Configuration
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT_ID")
DATA_STORE_ID = os.getenv("DATA_STORE_ID")
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "vertex_credentials.json"

# --- AI CONFIGURATION ---
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        print("✅ AI Model Configured: gemini-flash-latest")
    except:
        try:
            model = genai.GenerativeModel('gemini-2.0-flash')
            print("✅ AI Model Configured: gemini-2.0-flash")
        except:
            model = genai.GenerativeModel('gemini-pro-latest')
            print("⚠️ Fallback AI Model: gemini-pro-latest")
else:
    print("⚠️ WARNING: GEMINI_API_KEY is missing")
    model = None

# --- APP SETUP ---
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="KitaGuard API", version="2.8.0") 
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

# --- INTELLIGENCE DATA & MAPPING ---
ENTITY_MAP = {
    "maybank2u.com.my": "Malayan Banking Berhad (Maybank)",
    "cimbclicks.com.my": "CIMB Bank",
    "pbebank.com": "Public Bank Berhad",
    "rhbgroup.com": "RHB Bank",
    "hlb.com.my": "Hong Leong Bank",
    "ambank.com.my": "AmBank Group",
    "tngdigital.com.my": "Touch 'n Go eWallet",
    "kwsp.gov.my": "Kumpulan Wang Simpanan Pekerja (KWSP)",
    "hasil.gov.my": "Lembaga Hasil Dalam Negeri (LHDN)",
    "sebenarnya.my": "MCMC Sebenarnya.my",
    "semakmule.rmp.gov.my": "PDRM Semak Mule"
}

OFFICIAL_DOMAINS = list(ENTITY_MAP.keys())

SUSPICIOUS_KEYWORDS = [
    "bantuan", "sumbangan", "tunai", "ewallet", "e-wallet", 
    "claim", "tebus", "rm100", "rm200", "rm500", "rm1000",
    "kredit", "percuma", "lulus", "mykasih", "str", "sara",
    "zakat", "fitrah", "biasiswa", "elaun", "log-in", "signin",
    "verify", "account", "locked", "segera", "tamat"
]

# --- PYDANTIC MODELS ---
class CheckRequest(BaseModel):
    query: str
    
class ReportRequest(BaseModel):
    target: str
    target_type: str = "url" # e.g., "url", "phone", "account"

class VerificationResponse(BaseModel):
    status: str
    message: str
    ai_analysis: Optional[str] = None
    sources: List[dict] = []

# --- HELPERS ---
def expand_url(url_input: str) -> str:
    if any(shortener in url_input for shortener in ["bit.ly", "t.co", "tinyurl", "goo.gl"]):
        try:
            resp = requests.head(url_input, allow_redirects=True, timeout=3)
            return resp.url
        except:
            return url_input
    return url_input

def extract_domain(url_input: str) -> str:
    url_input = expand_url(url_input)
    if not url_input.startswith(('http://', 'https://')):
        url_input = 'http://' + url_input
    try:
        parsed = urlparse(url_input)
        domain = parsed.netloc.lower()
        if domain.startswith("www."): domain = domain[4:]
        return domain
    except:
        return ""

def get_image_metadata(image: Image) -> dict:
    metadata = {}
    try:
        info = image._getexif()
        if info:
            for tag, value in info.items():
                decoded = ExifTags.TAGS.get(tag, tag)
                metadata[decoded] = value
    except:
        pass
    return metadata

# --- 1. VERTEX AI SEARCH ---
@lru_cache(maxsize=100)
def search_official_sources(query: str):
    if not PROJECT_ID or not DATA_STORE_ID:
        print("❌ Vertex Config Error: Missing Project ID or Data Store ID")
        return []
        
    print(f"🔎 Vertex AI Search Triggered for: '{query}'")
    
    try:
        # 1. Initialize the client
        client = discoveryengine.SearchServiceClient()
        
        # 2. Define the path to your Data Store
        serving_config = client.serving_config_path(
            project=PROJECT_ID,
            location="global",
            data_store=DATA_STORE_ID,
            serving_config="default_config",
        )

        # 3. Create the search request
        request = discoveryengine.SearchRequest(
            serving_config=serving_config,
            query=query,
            page_size=3,
            content_search_spec={"snippet_spec": {"return_snippet": True}},
        )

        # 4. Execute and parse results
        response = client.search(request)
        
        results = []
        for result in response.results:
            data = result.document.derived_struct_data
            item = {
                "title": data.get("title", "Official Source"),
                "link": data.get("link", ""),
                "snippet": data.get("snippets", [{}])[0].get("snippet", "")
            }
            results.append(item)
            
        return results

    except Exception as e:
        print(f"🔥 Vertex AI Error: {e}")
        return []

# --- 2. DOMAIN CHECKER ---
def check_domain_safety(user_input: str):
    domain = extract_domain(user_input)
    if not domain: return {"status": "NOT_URL"}

    if domain in OFFICIAL_DOMAINS:
        return {"status": "SAFE", "target": ENTITY_MAP.get(domain, domain)}

    for brand_url, brand_name in ENTITY_MAP.items():
        brand_key = brand_url.split('.')[0]
        if brand_key in domain and domain != brand_url:
             return {"status": "DANGER", "target": brand_name}

    for real_site in OFFICIAL_DOMAINS:
        ratio = fuzz.partial_ratio(domain, real_site)
        if ratio > 85 and domain != real_site:
            return {"status": "DANGER", "target": ENTITY_MAP.get(real_site)}

    return {"status": "UNKNOWN_URL"}

# --- 3. SCHEMAS ---

# Schema for Text Verification
verification_schema = {
    "type": "object",
    "properties": {
        "status": {"type": "string", "enum": ["DANGER", "SUSPICIOUS", "CAUTION", "SAFE"]},
        "message": {"type": "string"},
        "explanation": {"type": "string"},
        "risk_factors": {"type": "array", "items": {"type": "string"}}
    },
    "required": ["status", "message", "explanation", "risk_factors"]
}

# Schema for Image Verification
image_schema = {
    "type": "object",
    "properties": {
        "status": {"type": "string", "enum": ["DANGER", "SUSPICIOUS", "SAFE"]},
        "message": {"type": "string"},
        "explanation": {"type": "string"},
        "extracted_text": {"type": "string"}
    },
    "required": ["status", "message", "explanation", "extracted_text"]
}

# --- 4. API ENDPOINTS ---
@app.get("/")
def read_root():
    return {"status": "System Operational", "version": "3.0.0 (Firebase Enabled)"}

# Initialize OSINT class (Connects to Firebase)
osint_analyst = MalaysianOSINT()

@app.post("/verify", response_model=VerificationResponse)
@limiter.limit("20/minute")
async def verify_content(request: Request, check_req: CheckRequest):
    user_query = check_req.query.strip()
    print(f"📥 Received Request: {user_query}")
    
    is_probably_url = "." in user_query and " " not in user_query
    found_risks = [w for w in SUSPICIOUS_KEYWORDS if w in user_query.lower()]

    # PHASE 1: Domain Analysis (Fast Pass)
    if is_probably_url:
        domain_check = check_domain_safety(user_query)
        if domain_check["status"] == "SAFE":
            return {
                "status": "SAFE", "message": "Verified Official Site", 
                "ai_analysis": f"✅ Confirmed: This is the official {domain_check['target']} portal."
            }
        if domain_check["status"] == "DANGER":
            return {
                "status": "DANGER", "message": "Phishing Alert!", 
                "ai_analysis": f"Critical: This URL is mimicking {domain_check['target']}. Do not enter any credentials."
            }

    # --- PHASE 2: Gather ALL OSINT Intel ---
    
    # 1. Check Sebenarnya.my (Fact checker)
    local_intel = osint_analyst.check_sebenarnya(user_query)
    
    # 2. Check Community Reports (Firebase)
    community_flags = osint_analyst.get_community_flags(user_query)
    
    # 3. Check VirusTotal (Only for URLs)
    vt_scan = osint_analyst.check_virustotal(user_query) if is_probably_url else "N/A"
    
    # 4. Check Semak Mule Logic (NEW! Was missing before)
    semak_mule_scan = osint_analyst.check_semak_mule(user_query)

    # 5. Google Search (Reality Check)
    search_results = search_official_sources(user_query)

    # --- PHASE 3: AI Analysis ---
    try:
        prompt = f"""
        ### ROLE
        Act as 'KitaGuard', a specialized Malaysian OSINT analyst.
        
        ### RAW INTELLIGENCE
        - User Claim/URL: "{user_query}"
        - Community Reports (Firebase): {community_flags} flags
        - Semak Mule / Database Check: {semak_mule_scan}
        - VirusTotal Scan: {vt_scan}
        - Sebenarnya.my Records: {local_intel}
        - Google Search Results: {str(search_results)}
        
        ### TASK
        Analyze if this is a scam.
        1. **DANGER**: If VirusTotal says malicious OR Sebenarnya.my has a match OR Community Flags > 5.
        2. **SUSPICIOUS**: If Community Flags > 0 OR suspicious keywords found.
        3. **SAFE**: If official Google Search results confirm it's a valid government/bank site.
        
        ### RESPONSE FORMAT (JSON ONLY)
        {{
            "status": "DANGER" | "SUSPICIOUS" | "CAUTION" | "SAFE",
            "message": "Short Headline",
            "explanation": "Clear reason citing the specific intelligence source (e.g. 'Flagged by 3 users').",
            "risk_factors": {found_risks}
        }}
        """
        
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                response_schema=verification_schema,
                temperature=0.2
            )
        )
        ai_data = json.loads(response.text)

        return {
            "status": ai_data.get("status", "UNKNOWN"),
            "message": ai_data.get("message", "Unverified"),
            "ai_analysis": ai_data.get("explanation", "Manual check needed."),
            "sources": search_results[:2]
        }

    except Exception as e:
        print(f"AI Error: {e}")
        return {
            "status": "CAUTION" if found_risks else "UNKNOWN",
            "message": "System Busy",
            "ai_analysis": "AI analysis unavailable.",
            "sources": []
        }

@app.post("/verify-image")
async def verify_image(file: UploadFile = File(...), query: str = Form(None)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    
    meta = get_image_metadata(image)
    
    prompt = f"""
    ### ROLE
    Act as 'KitaGuard Vision'. Detect fraud in this Malaysian image.
    ### DATA
    Metadata: {str(meta)[:200]}
    User Text: {query if query else 'N/A'}
    ### TASK
    Analyze for fake logos, scam keywords, and photo editing.
    """
    
    try:
        response = model.generate_content(
            [prompt, image],
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                response_schema=image_schema,
                temperature=0.2
            )
        )
        ai_data = json.loads(response.text)
        
        return {
            "status": ai_data.get("status", "UNKNOWN"),
            "message": ai_data.get("message", "Analysis Failed"),
            "ai_analysis": ai_data.get("explanation", "N/A"),
            "extracted_text": ai_data.get("extracted_text", "")
        }
    except Exception as e:
        return {"status": "ERROR", "message": str(e)}

# --- REPORT ENDPOINT ---
@app.post("/report")
async def report_scam(report_req: ReportRequest):
    try:
        osint_analyst.add_report(report_req.target, report_req.target_type)
        return {"status": "SUCCESS", "message": f"Report logged for {report_req.target}"}
    except Exception as e:
        print(f"Database Error: {e}")
        return {"status": "ERROR", "message": "Failed to save report"}