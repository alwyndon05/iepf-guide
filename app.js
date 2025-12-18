// ============================================
// IEPF Guide - Interactive Wizard
// ============================================

// State
const state = {
    currentStep: 0,
    claimantType: null,
    shareType: null
};

// Document requirements by claimant type
const documentsByClaimant = {
    self: {
        base: [
            'Filled and signed Form IEPF-5',
            'Aadhaar card (self-attested copy)',
            'PAN card (self-attested copy)',
            'Cancelled cheque or bank passbook copy',
            'Indemnity bond (original, on stamp paper)',
            'Advance stamped receipt'
        ],
        physical: [
            'Original share certificate(s)',
            'Folio number details'
        ],
        demat: [
            'Client Master List (CML) from your DP',
            'DP ID and Client ID'
        ]
    },
    heir: {
        base: [
            'Filled and signed Form IEPF-5',
            'Death certificate of the shareholder (original/attested)',
            'Succession certificate / Probate / Legal heir certificate',
            'Aadhaar card of claimant(s)',
            'PAN card of claimant(s)',
            'Cancelled cheque or bank passbook copy',
            'Indemnity bond (original, on stamp paper)',
            'Affidavit by legal heir(s)',
            'NOC from other legal heirs (if applicable)'
        ],
        physical: [
            'Original share certificate(s) (if available)',
            'Folio number details'
        ],
        demat: [
            'Client Master List (CML) from your DP',
            'DP ID and Client ID of claimant'
        ]
    },
    nominee: {
        base: [
            'Filled and signed Form IEPF-5',
            'Death certificate of the shareholder',
            'Nomination form / proof of nomination',
            'Aadhaar card of nominee',
            'PAN card of nominee',
            'Cancelled cheque or bank passbook copy',
            'Indemnity bond (original, on stamp paper)',
            'Affidavit by nominee'
        ],
        physical: [
            'Original share certificate(s) (if available)',
            'Folio number details'
        ],
        demat: [
            'Client Master List (CML) from your DP',
            'DP ID and Client ID'
        ]
    },
    joint: {
        base: [
            'Filled and signed Form IEPF-5',
            'Death certificate of deceased holder(s) (if applicable)',
            'Identity documents of all surviving holders',
            'PAN card of surviving holder(s)',
            'Declaration from surviving holder(s)',
            'Cancelled cheque or bank passbook copy',
            'Indemnity bond (original, on stamp paper)'
        ],
        physical: [
            'Original share certificate(s)',
            'Folio number details'
        ],
        demat: [
            'Client Master List (CML) from your DP',
            'DP ID and Client ID'
        ]
    }
};

const claimantLabels = {
    self: 'Original Shareholder',
    heir: 'Legal Heir',
    nominee: 'Nominee',
    joint: 'Joint/Surviving Holder'
};

const shareTypeLabels = {
    physical: 'Physical Shares',
    demat: 'Demat Shares'
};

// ============================================
// Navigation Functions
// ============================================

function goToStep(stepNumber, skipScroll = false) {
    // Update state
    state.currentStep = stepNumber;

    // Update wizard steps
    document.querySelectorAll('.wizard-step').forEach(step => {
        step.classList.remove('active');
    });
    const targetStep = document.querySelector(`.wizard-step[data-step="${stepNumber}"]`);
    if (targetStep) {
        targetStep.classList.add('active');
    }

    // Update progress bar
    updateProgress(stepNumber);

    // Scroll to tool if not visible (skip on initial load)
    if (!skipScroll) {
        scrollToTool();
    }
}

function nextStep() {
    goToStep(state.currentStep + 1);
}

function prevStep() {
    goToStep(state.currentStep - 1);
}

function resetWizard() {
    state.currentStep = 0;
    state.claimantType = null;
    state.shareType = null;
    goToStep(0);
}

// ============================================
// Progress Bar
// ============================================

function updateProgress(step) {
    // Update progress fill
    const progressFill = document.getElementById('progress-fill');
    const progressPercentage = (step / 3) * 100;
    progressFill.style.width = `${progressPercentage}%`;

    // Update step indicators
    document.querySelectorAll('.progress-step').forEach((stepEl, index) => {
        stepEl.classList.remove('active', 'completed');
        if (index < step) {
            stepEl.classList.add('completed');
        } else if (index === step) {
            stepEl.classList.add('active');
        }
    });
}

// ============================================
// Selection Handlers
// ============================================

function selectClaimant(type) {
    state.claimantType = type;
    goToStep(2);
}

function selectShareType(type) {
    state.shareType = type;
    renderResults();
    goToStep(3);
}

// ============================================
// Results Rendering
// ============================================

