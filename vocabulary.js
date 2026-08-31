// Vocabulary Lab — page-specific logic for pages/vocabulary.html

const vocabContainer     = document.getElementById('vocabContainer');
const vocabLearnModeBtn  = document.getElementById('vocabLearnModeBtn');
const vocabTestModeBtn   = document.getElementById('vocabTestModeBtn');
const vocabModeHint      = document.getElementById('vocabModeHint');
const vocabAudioStatus   = document.getElementById('vocabAudioStatus');

// State
let isLearnMode = localStorage.getItem('VOCAB_LEARN_MODE') !== 'false';
let currentAudio = null;

const AUDIO_BASE = '../audio/vocabulary/';
const VOCAB_LEARN_KEY = 'VOCAB_LEARN_MODE';

// ─── Data ────────────────────────────────────────────────────────────────────
// Each entry: { word, thai, phon, english, audio }
//   word    — English meaning
//   thai    — Thai script
//   phon    — phonetic tones / pronunciation aid
//   english — translation (usually same as word; kept for clarity)
//   audio   — mp3 filename (added later; optional)
const vocabulary = [
  // ── Pronouns & Polite Particles ── //
  { word: 'I',                  thai: 'ผม',   phon: 'pǒm',        english: 'I (male, polite)',       category: 'pronouns' },
  { word: 'I / Me',             thai: 'ฉัน',  phon: 'chǎn',       english: 'I / Me (female or neutral)', category: 'pronouns' },
  { word: 'You',                thai: 'คุณ',  phon: 'kun',        english: 'You (polite)',           category: 'pronouns' },
  { word: 'He / She',           thai: 'เขา',  phon: 'kǎo',        english: 'He / She / They',        category: 'pronouns' },
  { word: 'It',                 thai: 'มัน',  phon: 'man',        english: 'It',                     category: 'pronouns' },
  { word: 'We / Us',            thai: 'เรา',  phon: 'rao',        english: 'We / Us',                category: 'pronouns' },
  { word: 'Older sibling',      thai: 'พี่',   phon: 'pîi',        english: 'Older brother/sister (respectful for older people)', category: 'pronouns' },
  { word: 'Younger sibling',    thai: 'น้อง', phon: 'nóong',      english: 'Younger brother/sister', category: 'pronouns' },
  { word: 'ครับ',               thai: 'ครับ', phon: 'kráp',       english: 'Polite particle (male speaker)', category: 'pronouns' },
  { word: 'ค่ะ',                thai: 'ค่ะ',  phon: 'kâ',         english: 'Polite particle (female, statements)', category: 'pronouns' },
  { word: 'คะ',                 thai: 'คะ',   phon: 'ká',         english: 'Polite particle (female, questions)', category: 'pronouns' },

  // ── Core Verbs ── //
  { word: 'To be (is/am/are)', thai: 'เป็น',  phon: 'bpen',        english: 'To be (identity/status)', category: 'verbs' },
  { word: 'To be (means)',     thai: 'คือ',   phon: 'kue',         english: 'To be (means / is defined as)', category: 'verbs' },
  { word: 'To have',           thai: 'มี',    phon: 'mii',         english: 'To have / There is / There are', category: 'verbs' },
  { word: 'To go',             thai: 'ไป',    phon: 'bpai',        english: 'To go',            category: 'verbs' },
  { word: 'To come',           thai: 'มา',    phon: 'maa',         english: 'To come',          category: 'verbs' },
  { word: 'To do / make',      thai: 'ทำ',    phon: 'tham',        english: 'To do / To make',  category: 'verbs' },
  { word: 'To eat',            thai: 'กิน',   phon: 'gin',         english: 'To eat',           category: 'verbs' },
  { word: 'To drink',          thai: 'ดื่ม',  phon: 'duem',        english: 'To drink',         category: 'verbs' },
  { word: 'To want / take',    thai: 'เอา',   phon: 'ao',          english: 'To want / To take (an item)', category: 'verbs' },
  { word: 'To want to',        thai: 'อยาก',  phon: 'yàak',        english: 'To want to (do something)', category: 'verbs' },
  { word: 'To like',           thai: 'ชอบ',   phon: 'chɔ̂ɔp',       english: 'To like',          category: 'verbs' },
  { word: 'To love',           thai: 'รัก',   phon: 'rák',         english: 'To love',          category: 'verbs' },
  { word: 'To speak / talk',   thai: 'พูด',   phon: 'pûut',        english: 'To speak / To talk', category: 'verbs' },
  { word: 'To listen',         thai: 'ฟัง',   phon: 'fang',        english: 'To listen',        category: 'verbs' },
  { word: 'To look / watch',   thai: 'ดู',    phon: 'duu',         english: 'To look / To watch', category: 'verbs' },
  { word: 'To see',            thai: 'เห็น',  phon: 'hěn',         english: 'To see',           category: 'verbs' },
  { word: 'To think',          thai: 'คิด',   phon: 'kít',         english: 'To think',         category: 'verbs' },
  { word: 'To know (facts)',   thai: 'รู้',    phon: 'rúu',         english: 'To know (facts/information)', category: 'verbs' },
  { word: 'To know (person)',  thai: 'รู้จัก', phon: 'rúu-jàk',     english: 'To know (a person or place)', category: 'verbs' },
  { word: 'To understand',     thai: 'เข้าใจ', phon: 'kâo-jai',     english: 'To understand',    category: 'verbs' },
  { word: 'To give',           thai: 'ให้',    phon: 'hâi',         english: 'To give / For / To let', category: 'verbs' },
  { word: 'Can / Able',        thai: 'ได้',    phon: 'dâi',         english: 'Can / Able to / Got', category: 'verbs' },
  { word: 'To buy',            thai: 'ซื้อ',   phon: 'súe',         english: 'To buy',           category: 'verbs' },
  { word: 'To sell',           thai: 'ขาย',   phon: 'kǎai',        english: 'To sell',          category: 'verbs' },
  { word: 'To sleep',          thai: 'นอน',   phon: 'nɔɔn',        english: 'To sleep / Lie down', category: 'verbs' },
  { word: 'To work',           thai: 'ทำงาน', phon: 'tham-ngaan',  english: 'To work',          category: 'verbs' },
  { word: 'To wait',           thai: 'รอ',    phon: 'rɔɔ',         english: 'To wait',          category: 'verbs' },
  { word: 'To meet / find',    thai: 'เจอ',   phon: 'jəə',         english: 'To meet / To find', category: 'verbs' },
  { word: 'To help',           thai: 'ช่วย',  phon: 'chûai',       english: 'To help',          category: 'verbs' },
  { word: 'To use',            thai: 'ใช้',   phon: 'chái',        english: 'To use',           category: 'verbs' },

  // ── Question Words ── //
  { word: 'What',             thai: 'อะไร',     phon: 'à-rai',      english: 'What',                  category: 'questions' },
  { word: 'Who',              thai: 'ใคร',      phon: 'krai',       english: 'Who',                   category: 'questions' },
  { word: 'Where',            thai: 'ที่ไหน',   phon: 'tîi-nǎi',    english: 'Where',                 category: 'questions' },
  { word: 'When',             thai: 'เมื่อไหร่', phon: 'mûea-rài',  english: 'When',                  category: 'questions' },
  { word: 'Why',              thai: 'ทำไม',     phon: 'tam-mai',    english: 'Why',                   category: 'questions' },
  { word: 'How',              thai: 'ยังไง',    phon: 'yang-ngai',  english: 'How (อย่างไร / ยังไง)',  category: 'questions' },
  { word: 'How much',         thai: 'เท่าไหร่', phon: 'tâo-rài',    english: 'How much',              category: 'questions' },
  { word: 'How many',         thai: 'กี่',      phon: 'gìi',        english: 'How many',              category: 'questions' },
  { word: 'Question marker',  thai: 'ไหม',      phon: 'mǎi',        english: 'Yes/No question marker', category: 'questions' },
  { word: 'Right?',           thai: 'ใช่มั้ย',  phon: 'châi-mái',   english: 'Right? / Isn\'t it?',    category: 'questions' },

  // ── Common Nouns & Places ── //
  { word: 'Person / People', thai: 'คน',      phon: 'khon',        english: 'Person / People',         category: 'nouns' },
  { word: 'House / Home',    thai: 'บ้าน',    phon: 'bâan',        english: 'House / Home',             category: 'nouns' },
  { word: 'Shop / Store',    thai: 'ร้าน',    phon: 'ráan',        english: 'Shop / Store',             category: 'nouns' },
  { word: 'Food',            thai: 'อาหาร',  phon: 'aa-hǎan',     english: 'Food',                     category: 'nouns' },
  { word: 'Water',           thai: 'น้ำ',     phon: 'nám',         english: 'Water',                    category: 'nouns' },
  { word: 'Rice / Meal',     thai: 'ข้าว',    phon: 'khâaw',       english: 'Rice / Meal',              category: 'nouns' },
  { word: 'Work / Job',      thai: 'งาน',     phon: 'ngaan',       english: 'Work / Job / Event',       category: 'nouns' },
  { word: 'Friend',          thai: 'เพื่อน',  phon: 'pûean',       english: 'Friend',                   category: 'nouns' },
  { word: 'Money',           thai: 'เงิน',    phon: 'ngoen',       english: 'Money (เงิน / ตังค์)',      category: 'nouns' },
  { word: 'Thing / Belonging', thai: 'ของ',   phon: 'khɔ̌ɔng',      english: 'Thing / Belonging',        category: 'nouns' },
  { word: 'Time',            thai: 'เวลา',   phon: 'wee-laa',     english: 'Time',                     category: 'nouns' },
  { word: 'Day',             thai: 'วัน',     phon: 'wan',         english: 'Day',                      category: 'nouns' },
  { word: 'Year',            thai: 'ปี',      phon: 'bpii',        english: 'Year',                     category: 'nouns' },
  { word: 'Today',           thai: 'วันนี้',  phon: 'wan-níi',     english: 'Today',                    category: 'nouns' },
  { word: 'Tomorrow',        thai: 'พรุ่งนี้', phon: 'phrûng-níi', english: 'Tomorrow',                 category: 'nouns' },
  { word: 'Yesterday',       thai: 'เมื่อวาน', phon: 'mûuea-waan', english: 'Yesterday',                category: 'nouns' },
  { word: 'Story / Subject', thai: 'เรื่อง',  phon: 'rûeang',      english: 'Story / Matter / Subject', category: 'nouns' },

  // ── Adjectives & Adverbs ── //
  { word: 'Good',          thai: 'ดี',     phon: 'dii',        english: 'Good',                  category: 'adjectives' },
  { word: 'No / Not',      thai: 'ไม่',    phon: 'mâi',        english: 'No / Not',              category: 'adjectives' },
  { word: 'Very / Much',   thai: 'มาก',    phon: 'mâak',       english: 'Very / Much',           category: 'adjectives' },
  { word: 'Little / Few',  thai: 'น้อย',   phon: 'nɔ́ɔi',        english: 'Little / Few',          category: 'adjectives' },
  { word: 'Big',           thai: 'ใหญ่',   phon: 'yài',        english: 'Big',                   category: 'adjectives' },
  { word: 'Small',         thai: 'เล็ก',   phon: 'lék',        english: 'Small',                 category: 'adjectives' },
  { word: 'New',           thai: 'ใหม่',   phon: 'mài',        english: 'New',                   category: 'adjectives' },
  { word: 'Old (object)',  thai: 'เก่า',   phon: 'gào',        english: 'Old (for objects)',     category: 'adjectives' },
  { word: 'Beautiful',     thai: 'สวย',    phon: 'sǔai',       english: 'Beautiful',             category: 'adjectives' },
  { word: 'Delicious',     thai: 'อร่อย',  phon: 'à-rɔ̀i',       english: 'Delicious',             category: 'adjectives' },
  { word: 'Fun',           thai: 'สนุก',   phon: 'sa-nùk',     english: 'Fun',                   category: 'adjectives' },
  { word: 'Tired',         thai: 'เหนื่อย', phon: 'nûeai',      english: 'Tired',                 category: 'adjectives' },
  { word: 'Like',          thai: 'ชอบ',    phon: 'chɔ̂ɔp',       english: 'To like',              category: 'adjectives' },
  { word: 'Hot',           thai: 'ร้อน',   phon: 'rɔ́ɔn',        english: 'Hot (temperature/weather)', category: 'adjectives' },
  { word: 'Cold',          thai: 'หนาว',   phon: 'nǎaw',       english: 'Cold (weather)',        category: 'adjectives' },
  { word: 'Fast',          thai: 'เร็ว',    phon: 'reo',        english: 'Fast',                  category: 'adjectives' },
  { word: 'Slow',          thai: 'ช้า',    phon: 'cháa',       english: 'Slow',                  category: 'adjectives' },
  { word: 'Yes / Correct', thai: 'ใช่',    phon: 'châi',       english: 'Yes / Correct',          category: 'adjectives' },

  // ── Connectors, Prepositions & Particles ── //
  { word: 'And',                thai: 'และ',   phon: 'láe',     english: 'And',                 category: 'connectors' },
  { word: 'But',                thai: 'แต่',   phon: 'dtɛ̀ɛ',    english: 'But',                 category: 'connectors' },
  { word: 'Because',            thai: 'เพราะ', phon: 'prɔ́',     english: 'Because',             category: 'connectors' },
  { word: 'If',                 thai: 'ถ้า',   phon: 'tâa',     english: 'If',                  category: 'connectors' },
  { word: 'Or',                 thai: 'หรือ',  phon: 'rǔe',     english: 'Or',                  category: 'connectors' },
  { word: 'At / That / Which',  thai: 'ที่',    phon: 'tîi',     english: 'At / That / Which (location or relative pronoun)', category: 'connectors' },
  { word: 'With',               thai: 'กับ',   phon: 'gap',     english: 'With',                category: 'connectors' },
  { word: 'In / Inside',        thai: 'ใน',    phon: 'nai',     english: 'In / Inside',         category: 'connectors' },
  { word: 'On / Above',         thai: 'บน',    phon: 'bon',     english: 'On / Above',          category: 'connectors' },
  { word: 'Will (future)',      thai: 'จะ',    phon: 'jà',      english: 'Will (future tense marker)', category: 'connectors' },
  { word: 'In the process of',  thai: 'กำลัง', phon: 'gam-lang', english: 'In the process of (-ing verb marker)', category: 'connectors' },
  { word: 'Already / And then', thai: 'แล้ว',  phon: 'láew',    english: 'Already / And then',  category: 'connectors' },
  { word: 'Also / Too / With',  thai: 'ด้วย',  phon: 'dûai',    english: 'Also / Too / With',   category: 'connectors' },
  { word: 'Softening particle', thai: 'นะ',    phon: 'ná',      english: 'Softening particle (seeking agreement / gentle emphasis)', category: 'connectors' },
];

