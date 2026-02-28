// --- DOM ELEMENTS ---
const inputBox = document.getElementById('query-input');
const verifyBtn = document.getElementById('verify-btn');
const resultBox = document.getElementById('result-box');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('hidden-file-input');
const uploadBtn = document.getElementById('upload-btn');
const previewContainer = document.getElementById('image-preview-container');
const previewImg = document.getElementById('preview-img');
const removeImgBtn = document.getElementById('remove-image-btn');

// Report Button Elements
const reportContainer = document.getElementById('report-container');
const reportBtn = document.getElementById('report-btn');

// --- STATE ---
let currentImageFile = null;
let currentScanTarget = ""; 
let currentScanType = "url"; 
let loadingIntervalId = null; // Tracks the dynamic loading text interval

// =========================================================
//  1. INITIALIZATION & CONTEXT MENU HANDLERS
// =========================================================

function checkPendingScans() {
    chrome.storage.local.get(['pending_scan', 'pending_image_scan'], (result) => {
        if (result.pending_scan) {
            inputBox.value = result.pending_scan;
            performTextVerification(result.pending_scan);
            chrome.storage.local.remove(['pending_scan']);
        }
        else if (result.pending_image_scan) {
            performUrlVerification(result.pending_image_scan);
            chrome.storage.local.remove(['pending_image_scan']);
        }
    });
}

document.addEventListener('DOMContentLoaded', checkPendingScans);

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
        if (changes.pending_scan?.newValue) {
            inputBox.value = changes.pending_scan.newValue;
            performTextVerification(changes.pending_scan.newValue);
            chrome.storage.local.remove(['pending_scan']);
        }
        if (changes.pending_image_scan?.newValue) {
            performUrlVerification(changes.pending_image_scan.newValue);
            chrome.storage.local.remove(['pending_image_scan']);
        }
    }
});

// =========================================================
//  2. DRAG & DROP / PASTE / FILE UPLOAD LOGIC
// =========================================================

uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

inputBox.addEventListener('paste', (e) => {
  const items = (e.clipboardData || e.originalEvent.clipboardData).items;
  for (let item of items) {
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      e.preventDefault(); 
      handleFile(item.getAsFile());
    }
  }
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');

  // 1. Check if user drop file
  if (e.dataTransfer.files.length > 0) {
    handleFile(e.dataTransfer.files[0]);
  }
  // 2. Check if the user drop text
  else{
    const droppedText = e.dataTransfer.getData('text/plain');
    if (droppedText) {
      // Insert the text into the box
      inputBox.value = droppedText;
      
      // Fire the 'input' event manually so your auto-resize CSS/JS triggers
      inputBox.dispatchEvent(new Event('input'));
    }
  }
});

function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  
  currentImageFile = file;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    previewContainer.classList.remove("preview-hidden");
    previewContainer.style.display = 'block'; 
  };
  reader.readAsDataURL(file);
}

removeImgBtn.addEventListener('click', () => {
  currentImageFile = null;
  fileInput.value = "";
  previewImg.src = "";
  previewContainer.classList.add("preview-hidden");
  previewContainer.style.display = 'none';
  inputBox.value = "";
});


// =========================================================
//  3. VERIFY BUTTON LOGIC (THE BRAIN)
// =========================================================
verifyBtn.addEventListener('click', () => {
  const text = inputBox.value.trim();
  
  if (currentImageFile) {
      performFileVerification(currentImageFile);
  } else if (text) {
      performTextVerification(text);
  }
});

// =========================================================
//  4. API FUNCTIONS
// =========================================================
async function performTextVerification(query) {
    // 1. Pass the Text-specific Tech Stack Messages
    showLoadingState([
        "🔍 Running Domain Security Check...",
        "🌐 Checking VirusTotal & Sebenarnya.my...",
        "🏛️ Searching Gov.my via Vertex AI...",
        "🧠 Gemini is analyzing the intelligence..."
    ]);
    
    currentScanTarget = query;
    currentScanType = "text";
    try {
        const response = await fetch("http://127.0.0.1:8000/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: query })
        });
        const data = await response.json();
        renderResults(data);
        showReportButton();
    } catch (error) {
        showErrorState(error);
    } finally {
        verifyBtn.disabled = false;
    }
}