function renderResults() {
    // Update summary badge
    const summary = document.getElementById('selection-summary');
    summary.innerHTML = `${claimantLabels[state.claimantType]} · ${shareTypeLabels[state.shareType]}`;

    // Render checklist
    renderChecklist();

    // Update timeline based on claimant type
    updateTimeline();
}

function renderChecklist() {
    const checklist = document.getElementById('document-checklist');
    const docs = documentsByClaimant[state.claimantType];
    const allDocs = [...docs.base, ...docs[state.shareType]];

    checklist.innerHTML = allDocs.map((doc, index) => `
        <div class="checklist-item" onclick="toggleCheck(this)">
            <input type="checkbox" id="doc-${index}">
            <label for="doc-${index}">${doc}</label>
        </div>
    `).join('');

    // Update count
    updateChecklistCount();
}

function updateTimeline() {
    const timelineNote = document.getElementById('timeline-note');
    const totalTimeline = document.getElementById('total-timeline');

    if (state.claimantType === 'heir') {
        timelineNote.textContent = 'Legal heir claims often take longer due to additional verification.';
        totalTimeline.textContent = '4-8 months';
    } else if (state.claimantType === 'nominee') {
        timelineNote.textContent = 'Nomination may not eliminate need for additional declarations.';
        totalTimeline.textContent = '3-6 months';
    } else {
        timelineNote.textContent = '';
        totalTimeline.textContent = '3-6 months';
    }
}

// ============================================
// Checklist Interactions
// ============================================

function toggleCheck(item) {
    const checkbox = item.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;
    item.classList.toggle('checked', checkbox.checked);
    updateChecklistCount();
}

function updateChecklistCount() {
    const total = document.querySelectorAll('.checklist-item').length;
    const checked = document.querySelectorAll('.checklist-item.checked').length;
    const countEl = document.getElementById('checklist-count');
    if (countEl) {
        countEl.textContent = `${checked}/${total}`;
    }
}

// ============================================
// Accordion Functions
// ============================================

function toggleAccordion(button) {
    const item = button.parentElement;
    item.classList.toggle('open');
}

function toggleFaq(button) {
    const item = button.parentElement;
    item.classList.toggle('open');
}

// ============================================
// Guide Tabs
// ============================================

function initGuideTabs() {
    const tabs = document.querySelectorAll('.guide-tab');
    const panels = document.querySelectorAll('.guide-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetPanel = tab.dataset.tab;

            // Update tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update panels
            panels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.dataset.panel === targetPanel) {
                    panel.classList.add('active');
                }
            });
        });
    });
}

// ============================================
// Scroll & Navigation
// ============================================

