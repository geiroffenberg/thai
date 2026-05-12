// Tenses Lab — page-specific logic for pages/tenses.html

const tensLearnModeButton = document.getElementById('tensLearnModeBtn');
const tensTestModeButton  = document.getElementById('tensTestModeBtn');
const tensModeHint        = document.getElementById('tensModeHint');
const tensesLab           = document.getElementById('tenses-lab');
const tensAudioStatus     = document.getElementById('tensAudioStatus');

// Practice panel
const tensePracticePrompt = document.getElementById('tensePracticePrompt');
const tenseAnswer         = document.getElementById('tenseAnswer');
const tenseBreakdown      = document.getElementById('tenseBreakdown');
const tenseExplanation    = document.getElementById('tenseExplanation');
const revealTenseBtn      = document.getElementById('revealTenseBtn');
const nextTenseBtn        = document.getElementById('nextTenseBtn');
const verbSelector        = document.querySelectorAll('.verb-btn');

const TENSE_MODE_KEY = 'thai-tenses-mode';
const AUDIO_BASE = '../audio'; // Placeholder for future tense audio

// ─── Data ────────────────────────────────────────────────────────────────────

/**
 * TENSE STRUCTURE:
 * - Present simple: VERB + OBJECT (no helper)
 * - Present progressive: กำลัง (kam lang) + VERB + OBJECT
 * - Past: VERB + OBJECT + แล้ว (laew)
 * - Future: จะ (ja) + VERB + OBJECT
 */

const TENSES = [
  {
    id: 'present-simple',
    name: 'Simple Present',
    english: 'I eat rice',
    structure: 'verb + object',
    helper: null,
    helperPosition: null,
    description: 'No helper needed. Plain statement of habitual action or general truth.',
  },
  {
    id: 'present-progressive',
    name: 'Present Progressive',
    english: 'I am eating rice (right now)',
    structure: 'กำลัง + verb + object',
    helper: { thai: 'กำลัง', rom: 'kam lang', meaning: 'in the process of' },
    helperPosition: 'before',
    description: 'Use กำลัง before the verb to show ongoing action happening right now.',
  },
  {
    id: 'simple-past',
    name: 'Simple Past',
    english: 'I ate rice / I have eaten rice',
    structure: 'verb + object + แล้ว',
    helper: { thai: 'แล้ว', rom: 'laew', meaning: 'already; finished' },
    helperPosition: 'after',
    description: 'Use แล้ว after the verb to show completed action. Often means "already".',
  },
  {
    id: 'future',
    name: 'Future',
    english: 'I will eat rice',
    structure: 'จะ + verb + object',
    helper: { thai: 'จะ', rom: 'ja', meaning: 'will; shall' },
    helperPosition: 'before',
    description: 'Use จะ before the verb to show intention or future action.',
  },
];

