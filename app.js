/* ══════════════════════════════════════
   NEUROBOOK — app.js
   Full application logic
══════════════════════════════════════ */

/* ── GLOBALS ── */
let lang = 'en';
let curMod = null;
let qAns = {};
let sbOpen = true;
let saveTimer = null;

const $ = id => document.getElementById(id);
const openOv = id => $(id).classList.add('open');
const closeOv = id => $(id).classList.remove('open');
const tr = (m, k) => ((m[lang] || m.en)[k]) || '';

/* ══════════════════════════════════════
   DEFAULT DATA
══════════════════════════════════════ */
const DEFAULT_MODULES = [
  {
    id: 'executive', color: '#c084fc', icon: '🧠', builtIn: true,
    en: { title: 'Executive System', sub: 'Prefrontal Cortex · System 1', lead: 'Creates plans, rules, strategies, and long-term goals. The instruction-generator — the layer that makes you more than your impulses.' },
    hi: { title: 'कार्यकारी प्रणाली', sub: 'प्रीफ्रंटल कॉर्टेक्स · सिस्टम 1', lead: 'योजनाएं, नियम, रणनीतियां और दीर्घकालिक लक्ष्य बनाता है।' },
    components: [
      { name: 'DLPFC', en: 'Working memory, logical structuring, multi-step planning, focus. Your "internal architect."', hi: 'कार्यशील स्मृति, तार्किक संरचना, बहु-चरण योजना। आपका "आंतरिक वास्तुकार।"' },
      { name: 'VMPFC', en: 'Value comparison and emotional integration. Prevents cold, emotionless decisions.', hi: 'मूल्य तुलना और भावनात्मक एकीकरण। ठंडे निर्णयों से बचाता है।' },
      { name: 'OFC', en: 'Orbitofrontal Cortex. Reward evaluation. Updates strategy when outcomes change.', hi: 'पुरस्कार मूल्यांकन। परिणाम बदलने पर रणनीति अपडेट करता है।' },
      { name: 'ACC', en: 'Anterior Cingulate Cortex. Detects conflict and errors. When you feel tension — ACC is active.', hi: 'संघर्ष और त्रुटियों का पता लगाता है। आंतरिक तनाव = ACC सक्रिय।' },
    ],
    note: { en: '⚡ Energy-expensive. PFC is the first to fail under sleep deprivation or chronic stress.', hi: '⚡ ऊर्जा-महंगा। नींद की कमी में PFC पहले बंद होता है।' },
    extras: []
  },
  {
    id: 'emotional', color: '#fb923c', icon: '🔥', builtIn: true,
    en: { title: 'Emotional Valuation', sub: 'Limbic Network · System 2', lead: 'Assigns emotional value to every experience. Does not create strategy — it creates urgency.' },
    hi: { title: 'भावनात्मक मूल्यांकन', sub: 'लिम्बिक नेटवर्क · सिस्टम 2', lead: 'हर अनुभव को भावनात्मक मूल्य देता है। रणनीति नहीं — आवश्यकता बनाता है।' },
    components: [
      { name: 'Amygdala', en: 'Threat detection and emotional intensity. First responder to fear or danger.', hi: 'खतरे का पता लगाना। भय के प्रति पहला प्रतिक्रियाकर्ता।' },
      { name: 'Hippocampus', en: 'Memory storage and context tagging. Connects past experiences to present reactions.', hi: 'स्मृति संग्रहण। पिछले अनुभवों को वर्तमान से जोड़ता है।' },
      { name: 'Hypothalamus', en: 'Drives: hunger, sex, stress. Hormonal control. Primal survival signals.', hi: 'इच्छाएं: भूख, कामेच्छा, तनाव। हार्मोनल नियंत्रण।' },
      { name: 'Nucleus Accumbens', en: 'Pleasure processing and reward reinforcement. The system that "feels the high."', hi: 'आनंद प्रसंस्करण। वह प्रणाली जो उच्चता महसूस करती है।' },
    ],
    note: { en: '⚠ Dominant in most people. Must be regulated through PFC — not suppressed.', hi: '⚠ अधिकांश लोगों में प्रभावशाली। PFC द्वारा नियंत्रित किया जाना चाहिए।' },
    extras: []
  },
  {
    id: 'habit', color: '#22d3ee', icon: '⚙️', builtIn: true,
    en: { title: 'Habit Execution', sub: 'Basal Ganglia · System 3', lead: 'Automates repeated behaviors. Does not think. Executes stored patterns relentlessly.' },
    hi: { title: 'आदत निष्पादन', sub: 'बेसल गैन्ग्लिया · सिस्टम 3', lead: 'बार-बार दोहराए व्यवहारों को स्वचालित करता है। सोचता नहीं।' },
    components: [
      { name: 'Striatum', en: 'Caudate + Putamen. Habit loops and action selection. The "pattern runner."', hi: 'कॉडेट + पुटामेन। आदत लूप और क्रिया चयन।' },
      { name: 'Globus Pallidus', en: 'Action inhibition — the brake on the habit system.', hi: 'क्रिया अवरोध — आदत प्रणाली की ब्रेक।' },
      { name: 'Substantia Nigra', en: 'Dopamine modulation for movement and habit reinforcement.', hi: 'आंदोलन और आदत सुदृढीकरण के लिए डोपामाइन।' },
    ],
    note: { en: '💡 This system runs forever once set. Program it deliberately — not accidentally.', hi: '💡 पैटर्न स्थापित होने पर यह हमेशा चलती है। जानबूझकर प्रोग्राम करें।' },
    extras: []
  },
  {
    id: 'motivation', color: '#a3e635', icon: '⚡', builtIn: true,
    en: { title: 'Motivation & Reinforcement', sub: 'Dopamine Pathway · System 4', lead: 'Signals importance and predicted reward. Dopamine ≠ pleasure. Dopamine = "This matters. Move."' },
    hi: { title: 'प्रेरणा और सुदृढीकरण', sub: 'डोपामाइन मार्ग · सिस्टम 4', lead: 'डोपामाइन ≠ आनंद। डोपामाइन = "यह महत्वपूर्ण है। आगे बढ़ो।"' },
    components: [
      { name: 'VTA', en: 'Ventral Tegmental Area. Primary dopamine production source of the brain.', hi: 'वेंट्रल टेगमेंटल एरिया। मुख्य डोपामाइन उत्पादन स्रोत।' },
      { name: 'Nucleus Accumbens', en: 'Converts the dopamine signal into motivation to act and pursue.', hi: 'डोपामाइन संकेत को कार्य करने की प्रेरणा में बदलता है।' },
      { name: 'PFC Connection', en: 'Uses dopamine to pursue goals. The bridge between wanting and doing.', hi: 'लक्ष्य प्राप्त करने के लिए डोपामाइन। चाहत और करने के बीच पुल।' },
    ],
    note: { en: '🔑 Redirect dopamine toward real goals. Cheap spikes raise baseline — goals feel dull.', hi: '🔑 डोपामाइन को वास्तविक लक्ष्यों की ओर मोड़ें।' },
    extras: []
  },
  {
    id: 'survival', color: '#f43f5e', icon: '💗', builtIn: true,
    en: { title: 'Survival & Arousal', sub: 'Brainstem · System 5', lead: 'Keeps the organism alive and awake. Determines whether all higher systems function at all.' },
    hi: { title: 'जीवन-रक्षा और उत्तेजना', sub: 'ब्रेनस्टेम · सिस्टम 5', lead: 'जीव को जीवित और जागरूक रखता है। सभी उच्च प्रणालियों की नींव।' },
    components: [
      { name: 'Medulla', en: 'Heartbeat and breathing. Non-negotiable survival functions running 24/7.', hi: 'दिल की धड़कन और सांस। अनिवार्य जीवन-रक्षा कार्य।' },
      { name: 'Pons', en: 'Sleep cycle regulation. Gate to every higher cognitive function.', hi: 'नींद चक्र नियमन। हर उच्च कार्य का द्वार।' },
      { name: 'Reticular Formation', en: 'Arousal and consciousness level. Your brain\'s online/offline switch.', hi: 'उत्तेजना और चेतना स्तर। मस्तिष्क का ऑन/ऑफ स्विच।' },
    ],
    note: { en: '🛡 Neglect sleep and rest — PFC goes offline first. Every higher function degrades.', hi: '🛡 नींद नजरअंदाज करें — PFC पहले बंद होता है।' },
    extras: []
  },
  { id: 'hierarchy', color: '#818cf8', icon: '📊', builtIn: true, type: 'hierarchy', en: { title: 'Control Hierarchy', sub: 'The Dominance Stack', lead: 'Lower systems activate first and fastest. PFC sits at the top — last to speak, most important.' }, hi: { title: 'नियंत्रण पदानुक्रम', sub: 'प्रभुत्व का ढेर', lead: 'निचली प्रणालियां पहले सक्रिय होती हैं। PFC शीर्ष पर।' }, extras: [] },
  { id: 'compare', color: '#f9a8d4', icon: '⚖️', builtIn: true, type: 'compare', en: { title: 'Most vs Disciplined', sub: 'The Brain Usage Gap', lead: 'Same hardware. Completely different operating mode.' }, hi: { title: 'सामान्य बनाम अनुशासित', sub: 'मस्तिष्क उपयोग का अंतर', lead: 'एक ही हार्डवेयर। पूरी तरह अलग ऑपरेटिंग मोड।' }, extras: [] },
  { id: 'formula', color: '#c084fc', icon: '∑', builtIn: true, type: 'formula', en: { title: 'The Real Formula', sub: 'Identity Equation', lead: 'You are not your impulses, habits, or emotions. You are the instruction-creating layer.' }, hi: { title: 'वास्तविक सूत्र', sub: 'पहचान समीकरण', lead: 'आप अपने आवेग, आदतें या भावनाएं नहीं हैं।' }, extras: [] },
  { id: 'protocol', color: '#34d399', icon: '🎯', builtIn: true, type: 'protocol', en: { title: 'PFC Dominance Protocol', sub: 'Implementation Guide', lead: 'Five practices that shift brain dominance from limbic to executive control.' }, hi: { title: 'PFC प्रभुत्व प्रोटोकॉल', sub: 'कार्यान्वयन गाइड', lead: 'पांच अभ्यास जो प्रभुत्व लिम्बिक से PFC में स्थानांतरित करते हैं।' }, extras: [] },
  { id: 'quiz', color: '#fbbf24', icon: '❓', builtIn: true, type: 'quiz', en: { title: 'Knowledge Quiz', sub: 'Test Your Understanding', lead: '7 questions to verify your grasp of the cognitive architecture.' }, hi: { title: 'ज्ञान परीक्षण', sub: 'अपनी समझ जांचें', lead: '7 प्रश्न जो आपकी समझ सत्यापित करते हैं।' }, extras: [] },
];

