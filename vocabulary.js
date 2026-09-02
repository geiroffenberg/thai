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
  { word: 'I',                  thai: 'ผม',   phon: 'pǒm',        english: 'I (male, polite)',       audio: '01-pom.mp3', category: 'pronouns' },
  { word: 'I / Me',             thai: 'ฉัน',  phon: 'chǎn',       english: 'I / Me (female or neutral)', audio: '02-chan.mp3', category: 'pronouns' },
  { word: 'You',                thai: 'คุณ',  phon: 'kun',        english: 'You (polite)',           audio: '03-khun.mp3', category: 'pronouns' },
  { word: 'He / She',           thai: 'เขา',  phon: 'kǎo',        english: 'He / She / They',        audio: '04-khao.mp3', category: 'pronouns' },
  { word: 'It',                 thai: 'มัน',  phon: 'man',        english: 'It',                     audio: '05-man.mp3', category: 'pronouns' },
  { word: 'We / Us',            thai: 'เรา',  phon: 'rao',        english: 'We / Us',                audio: '06-rao.mp3', category: 'pronouns' },
  { word: 'Older sibling',      thai: 'พี่',   phon: 'pîi',        english: 'Older brother/sister (respectful for older people)', audio: '07-phi.mp3', category: 'pronouns' },
  { word: 'Younger sibling',    thai: 'น้อง', phon: 'nóong',      english: 'Younger brother/sister', audio: '08-nong.mp3', category: 'pronouns' },
  { word: 'ครับ',               thai: 'ครับ', phon: 'kráp',       english: 'Polite particle (male speaker)', audio: '09-khrap.mp3', category: 'pronouns' },
  { word: 'ค่ะ',                thai: 'ค่ะ',  phon: 'kâ',         english: 'Polite particle (female, statements)', audio: '10-kha.mp3', category: 'pronouns' },
  { word: 'คะ',                 thai: 'คะ',   phon: 'ká',         english: 'Polite particle (female, questions)', audio: '11-kha.mp3', category: 'pronouns' },

  // ── Core Verbs ── //
  { word: 'To be (is/am/are)', thai: 'เป็น',  phon: 'bpen',        english: 'To be (identity/status)', audio: '12-bpen.mp3', category: 'verbs' },
  { word: 'To be (means)',     thai: 'คือ',   phon: 'kue',         english: 'To be (means / is defined as)', audio: '13-khue.mp3', category: 'verbs' },
  { word: 'To have',           thai: 'มี',    phon: 'mii',         english: 'To have / There is / There are', audio: '14-mi.mp3', category: 'verbs' },
  { word: 'To go',             thai: 'ไป',    phon: 'bpai',        english: 'To go',            audio: '15-bpai.mp3', category: 'verbs' },
  { word: 'To come',           thai: 'มา',    phon: 'maa',         english: 'To come',          audio: '16-maa.mp3', category: 'verbs' },
  { word: 'To do / make',      thai: 'ทำ',    phon: 'tham',        english: 'To do / To make',  audio: '17-tham.mp3', category: 'verbs' },
  { word: 'To eat',            thai: 'กิน',   phon: 'gin',         english: 'To eat',           audio: '18-gin.mp3', category: 'verbs' },
  { word: 'To drink',          thai: 'ดื่ม',  phon: 'duem',        english: 'To drink',         audio: '19-dueam.mp3', category: 'verbs' },
  { word: 'To want / take',    thai: 'เอา',   phon: 'ao',          english: 'To want / To take (an item)', audio: '20-ao.mp3', category: 'verbs' },
  { word: 'To want to',        thai: 'อยาก',  phon: 'yàak',        english: 'To want to (do something)', audio: '21-yaak.mp3', category: 'verbs' },
  { word: 'To like',           thai: 'ชอบ',   phon: 'chɔ̂ɔp',       english: 'To like',          audio: '22-chop.mp3', category: 'verbs' },
  { word: 'To love',           thai: 'รัก',   phon: 'rák',         english: 'To love',          audio: '23-rak.mp3', category: 'verbs' },
  { word: 'To speak / talk',   thai: 'พูด',   phon: 'pûut',        english: 'To speak / To talk', audio: '24-phut.mp3', category: 'verbs' },
  { word: 'To listen',         thai: 'ฟัง',   phon: 'fang',        english: 'To listen',        audio: '25-fang.mp3', category: 'verbs' },
  { word: 'To look / watch',   thai: 'ดู',    phon: 'duu',         english: 'To look / To watch', audio: '26-duu.mp3', category: 'verbs' },
  { word: 'To see',            thai: 'เห็น',  phon: 'hěn',         english: 'To see',           audio: '27-hen.mp3', category: 'verbs' },
  { word: 'To think',          thai: 'คิด',   phon: 'kít',         english: 'To think',         audio: '28-khit.mp3', category: 'verbs' },
  { word: 'To know (facts)',   thai: 'รู้',    phon: 'rúu',         english: 'To know (facts/information)', audio: '29-ruu.mp3', category: 'verbs' },
  { word: 'To know (person)',  thai: 'รู้จัก', phon: 'rúu-jàk',     english: 'To know (a person or place)', audio: '30-ruu-jak.mp3', category: 'verbs' },
  { word: 'To understand',     thai: 'เข้าใจ', phon: 'kâo-jai',     english: 'To understand',    audio: '31-khao-jai.mp3', category: 'verbs' },
  { word: 'To give',           thai: 'ให้',    phon: 'hâi',         english: 'To give / For / To let', audio: '32-hai.mp3', category: 'verbs' },
  { word: 'Can / Able',        thai: 'ได้',    phon: 'dâi',         english: 'Can / Able to / Got', audio: '33-dai.mp3', category: 'verbs' },
  { word: 'To buy',            thai: 'ซื้อ',   phon: 'súe',         english: 'To buy',           audio: '34-sue.mp3', category: 'verbs' },
  { word: 'To sell',           thai: 'ขาย',   phon: 'kǎai',        english: 'To sell',          audio: '35-khai.mp3', category: 'verbs' },
  { word: 'To sleep',          thai: 'นอน',   phon: 'nɔɔn',        english: 'To sleep / Lie down', audio: '36-non.mp3', category: 'verbs' },
  { word: 'To work',           thai: 'ทำงาน', phon: 'tham-ngaan',  english: 'To work',          audio: '37-tham-ngaan.mp3', category: 'verbs' },
  { word: 'To wait',           thai: 'รอ',    phon: 'rɔɔ',         english: 'To wait',          audio: '38-ro.mp3', category: 'verbs' },
  { word: 'To meet / find',    thai: 'เจอ',   phon: 'jəə',         english: 'To meet / To find', audio: '39-joe.mp3', category: 'verbs' },
  { word: 'To help',           thai: 'ช่วย',  phon: 'chûai',       english: 'To help',          audio: '40-chuay.mp3', category: 'verbs' },
  { word: 'To use',            thai: 'ใช้',   phon: 'chái',        english: 'To use',           audio: '41-chai.mp3', category: 'verbs' },

  // ── Question Words ── //
  { word: 'What',             thai: 'อะไร',     phon: 'à-rai',      english: 'What',                  audio: '42-a-rai.mp3', category: 'questions' },
  { word: 'Who',              thai: 'ใคร',      phon: 'krai',       english: 'Who',                   audio: '43-khrai.mp3', category: 'questions' },
  { word: 'Where',            thai: 'ที่ไหน',   phon: 'tîi-nǎi',    english: 'Where',                 audio: '44-thi-nai.mp3', category: 'questions' },
  { word: 'When',             thai: 'เมื่อไหร่', phon: 'mûea-rài',  english: 'When',                  audio: '45-muea-rai.mp3', category: 'questions' },
  { word: 'Why',              thai: 'ทำไม',     phon: 'tam-mai',    english: 'Why',                   audio: '46-thammai.mp3', category: 'questions' },
  { word: 'How',              thai: 'ยังไง',    phon: 'yang-ngai',  english: 'How (อย่างไร / ยังไง)',  audio: '47-yang-ngai.mp3', category: 'questions' },
  { word: 'How much',         thai: 'เท่าไหร่', phon: 'tâo-rài',    english: 'How much',              audio: '48-thao-rai.mp3', category: 'questions' },
  { word: 'How many',         thai: 'กี่',      phon: 'gìi',        english: 'How many',              audio: '49-kii.mp3', category: 'questions' },
  { word: 'Question marker',  thai: 'ไหม',      phon: 'mǎi',        english: 'Yes/No question marker', audio: '50-mai.mp3', category: 'questions' },
  { word: 'Right?',           thai: 'ใช่มั้ย',  phon: 'châi-mái',   english: 'Right? / Isn\'t it?',    audio: '51-chai-mai.mp3', category: 'questions' },

  // ── Common Nouns & Places ── //
  { word: 'Person / People', thai: 'คน',      phon: 'khon',        english: 'Person / People',         audio: '52-khon.mp3', category: 'nouns' },
  { word: 'House / Home',    thai: 'บ้าน',    phon: 'bâan',        english: 'House / Home',             audio: '53-baan.mp3', category: 'nouns' },
  { word: 'Shop / Store',    thai: 'ร้าน',    phon: 'ráan',        english: 'Shop / Store',             audio: '54-raan.mp3', category: 'nouns' },
  { word: 'Food',            thai: 'อาหาร',  phon: 'aa-hǎan',     english: 'Food',                     audio: '55-a-haan.mp3', category: 'nouns' },
  { word: 'Water',           thai: 'น้ำ',     phon: 'nám',         english: 'Water',                    audio: '56-nam.mp3', category: 'nouns' },
  { word: 'Rice / Meal',     thai: 'ข้าว',    phon: 'khâaw',       english: 'Rice / Meal',              audio: '57-khao.mp3', category: 'nouns' },
  { word: 'Work / Job',      thai: 'งาน',     phon: 'ngaan',       english: 'Work / Job / Event',       audio: '58-ngan.mp3', category: 'nouns' },
  { word: 'Friend',          thai: 'เพื่อน',  phon: 'pûean',       english: 'Friend',                   audio: '59-phuean.mp3', category: 'nouns' },
  { word: 'Money',           thai: 'เงิน',    phon: 'ngoen',       english: 'Money (เงิน / ตังค์)',      audio: '60-ngoen.mp3', category: 'nouns' },
  { word: 'Thing / Belonging', thai: 'ของ',   phon: 'khɔ̌ɔng',      english: 'Thing / Belonging',        audio: '61-khong.mp3', category: 'nouns' },
  { word: 'Time',            thai: 'เวลา',   phon: 'wee-laa',     english: 'Time',                     audio: '62-wee-laa.mp3', category: 'nouns' },
  { word: 'Day',             thai: 'วัน',     phon: 'wan',         english: 'Day',                      audio: '63-wan.mp3', category: 'nouns' },
  { word: 'Year',            thai: 'ปี',      phon: 'bpii',        english: 'Year',                     audio: '64-bpii.mp3', category: 'nouns' },
  { word: 'Today',           thai: 'วันนี้',  phon: 'wan-níi',     english: 'Today',                    audio: '65-wan-nii.mp3', category: 'nouns' },
  { word: 'Tomorrow',        thai: 'พรุ่งนี้', phon: 'phrûng-níi', english: 'Tomorrow',                 audio: '66-phrung-nii.mp3', category: 'nouns' },
  { word: 'Yesterday',       thai: 'เมื่อวาน', phon: 'mûuea-waan', english: 'Yesterday',                audio: '67-muea-wan.mp3', category: 'nouns' },
  { word: 'Story / Subject', thai: 'เรื่อง',  phon: 'rûeang',      english: 'Story / Matter / Subject', audio: '68-rueang.mp3', category: 'nouns' },

  // ── Adjectives & Adverbs ── //
  { word: 'Good',          thai: 'ดี',     phon: 'dii',        english: 'Good',                  audio: '69-dii.mp3', category: 'adjectives' },
  { word: 'No / Not',      thai: 'ไม่',    phon: 'mâi',        english: 'No / Not',              audio: '70-mai.mp3', category: 'adjectives' },
  { word: 'Very / Much',   thai: 'มาก',    phon: 'mâak',       english: 'Very / Much',           audio: '71-maak.mp3', category: 'adjectives' },
  { word: 'Little / Few',  thai: 'น้อย',   phon: 'nɔ́ɔi',        english: 'Little / Few',          audio: '72-noi.mp3', category: 'adjectives' },
  { word: 'Big',           thai: 'ใหญ่',   phon: 'yài',        english: 'Big',                   audio: '73-yai.mp3', category: 'adjectives' },
  { word: 'Small',         thai: 'เล็ก',   phon: 'lék',        english: 'Small',                 audio: '74-lek.mp3', category: 'adjectives' },
  { word: 'New',           thai: 'ใหม่',   phon: 'mài',        english: 'New',                   audio: '75-mai.mp3', category: 'adjectives' },
  { word: 'Old (object)',  thai: 'เก่า',   phon: 'gào',        english: 'Old (for objects)',     audio: '76-gao.mp3', category: 'adjectives' },
  { word: 'Beautiful',     thai: 'สวย',    phon: 'sǔai',       english: 'Beautiful',             audio: '77-suay.mp3', category: 'adjectives' },
  { word: 'Delicious',     thai: 'อร่อย',  phon: 'à-rɔ̀i',       english: 'Delicious',             audio: '78-a-roi.mp3', category: 'adjectives' },
  { word: 'Fun',           thai: 'สนุก',   phon: 'sa-nùk',     english: 'Fun',                   audio: '79-sa-nuk.mp3', category: 'adjectives' },
  { word: 'Tired',         thai: 'เหนื่อย', phon: 'nûeai',      english: 'Tired',                 audio: '80-nueai.mp3', category: 'adjectives' },
  { word: 'Like',          thai: 'ชอบ',    phon: 'chɔ̂ɔp',       english: 'To like',              audio: '81-chop.mp3', category: 'adjectives' },
  { word: 'Hot',           thai: 'ร้อน',   phon: 'rɔ́ɔn',        english: 'Hot (temperature/weather)', audio: '82-ron.mp3', category: 'adjectives' },
  { word: 'Cold',          thai: 'หนาว',   phon: 'nǎaw',       english: 'Cold (weather)',        audio: '83-nao.mp3', category: 'adjectives' },
  { word: 'Fast',          thai: 'เร็ว',    phon: 'reo',        english: 'Fast',                  audio: '84-reo.mp3', category: 'adjectives' },
  { word: 'Slow',          thai: 'ช้า',    phon: 'cháa',       english: 'Slow',                  audio: '85-chaa.mp3', category: 'adjectives' },
  { word: 'Yes / Correct', thai: 'ใช่',    phon: 'châi',       english: 'Yes / Correct',          audio: '86-chai.mp3', category: 'adjectives' },

  // ── Connectors, Prepositions & Particles ── //
  { word: 'And',                thai: 'และ',   phon: 'láe',     english: 'And',                 audio: '87-lae.mp3', category: 'connectors' },
  { word: 'But',                thai: 'แต่',   phon: 'dtɛ̀ɛ',    english: 'But',                 audio: '88-dtae.mp3', category: 'connectors' },
  { word: 'Because',            thai: 'เพราะ', phon: 'prɔ́',     english: 'Because',             audio: '89-phro.mp3', category: 'connectors' },
  { word: 'If',                 thai: 'ถ้า',   phon: 'tâa',     english: 'If',                  audio: '90-tha.mp3', category: 'connectors' },
  { word: 'Or',                 thai: 'หรือ',  phon: 'rǔe',     english: 'Or',                  audio: '91-rue.mp3', category: 'connectors' },
  { word: 'At / That / Which',  thai: 'ที่',    phon: 'tîi',     english: 'At / That / Which (location or relative pronoun)', audio: '92-thi.mp3', category: 'connectors' },
  { word: 'With',               thai: 'กับ',   phon: 'gap',     english: 'With',                audio: '93-gap.mp3', category: 'connectors' },
  { word: 'In / Inside',        thai: 'ใน',    phon: 'nai',     english: 'In / Inside',         audio: '94-nai.mp3', category: 'connectors' },
  { word: 'On / Above',         thai: 'บน',    phon: 'bon',     english: 'On / Above',          audio: '95-bon.mp3', category: 'connectors' },
  { word: 'Will (future)',      thai: 'จะ',    phon: 'jà',      english: 'Will (future tense marker)', audio: '96-ja.mp3', category: 'connectors' },
  { word: 'In the process of',  thai: 'กำลัง', phon: 'gam-lang', english: 'In the process of (-ing verb marker)', audio: '97-gam-lang.mp3', category: 'connectors' },
  { word: 'Already / And then', thai: 'แล้ว',  phon: 'láew',    english: 'Already / And then',  audio: '98-laew.mp3', category: 'connectors' },
  { word: 'Also / Too / With',  thai: 'ด้วย',  phon: 'dûai',    english: 'Also / Too / With',   audio: '99-duay.mp3', category: 'connectors' },
  { word: 'Softening particle', thai: 'นะ',    phon: 'ná',      english: 'Softening particle (seeking agreement / gentle emphasis)', audio: '100-na.mp3', category: 'connectors' },
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
