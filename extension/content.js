// 1. SAFE REGEX & CONFIG
// Matches Malaysian mobile (01x) and landline (0x) roughly
const phoneRegex = /(?:\+?6?01)[0-46-9]-*[0-9]{7,8}|(?:\+?6?0)[2-9]-*[0-9]{7,8}/g;

// Only flag these if the URL is clearly NOT official
const bankingKeywords = [
  { word: "maybank", official: "maybank2u.com.my" },
  { word: "cimb", official: "cimbclicks.com.my" },
  { word: "public bank", official: "pbebank.com" }
];

// 2. PART A: PHONE NUMBER HIGHLIGHTER (Local Only)
function highlightPhoneNumbers() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodesToReplace = [];

  while (node = walker.nextNode()) {
    // Skip if inside script, style, or already highlighted
    if (node.parentNode.tagName === 'SCRIPT' || 
        node.parentNode.tagName === 'STYLE' || 
        node.parentNode.classList.contains('kitaguard-highlight')) continue;

    if (node.nodeValue && node.nodeValue.match(phoneRegex)) {
      nodesToReplace.push(node);
    }
  }

  nodesToReplace.forEach(node => {
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    
    // Reset regex to ensure we catch multiple numbers in one string
    const text = node.nodeValue;
    const matches = [...text.matchAll(phoneRegex)];

    if (matches.length === 0) return;

    matches.forEach(match => {
      // 1. Text before the number
      const before = text.slice(lastIndex, match.index);
      fragment.appendChild(document.createTextNode(before));

      // 2. The Highlighted Number (Span)
      const span = document.createElement('span');
      span.textContent = match[0]; 
      span.style.backgroundColor = "#ffeb3b"; 
      span.style.borderBottom = "2px solid #d32f2f";
      span.style.cursor = "pointer";
      span.title = "Click to Verify with KitaGuard";
      span.classList.add('kitaguard-highlight');

      // CLICK EVENT: Send message to Side Panel
      span.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        // Send to Background -> Side Panel
        chrome.runtime.sendMessage({ 
            action: "triggerCheck", 
            payload: match[0] 
        });
      });

      fragment.appendChild(span);
      lastIndex = match.index + match[0].length;
    });

    // 3. Text remaining
    fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    node.parentNode.replaceChild(fragment, node);
  });
}

// 3. PART B: FAKE NEWS SCANNER (Triggered by Side Panel)
// We listen for a message from the Side Panel "Scan This Page" button
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scanPageHeaders") {
    
    // Only grab H1 and H2 (Headlines)
    const headlines = Array.from(document.querySelectorAll("h1, h2"))
                           .map(h => h.innerText.trim())
                           .filter(text => text.length > 10)
                           .slice(0, 5); 

    sendResponse({ headlines: headlines });
  }
});

// Run Passive Scanners on Load
window.addEventListener('load', () => {
    // Delay slightly to let page render
    setTimeout(highlightPhoneNumbers, 1000);
});