/* ── QUIZ DATA ── */
const QS = {
  en: [
    { q: "Which region is the 'instruction generator' responsible for planning and working memory?", opts: ["Amygdala", "DLPFC", "Nucleus Accumbens", "Substantia Nigra"], ans: 1, fb: "The DLPFC handles working memory, logical structuring, and multi-step planning — the core of the Executive System." },
    { q: "Dopamine primarily signals:", opts: ["Pleasure and satisfaction", "'This matters — move toward it'", "Threat and danger", "Sleep and rest"], ans: 1, fb: "Dopamine signals salience and predicted reward — 'this matters, pursue it' — not pleasure itself." },
    { q: "Why is sleep deprivation devastating to cognitive control?", opts: ["Overactivates Amygdala only", "Shuts down Brainstem", "PFC is energy-expensive and fails first when depleted", "Destroys dopamine permanently"], ans: 2, fb: "PFC is metabolically costly. It degrades first under energy deprivation — sleep is its primary fuel." },
    { q: "Which system 'does not think — it executes stored patterns'?", opts: ["Limbic Network", "Prefrontal Cortex", "Basal Ganglia Network", "Brainstem"], ans: 2, fb: "The Basal Ganglia runs pre-programmed loops automatically, without deliberation." },
    { q: "The ACC activates when you feel internal tension. Its function is:", opts: ["Producing dopamine", "Detecting conflict and calling for more control", "Regulating sleep cycles", "Processing pleasure"], ans: 1, fb: "ACC is your error-detection and conflict-monitoring signal — it flags problems and recruits the PFC." },
    { q: "In disciplined individuals, what happens to the dopamine system?", opts: ["Suppressed entirely", "Redirected toward meaningful goals by PFC", "Permanently heightened", "Stops reacting to rewards"], ans: 1, fb: "Discipline redirects dopamine — the PFC associates the motivational drive with long-term goals." },
    { q: "Which Limbic structure connects past memories to present emotional reactions?", opts: ["Hypothalamus", "Nucleus Accumbens", "Hippocampus", "Globus Pallidus"], ans: 2, fb: "The Hippocampus stores memories with context tags and feeds pattern data to the amygdala." },
  ],
  hi: [
    { q: "कौन सा क्षेत्र 'निर्देश-निर्माता' है — योजना और कार्यशील स्मृति के लिए?", opts: ["अमिग्डाला", "DLPFC", "न्यूक्लियस एक्युम्बेन्स", "सबस्टेंशिया नाइग्रा"], ans: 1, fb: "DLPFC कार्यशील स्मृति, तार्किक संरचना और बहु-चरण योजना संभालता है।" },
    { q: "डोपामाइन मुख्य रूप से क्या संकेत देता है?", opts: ["आनंद और संतुष्टि", "'यह महत्वपूर्ण है — आगे बढ़ो'", "खतरा", "नींद"], ans: 1, fb: "डोपामाइन आनंद रसायन नहीं — यह महत्व का संकेत है।" },
    { q: "नींद की कमी संज्ञानात्मक नियंत्रण को क्यों नुकसान पहुंचाती है?", opts: ["केवल अमिग्डाला अत्यधिक सक्रिय", "ब्रेनस्टेम बंद", "PFC ऊर्जा-महंगा है और पहले विफल होता है", "डोपामाइन नष्ट"], ans: 2, fb: "PFC चयापचय रूप से महंगा है — ऊर्जा की कमी में यह सबसे पहले विफल होता है।" },
    { q: "कौन सी प्रणाली 'सोचती नहीं — पैटर्न निष्पादित करती है'?", opts: ["लिम्बिक", "प्रीफ्रंटल कॉर्टेक्स", "बेसल गैन्ग्लिया", "ब्रेनस्टेम"], ans: 2, fb: "बेसल गैन्ग्लिया बिना सोचे पूर्व-प्रोग्राम्ड लूप चलाती है।" },
    { q: "ACC की क्या भूमिका है?", opts: ["डोपामाइन उत्पादन", "संघर्ष पहचानना और नियंत्रण बुलाना", "नींद नियमन", "आनंद प्रसंस्करण"], ans: 1, fb: "ACC त्रुटि-पहचान प्रणाली है जो PFC को भर्ती करती है।" },
    { q: "अनुशासित लोगों में डोपामाइन का क्या होता है?", opts: ["दबाया जाता", "PFC द्वारा अर्थपूर्ण लक्ष्यों की ओर मोड़ा जाता", "बढ़ाया जाता", "प्रतिक्रिया बंद"], ans: 1, fb: "अनुशासन डोपामाइन को दीर्घकालिक लक्ष्यों से जोड़ता है।" },
    { q: "कौन सी लिम्बिक संरचना स्मृति को वर्तमान भावनाओं से जोड़ती है?", opts: ["हाइपोथैलेमस", "न्यूक्लियस एक्युम्बेन्स", "हिप्पोकैम्पस", "ग्लोबस पैलिडस"], ans: 2, fb: "हिप्पोकैम्पस संदर्भ टैग के साथ यादें संग्रहीत करता है।" },
  ]
};

