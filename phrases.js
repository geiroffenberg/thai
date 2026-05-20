// Phrases Lab — page-specific logic for pages/phrases.html

const phrasesContainer = document.getElementById('phrasesContainer');
const learnModeBtn = document.getElementById('learnModeBtn');
const testModeBtn = document.getElementById('testModeBtn');
const maleBtn = document.getElementById('maleBtn');
const femaleBtn = document.getElementById('femaleBtn');
const modeHint = document.getElementById('modeHint');

// Load phrases data
let phrasesData = [];
const PHRASES_FILE = '../thai_phrases.json';
const LEARN_MODE_KEY = 'PHRASE_LEARN_MODE';
const GENDER_KEY = 'PHRASE_GENDER';

// State
let isLearnMode = localStorage.getItem(LEARN_MODE_KEY) !== 'false';
let currentGender = localStorage.getItem(GENDER_KEY) || 'male'; // 'male' or 'female'

// Fetch and load phrases
async function loadPhrases() {
  try {
    const response = await fetch(PHRASES_FILE);
    phrasesData = await response.json();
    renderPhrases();
  } catch (error) {
    console.error('Failed to load phrases:', error);
    phrasesContainer.innerHTML = '<p>Error loading phrases. Please refresh the page.</p>';
  }
}

// Group phrases by category
function groupByCategory(phrases) {
  return phrases.reduce((acc, phrase) => {
    const cat = phrase.category || 'uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(phrase);
    return acc;
  }, {});
}

// Category display order (pedagogical/frequency-based)
const categoryOrder = [
  'greetings',
  'essentials',
  'dining',
  'shopping',
  'directions',
  'hotel_travel',
  'communication',
  'emergencies',
  'social'
];

// Render all phrases grouped by category
function renderPhrases() {
  phrasesContainer.innerHTML = '';
  const grouped = groupByCategory(phrasesData);

  // Sort categories by predefined order
  const orderedCategories = categoryOrder.filter(cat => grouped[cat]).concat(
    Object.keys(grouped).filter(cat => !categoryOrder.includes(cat))
  );

  orderedCategories.forEach(category => {
    const phrases = grouped[category];

    // Category header (subtle)
    const categoryHeader = document.createElement('h3');
    categoryHeader.className = 'category-header';
    categoryHeader.textContent = toTitleCase(category.replace(/_/g, ' '));
    phrasesContainer.appendChild(categoryHeader);

    // Cards grid for this category
    const grid = document.createElement('div');
    grid.className = 'phrases-grid';
    grid.setAttribute('aria-label', `${category} phrases`);

    phrases.forEach(phrase => {
      const card = createPhraseCard(phrase);
      grid.appendChild(card);
    });

    phrasesContainer.appendChild(grid);
  });
}

// Create a single phrase card
function createPhraseCard(phrase) {
  const card = document.createElement('article');
  card.className = 'card phrase-card';
  card.setAttribute('data-phrase-id', phrase.id);
  card.setAttribute('data-category', phrase.category);

  // Get current gender version
  const genderData = currentGender === 'male' ? phrase.male : phrase.female;

  if (isLearnMode) {
    // Learning mode: show all info
    card.innerHTML = `
      <div class="phrase-content">
        <div class="thai-text">${genderData.thai}</div>
        <div class="phonetic-tones">${genderData.phonetic_tones}</div>
        <div class="english-translation">${phrase.english_translation}</div>
        <div class="explanation">${phrase.explanation}</div>
      </div>
    `;
  } else {
    // Test mode: show only English, click to reveal
    card.classList.add('test-mode');
    card.innerHTML = `
      <div class="phrase-content hidden-content">
        <div class="english-translation-primary">${phrase.english_translation}</div>
      </div>
      <div class="phrase-content revealed-content" style="display: none;">
        <div class="thai-text">${genderData.thai}</div>
        <div class="phonetic-tones">${genderData.phonetic_tones}</div>
        <div class="english-translation">${phrase.english_translation}</div>
        <div class="explanation">${phrase.explanation}</div>
      </div>
    `;

    // Add click handler for reveal
    card.addEventListener('click', () => {
      const hidden = card.querySelector('.hidden-content');
      const revealed = card.querySelector('.revealed-content');
      if (hidden && revealed) {
        hidden.style.display = hidden.style.display === 'none' ? 'block' : 'none';
        revealed.style.display = revealed.style.display === 'none' ? 'block' : 'none';
      }
    });
  }

  return card;
}

// Update mode display
function updateModeDisplay() {
  learnModeBtn.classList.toggle('active', isLearnMode);
  learnModeBtn.setAttribute('aria-pressed', String(isLearnMode));
  testModeBtn.classList.toggle('active', !isLearnMode);
  testModeBtn.setAttribute('aria-pressed', String(!isLearnMode));

  if (isLearnMode) {
    modeHint.textContent = 'Learning mode shows each phrase with English translation and phonetics. Toggle between Male and Female speakers.';
  } else {
    modeHint.textContent = 'Test mode hides hints—click a card to reveal the Thai phrase, transliteration, and pronunciation.';
  }

  localStorage.setItem(LEARN_MODE_KEY, String(isLearnMode));
}

// Update gender display
function updateGenderDisplay() {
  maleBtn.classList.toggle('active', currentGender === 'male');
  maleBtn.setAttribute('aria-pressed', String(currentGender === 'male'));
  femaleBtn.classList.toggle('active', currentGender === 'female');
  femaleBtn.setAttribute('aria-pressed', String(currentGender === 'female'));

  localStorage.setItem(GENDER_KEY, currentGender);
}

// Toggle mode
function toggleMode(toLearn) {
  isLearnMode = toLearn;
  updateModeDisplay();
  renderPhrases();
}

// Toggle gender
function toggleGender(gender) {
  currentGender = gender;
  updateGenderDisplay();
  renderPhrases();
}

// Utility: title case
function toTitleCase(str) {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Event listeners
if (learnModeBtn) {
  learnModeBtn.addEventListener('click', () => toggleMode(true));
}
if (testModeBtn) {
  testModeBtn.addEventListener('click', () => toggleMode(false));
}
if (maleBtn) {
  maleBtn.addEventListener('click', () => toggleGender('male'));
}
if (femaleBtn) {
  femaleBtn.addEventListener('click', () => toggleGender('female'));
}

// Initialize
updateModeDisplay();
updateGenderDisplay();
loadPhrases();
