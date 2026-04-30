// Alphabet Lab — page-specific logic for pages/alphabet.html
const consonantGrid = document.getElementById('consonantGrid');
const vowelGridShort = document.getElementById('vowelGridShort');
const vowelGridLong = document.getElementById('vowelGridLong');
const vowelGridSpecial = document.getElementById('vowelGridSpecial');
const spotlightChar = document.getElementById('spotlightChar');
const spotlightName = document.getElementById('spotlightName');
const quizForm = document.getElementById('alphabetQuizForm');
const quizAnswer = document.getElementById('quizAnswer');
const quizPrompt = document.getElementById('quizPrompt');
const quizFeedback = document.getElementById('quizFeedback');
const quizScore = document.getElementById('quizScore');
const nextQuestionButton = document.getElementById('nextQuestion');
const audioStatus = document.getElementById('audioStatus');
const alphabetLab = document.getElementById('alphabet-lab');
const learnModeButton = document.getElementById('learnModeBtn');
const testModeButton = document.getElementById('testModeBtn');
const modeHint = document.getElementById('modeHint');

// Each entry has:
//   symbol  — the Thai character
//   name    — simple sound (what the letter sounds like) — primary label
//   thai    — traditional acrophonic name (kept for reference)
const consonants = [
  { symbol: 'ก', name: 'g',  thai: 'gaw gai' },
  { symbol: 'ข', name: 'kh', thai: 'khaw khai' },
  { symbol: 'ฃ', name: 'kh', thai: 'khaw khuat (obsolete)' },
  { symbol: 'ค', name: 'kh', thai: 'khaw khwai' },
  { symbol: 'ฅ', name: 'kh', thai: 'khaw khon (obsolete)' },
  { symbol: 'ฆ', name: 'kh', thai: 'khaw ra-khang' },
  { symbol: 'ง', name: 'ng', thai: 'ngaw ngu' },
  { symbol: 'จ', name: 'j',  thai: 'jaw jaan' },
  { symbol: 'ฉ', name: 'ch', thai: 'chaw ching' },
  { symbol: 'ช', name: 'ch', thai: 'chaw chang' },
  { symbol: 'ซ', name: 's',  thai: 'saw so' },
  { symbol: 'ฌ', name: 'ch', thai: 'chaw choe' },
  { symbol: 'ญ', name: 'y',  thai: 'yaw ying' },
  { symbol: 'ฎ', name: 'd',  thai: 'daw cha-da' },
  { symbol: 'ฏ', name: 'dt', thai: 'dtaw pa-dtak' },
  { symbol: 'ฐ', name: 'th', thai: 'thaw than' },
  { symbol: 'ฑ', name: 'th', thai: 'thaw montho' },
  { symbol: 'ฒ', name: 'th', thai: 'thaw phu-thao' },
  { symbol: 'ณ', name: 'n',  thai: 'naw nen' },
  { symbol: 'ด', name: 'd',  thai: 'daw dek' },
  { symbol: 'ต', name: 'dt', thai: 'dtaw dtao' },
  { symbol: 'ถ', name: 'th', thai: 'thaw thung' },
  { symbol: 'ท', name: 'th', thai: 'thaw thahan' },
  { symbol: 'ธ', name: 'th', thai: 'thaw thong' },
  { symbol: 'น', name: 'n',  thai: 'naw nu' },
  { symbol: 'บ', name: 'b',  thai: 'baw baimai' },
  { symbol: 'ป', name: 'bp', thai: 'bpaw bplaa' },
  { symbol: 'ผ', name: 'ph', thai: 'phaw phueng' },
  { symbol: 'ฝ', name: 'f',  thai: 'faw faa' },
  { symbol: 'พ', name: 'ph', thai: 'phaw phaan' },
  { symbol: 'ฟ', name: 'f',  thai: 'faw fan' },
  { symbol: 'ภ', name: 'ph', thai: 'phaw sam-phao' },
  { symbol: 'ม', name: 'm',  thai: 'maw maa' },
  { symbol: 'ย', name: 'y',  thai: 'yaw yak' },
  { symbol: 'ร', name: 'r',  thai: 'raw ruea' },
  { symbol: 'ล', name: 'l',  thai: 'law ling' },
  { symbol: 'ว', name: 'w',  thai: 'waw waen' },
  { symbol: 'ศ', name: 's',  thai: 'saw sala' },
  { symbol: 'ษ', name: 's',  thai: 'saw rue-si' },
  { symbol: 'ส', name: 's',  thai: 'saw suea' },
  { symbol: 'ห', name: 'h',  thai: 'haw hip' },
  { symbol: 'ฬ', name: 'l',  thai: 'law chu-laa' },
  { symbol: 'อ', name: 'aw', thai: 'aw aang' },
  { symbol: 'ฮ', name: 'h',  thai: 'haw nok-huk' }
];