/* ══════════════════════════════════════
   LOCALSTORAGE
══════════════════════════════════════ */
let MODS = [];

function loadData() {
  try {
    const saved = localStorage.getItem('neurobook_modules');
    if (saved) {
      MODS = JSON.parse(saved);
    } else {
      MODS = JSON.parse(JSON.stringify(DEFAULT_MODULES));
    }
    const savedLang = localStorage.getItem('neurobook_lang');
    if (savedLang) lang = savedLang;
    const savedTheme = localStorage.getItem('neurobook_theme');
    if (savedTheme) {
      document.body.setAttribute('data-theme', savedTheme);
      document.querySelectorAll('.sw').forEach(s => s.classList.toggle('on', s.dataset.t === savedTheme));
    }
    const savedSb = localStorage.getItem('neurobook_sb');
    if (savedSb === 'closed') { sbOpen = false; applySb(); }
  } catch (e) {
    MODS = JSON.parse(JSON.stringify(DEFAULT_MODULES));
  }
}

function saveData() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem('neurobook_modules', JSON.stringify(MODS));
      localStorage.setItem('neurobook_lang', lang);
      localStorage.setItem('neurobook_theme', document.body.getAttribute('data-theme') || 'void');
      localStorage.setItem('neurobook_sb', sbOpen ? 'open' : 'closed');
      showSaveIndicator();
    } catch (e) { console.warn('Save failed', e); }
  }, 400);
}