// ─── Display order for categories (pedagogical) ────────────────────────────
const vocabCategoryOrder = [
  'pronouns',
  'verbs',
  'questions',
  'nouns',
  'adjectives',
  'connectors'
];

function toTitleCase(str) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Audio ──────────────────────────────────────────────────────────────────
function playVocabAudio(audioFile) {
  if (!audioFile) {
    setVocabStatus('No mp3 file mapped for this word yet.');
    return;
  }
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  currentAudio = new Audio(AUDIO_BASE + audioFile);
  currentAudio.play().catch(() => {});
}

function setVocabStatus(msg) {
  if (vocabAudioStatus) vocabAudioStatus.textContent = 'Audio: ' + msg;
}

// ─── Rendering ──────────────────────────────────────────────────────────────
function groupByCategory(list) {
  return list.reduce((acc, item) => {
    const cat = item.category || 'uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});
}

function renderVocab() {
  if (!vocabContainer) return;
  vocabContainer.innerHTML = '';

  const grouped = groupByCategory(vocabulary);
  const ordered = vocabCategoryOrder.filter(cat => grouped[cat])
    .concat(Object.keys(grouped).filter(cat => !vocabCategoryOrder.includes(cat)));

  ordered.forEach(category => {
    const header = document.createElement('h3');
    header.className = 'category-header';
    header.textContent = toTitleCase(category);
    vocabContainer.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'vocab-grid';
    grid.setAttribute('aria-label', `${category} vocabulary`);

    grouped[category].forEach(item => {
      grid.appendChild(createVocabCard(item));
    });

    vocabContainer.appendChild(grid);
  });
}

function createVocabCard(item) {
  const card = document.createElement('article');
  card.className = 'card vocab-card';
  card.style.cursor = 'pointer';

  if (isLearnMode) {
    card.innerHTML = `
      <div class="vocab-content">
        <div class="vocab-thai">${item.thai}</div>
        <div class="vocab-phon">${item.phon}</div>
        <div class="vocab-english">${item.english}</div>
      </div>
    `;
    card.addEventListener('click', () => playVocabAudio(item.audio));
  } else {
    card.classList.add('test-mode');
    card.innerHTML = `
      <div class="vocab-content hidden-content">
        <div class="vocab-english-primary">${item.english}</div>
      </div>
      <div class="vocab-content revealed-content" style="display:none;">
        <div class="vocab-thai">${item.thai}</div>
        <div class="vocab-phon">${item.phon}</div>
        <div class="vocab-english">${item.english}</div>
      </div>
    `;
    card.addEventListener('click', () => {
      const hidden = card.querySelector('.hidden-content');
      const revealed = card.querySelector('.revealed-content');
      if (revealed.style.display === 'none') {
        hidden.style.display = 'none';
        revealed.style.display = 'block';
      } else {
        playVocabAudio(item.audio);
      }
    });
  }

  return card;
}

// ─── Mode ───────────────────────────────────────────────────────────────────
function updateModeDisplay() {
  if (vocabLearnModeBtn) {
    vocabLearnModeBtn.classList.toggle('active', isLearnMode);
    vocabLearnModeBtn.setAttribute('aria-pressed', String(isLearnMode));
  }
  if (vocabTestModeBtn) {
    vocabTestModeBtn.classList.toggle('active', !isLearnMode);
    vocabTestModeBtn.setAttribute('aria-pressed', String(!isLearnMode));
  }
  if (vocabModeHint) {
    vocabModeHint.textContent = isLearnMode
      ? 'Learning mode shows each word with Thai script, phonetic tones, and English meaning. Tap a card to hear it.'
      : 'Test mode shows the English meaning only. Tap a card to reveal the Thai word and pronunciation, then tap again to hear it.';
  }
  try { localStorage.setItem(VOCAB_LEARN_KEY, String(isLearnMode)); } catch (e) {}
}

function toggleMode(toLearn) {
  isLearnMode = toLearn;
  updateModeDisplay();
  renderVocab();
}

// ─── Init ───────────────────────────────────────────────────────────────────
if (vocabLearnModeBtn) vocabLearnModeBtn.addEventListener('click', () => toggleMode(true));
if (vocabTestModeBtn)  vocabTestModeBtn.addEventListener('click',  () => toggleMode(false));

updateModeDisplay();
renderVocab();
setVocabStatus('Tap a card to hear the word (audio files coming soon).');