const VERBS = {
  gin: {
    thai: 'กิน',
    rom: 'gin',
    meaning: 'eat',
    object: 'ข้าว (khao — rice)',
    examples: [
      {
        tenseId: 'present-simple',
        thai: 'กิน ข้าว',
        rom: 'gin khao',
        english: 'eat rice (habitual)',
      },
      {
        tenseId: 'present-progressive',
        thai: 'กำลัง กิน ข้าว',
        rom: 'kam lang gin khao',
        english: 'am eating rice (right now)',
      },
      {
        tenseId: 'simple-past',
        thai: 'กิน ข้าว แล้ว',
        rom: 'gin khao laew',
        english: 'ate rice; have eaten rice',
      },
      {
        tenseId: 'future',
        thai: 'จะ กิน ข้าว',
        rom: 'ja gin khao',
        english: 'will eat rice',
      },
    ],
  },
  pen: {
    thai: 'เป็น',
    rom: 'pen',
    meaning: 'be (predicate)',
    object: 'ครู (khru — teacher)',
    examples: [
      {
        tenseId: 'present-simple',
        thai: 'เป็น ครู',
        rom: 'pen khru',
        english: 'be a teacher (general fact)',
      },
      {
        tenseId: 'present-progressive',
        thai: 'กำลัง เป็น ครู',
        rom: 'kam lang pen khru',
        english: 'in process of becoming a teacher',
      },
      {
        tenseId: 'simple-past',
        thai: 'เป็น ครู แล้ว',
        rom: 'pen khru laew',
        english: 'became a teacher; has been a teacher',
      },
      {
        tenseId: 'future',
        thai: 'จะ เป็น ครู',
        rom: 'ja pen khru',
        english: 'will be a teacher',
      },
    ],
  },
  pai: {
    thai: 'ไป',
    rom: 'pai',
    meaning: 'go',
    object: 'โรงเรียน (rohng riian — school)',
    examples: [
      {
        tenseId: 'present-simple',
        thai: 'ไป โรงเรียน',
        rom: 'pai rohng riian',
        english: 'go to school (habitual)',
      },
      {
        tenseId: 'present-progressive',
        thai: 'กำลัง ไป โรงเรียน',
        rom: 'kam lang pai rohng riian',
        english: 'am going to school (right now)',
      },
      {
        tenseId: 'simple-past',
        thai: 'ไป โรงเรียน แล้ว',
        rom: 'pai rohng riian laew',
        english: 'went to school; have gone to school',
      },
      {
        tenseId: 'future',
        thai: 'จะ ไป โรงเรียน',
        rom: 'ja pai rohng riian',
        english: 'will go to school',
      },
    ],
  },
  maa: {
    thai: 'มา',
    rom: 'maa',
    meaning: 'come',
    object: 'บ้าน (baan — home)',
    examples: [
      {
        tenseId: 'present-simple',
        thai: 'มา บ้าน',
        rom: 'maa baan',
        english: 'come home (habitual)',
      },
      {
        tenseId: 'present-progressive',
        thai: 'กำลัง มา บ้าน',
        rom: 'kam lang maa baan',
        english: 'am coming home (right now)',
      },
      {
        tenseId: 'simple-past',
        thai: 'มา บ้าน แล้ว',
        rom: 'maa baan laew',
        english: 'came home; have come home',
      },
      {
        tenseId: 'future',
        thai: 'จะ มา บ้าน',
        rom: 'ja maa baan',
        english: 'will come home',
      },
    ],
  },
  tham: {
    thai: 'ทำ',
    rom: 'tham',
    meaning: 'do; make',
    object: 'การบ้าน (gaan baan — homework)',
    examples: [
      {
        tenseId: 'present-simple',
        thai: 'ทำ การบ้าน',
        rom: 'tham gaan baan',
        english: 'do homework (habitual)',
      },
      {
        tenseId: 'present-progressive',
        thai: 'กำลัง ทำ การบ้าน',
        rom: 'kam lang tham gaan baan',
        english: 'am doing homework (right now)',
      },
      {
        tenseId: 'simple-past',
        thai: 'ทำ การบ้าน แล้ว',
        rom: 'tham gaan baan laew',
        english: 'did homework; have done homework',
      },
      {
        tenseId: 'future',
        thai: 'จะ ทำ การบ้าน',
        rom: 'ja tham gaan baan',
        english: 'will do homework',
      },
    ],
  },
};

// ─── State ───────────────────────────────────────────────────────────────────

let isTestMode = false;
let currentVerbInPractice = 'gin';
let currentTenseInPractice = 0;
const practiceHistory = [];

// ─── Mode Switching ──────────────────────────────────────────────────────────

function applyMode(mode) {
  isTestMode = mode === 'test';

  // Update buttons
  if (tensLearnModeButton) {
    tensLearnModeButton.classList.toggle('active', !isTestMode);
    tensLearnModeButton.setAttribute('aria-pressed', String(!isTestMode));
  }
  if (tensTestModeButton) {
    tensTestModeButton.classList.toggle('active', isTestMode);
    tensTestModeButton.setAttribute('aria-pressed', String(isTestMode));
  }

  // Update hint
  if (tensModeHint) {
    tensModeHint.textContent = isTestMode
      ? 'Test mode hides the helper words. Tap "Reveal" to see the structure.'
      : 'Learning mode shows the helper words and full structure.';
  }

  // Update cards visibility
  updateTenseCardsVisibility();

  // Store preference
  try {
    localStorage.setItem(TENSE_MODE_KEY, mode);
  } catch (e) {}
}

function updateTenseCardsVisibility() {
  const cards = document.querySelectorAll('.tense-card');
  cards.forEach((card) => {
    const helper = card.querySelector('.tense-helper');
    if (helper) {
      helper.style.display = isTestMode ? 'none' : 'inline';
    }
  });
}