async function performFileVerification(file) {
    // 2. Pass the Image-specific Tech Stack Messages
    showLoadingState([
        "🖼️ Processing Image Metadata...",
        "🔍 Extracting Embedded Text...",
        "🏛️ Cross-referencing Official Databases...",
        "🧠 Gemini Vision is checking for manipulation..."
    ]);

    currentScanTarget = "Uploaded Image Poster";
    currentScanType = "image";

    const formData = new FormData();
    formData.append("file", file, "upload.jpg");

    try {
        const response = await fetch("http://127.0.0.1:8000/verify-image", {
            method: "POST",
            body: formData
        });
        const data = await response.json();
        renderResults(data);
        showReportButton();
        
        currentImageFile = null;
        fileInput.value = "";
        previewImg.src = "";
        previewContainer.classList.add("preview-hidden");
        previewContainer.style.display = 'none';
        inputBox.value = "";
    } catch (error) {
        showErrorState(error);
    } finally {
        verifyBtn.disabled = false;
    }
}

async function performUrlVerification(imageUrl) {
    // 3. Pass Image-specific Tech Stack Messages
    showLoadingState([
        "🖼️ Downloading & Processing Image...",
        "🔍 Extracting Embedded Text...",
        "🏛️ Cross-referencing Official Databases...",
        "🧠 Gemini Vision is checking for manipulation..."
    ]);

    currentScanTarget = imageUrl;
    currentScanType = "url";

    try {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) throw new Error("Failed to download image from web");
        const blob = await imageResponse.blob();

        const formData = new FormData();
        formData.append("file", blob, "scan.jpg");

        const response = await fetch("http://127.0.0.1:8000/verify-image", {
            method: "POST",
            body: formData
        });
        const data = await response.json();
        renderResults(data);
        showReportButton();
    } catch (error) {
        showErrorState(error);
    } finally {
        verifyBtn.disabled = false;
    }
}

// =========================================================
//  5. UI HELPER FUNCTIONS
// =========================================================

// --- DYNAMIC LOADING LOGIC ---
function showLoadingState(messagesArray) {
    stopLoading(); // Clear any existing intervals safely

    resultBox.style.display = 'block';
    resultBox.className = ''; 
    
    // Inject the first message into the UI
    let messageIndex = 0;
    resultBox.innerHTML = `
        <div class="loading-card">
            <span>⚙️</span>
            <span id="dynamic-loading-text">${messagesArray[0]}</span>
        </div>`;
    
    verifyBtn.disabled = true;
    if (reportContainer) reportContainer.style.display = 'none';

    // Start cycling through the messages
    const textElement = document.getElementById('dynamic-loading-text');
    loadingIntervalId = setInterval(() => {
        messageIndex = (messageIndex + 1) % messagesArray.length;
        if (textElement) {
            textElement.innerText = messagesArray[messageIndex];
        }
    }, 1500); // Changes every 1.5 seconds
}

// --- STOP LOADING LOGIC ---
function stopLoading() {
    if (loadingIntervalId) {
        clearInterval(loadingIntervalId);
        loadingIntervalId = null;
    }
}

function showErrorState(error) {
    stopLoading(); // Stop the animation
    
    resultBox.style.display = 'block';
    resultBox.innerHTML = `
      <div class="result-card status-danger">
        
        <div class="status-header text-danger">
           <span>⚠️</span> SYSTEM ERROR
        </div>
        
        <div class="headline">
          Could not connect to the KitaGuard backend.
        </div>

        <div class="analysis-text">
          <br>• Please ensure your FastAPI server is running (<code>uvicorn main:app --reload</code>).
          <br>• Check your terminal for any crash reports.
          <br><br><strong>Technical Details:</strong>
          <br>${error.message || error}
        </div>

      </div>
    `;
    console.error("KitaGuard API Error:", error);
}

function showReportButton() {
    if (!reportContainer || !reportBtn) return;
    reportContainer.style.display = "block";
    reportBtn.innerText = "🚨 Report as Scam";
    reportBtn.disabled = false;
    reportBtn.style.backgroundColor = "#ff4d4f";
}