// Thai vowels — categorized. "-" marks where the consonant goes.
// `name` is the simple sound, `thai` is the traditional name.
const shortVowels = [
  { symbol: '-ะ', name: 'a',   thai: 'sara a' },
  { symbol: '-ิ', name: 'i',   thai: 'sara i' },
  { symbol: '-ึ', name: 'ue',  thai: 'sara ue' },
  { symbol: '-ุ', name: 'u',   thai: 'sara u' },
  { symbol: 'เ-ะ', name: 'e',   thai: 'sara e (short)' },
  { symbol: 'แ-ะ', name: 'ae',  thai: 'sara ae (short)' },
  { symbol: 'โ-ะ', name: 'o',   thai: 'sara o (short)' },
  { symbol: 'เ-าะ', name: 'aw',  thai: 'sara aw (short)' },
  { symbol: 'เ-อะ', name: 'er',  thai: 'sara er (short)' },
  { symbol: 'เ-ียะ', name: 'ia',  thai: 'sara ia (short)' },
  { symbol: 'เ-ือะ', name: 'uea', thai: 'sara uea (short)' },
  { symbol: '-ัวะ', name: 'ua',  thai: 'sara ua (short)' }
];

const longVowels = [
  { symbol: '-า', name: 'aa',  thai: 'sara aa' },
  { symbol: '-ี', name: 'ii',  thai: 'sara ii' },
  { symbol: '-ื', name: 'uee', thai: 'sara uee' },
  { symbol: '-ู', name: 'uu',  thai: 'sara uu' },
  { symbol: 'เ-', name: 'ee',  thai: 'sara e (long)' },
  { symbol: 'แ-', name: 'aae', thai: 'sara ae (long)' },
  { symbol: 'โ-', name: 'oo',  thai: 'sara o (long)' },
  { symbol: '-อ', name: 'aaw', thai: 'sara aw (long)' },
  { symbol: 'เ-อ', name: 'eer', thai: 'sara er (long)' },
  { symbol: 'เ-ีย', name: 'iia', thai: 'sara ia (long)' },
  { symbol: 'เ-ือ', name: 'uuea',thai: 'sara uea (long)' },
  { symbol: '-ัว', name: 'uua', thai: 'sara ua (long)' }
];

const specialVowels = [
  { symbol: 'อำ', name: 'am', thai: 'sara am' },
  { symbol: 'ใอ', name: 'ai', thai: 'sara ai mai-muan' },
  { symbol: 'ไอ', name: 'ai', thai: 'sara ai mai-malai' },
  { symbol: 'เอา', name: 'ao', thai: 'sara ao' }
];

const vowels = [...shortVowels, ...longVowels, ...specialVowels];

const allLetters = [...consonants, ...vowels];
let currentQuestion = null;
let attempts = 0;
let correct = 0;
let currentLetterAudio = null;
let activeMode = 'learn';

const MODE_STORAGE_KEY = 'thai-alphabet-mode';

const AUDIO_BASE = '../audio/letters';

function slugifyAudio(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'clip';
}