// ─── Tense Cards Rendering ───────────────────────────────────────────────────

function renderTenseCards(verb = 'gin') {
  const container = document.getElementById('ginKhaoCards');
  if (!container) return;

  container.innerHTML = '';
  const verbData = VERBS[verb];
  if (!verbData) return;

  verbData.examples.forEach((example) => {
    const tense = TENSES.find((t) => t.id === example.tenseId);
    if (!tense) return;

    const card = document.createElement('div');
    card.className = 'card tense-card';
    card.innerHTML = `
      <div class="tense-header">
        <h4 class="tense-name">${tense.name}</h4>
        <p class="tense-english">${example.english}</p>
      </div>
      <div class="tense-structure">
        <p class="structure-label">Structure:</p>
        <p class="structure-text">${tense.structure}</p>
      </div>
      <div class="tense-content">
        ${
          tense.helper
            ? `<div class="tense-helper" style="display: ${isTestMode ? 'none' : 'inline'}">
                <span class="helper-label">Helper:</span>
                <span class="helper-thai">${tense.helper.thai}</span>
                <span class="helper-rom">${tense.helper.rom}</span>
                <span class="helper-meaning">— ${tense.helper.meaning}</span>
              </div>`
            : '<div class="tense-helper" style="display: none;">No helper word</div>'
        }
        <div class="tense-example">
          <span class="example-thai">${example.thai}</span>
          <span class="example-rom">${example.rom}</span>
        </div>
      </div>
      <p class="tense-note-small">${tense.description}</p>
    `;
    container.appendChild(card);
  });
}

// ─── Other Verbs Panel ────────────────────────────────────────────────────────