function scrollToTool() {
    const toolSection = document.getElementById('claim-tool');
    if (toolSection) {
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const targetPosition = toolSection.offsetTop - navHeight - 20;
        const currentPosition = window.pageYOffset;

        // Only scroll if target is not visible
        if (currentPosition < targetPosition - 100 || currentPosition > targetPosition + 300) {
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const navHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = target.offsetTop - navHeight - 20;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// ============================================
// Stock Calculator
// ============================================

// Calculator State
const calculatorState = {
    selectedStock: null,
    stockSymbol: null,
    stockName: null,
    currentPrice: null
};

// Historical corporate actions database (multiplier = how many shares you have today per 1 original share)
// Data compiled from BSE/NSE records - includes BSE scrip codes for linking
const stockCorporateActions = {
    'RELIANCE.NS': { multiplier: 4, history: '1:1 Bonus (2017), 1:1 Bonus (2009), Stock split 10:1 (2017)', rta: 'KFin Technologies', bseCode: '500325' },
    'TCS.NS': { multiplier: 2, history: '1:1 Bonus (2018), 1:1 Bonus (2006)', rta: 'TSR Consultants', bseCode: '532540' },
    'INFY.NS': { multiplier: 64, history: 'Multiple bonuses (1:1 in 2014, 2006, 2004, 1999) and 2:1 split (2015)', rta: 'KFin Technologies', bseCode: '500209' },
    'HDFCBANK.NS': { multiplier: 5, history: 'Stock split 2:1 (2019), 5:1 (2011)', rta: 'Datamatics Business Solutions', bseCode: '500180' },
    'ICICIBANK.NS': { multiplier: 5, history: 'Stock split 5:1 (2007), Bonus 1:10 (2005)', rta: 'KFin Technologies', bseCode: '532174' },
    'SBIN.NS': { multiplier: 10, history: 'Stock split 10:1 (2014)', rta: 'Datamatics Business Solutions', bseCode: '500112' },
    'HINDUNILVR.NS': { multiplier: 4, history: '1:1 Bonus (2010), 1:1 Bonus (1999)', rta: 'KFin Technologies', bseCode: '500696' },
    'ITC.NS': { multiplier: 10, history: '1:1 Bonus (2005), Stock split 10:1 (2005)', rta: 'KFin Technologies', bseCode: '500875' },
    'BHARTIARTL.NS': { multiplier: 2, history: '1:1 Bonus (2009), Stock split 2:1 (2005)', rta: 'KFin Technologies', bseCode: '532454' },
    'KOTAKBANK.NS': { multiplier: 2, history: 'Stock split 2:1 (2015)', rta: 'Link Intime', bseCode: '500247' },
    'LT.NS': { multiplier: 2, history: '1:2 Bonus (2017), Stock split 2:1 (2006)', rta: 'Link Intime', bseCode: '500510' },
    'AXISBANK.NS': { multiplier: 5, history: 'Stock split 5:1 (2008)', rta: 'Link Intime', bseCode: '532215' },
    'ASIANPAINT.NS': { multiplier: 10, history: '1:1 Bonus (2013), Stock split 10:1 (2013)', rta: 'Link Intime', bseCode: '500820' },
    'MARUTI.NS': { multiplier: 2, history: 'Stock split 2:1 (2007)', rta: 'KFin Technologies', bseCode: '532500' },
    'TITAN.NS': { multiplier: 10, history: '1:1 Bonus (2018), Stock split 10:1 (2004)', rta: 'TSR Consultants', bseCode: '500114' },
    'SUNPHARMA.NS': { multiplier: 5, history: '1:1 Bonus (2010), Stock split 5:1 (2004)', rta: 'Link Intime', bseCode: '524715' },
    'BAJFINANCE.NS': { multiplier: 5, history: 'Stock split 5:1 (2012)', rta: 'KFin Technologies', bseCode: '500034' },
    'WIPRO.NS': { multiplier: 96, history: 'Multiple bonuses including 1:1 (2019, 2017, 2010, 2005, 2004)', rta: 'KFin Technologies', bseCode: '507685' },
    'HCLTECH.NS': { multiplier: 2, history: '1:1 Bonus (2015)', rta: 'KFin Technologies', bseCode: '532281' },
    'TATAMOTORS.NS': { multiplier: 10, history: 'Stock split 10:1 (2011)', rta: 'TSR Consultants', bseCode: '500570' },
    'TATASTEEL.NS': { multiplier: 10, history: 'Stock split 10:1 (2013)', rta: 'TSR Consultants', bseCode: '500470' },
    'POWERGRID.NS': { multiplier: 2, history: 'Stock split 2:1 (2017)', rta: 'KFin Technologies', bseCode: '532898' },
    'NTPC.NS': { multiplier: 2, history: 'Stock split 2:1 (2013)', rta: 'KFin Technologies', bseCode: '532555' },
    'ONGC.NS': { multiplier: 2, history: '1:1 Bonus (2016), Stock split 2:1 (2013)', rta: 'KFin Technologies', bseCode: '500312' },
    'COALINDIA.NS': { multiplier: 1, history: 'No significant bonus/split', rta: 'Link Intime', bseCode: '533278' },
    'TECHM.NS': { multiplier: 2, history: '1:1 Bonus (2018)', rta: 'KFin Technologies', bseCode: '532755' },
    'NESTLEIND.NS': { multiplier: 10, history: 'Stock split 10:1 (2015)', rta: 'KFin Technologies', bseCode: '500790' },
    'JSWSTEEL.NS': { multiplier: 10, history: 'Stock split 10:1 (2010)', rta: 'Link Intime', bseCode: '500228' },
    'DIVISLAB.NS': { multiplier: 2, history: '1:1 Bonus (2011)', rta: 'KFin Technologies', bseCode: '532488' },
    'DRREDDY.NS': { multiplier: 5, history: '1:1 Bonus (2001), Stock split 5:1 (2001)', rta: 'KFin Technologies', bseCode: '500124' },
    'CIPLA.NS': { multiplier: 1, history: 'No significant recent bonus/split', rta: 'Link Intime', bseCode: '500087' },
    'BRITANNIA.NS': { multiplier: 5, history: 'Stock split 5:1 (2018)', rta: 'KFin Technologies', bseCode: '500825' },
    'EICHERMOT.NS': { multiplier: 10, history: 'Stock split 10:1 (2011)', rta: 'KFin Technologies', bseCode: '505200' },
    'HEROMOTOCO.NS': { multiplier: 2, history: 'Stock split 2:1 (2009)', rta: 'KFin Technologies', bseCode: '500182' },
    'BAJAJ-AUTO.NS': { multiplier: 10, history: 'Stock split 10:1 (2011)', rta: 'KFin Technologies', bseCode: '532977' },
    'HINDALCO.NS': { multiplier: 1, history: 'No significant recent bonus/split', rta: 'Link Intime', bseCode: '500440' },
    'BPCL.NS': { multiplier: 2, history: '1:1 Bonus (2012)', rta: 'KFin Technologies', bseCode: '500547' },
    'IOC.NS': { multiplier: 2, history: '1:1 Bonus (2016)', rta: 'KFin Technologies', bseCode: '530965' },
    'M&M.NS': { multiplier: 2, history: '1:1 Bonus (2008), Stock split 2:1 (2007)', rta: 'TSR Consultants', bseCode: '500520' },
    'DABUR.NS': { multiplier: 2, history: 'Stock split 2:1 (2015), 1:1 Bonus (2010)', rta: 'Link Intime', bseCode: '500096' },
    'PIDILITIND.NS': { multiplier: 2, history: '1:1 Bonus (2016)', rta: 'Link Intime', bseCode: '500331' },
    'HAVELLS.NS': { multiplier: 1, history: 'No significant recent bonus/split', rta: 'KFin Technologies', bseCode: '517354' },
    'DLF.NS': { multiplier: 1, history: 'No significant bonus/split', rta: 'KFin Technologies', bseCode: '532868' },
    'IRCTC.NS': { multiplier: 5, history: 'Stock split 5:1 (2022)', rta: 'KFin Technologies', bseCode: '542830' },
    'TATAPOWER.NS': { multiplier: 1, history: 'No significant recent bonus/split', rta: 'TSR Consultants', bseCode: '500400' },
    'TATAELXSI.NS': { multiplier: 2, history: '1:1 Bonus (2020)', rta: 'TSR Consultants', bseCode: '500408' }
};


// Popular Indian stocks database for autocomplete
const indianStocks = [
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries', shortName: 'Reliance' },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services', shortName: 'TCS' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', shortName: 'HDFC Bank' },
    { symbol: 'INFY.NS', name: 'Infosys', shortName: 'Infosys' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', shortName: 'ICICI Bank' },
    { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever', shortName: 'HUL' },
    { symbol: 'SBIN.NS', name: 'State Bank of India', shortName: 'SBI' },
    { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel', shortName: 'Airtel' },
    { symbol: 'ITC.NS', name: 'ITC Limited', shortName: 'ITC' },
    { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank', shortName: 'Kotak Bank' },
    { symbol: 'LT.NS', name: 'Larsen & Toubro', shortName: 'L&T' },
    { symbol: 'AXISBANK.NS', name: 'Axis Bank', shortName: 'Axis Bank' },
    { symbol: 'ASIANPAINT.NS', name: 'Asian Paints', shortName: 'Asian Paints' },
    { symbol: 'MARUTI.NS', name: 'Maruti Suzuki', shortName: 'Maruti' },
    { symbol: 'TITAN.NS', name: 'Titan Company', shortName: 'Titan' },
    { symbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical', shortName: 'Sun Pharma' },
    { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance', shortName: 'Bajaj Finance' },
    { symbol: 'WIPRO.NS', name: 'Wipro', shortName: 'Wipro' },
    { symbol: 'HCLTECH.NS', name: 'HCL Technologies', shortName: 'HCL Tech' },
    { symbol: 'TATAMOTORS.NS', name: 'Tata Motors', shortName: 'Tata Motors' },
    { symbol: 'TATASTEEL.NS', name: 'Tata Steel', shortName: 'Tata Steel' },
    { symbol: 'POWERGRID.NS', name: 'Power Grid Corporation', shortName: 'Power Grid' },
    { symbol: 'NTPC.NS', name: 'NTPC Limited', shortName: 'NTPC' },
    { symbol: 'ONGC.NS', name: 'Oil & Natural Gas Corporation', shortName: 'ONGC' },
    { symbol: 'COALINDIA.NS', name: 'Coal India', shortName: 'Coal India' },
    { symbol: 'BAJAJFINSV.NS', name: 'Bajaj Finserv', shortName: 'Bajaj Finserv' },
    { symbol: 'TECHM.NS', name: 'Tech Mahindra', shortName: 'Tech Mahindra' },
    { symbol: 'ULTRACEMCO.NS', name: 'UltraTech Cement', shortName: 'UltraTech' },
    { symbol: 'NESTLEIND.NS', name: 'Nestle India', shortName: 'Nestle' },
    { symbol: 'JSWSTEEL.NS', name: 'JSW Steel', shortName: 'JSW Steel' },
    { symbol: 'ADANIENT.NS', name: 'Adani Enterprises', shortName: 'Adani Ent' },
    { symbol: 'ADANIPORTS.NS', name: 'Adani Ports', shortName: 'Adani Ports' },
    { symbol: 'GRASIM.NS', name: 'Grasim Industries', shortName: 'Grasim' },
    { symbol: 'DIVISLAB.NS', name: 'Divis Laboratories', shortName: 'Divis Lab' },
    { symbol: 'DRREDDY.NS', name: 'Dr Reddys Laboratories', shortName: 'Dr Reddys' },
    { symbol: 'CIPLA.NS', name: 'Cipla', shortName: 'Cipla' },
    { symbol: 'BRITANNIA.NS', name: 'Britannia Industries', shortName: 'Britannia' },
    { symbol: 'EICHERMOT.NS', name: 'Eicher Motors', shortName: 'Eicher' },
    { symbol: 'HEROMOTOCO.NS', name: 'Hero MotoCorp', shortName: 'Hero Moto' },
    { symbol: 'BAJAJ-AUTO.NS', name: 'Bajaj Auto', shortName: 'Bajaj Auto' },
    { symbol: 'HINDALCO.NS', name: 'Hindalco Industries', shortName: 'Hindalco' },
    { symbol: 'VEDL.NS', name: 'Vedanta Limited', shortName: 'Vedanta' },
    { symbol: 'BPCL.NS', name: 'Bharat Petroleum', shortName: 'BPCL' },
    { symbol: 'IOC.NS', name: 'Indian Oil Corporation', shortName: 'IOC' },
    { symbol: 'HDFCLIFE.NS', name: 'HDFC Life Insurance', shortName: 'HDFC Life' },
    { symbol: 'SBILIFE.NS', name: 'SBI Life Insurance', shortName: 'SBI Life' },
    { symbol: 'INDUSINDBK.NS', name: 'IndusInd Bank', shortName: 'IndusInd' },
    { symbol: 'M&M.NS', name: 'Mahindra & Mahindra', shortName: 'M&M' },
    { symbol: 'SHREECEM.NS', name: 'Shree Cement', shortName: 'Shree Cement' },
    { symbol: 'TATACONSUM.NS', name: 'Tata Consumer Products', shortName: 'Tata Consumer' },
    { symbol: 'APOLLOHOSP.NS', name: 'Apollo Hospitals', shortName: 'Apollo Hosp' },
    { symbol: 'DABUR.NS', name: 'Dabur India', shortName: 'Dabur' },
    { symbol: 'GODREJCP.NS', name: 'Godrej Consumer Products', shortName: 'Godrej CP' },
    { symbol: 'PIDILITIND.NS', name: 'Pidilite Industries', shortName: 'Pidilite' },
    { symbol: 'HAVELLS.NS', name: 'Havells India', shortName: 'Havells' },
    { symbol: 'SIEMENS.NS', name: 'Siemens India', shortName: 'Siemens' },
    { symbol: 'ABB.NS', name: 'ABB India', shortName: 'ABB' },
    { symbol: 'BERGEPAINT.NS', name: 'Berger Paints', shortName: 'Berger Paints' },
    { symbol: 'DLF.NS', name: 'DLF Limited', shortName: 'DLF' },
    { symbol: 'ZOMATO.NS', name: 'Zomato', shortName: 'Zomato' },
    { symbol: 'PAYTM.NS', name: 'Paytm (One97)', shortName: 'Paytm' },
    { symbol: 'NYKAA.NS', name: 'FSN E-Commerce (Nykaa)', shortName: 'Nykaa' },
    { symbol: 'IRCTC.NS', name: 'IRCTC', shortName: 'IRCTC' },
    { symbol: 'TATAPOWER.NS', name: 'Tata Power', shortName: 'Tata Power' },
    { symbol: 'TATAELXSI.NS', name: 'Tata Elxsi', shortName: 'Tata Elxsi' },
    { symbol: 'PERSISTENT.NS', name: 'Persistent Systems', shortName: 'Persistent' },
    { symbol: 'LTIM.NS', name: 'LTIMindtree', shortName: 'LTIMindtree' },
    { symbol: 'MPHASIS.NS', name: 'Mphasis', shortName: 'Mphasis' },
    { symbol: 'COFORGE.NS', name: 'Coforge', shortName: 'Coforge' },
    { symbol: 'BANKBARODA.NS', name: 'Bank of Baroda', shortName: 'Bank of Baroda' },
    { symbol: 'PNB.NS', name: 'Punjab National Bank', shortName: 'PNB' },
    { symbol: 'CANBK.NS', name: 'Canara Bank', shortName: 'Canara Bank' },
    { symbol: 'IDFCFIRSTB.NS', name: 'IDFC First Bank', shortName: 'IDFC First' }
];

// Initialize year dropdown
function initYearDropdown() {
    const yearSelect = document.getElementById('purchase-year');
    if (!yearSelect) return;

    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1980; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

// Stock search functionality
function initStockSearch() {
    const searchInput = document.getElementById('stock-search');
    const searchResults = document.getElementById('search-results');

    if (!searchInput || !searchResults) return;

    let debounceTimer;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim().toLowerCase();

        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        debounceTimer = setTimeout(() => {
            const matches = indianStocks.filter(stock =>
                stock.name.toLowerCase().includes(query) ||
                stock.shortName.toLowerCase().includes(query) ||
                stock.symbol.toLowerCase().includes(query)
            ).slice(0, 8);

            if (matches.length > 0) {
                searchResults.innerHTML = matches.map(stock => `
                    <div class="search-result-item" onclick="selectStock('${stock.symbol}', '${stock.name}')">
                        <span class="result-symbol">${stock.symbol.replace('.NS', '')}</span>
                        <span class="result-name">${stock.name}</span>
                    </div>
                `).join('');
                searchResults.style.display = 'block';
            } else {
                searchResults.innerHTML = `
                    <div class="search-no-results">
                        No stocks found. Try a different name.
                    </div>
                `;
                searchResults.style.display = 'block';
            }
        }, 200);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) {
            searchResults.style.display = 'none';
        }
    });
}

// Select stock from search results
function selectStock(symbol, name) {
    calculatorState.stockSymbol = symbol;
    calculatorState.stockName = name;

    // Update UI
    document.getElementById('stock-search').style.display = 'none';
    document.getElementById('search-results').style.display = 'none';

    const selectedStock = document.getElementById('selected-stock');
    document.getElementById('display-symbol').textContent = symbol.replace('.NS', '');
    document.getElementById('display-name').textContent = name;
    selectedStock.style.display = 'flex';

    // Show corporate actions info if available
    displayCorporateActionsInfo(symbol);
}

// Display corporate actions info for selected stock
function displayCorporateActionsInfo(symbol) {
    const corpInfoDiv = document.getElementById('stock-corporate-info');
    const corpActions = stockCorporateActions[symbol];

    if (corpActions) {
        document.getElementById('corp-multiplier').textContent = corpActions.multiplier + 'x';
        document.getElementById('corp-multiplier-text').textContent = corpActions.multiplier;
        document.getElementById('corp-history').textContent = corpActions.history || 'No significant bonus/split history';
        document.getElementById('corp-rta-name').textContent = corpActions.rta;

        // Store BSE code for link
        calculatorState.bseCode = corpActions.bseCode;

        corpInfoDiv.style.display = 'block';
    } else {
        // Stock not in database - hide the info
        corpInfoDiv.style.display = 'none';
        calculatorState.bseCode = null;
    }
}

// Open BSE Corporate Information page
function openBSECorporateInfo(event) {
    event.preventDefault();

    if (calculatorState.bseCode) {
        // Direct link to BSE stock page with corp info
        const bseUrl = `https://www.bseindia.com/stock-share-price/x/x/${calculatorState.bseCode}/`;
        window.open(bseUrl, '_blank');
    } else if (calculatorState.stockSymbol) {
        // Fallback - search on BSE
        const symbol = calculatorState.stockSymbol.replace('.NS', '');
        window.open(`https://www.bseindia.com/stock-share-price/search/?q=${symbol}`, '_blank');
    } else {
        window.open('https://www.bseindia.com/', '_blank');
    }
}

// Select popular stock
function selectPopularStock(symbol, name) {
    selectStock(symbol, name);
    // Scroll to calculator
    document.getElementById('calculator').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Clear selected stock
function clearStock() {
    calculatorState.stockSymbol = null;
    calculatorState.stockName = null;
    calculatorState.currentPrice = null;
    calculatorState.bseCode = null;

    document.getElementById('selected-stock').style.display = 'none';
    document.getElementById('stock-corporate-info').style.display = 'none';
    document.getElementById('stock-search').style.display = 'block';
    document.getElementById('stock-search').value = '';
}

// Open price lookup in Google Finance
function openPriceLookup(event) {
    event.preventDefault();
    if (calculatorState.stockSymbol) {
        const symbol = calculatorState.stockSymbol.replace('.NS', '');
        window.open(`https://www.google.com/finance/quote/${symbol}:NSE`, '_blank');
    } else {
        window.open('https://www.google.com/finance/', '_blank');
    }
}

// Toggle bonus/split adjustment section
function toggleAdjustment() {
    const content = document.getElementById('adjustment-content');
    const chevron = document.getElementById('adjustment-chevron');

    if (content.style.display === 'none') {
        content.style.display = 'block';
        chevron.style.transform = 'rotate(180deg)';
    } else {
        content.style.display = 'none';
        chevron.style.transform = 'rotate(0deg)';
    }
}

// Calculate adjusted shares based on bonus and splits
function calculateAdjustedShares() {
    const originalShares = parseFloat(document.getElementById('num-shares').value) || 0;
    const bonusRatio = parseFloat(document.getElementById('bonus-ratio').value) || 1;
    const splitRatio = parseFloat(document.getElementById('split-ratio').value) || 1;
    const bonusCount = parseInt(document.getElementById('bonus-count').value) || 1;

    if (originalShares <= 0) {
        document.getElementById('adjusted-shares').textContent = 'Enter original shares first';
        return 0;
    }

    // Calculate: original * (bonus^count) * split
    const adjustedShares = originalShares * Math.pow(bonusRatio, bonusCount) * splitRatio;
    document.getElementById('adjusted-shares').textContent = Math.floor(adjustedShares).toLocaleString('en-IN');

    return Math.floor(adjustedShares);
}

// Open corporate actions history
function openCorporateActions(event) {
    event.preventDefault();
    if (calculatorState.stockSymbol) {
        const symbol = calculatorState.stockSymbol.replace('.NS', '');
        window.open(`https://www.bseindia.com/stock-share-price/equity/search/?q=${symbol}`, '_blank');
    } else {
        window.open('https://www.bseindia.com/corporates/corporate_act.aspx', '_blank');
    }
}

// Check if adjustments are enabled
function getAdjustedShareCount() {
    const content = document.getElementById('adjustment-content');
    if (content.style.display === 'none') {
        return null; // Not using adjustments
    }
    return calculateAdjustedShares();
}

// Fetch stock price using multiple methods
async function fetchStockPrice(symbol) {
    // Method 1: Try Yahoo Finance via different CORS proxies
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;

    const corsProxies = [
        `https://api.allorigins.win/get?url=${encodeURIComponent(yahooUrl)}`,
        `https://corsproxy.io/?${encodeURIComponent(yahooUrl)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(yahooUrl)}`
    ];

    for (const proxyUrl of corsProxies) {
        try {
            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) continue;

            let data = await response.json();

            // allorigins returns data in contents field
            if (data.contents) {
                data = JSON.parse(data.contents);
            }

            if (data.chart && data.chart.result && data.chart.result[0]) {
                const result = data.chart.result[0];
                const price = result.meta.regularMarketPrice || result.meta.previousClose;
                if (price) {
                    console.log('Price fetched successfully:', price);
                    return price;
                }
            }
        } catch (error) {
            console.log('Proxy failed, trying next...', error);
            continue;
        }
    }

    // Method 2: Fallback to Google Finance scrape via proxy
    try {
        const googleUrl = `https://www.google.com/finance/quote/${symbol.replace('.NS', '')}:NSE`;
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(googleUrl)}`;

        const response = await fetch(proxyUrl);
        if (response.ok) {
            const data = await response.json();
            if (data.contents) {
                // Extract price from Google Finance HTML
                const priceMatch = data.contents.match(/data-last-price="([0-9.]+)"/);
                if (priceMatch && priceMatch[1]) {
                    const price = parseFloat(priceMatch[1]);
                    console.log('Price from Google Finance:', price);
                    return price;
                }
            }
        }
    } catch (error) {
        console.log('Google Finance fallback failed:', error);
    }

    throw new Error('Unable to fetch stock price');
}

// Calculate value
function calculateValue() {
    // Validate inputs
    const numShares = parseFloat(document.getElementById('num-shares').value);
    const purchasePrice = parseFloat(document.getElementById('purchase-price').value);
    const purchaseYear = document.getElementById('purchase-year').value;
    const currentPrice = parseFloat(document.getElementById('current-price').value);

    if (!numShares || numShares <= 0) {
        showError('Please enter a valid number of shares');
        return;
    }

    if (!purchasePrice || purchasePrice <= 0) {
        showError('Please enter a valid purchase price');
        return;
    }

    if (!purchaseYear) {
        showError('Please select the year of purchase');
        return;
    }

    if (!currentPrice || currentPrice <= 0) {
        showError('Please enter the current price per share. Click "Look up price" to find it.');
        return;
    }

    // Store in state
    calculatorState.currentPrice = currentPrice;

    // Get multiplier from corporate actions database
    let multiplier = 1;
    let corpHistory = null;
    let rtaName = null;

    if (calculatorState.stockSymbol && stockCorporateActions[calculatorState.stockSymbol]) {
        const corpActions = stockCorporateActions[calculatorState.stockSymbol];
        multiplier = corpActions.multiplier || 1;
        corpHistory = corpActions.history;
        rtaName = corpActions.rta;
    }

    // Calculate adjusted shares
    const adjustedShares = numShares * multiplier;

    // Display results with adjusted shares
    displayResults(numShares, adjustedShares, purchasePrice, currentPrice, multiplier, corpHistory, rtaName);
}

// Display calculation results
function displayResults(originalShares, adjustedShares, purchasePrice, currentPrice, multiplier, corpHistory, rtaName) {
    // Calculate values using ADJUSTED shares for current value
    const investment = originalShares * purchasePrice;
    const currentValue = adjustedShares * currentPrice; // Use adjusted shares
    const gain = currentValue - investment;
    const gainPercent = ((gain / investment) * 100).toFixed(1);

    // Update result UI
    const stockName = calculatorState.stockName || 'Your Stock';
    document.getElementById('result-stock-name').textContent = stockName;
    document.getElementById('result-investment').textContent = formatCurrency(investment);
    document.getElementById('result-shares-detail').textContent = `${originalShares} shares @ ₹${purchasePrice.toFixed(2)}`;
    document.getElementById('result-current').textContent = formatCurrency(currentValue);

    // Show adjusted shares in current value detail if multiplier > 1
    if (multiplier > 1) {
        document.getElementById('result-price-detail').textContent = `${adjustedShares.toLocaleString('en-IN')} shares @ ₹${currentPrice.toFixed(2)}`;
    } else {
        document.getElementById('result-price-detail').textContent = `Current price: ₹${currentPrice.toFixed(2)}`;
    }

    document.getElementById('result-gain').textContent = (gain >= 0 ? '+' : '') + formatCurrency(gain);
    document.getElementById('result-percent').textContent = (gain >= 0 ? '+' : '') + gainPercent + '%';

    // Update gain card styling
    const gainCard = document.getElementById('result-gain-card');
    gainCard.classList.remove('positive', 'negative');
    gainCard.classList.add(gain >= 0 ? 'positive' : 'negative');

    // Show adjustment info if multiplier > 1
    const adjustmentInfo = document.getElementById('result-adjustment-info');
    if (multiplier > 1) {
        document.getElementById('result-original-shares').textContent = originalShares.toLocaleString('en-IN');
        document.getElementById('result-adjusted-shares').textContent = adjustedShares.toLocaleString('en-IN');
        document.getElementById('result-corp-history').textContent = corpHistory || '';
        adjustmentInfo.style.display = 'block';
    } else {
        adjustmentInfo.style.display = 'none';
    }

    // Show RTA info if available
    const rtaInfoDiv = document.getElementById('result-rta-info');
    if (rtaName) {
        document.getElementById('result-rta-name').textContent = rtaName;
        rtaInfoDiv.style.display = 'block';
    } else {
        rtaInfoDiv.style.display = 'none';
    }

    // Show results
    showResult();
}

// Format currency
function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

// UI State functions
function showLoading() {
    document.getElementById('calculator-form').style.display = 'none';
    document.getElementById('calculator-result').style.display = 'none';
    document.getElementById('calculator-error').style.display = 'none';
    document.getElementById('calculator-loading').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('calculator-loading').style.display = 'none';
}

function showResult() {
    document.getElementById('calculator-form').style.display = 'none';
    document.getElementById('calculator-error').style.display = 'none';
    document.getElementById('calculator-loading').style.display = 'none';
    document.getElementById('calculator-result').style.display = 'block';
}

function showError(message) {
    document.getElementById('error-message').textContent = message;
    document.getElementById('calculator-error').style.display = 'flex';
    document.getElementById('calculator-form').style.display = 'none';
    document.getElementById('calculator-result').style.display = 'none';
}

function hideError() {
    document.getElementById('calculator-error').style.display = 'none';
    document.getElementById('calculator-form').style.display = 'block';
    document.getElementById('calculator-result').style.display = 'none';
}

function resetCalculator() {
    // Reset state
    calculatorState.currentPrice = null;

    // Reset form values but keep stock selection
    document.getElementById('num-shares').value = '';
    document.getElementById('purchase-price').value = '';
    document.getElementById('purchase-year').value = '';
    document.getElementById('current-price').value = '';

    // Show form, hide everything else
    document.getElementById('calculator-result').style.display = 'none';
    document.getElementById('calculator-error').style.display = 'none';
    document.getElementById('calculator-loading').style.display = 'none';
    document.getElementById('calculator-form').style.display = 'block';
}

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize at step 0 (skip scroll on initial load)
    goToStep(0, true);

    // Initialize guide tabs
    initGuideTabs();

    // Initialize smooth scroll
    initSmoothScroll();

    // Initialize calculator
    initYearDropdown();
    initStockSearch();
});