function audioPath(group, index, letter) {
  const slug = slugifyAudio(`${letter.name}-${letter.thai}`);
  return `${AUDIO_BASE}/${group}/${String(index).padStart(2, '0')}-${slug}.mp3`;
}

function attachAudio(list, group) {
  list.forEach((letter, index) => {
    letter.audioFile = audioPath(group, index + 1, letter);
  });
}

// Derive the short pronunciation (e.g. "gaw" from "gaw gai") for each entry.
// For vowels the traditional name starts with "sara" — strip that prefix.
function attachPron(list) {
  list.forEach((l) => {
    if (l.thai && !l.pron) {
      const cleaned = l.thai.replace(/^sara\s+/i, '');
      l.pron = cleaned.split(/\s+/)[0];
    }
  });
}
attachPron(consonants);
attachPron(shortVowels);
attachPron(longVowels);
attachPron(specialVowels);
attachAudio(consonants, 'consonants');
attachAudio(shortVowels, 'vowels-short');
attachAudio(longVowels, 'vowels-long');
attachAudio(specialVowels, 'vowels-special');

function setAudioStatus(message) {
  if (audioStatus) {
    audioStatus.textContent = message;
  }
}

function updateModeButtons() {
  const isLearnMode = activeMode === 'learn';

  if (learnModeButton) {
    learnModeButton.classList.toggle('active', isLearnMode);
    learnModeButton.setAttribute('aria-pressed', String(isLearnMode));
  }

  if (testModeButton) {
    testModeButton.classList.toggle('active', !isLearnMode);
    testModeButton.setAttribute('aria-pressed', String(!isLearnMode));
  }
}

function clearTileSelection() {
  document.querySelectorAll('.alphabet-tile.active, .alphabet-tile.revealed').forEach((tile) => {
    tile.classList.remove('active', 'revealed');
  });
}

function applyMode(nextMode) {
  activeMode = nextMode === 'test' ? 'test' : 'learn';

  if (alphabetLab) {
    alphabetLab.dataset.mode = activeMode;
  }

  updateModeButtons();
  clearTileSelection();

  if (modeHint) {
    modeHint.textContent = activeMode === 'test'
      ? 'Test mode hides labels. Tap a letter tile to reveal its sound label and play audio.'
      : 'Learning mode shows each tile with sound labels and pronunciation hints.';
  }

  if (activeMode === 'test') {
    setSpotlight('?', 'Tap a tile to reveal', '');
    setAudioStatus('Audio status: Test mode is on. Tap a letter tile to reveal and hear it.');
  } else {
    setSpotlight('ก', 'g', 'gaw');
    setAudioStatus('Audio status: Tap a letter tile to hear its sound.');
  }

  try {
    localStorage.setItem(MODE_STORAGE_KEY, activeMode);
  } catch (e) {}
}

function playLetterAudio(audioFile, symbol) {
  if (!audioFile) {
    setAudioStatus('Audio status: No file mapped for this letter yet.');
    return;
  }

  if (currentLetterAudio) {
    currentLetterAudio.pause();
    currentLetterAudio.currentTime = 0;
  }

  const audio = new Audio(audioFile);
  currentLetterAudio = audio;
  setAudioStatus(`Audio status: Loading ${symbol}...`);

  audio.addEventListener('ended', () => {
    setAudioStatus(`Audio status: Played ${symbol}. Tap another letter.`);
  });

  audio.play()
    .then(() => {
      setAudioStatus(`Audio status: Playing ${symbol}`);
    })
    .catch(() => {
      setAudioStatus(`Audio status: Could not play ${symbol}. Check audio files or browser autoplay policy.`);
    });
}

function renderAlphabetGrid(gridElement, letters) {
  if (!gridElement) {
    return;
  }

  gridElement.innerHTML = letters
    .map(
      (letter) => `
        <button class="alphabet-tile" type="button" data-letter="${letter.symbol}" data-name="${letter.name}" data-pron="${letter.pron || ''}" data-audio="${letter.audioFile || ''}">
          <span class="tile-char">${letter.symbol}</span>
          <span class="tile-name">${letter.name}</span>
          ${letter.pron ? `<span class="tile-pron">"${letter.pron}"</span>` : ''}
        </button>
      `
    )
    .join('');
}

