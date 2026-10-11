/**
 * Bilingual Translation Dictionary for VANGUARD-LOGIX Field PWA
 * Supports English and Hindi (हिंदी) for Indian Army forward formations in connectivity shadow zones.
 */

export type Language = 'en' | 'hi';

export const translations = {
  en: {
    // Header & Connectivity
    systemTitle: 'VANGUARD-LOGIX Field Outpost PWA',
    systemSubtitle: 'Offline Tactical Requisition & Stocktaking Portal',
    signalOnline: 'ONLINE — VSAT CONNECTED',
    signalOffline: 'OFFLINE — SHADOW ZONE',
    simulateNoSignal: 'Simulate No Signal (VSAT Drop)',
    simulateRestore: 'Restore VSAT Link',
    syncButton: 'Sync Queued Indents',
    syncing: 'Synchronizing with HQ XIV Corps...',
    syncedSuccess: 'Batch Synchronization Completed Successfully!',
    queuedVouchers: 'Queued Offline Vouchers',
    theaterSector: 'HQ Northern Command / XIV Corps Sector',

    // Outpost & Stock Inspection
    selectOutpost: 'Select Forward Outpost / Battlegroup',
    elevationMsl: 'Elevation MSL',
    troopHeadcount: 'Troop PAX',
    outpostStockSummary: 'Field Stocktake & Forward Burn Rate',
    supplyItem: 'Supply Item',
    class: 'Class',
    currentStock: 'Current Stock',
    dailyBurn: 'Daily Burn',
    daysOfSupply: 'Days of Supply (DoS)',
    status: 'Status',
    normal: 'Normal',
    warning: 'Warning',
    critical: 'Critical Shortage',

    // IAF-Z-2096 Requisition Form
    formTitle: 'IAF-Z-2096 Military Requisition Voucher',
    formSubtitle: 'Generates Cryptographic SHA-256 Signature Locally When Offline',
    unitLabel: 'Originating Unit / Formation',
    unitPlaceholder: 'e.g., 3 LADAKH SCOUTS (High Altitude Warfare)',
    officerServiceNo: 'Officer Service Number',
    officerPlaceholder: 'e.g., IC-78219M Maj R. Sharma',
    officerName: 'Officer Name & Rank',
    officerNamePlaceholder: 'e.g., Maj R. Sharma',
    priorityTier: 'Priority Tier',
    opImmediate: 'Operational Immediate (Emergency Lifeline)',
    priority: 'Priority (Tactical Replenishment)',
    routine: 'Routine (Scheduled Cycle)',
    selectSupply: 'Select Supply Item to Indent',
    quantityRequested: 'Quantity Requested',
    justification: 'Operational Justification',
    justificationPlaceholder: 'Describe sub-zero burn escalation, impassable blizzard, or safety stock breach...',
    submitOfflineBtn: 'Save Voucher to Field Offline Queue',
    vouchersSavedSuccess: 'Voucher saved to local offline storage with SHA-256 signature.',

    // Offline Queue
    queueTitle: 'Offline Local Queue (Stored on Device Storage)',
    queueEmpty: 'No pending offline vouchers. All records synchronized with base depot.',
    voucherId: 'Voucher ID',
    originUnit: 'Unit',
    outpost: 'Outpost',
    itemsCount: 'Items',
    cryptoHash: 'Cryptographic SHA-256 Hash',
    actions: 'Actions',
    discard: 'Discard',
  },
  hi: {
    // Header & Connectivity
    systemTitle: 'वांगार्ड-लॉजिक्स अग्रिम चौकी फील्ड PWA',
    systemSubtitle: 'ऑफलाइन सामरिक मांगपत्र एवं स्टॉक मिलान पोर्टल',
    signalOnline: 'ऑनलाइन — वी-सैट सक्रिय (मुख्यालय से जुड़ा)',
    signalOffline: 'ऑफलाइन — छाया क्षेत्र (लिंक बाधित)',
    simulateNoSignal: 'सिग्नल कट सिमुलेट करें (वी-सैट ड्रॉप)',
    simulateRestore: 'वी-सैट लिंक बहाल करें',
    syncButton: 'कतारबद्ध मांगपत्र सिंक करें',
    syncing: 'मुख्यालय 14 कोर के साथ सिंक हो रहा है...',
    syncedSuccess: 'बैच सिंक्रोनाइज़ेशन सफलतापूर्वक संपन्न हुआ!',
    queuedVouchers: 'कतारबद्ध ऑफलाइन मांगपत्र',
    theaterSector: 'उत्तरी कमान / 14 कोर अग्रिम सेक्टर',

    // Outpost & Stock Inspection
    selectOutpost: 'अग्रिम चौकी / बैटलग्रुप चुनें',
    elevationMsl: 'समुद्र तल से ऊंचाई',
    troopHeadcount: 'सैन्य नफरी (PAX)',
    outpostStockSummary: 'फील्ड स्टॉक मिलान एवं दैनिक खपत दर',
    supplyItem: 'सामग्री विवरण',
    class: 'श्रेणी (Class)',
    currentStock: 'वर्तमान स्टॉक',
    dailyBurn: 'दैनिक खपत',
    daysOfSupply: 'आपूर्ति दिवस (DoS)',
    status: 'स्थिति',
    normal: 'सामान्य',
    warning: 'चेतावनी',
    critical: 'अति गंभीर कमी',

    // IAF-Z-2096 Requisition Form
    formTitle: 'IAF-Z-2096 सैन्य मांगपत्र वाउचर',
    formSubtitle: 'ऑफलाइन होने पर भी डिवाइस पर क्रिप्टोग्राफिक SHA-256 हस्ताक्षर जनरेट करता है',
    unitLabel: 'मांगकर्ता वाहिनी / रेजिमेंट',
    unitPlaceholder: 'उदा. 3 लद्दाख स्काउट्स (हाई एल्टीट्यूड वॉरफेयर)',
    officerServiceNo: 'अधिकारी सेवा संख्या (Service No)',
    officerPlaceholder: 'उदा. IC-78219M मेजर आर. शर्मा',
    officerName: 'अधिकारी का नाम व पद',
    officerNamePlaceholder: 'उदा. मेजर आर. शर्मा',
    priorityTier: 'प्राथमिकता श्रेणी',
    opImmediate: 'ऑपरेशनल तात्कालिक (आपातकालीन जीवनरेखा)',
    priority: 'प्राथमिकता (सामरिक पुनःपूर्ति)',
    routine: 'नियमित (निर्धारित चक्र)',
    selectSupply: 'आवश्यक सामग्री चुनें',
    quantityRequested: 'मांगी गई मात्रा',
    justification: 'सामरिक औचित्य (Tactical Reason)',
    justificationPlaceholder: 'माइनस तापमान में ईंधन वृद्धि, बर्फीले तूफान या सुरक्षा स्टॉक समाप्ति का विवरण दें...',
    submitOfflineBtn: 'मांगपत्र फील्ड कतार में सुरक्षित सहेजें',
    vouchersSavedSuccess: 'मांगपत्र SHA-256 हस्ताक्षर के साथ स्थानीय डिवाइस में सुरक्षित सहेज दिया गया।',

    // Offline Queue
    queueTitle: 'ऑफलाइन स्थानीय कतार (डिवाइस स्टोरेज में सुरक्षित)',
    queueEmpty: 'कोई लंबित ऑफलाइन मांगपत्र नहीं। सभी रिकॉर्ड बेस डिपो के साथ सिंक हो चुके हैं।',
    voucherId: 'वाउचर संख्या',
    originUnit: 'वाहिनी',
    outpost: 'चौकी',
    itemsCount: 'सामग्रियां',
    cryptoHash: 'क्रिप्टोग्राफिक SHA-256 हैश',
    actions: 'कार्रवाई',
    discard: 'रद्द करें',
  },
};