function renderOtherVerbCards(verb = 'pen') {
  const container = document.getElementById('otherVerbCards');
  if (!container) return;

  container.innerHTML = '';
  const verbData = VERBS[verb];
  if (!verbData) return;

  verbData.examples.forEach((example) => {
    const tense = TENSES.find((t) => t.id === example.tenseId);
    if (!tense) return;

    const card = document.createElement('div');
    card.className = 'card tense-card tense-card-compact';
    card.innerHTML = `
      <div class="tense-header">
        <h5 class="tense-name-sm">${tense.name}</h5>
      </div>
      <div class="tense-content">
        ${
          tense.helper
            ? `<span class="helper-thai" style="display: ${isTestMode ? 'none' : 'inline'}">${tense.helper.thai}</span>`
            : ''
        }
        <span class="example-thai">${example.thai}</span>
        <span class="example-rom">${example.rom}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

// ─── Practice Panel ──────────────────────────────────────────────────────────

const PRACTICE_QUESTIONS = [
  {
    english: 'I eat rice',
    verbKey: 'gin',
    tenseId: 'present-simple',
  },
  {
    english: 'I am eating rice (right now)',
    verbKey: 'gin',
    tenseId: 'present-progressive',
  },
  {
    english: 'I ate rice',
    verbKey: 'gin',
    tenseId: 'simple-past',
  },
  {
    english: 'I will eat rice',
    verbKey: 'gin',
    tenseId: 'future',
  },
  {
    english: 'I am a teacher',
    verbKey: 'pen',
    tenseId: 'present-simple',
  },
  {
    english: 'I am becoming a teacher',
    verbKey: 'pen',
    tenseId: 'present-progressive',
  },
  {
    english: 'I became a teacher',
    verbKey: 'pen',
    tenseId: 'simple-past',
  },
  {
    english: 'I will be a teacher',
    verbKey: 'pen',
    tenseId: 'future',
  },
  {
    english: 'I go to school',
    verbKey: 'pai',
    tenseId: 'present-simple',
  },
  {
    english: 'I am going to school',
    verbKey: 'pai',
    tenseId: 'present-progressive',
  },
  {
    english: 'I went to school',
    verbKey: 'pai',
    tenseId: 'simple-past',
  },
  {
    english: 'I will go to school',
    verbKey: 'pai',
    tenseId: 'future',
  },
];

function getNextPracticeQuestion() {
  if (PRACTICE_QUESTIONS.length === 0) return null;
  const idx = Math.floor(Math.random() * PRACTICE_QUESTIONS.length);
  return PRACTICE_QUESTIONS[idx];
}

function renderPracticeQuestion(question) {
  if (!question) return;

  currentVerbInPractice = question.verbKey;
  const tense = TENSES.find((t) => t.id === question.tenseId);
  const verbData = VERBS[question.verbKey];
  const example = verbData.examples.find((e) => e.tenseId === question.tenseId);

  if (tensePracticePrompt) {
    tensePracticePrompt.textContent = `Translate to Thai structure: ${question.english}`;
  }

  // Hide answer initially
  if (tenseAnswer) tenseAnswer.classList.add('hidden');
  if (revealTenseBtn) revealTenseBtn.textContent = 'Reveal';
  if (revealTenseBtn) revealTenseBtn.classList.remove('hidden-answer');

  // Prepare answer content
  if (tenseBreakdown) {
    let breakdownHTML = '';

    if (tense.helper && tense.helperPosition === 'before') {
      breakdownHTML += `
        <span class="breakdown-part helper-part">
          <span class="breakdown-thai">${tense.helper.thai}</span>
          <span class="breakdown-rom">${tense.helper.rom}</span>
        </span>
        <span class="breakdown-sep">+</span>
      `;
    }

    breakdownHTML += `
      <span class="breakdown-part verb-part">
        <span class="breakdown-thai">${verbData.thai}</span>
        <span class="breakdown-rom">${verbData.rom}</span>
      </span>
      <span class="breakdown-sep">+</span>
    `;

    // Simplified object representation
    const objMatch = verbData.object.match(/^([^\(]+)/);
    const objThai = objMatch ? objMatch[1].trim() : verbData.object;

    breakdownHTML += `
      <span class="breakdown-part object-part">
        <span class="breakdown-thai">${objThai}</span>
      </span>
    `;

    if (tense.helper && tense.helperPosition === 'after') {
      breakdownHTML += `
        <span class="breakdown-sep">+</span>
        <span class="breakdown-part helper-part">
          <span class="breakdown-thai">${tense.helper.thai}</span>
          <span class="breakdown-rom">${tense.helper.rom}</span>
        </span>
      `;
    }

    tenseBreakdown.innerHTML = breakdownHTML;
  }

  if (tenseExplanation) {
    let explanation = `<strong>${example.thai}</strong> (${example.rom})<br>`;
    explanation += `<em>${example.english}</em><br><br>`;
    explanation += `<strong>Structure:</strong> ${tense.structure}<br>`;
    if (tense.helper) {
      explanation += `<strong>Helper word:</strong> ${tense.helper.thai} (${tense.helper.rom}) — "${tense.helper.meaning}"<br>`;
    }
    explanation += `<br>${tense.description}`;
    tenseExplanation.innerHTML = explanation;
  }

  practiceHistory.push(question);
}

function revealAnswer() {
  if (!tenseAnswer) return;
  tenseAnswer.classList.remove('hidden');
  if (revealTenseBtn) {
    revealTenseBtn.textContent = 'Got it!';
    revealTenseBtn.classList.add('hidden-answer');
  }
}

function loadNextQuestion() {
  const question = getNextPracticeQuestion();
  renderPracticeQuestion(question);
}

// ─── Event Listeners ─────────────────────────────────────────────────────────

if (tensLearnModeButton) {
  tensLearnModeButton.addEventListener('click', () => applyMode('learn'));
}

if (tensTestModeButton) {
  tensTestModeButton.addEventListener('click', () => applyMode('test'));
}

if (revealTenseBtn) {
  revealTenseBtn.addEventListener('click', revealAnswer);
}

if (nextTenseBtn) {
  nextTenseBtn.addEventListener('click', loadNextQuestion);
}

verbSelector.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    verbSelector.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const verb = btn.dataset.verb;
    renderOtherVerbCards(verb);
    updateTenseCardsVisibility();
  });
});

// ─── Init ────────────────────────────────────────────────────────────────────

function initTensesPage() {
  // Load saved mode preference
  try {
    const savedMode = localStorage.getItem(TENSE_MODE_KEY);
    if (savedMode === 'test') applyMode('test');
    else applyMode('learn');
  } catch (e) {
    applyMode('learn');
  }

  // Render initial cards
  renderTenseCards('gin');
  renderOtherVerbCards('pen');

  // Load first practice question
  loadNextQuestion();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTensesPage);
} else {
  initTensesPage();
}