function setSpotlight(symbol, name, pron) {
  if (!spotlightChar || !spotlightName) {
    return;
  }

  spotlightChar.textContent = symbol;
  const pronPart = pron ? ` "${pron}"` : '';
  spotlightName.textContent = `${name}${pronPart}`;
}

function buildQuestion() {
  const randomIndex = Math.floor(Math.random() * allLetters.length);
  currentQuestion = allLetters[randomIndex];

  if (quizPrompt && currentQuestion) {
    quizPrompt.textContent = `Type the Thai letter that makes the sound: ${currentQuestion.name}`;
  }

  if (quizAnswer) {
    quizAnswer.value = '';
    quizAnswer.focus();
  }

  if (quizFeedback) {
    quizFeedback.textContent = '';
    quizFeedback.classList.remove('good', 'bad');
  }
}

function updateScoreboard() {
  if (quizScore) {
    quizScore.textContent = `Score: ${correct}/${attempts}`;
  }
}

renderAlphabetGrid(consonantGrid, consonants);
renderAlphabetGrid(vowelGridShort, shortVowels);
renderAlphabetGrid(vowelGridLong, longVowels);
renderAlphabetGrid(vowelGridSpecial, specialVowels);
buildQuestion();

try {
  const savedMode = localStorage.getItem(MODE_STORAGE_KEY);
  applyMode(savedMode === 'test' ? 'test' : 'learn');
} catch (e) {
  applyMode('learn');
}

[consonantGrid, vowelGridShort, vowelGridLong, vowelGridSpecial].forEach((grid) => {
  if (!grid) {
    return;
  }

  grid.addEventListener('click', (event) => {
    const tile = event.target.closest('.alphabet-tile');
    if (!tile) {
      return;
    }

    clearTileSelection();

    tile.classList.add('active');
    if (activeMode === 'test') {
      tile.classList.add('revealed');
    }

    setSpotlight(tile.dataset.letter || '', tile.dataset.name || '', tile.dataset.pron || '');
    playLetterAudio(tile.dataset.audio || '', tile.dataset.letter || '');
  });
});

if (learnModeButton) {
  learnModeButton.addEventListener('click', () => {
    applyMode('learn');
  });
}

if (testModeButton) {
  testModeButton.addEventListener('click', () => {
    applyMode('test');
  });
}

if (quizForm) {
  quizForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!currentQuestion || !quizAnswer || !quizFeedback) {
      return;
    }

    // Normalize: ignore the placeholder "-" so users can type just the marks.
    const normalize = (s) => s.replace(/-/g, '').trim();
    const guess = normalize(quizAnswer.value);
    attempts += 1;

    // Accept any letter sharing the same sound (e.g. all 5 "kh" consonants).
    const validSymbols = allLetters
      .filter((l) => l.name === currentQuestion.name)
      .map((l) => normalize(l.symbol));

    if (validSymbols.includes(guess)) {
      correct += 1;
      const note = validSymbols.length > 1
        ? ` (also accepted: ${validSymbols.filter((s) => s !== guess).join(' ')})`
        : '';
      quizFeedback.textContent = `Correct! Nice work.${note}`;
      quizFeedback.classList.remove('bad');
      quizFeedback.classList.add('good');
    } else {
      const allAnswers = validSymbols.join(' / ');
      quizFeedback.textContent = `Not yet. Correct answer${validSymbols.length > 1 ? 's' : ''}: ${allAnswers}`;
      quizFeedback.classList.remove('good');
      quizFeedback.classList.add('bad');
    }

    updateScoreboard();
  });
}

if (nextQuestionButton) {
  nextQuestionButton.addEventListener('click', () => {
    buildQuestion();
  });
}