function showSaveIndicator() {
  const ind = $('saveInd');
  if (!ind) return;
  ind.classList.add('show');
  clearTimeout(ind._t);
  ind._t = setTimeout(() => ind.classList.remove('show'), 1800);
}

function showToast(msg) {
  const t = $('toast');
  if (!t) return;
  t.querySelector('.toast-msg').textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ══════════════════════════════════════
   SIDEBAR TOGGLE
══════════════════════════════════════ */
function toggleSb() {
  sbOpen = !sbOpen;
  applySb();
  saveData();
}

function applySb() {
  const sb = $('sb');
  if (sbOpen) sb.classList.remove('collapsed');
  else sb.classList.add('collapsed');
}

/* ══════════════════════════════════════
   NAV
══════════════════════════════════════ */
function renderNav() {
  const nav = $('sbNav');
  nav.innerHTML = `<div class="nav-hd">${lang === 'hi' ? 'मॉड्यूल' : 'Modules'}</div>`;

  MODS.forEach(m => {
    const d = document.createElement('div');
    d.className = 'ni' + (curMod === m.id ? ' on' : '');
    d.style.setProperty('--nic', m.color);
    d.onclick = () => showMod(m.id);
    d.innerHTML = `
      <div class="ni-dot"></div>
      <div class="ni-txt">
        <div class="ni-name">${tr(m, 'title')}</div>
        <div class="ni-sub">${tr(m, 'sub')}</div>
      </div>
      <div class="ni-actions">
        <button class="ni-icon-btn" onclick="editModMeta('${m.id}',event)" title="Rename">✎</button>
        <button class="ni-icon-btn del" onclick="delMod('${m.id}',event)" title="Delete">✕</button>
      </div>
    `;
    nav.appendChild(d);
  });

  // Update lang buttons
  document.querySelectorAll('.lb').forEach((b, i) => {
    b.classList.toggle('on', (i === 0 && lang === 'en') || (i === 1 && lang === 'hi'));
  });
  $('lblAddMod').textContent = lang === 'hi' ? '+ मॉड्यूल जोड़ें' : '+ Add Module';
  $('lblTheme').textContent = lang === 'hi' ? 'थीम' : 'Theme';
  $('lblPDF').textContent = lang === 'hi' ? 'PDF' : 'PDF';
}

/* ══════════════════════════════════════
   SHOW MODULE
══════════════════════════════════════ */
function showMod(id) {
  curMod = id;
  qAns = {};
  renderNav();
  const m = MODS.find(x => x.id === id);
  if (!m) return;
  $('tbT').textContent = tr(m, 'title');
  $('tbS').textContent = tr(m, 'sub');
  const el = $('content');
  el.style.opacity = 0;
  setTimeout(() => {
    el.innerHTML = buildMod(m);
    el.className = 'anim';
    el.style.opacity = 1;
    if (m.type === 'quiz') bindQuiz(m);
  }, 80);
}

/* ══════════════════════════════════════
   BUILD MODULE
══════════════════════════════════════ */
function buildMod(m) {
  let h = `
    <div class="mod-eye">${m.icon} ${tr(m, 'sub')}</div>
    <h1 class="mod-title">${tr(m, 'title')}</h1>
    <p class="mod-lead">${tr(m, 'lead')}</p>
    <div class="accent-line" style="background:${m.color}"></div>
  `;
  if (m.type === 'hierarchy') h += buildHier();
  else if (m.type === 'compare')  h += buildCmp();
  else if (m.type === 'formula')  h += buildFormula();
  else if (m.type === 'protocol') h += buildProto();
  else if (m.type === 'quiz')     h += buildQuizHTML();
  else if (m.components)          h += buildCards(m);
  else if (m.custom)              h += buildCustom(m);
  return h;
}

/* ══════════════════════════════════════
   CARD GRID — with edit/save/delete
══════════════════════════════════════ */
function buildCards(m) {
  let h = `
    <div class="section-row">
      <span class="section-label">${lang === 'hi' ? 'घटक' : 'Components'}</span>
    </div>
    <div class="cards-grid" id="cg-${m.id}">
  `;
  (m.components || []).forEach((c, ci) => {
    h += cardHTML(m.id, ci, c, m.color);
  });
  h += addCardTileHTML(m.id);
  h += `</div>`;

  if (m.note) {
    h += `<div class="note-box" style="border-left:3px solid ${m.color}40">
      <span class="eh">${lang === 'hi' ? 'क्लिक करें' : 'click to edit'}</span>
      <div class="note-txt" style="color:${m.color}" contenteditable="true"
        onblur="saveNote('${m.id}',this.textContent)">${m.note[lang] || m.note.en}</div>
    </div>`;
  }
  return h;
}

function cardHTML(mid, ci, c, col) {
  return `
  <div class="card-wrap" id="cw-${mid}-${ci}">
    <div class="card-toolbar">
      <button class="ct-btn" onclick="toggleEditCard('${mid}',${ci})"
        id="editBtn-${mid}-${ci}">${lang === 'hi' ? '✎ संपादित' : '✎ Edit'}</button>
      <button class="ct-btn save-ct" onclick="saveCardEdit('${mid}',${ci})"
        id="saveBtn-${mid}-${ci}" style="display:none">${lang === 'hi' ? '✓ सहेजें' : '✓ Save'}</button>
      <button class="ct-btn del" onclick="delCard('${mid}',${ci})">✕</button>
    </div>
    <div class="card" style="--cc:${col}" id="card-${mid}-${ci}">
      <div class="card-badge-wrap">
        <span class="card-badge" style="color:${col}"
          id="badge-${mid}-${ci}">${c.name}</span>
      </div>
      <div class="card-desc" id="desc-${mid}-${ci}">${c[lang] || c.en}</div>
    </div>
  </div>`;
}

function addCardTileHTML(mid) {
  return `<button class="add-card-tile" onclick="startAddCard('${mid}')">
    <span class="plus">＋</span>
    <span>${lang === 'hi' ? 'कार्ड जोड़ें' : 'Add Card'}</span>
  </button>`;
}

/* Toggle edit mode on a card */
function toggleEditCard(mid, ci) {
  const card = $(`card-${mid}-${ci}`);
  const badge = $(`badge-${mid}-${ci}`);
  const desc = $(`desc-${mid}-${ci}`);
  const editBtn = $(`editBtn-${mid}-${ci}`);
  const saveBtn = $(`saveBtn-${mid}-${ci}`);

  card.classList.add('editing');
  badge.contentEditable = 'true';
  desc.contentEditable = 'true';
  badge.focus();
  editBtn.style.display = 'none';
  saveBtn.style.display = 'inline-flex';
}

function saveCardEdit(mid, ci) {
  const card = $(`card-${mid}-${ci}`);
  const badge = $(`badge-${mid}-${ci}`);
  const desc = $(`desc-${mid}-${ci}`);
  const editBtn = $(`editBtn-${mid}-${ci}`);
  const saveBtn = $(`saveBtn-${mid}-${ci}`);

  const newName = badge.textContent.trim() || 'Card';
  const newDesc = desc.textContent.trim();

  const m = MODS.find(x => x.id === mid);
  if (m && m.components[ci]) {
    m.components[ci].name = newName;
    m.components[ci].en = newDesc;
    m.components[ci].hi = newDesc;
    m.components[ci][lang] = newDesc;
  }

  card.classList.remove('editing');
  badge.contentEditable = 'false';
  desc.contentEditable = 'false';
  editBtn.style.display = 'inline-flex';
  saveBtn.style.display = 'none';

  saveData();
  showToast(lang === 'hi' ? '✓ कार्ड सहेजा' : '✓ Card saved');
}

function saveNote(mid, val) {
  const m = MODS.find(x => x.id === mid);
  if (m && m.note) { m.note.en = val; m.note.hi = val; m.note[lang] = val; }
  saveData();
}

function delCard(mid, ci) {
  const m = MODS.find(x => x.id === mid);
  if (!m) return;
  m.components.splice(ci, 1);
  reRenderGrid(m);
  saveData();
}

function reRenderGrid(m) {
  const grid = $(`cg-${m.id}`);
  if (!grid) return;
  grid.innerHTML = '';
  (m.components || []).forEach((c, ci) => {
    grid.insertAdjacentHTML('beforeend', cardHTML(m.id, ci, c, m.color));
  });
  grid.insertAdjacentHTML('beforeend', addCardTileHTML(m.id));
}

/* Add Card */
let _addCardTarget = null;
function startAddCard(mid) {
  _addCardTarget = mid;
  $('acBadge').value = '';
  $('acDesc').value = '';
  openOv('ovAddCard');
  setTimeout(() => $('acBadge').focus(), 100);
}

function confirmAddCard() {
  const badge = $('acBadge').value.trim();
  const desc = $('acDesc').value.trim();
  if (!badge && !desc) { closeOv('ovAddCard'); return; }
  const m = MODS.find(x => x.id === _addCardTarget);
  if (m) {
    if (!m.components) m.components = [];
    m.components.push({ name: badge || 'New Card', en: desc || '', hi: desc || '' });
    closeOv('ovAddCard');
    reRenderGrid(m);
    saveData();
    showToast(lang === 'hi' ? '✓ कार्ड जोड़ा' : '✓ Card added');
  }
}

/* ══════════════════════════════════════
   SPECIAL VIEWS
══════════════════════════════════════ */
function buildHier() {
  const rows = [
    { col: '#f43f5e', en: 'Survival — Brainstem',       hi: 'जीवन-रक्षा — ब्रेनस्टेम',        tag: 'BASE' },
    { col: '#fb923c', en: 'Emotion — Limbic',            hi: 'भावना — लिम्बिक',                  tag: 'FAST' },
    { col: '#22d3ee', en: 'Habit — Basal Ganglia',       hi: 'आदत — बेसल गैन्ग्लिया',           tag: 'AUTO' },
    { col: '#a3e635', en: 'Motivation — Dopamine',       hi: 'प्रेरणा — डोपामाइन',               tag: 'DRIVE' },
    { col: '#c084fc', en: 'Executive Control — PFC',     hi: 'कार्यकारी नियंत्रण — PFC',         tag: 'GOAL' },
  ];
  let h = `<div class="hier-wrap">`;
  rows.forEach((r, i) => {
    h += `<div class="hier-row" style="border-left:3px solid ${r.col}">
      <div class="h-dot" style="background:${r.col};box-shadow:0 0 7px ${r.col}"></div>
      <span class="h-name">${r[lang] || r.en}</span>
      <span class="h-tag" style="color:${r.col}">${r.tag}</span>
    </div>`;
    if (i < rows.length - 1) h += `<div class="h-arr">↓</div>`;
  });
  h += `</div>`;
  const ins = lang === 'hi'
    ? 'अधिकांश लोगों में: लिम्बिक + डोपामाइन हावी। PFC देर से प्रतिक्रिया करता है। अनुशासित लोगों में: PFC नियम सेट करता है → डोपामाइन पुनर्निर्देशित → आदतें अनुसरण करती हैं।'
    : 'Most people: Limbic + Dopamine dominate. PFC reacts late.<br>Disciplined: PFC sets the rule → Dopamine redirected → Habits follow → Limbic regulated.';
  h += `<div class="note-box" style="margin-top:1.2rem">
    <div style="font-family:var(--font-d);font-size:.9rem;font-weight:700;margin-bottom:.4rem">${lang === 'hi' ? 'मुख्य अंतर्दृष्टि' : 'Key Insight'}</div>
    <div style="font-size:.8rem;color:var(--mu2);line-height:1.7">${ins}</div>
  </div>`;
  return h;
}

function buildCmp() {
  const bad = lang === 'hi'
    ? ['लिम्बिक + डोपामाइन सभी निर्णयों पर हावी', 'PFC आवेग के बाद देर से प्रतिक्रिया', 'सस्ता डोपामाइन लक्ष्यों को हाईजैक करता', 'आदतें संयोगवश बनती हैं', 'भावना = पहचान। आवेग = क्रिया।']
    : ['Limbic + Dopamine dominate all decisions', 'PFC reacts late, after impulse fires', 'Cheap dopamine hijacks goals', 'Habits formed by accident, not intention', 'Emotion = identity. Impulse = action.'];
  const good = lang === 'hi'
    ? ['PFC परिस्थितियों से पहले नियम सेट', 'डोपामाइन अर्थपूर्ण लक्ष्यों की ओर', 'आदतें जानबूझकर प्रोग्राम', 'लिम्बिक नियंत्रित — दबाई नहीं', 'आवेग देखा जाता। PFC निर्णय लेता।']
    : ['PFC sets the rule before situations arise', 'Dopamine redirected toward meaningful goals', 'Habits intentionally programmed', 'Limbic regulated — not suppressed', 'Impulse observed. PFC decides.'];
  const bl = lang === 'hi' ? 'अधिकांश लोग' : 'Most People';
  const gl = lang === 'hi' ? 'अनुशासित लोग' : 'Disciplined People';
  return `<div class="cmp-grid2">
    <div class="cmp-box" style="border-color:rgba(244,63,94,.18)">
      <div class="cmp-title2" style="color:var(--a5)">${bl}</div>
      ${bad.map(b => `<div class="cmp-item2"><span style="color:var(--a5);flex-shrink:0">→</span>${b}</div>`).join('')}
    </div>
    <div class="cmp-box" style="border-color:rgba(163,230,53,.18)">
      <div class="cmp-title2" style="color:var(--a4)">${gl}</div>
      ${good.map(g => `<div class="cmp-item2"><span style="color:var(--a4);flex-shrink:0">→</span>${g}</div>`).join('')}
    </div>
  </div>`;
}

function buildFormula() {
  const you   = lang === 'hi' ? 'आप' : 'You';
  const items = lang === 'hi' ? ['आवेग', 'आदत', 'भावना'] : ['Impulse', 'Habit', 'Emotion'];
  const pfc   = lang === 'hi' ? 'PFC नेटवर्क' : 'PFC Network';
  const best  = lang === 'hi' ? 'आप (सर्वश्रेष्ठ)' : 'You (at your best)';
  const sep   = lang === 'hi' ? 'निर्देश-निर्माण परत =' : 'THE INSTRUCTION-CREATING LAYER =';
  return `<div class="formula-box">
    ${items.map(i => `<div class="f-line"><span class="f-chip x">${i}</span><span class="f-neq">≠</span><span class="f-chip x">${you}</span></div>`).join('')}
    <div class="f-sep">${sep}</div>
    <div class="f-line"><span class="f-chip lit">${pfc}</span><span class="f-eq">=</span><span class="f-chip lit">${best}</span></div>
  </div>`;
}

function buildProto() {
  const items = lang === 'hi' ? [
    { icon: '🌙', title: 'नींद की रक्षा करें', desc: 'PFC ऊर्जा-महंगा है। नींद की कमी इसे सबसे पहले बंद करती है।', tag: 'PFC ईंधन', c: '#818cf8' },
    { icon: '📵', title: 'सस्ते डोपामाइन कम करें', desc: 'सोशल मीडिया रिवॉर्ड बेसलाइन बढ़ाता है — वास्तविक लक्ष्य अनाकर्षक लगते हैं।', tag: 'डोपामाइन रीसेट', c: '#34d399' },
    { icon: '🧩', title: 'कार्यशील स्मृति प्रशिक्षित करें', desc: 'DLPFC गहरी पढ़ाई और जटिल समस्याओं से मजबूत होता है।', tag: 'DLPFC प्रशिक्षण', c: '#60a5fa' },
    { icon: '⚙️', title: 'जानबूझकर आदतें बनाएं', desc: 'संकेत आने से पहले दिनचर्या चुनें — बाद में नहीं।', tag: 'आदत प्रोग्रामिंग', c: '#f9a8d4' },
    { icon: '⏳', title: 'विलंबित संतुष्टि का अभ्यास', desc: 'हर बार जब पुरस्कार टालते हैं, PFC प्रभुत्व मजबूत होता है।', tag: 'PFC प्रभुत्व', c: '#fbbf24' },
  ] : [
    { icon: '🌙', title: 'Protect Sleep', desc: 'PFC is fuel-expensive. Sleep deprivation knocks it offline first. Back to brainstem-only mode.', tag: 'PFC Fuel', c: '#818cf8' },
    { icon: '📵', title: 'Reduce Cheap Dopamine', desc: 'Social media floods the reward system, raising baseline so high that real goals feel dull.', tag: 'Dopamine Reset', c: '#34d399' },
    { icon: '🧩', title: 'Train Working Memory', desc: 'DLPFC strengthens through deep reading, complex problem-solving, and structured writing.', tag: 'DLPFC Training', c: '#60a5fa' },
    { icon: '⚙️', title: 'Build Intentional Habits', desc: 'Basal Ganglia runs forever once set. Choose the routine before the cue — not after.', tag: 'Basal Ganglia', c: '#f9a8d4' },
    { icon: '⏳', title: 'Practice Delayed Gratification', desc: 'Each deferred reward strengthens PFC-over-limbic dominance. This is the master skill.', tag: 'PFC Dominance', c: '#fbbf24' },
  ];
  return `<div class="proto-grid">${items.map(p => `
    <div class="p-card" style="--pc:${p.c}">
      <div class="p-icon">${p.icon}</div>
      <div class="p-title">${p.title}</div>
      <div class="p-desc">${p.desc}</div>
      <div class="p-tag" style="color:${p.c}">${p.tag}</div>
    </div>`).join('')}</div>`;
}

function buildQuizHTML() {
  const qs = QS[lang] || QS.en;
  return `<div id="qwrap">${qs.map((q, i) => `
    <div class="q-card">
      <div class="q-text">${i + 1}. ${q.q}</div>
      <div class="q-opts">${q.opts.map((o, j) => `<button class="q-opt" data-qi="${i}" data-j="${j}">${o}</button>`).join('')}</div>
      <div class="q-fb" id="qfb${i}"></div>
    </div>`).join('')}
  </div><div class="q-score" id="qsc"></div>`;
}

function bindQuiz() {
  $('content').querySelectorAll('.q-opt').forEach(b => {
    b.onclick = () => {
      const qi = +b.dataset.qi, j = +b.dataset.j;
      if (qAns[qi] !== undefined) return;
      qAns[qi] = j;
      const qs = QS[lang] || QS.en, q = qs[qi];
      b.closest('.q-opts').querySelectorAll('.q-opt').forEach(x => x.disabled = true);
      b.closest('.q-opts').querySelectorAll('.q-opt')[q.ans].classList.add('c');
      const fb = $('qfb' + qi);
      if (j === q.ans) { b.classList.add('c'); fb.className = 'q-fb show c'; fb.textContent = '✓ ' + q.fb; }
      else             { b.classList.add('w'); fb.className = 'q-fb show w'; fb.textContent = '✗ ' + q.fb; }
      const tot = qs.length, done = Object.keys(qAns).length;
      const corr = Object.entries(qAns).filter(([i, s]) => +s === qs[+i].ans).length;
      $('qsc').textContent = `${done}/${tot} ${lang === 'hi' ? 'उत्तर' : 'answered'} · ${corr} ${lang === 'hi' ? 'सही' : 'correct'}`;
    };
  });
}

function buildCustom(m) {
  const pts = m.points || [];
  if (!pts.length) return `<p style="color:var(--mu);font-size:.85rem">${lang === 'hi' ? 'कोई बिंदु नहीं।' : 'No points added yet.'}</p>`;
  return `<ul class="cpoints">${pts.map(p => `<li class="cpoint" style="--cc:${m.color}">${p}</li>`).join('')}</ul>`;
}

/* ══════════════════════════════════════
   LANG & THEME
══════════════════════════════════════ */
function setLang(l) {
  lang = l;
  document.querySelectorAll('.lb').forEach((b, i) => {
    b.classList.toggle('on', (i === 0 && l === 'en') || (i === 1 && l === 'hi'));
  });
  saveData();
  renderNav();
  if (curMod) showMod(curMod);
}

function setTheme(t) {
  document.body.setAttribute('data-theme', t);
  document.querySelectorAll('.sw').forEach(s => s.classList.toggle('on', s.dataset.t === t));
  saveData();
}

/* ══════════════════════════════════════
   MODULE CRUD
══════════════════════════════════════ */
function createMod() {
  const title = $('nT').value.trim();
  if (!title) { $('nT').focus(); return; }
  const id = 'cx_' + Date.now();
  MODS.push({
    id, icon: '📌', color: $('nC').value, custom: true, builtIn: false,
    en: { title, sub: $('nS').value.trim() || 'Custom Module', lead: $('nSu').value.trim() || '' },
    hi: { title, sub: $('nS').value.trim() || 'कस्टम मॉड्यूल', lead: $('nSu').value.trim() || '' },
    points: $('nP').value.trim().split('\n').filter(p => p.trim()),
    extras: []
  });
  ['nT', 'nS', 'nSu', 'nP'].forEach(i => $(i).value = '');
  closeOv('ovAddMod');
  saveData();
  renderNav();
  showMod(id);
  showToast(lang === 'hi' ? '✓ मॉड्यूल बनाया' : '✓ Module created');
}

/* Edit module metadata (rename etc) */
let _editModId = null;
function editModMeta(id, e) {
  e.stopPropagation();
  _editModId = id;
  const m = MODS.find(x => x.id === id);
  if (!m) return;
  $('emTitle').value = tr(m, 'title');
  $('emSub').value   = tr(m, 'sub');
  $('emLead').value  = tr(m, 'lead');
  $('emColor').value = m.color;
  $('emIcon').value  = m.icon;
  openOv('ovEditMod');
}

function saveModMeta() {
  const m = MODS.find(x => x.id === _editModId);
  if (!m) return;
  const title = $('emTitle').value.trim() || tr(m, 'title');
  const sub   = $('emSub').value.trim()   || tr(m, 'sub');
  const lead  = $('emLead').value.trim()  || tr(m, 'lead');
  // Update both langs
  if (!m.en) m.en = {};
  if (!m.hi) m.hi = {};
  m.en.title = title; m.en.sub = sub; m.en.lead = lead;
  m.hi.title = title; m.hi.sub = sub; m.hi.lead = lead;
  m.color = $('emColor').value;
  m.icon  = $('emIcon').value.trim() || m.icon;
  closeOv('ovEditMod');
  saveData();
  renderNav();
  if (curMod === _editModId) showMod(_editModId);
  showToast(lang === 'hi' ? '✓ मॉड्यूल अपडेट हुआ' : '✓ Module updated');
}

function delMod(id, e) {
  e.stopPropagation();
  if (!confirm(lang === 'hi' ? 'इस मॉड्यूल को हटाएं?' : 'Delete this module?')) return;
  const idx = MODS.findIndex(m => m.id === id);
  if (idx >= 0) {
    MODS.splice(idx, 1);
    saveData();
    renderNav();
    if (curMod === id) showMod(MODS[0]?.id);
  }
}

/* ══════════════════════════════════════
   PDF EXPORT
══════════════════════════════════════ */
async function dlPDF() {
  const btn = $('btnPDF');
  btn.innerHTML = '⏳';
  btn.disabled = true;
  const { jsPDF } = window.jspdf;
  const m = MODS.find(x => x.id === curMod);
  if (!m) { btn.innerHTML = `⬇ <span id="lblPDF">PDF</span>`; btn.disabled = false; return; }
  const ti = tr(m, 'title'), su = tr(m, 'sub'), le = tr(m, 'lead');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, mg = 18; let y = mg;

  pdf.setFillColor(12, 12, 22); pdf.rect(0, 0, W, 48, 'F');
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(20); pdf.setTextColor(220, 210, 255);
  pdf.text(ti, mg, y + 12);
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(130, 120, 160);
  pdf.text(su || '', mg, y + 20);
  pdf.setFontSize(9); pdf.setTextColor(190, 185, 210);
  pdf.text(pdf.splitTextToSize(le || '', W - mg * 2), mg, y + 28);
  y = 56;

  const sec = (title, text, bg = [245, 243, 255], tc = [50, 45, 80]) => {
    if (y > 258) { pdf.addPage(); y = mg; }
    const lines = pdf.splitTextToSize(text, W - mg * 2 - 8);
    const h = Math.max(20, lines.length * 5 + 12);
    pdf.setFillColor(...bg); pdf.roundedRect(mg, y, W - mg * 2, h, 3, 3, 'F');
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); pdf.setTextColor(100, 50, 180);
    pdf.text(title, mg + 4, y + 7);
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8.5); pdf.setTextColor(...tc);
    pdf.text(lines, mg + 4, y + 13); y += h + 6;
  };

  if (m.components) { m.components.forEach(c => sec(c.name, c[lang] || c.en)); }
  if (m.note) sec('Note', m.note[lang] || m.note.en, [240, 235, 255], [120, 80, 190]);
  if (m.custom && m.points) m.points.forEach((p, i) => sec(`${i + 1}`, p));

  pdf.setFillColor(235, 232, 248); pdf.rect(0, 285, W, 12, 'F');
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7); pdf.setTextColor(160, 150, 180);
  pdf.text('NeuroBook · Cognitive Architecture Notebook', W / 2, 292, { align: 'center' });
  pdf.save(`${ti.replace(/\s+/g, '-').replace(/[^\w-]/g, '')}.pdf`);
  btn.innerHTML = `⬇ <span id="lblPDF">${lang === 'hi' ? 'PDF' : 'PDF'}</span>`;
  btn.disabled = false;
}

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
function init() {
  loadData();

  // Sidebar toggle
  $('sbToggle').addEventListener('click', toggleSb);

  // Modal close on overlay click
  document.querySelectorAll('.ov').forEach(o => {
    o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
  });

  // Enter key in modal inputs
  $('nT').addEventListener('keydown', e => { if (e.key === 'Enter') createMod(); });
  $('acBadge').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('acDesc').focus(); } });

  // Update lang buttons initial state
  document.querySelectorAll('.lb').forEach((b, i) => {
    b.classList.toggle('on', (i === 0 && lang === 'en') || (i === 1 && lang === 'hi'));
  });

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  renderNav();
  showMod(MODS[0]?.id || 'executive');
}

document.addEventListener('DOMContentLoaded', init);