// =========================================================
//  6. RENDER RESULTS 
// =========================================================
function renderResults(data) {
    stopLoading(); // Stop the animation before showing results
    
    resultBox.innerHTML = ''; 
    resultBox.style.display = 'block';
  
    let rawAnalysis = data.ai_analysis || data.explanation || "No details provided.";
    let formattedAnalysis = formatGeminiText(rawAnalysis);

    let statusClass = "status-unknown";
    let textClass = "text-unknown";
    let icon = "❓";
    let title = "UNVERIFIED";

    if (data.status === "DANGER") {
        statusClass = "status-danger";
        textClass = "text-danger";
        icon = "🚨";
        title = "DANGER DETECTED";
    } else if (data.status === "SUSPICIOUS" || data.status === "CAUTION") {
        statusClass = "status-warning";
        textClass = "text-warning";
        icon = "⚠️";
        title = data.status === "SUSPICIOUS" ? "SUSPICIOUS" : "USE CAUTION";
    } else if (data.status === "SAFE") {
        statusClass = "status-safe";
        textClass = "text-safe";
        icon = "✅";
        title = "LIKELY SAFE";
    } else if (data.status === "ERROR") {
        statusClass = "status-danger";
        textClass = "text-danger";
        icon = "⚠️";
        title = "SYSTEM ERROR";
    }

    resultBox.innerHTML = `
      <div class="result-card ${statusClass}">
        
        <div class="status-header ${textClass}">
           <span>${icon}</span> ${title}
        </div>
        
        <div class="headline">
          ${data.message || "Analysis complete."}
        </div>

        <div class="analysis-text">
          ${formattedAnalysis}
        </div>

        ${data.extracted_text ? `
        <div class="ocr-box">
          <div style="font-weight: 700; margin-bottom: 4px; color: #5f6368;">
            👁️ Text Found in Image:
          </div>
          "${data.extracted_text.substring(0, 180)}..."
        </div>` : ''}

        ${data.sources && data.sources.length > 0 ? `
        <div style="margin-top: 15px; font-size: 12px;">
          <a href="${data.sources[0].link}" target="_blank" class="source-link">
            🔗 Source: ${data.sources[0].title}
          </a>
        </div>` : ''}

      </div>
    `;
}

function formatGeminiText(raw) {
    if (!raw) return "No details provided.";
    let text = raw.replace(/\r\n/g, "\n").trim();
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/(?:^|\s)(\d+)[.)-]\s+/g, '<br><br><strong>$1.</strong> ');
    text = text.replace(/(?:^|\s)[•*-]\s+/g, '<br>• ');
    text = text.replace(/\n\n/g, '<br><br>');
    text = text.replace(/^(<br>\s*)+/, '');
    return text;
}

// =========================================================
//  7. COMMUNITY REPORTING LOGIC
// =========================================================
if (reportBtn) {
    reportBtn.addEventListener("click", async () => {
        if (!currentScanTarget) return;

        reportBtn.innerText = "⏳ Reporting...";
        reportBtn.disabled = true;

        try {
            const response = await fetch("http://127.0.0.1:8000/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    target: currentScanTarget,
                    target_type: currentScanType
                })
            });

            const data = await response.json();

            if (data.status === "SUCCESS") {
                reportBtn.innerText = "✅ Reported to Community";
                reportBtn.style.backgroundColor = "#4CAF50"; 
            } else {
                throw new Error("Failed to report");
            }
        } catch (error) {
            console.error("Report Error:", error);
            reportBtn.innerText = "❌ Error. Try Again.";
            reportBtn.disabled = false;
            reportBtn.style.backgroundColor = "#ff4d4f";
        }
    });
}

// =========================================================
//  AUTO-RESIZE TEXTAREA
// =========================================================
inputBox.addEventListener('input', function() {
    this.style.height = 'auto';
    
    this.style.height = this.scrollHeight + 'px';
});

// =========================================================
//  PRESS "ENTER" TO SUBMIT (Shift+Enter for new line)
// =========================================================
inputBox.addEventListener('keydown', (e) => {
    // If user presses Enter AND is not holding Shift
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // Prevents the box from just making a new line
        
        // Only trigger if there is text or an image ready
        if (inputBox.value.trim() !== "" || currentImageFile !== null) {
            verifyBtn.click(); // Programmatically click the send button
        }
    }
});