// Numbers Lab — page-specific logic for pages/numbers.html

const numLearnModeButton = document.getElementById('numLearnModeBtn');
const numTestModeButton  = document.getElementById('numTestModeBtn');
const numModeHint        = document.getElementById('numModeHint');
const numbersLab         = document.getElementById('numbers-lab');
const numAudioStatus     = document.getElementById('numAudioStatus');

// Practice panel
const practiceNumber = document.getElementById('practiceNumber');
const practiceAnswer = document.getElementById('practiceAnswer');
const practiceThai   = document.getElementById('practiceThai');
const practiceRom    = document.getElementById('practiceRom');
const revealBtn      = document.getElementById('revealBtn');
const nextNumBtn     = document.getElementById('nextNumBtn');

const AUDIO_BASE   = '../audio/numbers';
const NUM_MODE_KEY = 'thai-numbers-mode';

// ─── Data ────────────────────────────────────────────────────────────────────

const DIGIT_THAI = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
const DIGIT_ROM  = ['', 'neung', 'song', 'saam', 'sii', 'haa', 'hok', 'jet', 'paet', 'gao'];

const oneToTen = [
  { digit: '1',  thai: 'หนึ่ง', rom: 'neung', audio: `${AUDIO_BASE}/01-neung.mp3` },
  { digit: '2',  thai: 'สอง',   rom: 'song',  audio: `${AUDIO_BASE}/02-song.mp3` },
  { digit: '3',  thai: 'สาม',   rom: 'saam',  audio: `${AUDIO_BASE}/03-saam.mp3` },
  { digit: '4',  thai: 'สี่',   rom: 'sii',   audio: `${AUDIO_BASE}/04-sii.mp3` },
  { digit: '5',  thai: 'ห้า',   rom: 'haa',   audio: `${AUDIO_BASE}/05-haa.mp3` },
  { digit: '6',  thai: 'หก',    rom: 'hok',   audio: `${AUDIO_BASE}/06-hok.mp3` },
  { digit: '7',  thai: 'เจ็ด',  rom: 'jet',   audio: `${AUDIO_BASE}/07-jet.mp3` },
  { digit: '8',  thai: 'แปด',   rom: 'paet',  audio: `${AUDIO_BASE}/08-paet.mp3` },
  { digit: '9',  thai: 'เก้า',  rom: 'gao',   audio: `${AUDIO_BASE}/09-gao.mp3` },
  { digit: '10', thai: 'สิบ',   rom: 'sip',   audio: `${AUDIO_BASE}/10-sip.mp3` },
];

const exceptions = [
  { digit: '11', thai: 'สิบเอ็ด',    rom: 'sip-et',     audio: `${AUDIO_BASE}/11-sip-et.mp3`,     note: 'exception: 1 at end → เอ็ด' },
  { digit: '21', thai: 'ยี่สิบเอ็ด', rom: 'yii-sip-et', audio: `${AUDIO_BASE}/21-yii-sip-et.mp3`, note: 'exception: 20 uses ยี่ + เอ็ด' },
];

const tens = [
  { digit: '20', thai: 'ยี่สิบ',  rom: 'yii-sip',  audio: `${AUDIO_BASE}/20-yii-sip.mp3`, note: 'ยี่ not สอง' },
  { digit: '30', thai: 'สามสิบ',  rom: 'saam-sip', audio: null },
  { digit: '40', thai: 'สี่สิบ',  rom: 'sii-sip',  audio: null },
  { digit: '50', thai: 'ห้าสิบ',  rom: 'haa-sip',  audio: null },
  { digit: '60', thai: 'หกสิบ',   rom: 'hok-sip',  audio: null },
  { digit: '70', thai: 'เจ็ดสิบ', rom: 'jet-sip',  audio: null },
  { digit: '80', thai: 'แปดสิบ',  rom: 'paet-sip', audio: null },
  { digit: '90', thai: 'เก้าสิบ', rom: 'gao-sip',  audio: null },
];

const powers = [
  { digit: '100',       thai: 'ร้อย',  rom: 'roi',  audio: `${AUDIO_BASE}/100-roi.mp3` },
  { digit: '1 000',     thai: 'พัน',   rom: 'phan', audio: `${AUDIO_BASE}/1000-phan.mp3` },
  { digit: '10 000',    thai: 'หมื่น', rom: 'muen', audio: `${AUDIO_BASE}/10000-muen.mp3` },
  { digit: '100 000',   thai: 'แสน',   rom: 'saen', audio: `${AUDIO_BASE}/100000-saen.mp3` },
  { digit: '1 000 000', thai: 'ล้าน',  rom: 'laan', audio: `${AUDIO_BASE}/1000000-laan.mp3` },
];

// ─── Thai number composition ──────────────────────────────────────────────────
// Rules:
//   • 10s digit = 1  → สิบ alone (no หนึ่ง prefix)
//   • 10s digit = 2  → ยี่สิบ (not สองสิบ)
//   • Units digit = 1 in a multi-digit number → เอ็ด (not หนึ่ง)

function buildThaiNumber(n) {
  if (n === 0) return { thai: 'ศูนย์', rom: 'sun' };

  const thaiParts = [];
  const romParts  = [];

  const POWERS = [
    { value: 1000000, thai: 'ล้าน',  rom: 'laan' },
    { value: 100000,  thai: 'แสน',   rom: 'saen' },
    { value: 10000,   thai: 'หมื่น', rom: 'muen' },
    { value: 1000,    thai: 'พัน',   rom: 'phan' },
    { value: 100,     thai: 'ร้อย',  rom: 'roi'  },
  ];

  for (const p of POWERS) {
    const d = Math.floor(n / p.value);
    if (d > 0) {
      thaiParts.push(DIGIT_THAI[d] + p.thai);
      romParts.push(DIGIT_ROM[d] + '-' + p.rom);
      n %= p.value;
    }
  }

  // Handle remaining 1–99
  if (n >= 10) {
    const t = Math.floor(n / 10);
    const u = n % 10;

    if (t === 2) {
      thaiParts.push('ยี่สิบ'); romParts.push('yii-sip');
    } else if (t === 1) {
      thaiParts.push('สิบ'); romParts.push('sip');
    } else {
      thaiParts.push(DIGIT_THAI[t] + 'สิบ'); romParts.push(DIGIT_ROM[t] + '-sip');
    }

    if (u === 1) {
      thaiParts.push('เอ็ด'); romParts.push('et');
    } else if (u > 1) {
      thaiParts.push(DIGIT_THAI[u]); romParts.push(DIGIT_ROM[u]);
    }
  } else if (n > 0) {
    thaiParts.push(DIGIT_THAI[n]); romParts.push(DIGIT_ROM[n]);
  }

  return { thai: thaiParts.join(''), rom: romParts.join('-') };
}

// ─── Audio ───────────────────────────────────────────────────────────────────

let currentAudio = null;

function playAudio(audioFile, label) {
  if (!audioFile) {
    setAudioStatus(`No audio file recorded for "${label}" yet.`);
    return;
  }
  if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }
  const audio = new Audio(audioFile);
  currentAudio = audio;
  setAudioStatus(`Loading ${label}…`);
  audio.addEventListener('ended', () => setAudioStatus(`Played ${label}. Tap another number.`));
  audio.play()
    .then(() => setAudioStatus(`Playing ${label}`))
    .catch(() => setAudioStatus(`Could not play ${label}. Audio file not available yet.`));
}

function setAudioStatus(msg) {
  if (numAudioStatus) numAudioStatus.textContent = msg;
}

// ─── Tile rendering ──────────────────────────────────────────────────────────

function renderNumberGrid(gridEl, entries) {
  if (!gridEl) return;
  gridEl.innerHTML = entries.map((entry) => `
    <button
      class="number-tile"
      type="button"
      data-digit="${entry.digit}"
      data-thai="${entry.thai}"
      data-rom="${entry.rom}"
      data-audio="${entry.audio || ''}"
    >
      <span class="num-tile-digit">${entry.digit}</span>
      <span class="num-tile-thai">${entry.thai}</span>
      <span class="num-tile-rom">${entry.rom}</span>
      ${entry.note ? `<span class="num-tile-note">${entry.note}</span>` : ''}
    </button>
  `).join('');
}

// ─── Mode ────────────────────────────────────────────────────────────────────

let activeMode = 'learn';

function clearTileSelection() {
  document.querySelectorAll('.number-tile.active, .number-tile.revealed').forEach((t) => {
    t.classList.remove('active', 'revealed');
  });
}

function applyMode(nextMode) {
  activeMode = nextMode === 'test' ? 'test' : 'learn';
  if (numbersLab) numbersLab.dataset.mode = activeMode;

  const isTest = activeMode === 'test';
  if (numLearnModeButton) {
    numLearnModeButton.classList.toggle('active', !isTest);
    numLearnModeButton.setAttribute('aria-pressed', String(!isTest));
  }
  if (numTestModeButton) {
    numTestModeButton.classList.toggle('active', isTest);
    numTestModeButton.setAttribute('aria-pressed', String(isTest));
  }
  if (numModeHint) {
    numModeHint.textContent = isTest
      ? 'Test mode shows the numeral only. Tap a tile to reveal the Thai word and romanization.'
      : 'Learning mode shows each number with its Thai word and pronunciation.';
  }
  clearTileSelection();
  setAudioStatus(isTest
    ? 'Test mode is on. Tap a number tile to reveal and hear it.'
    : 'Tap a number tile to hear its sound.');

  try { localStorage.setItem(NUM_MODE_KEY, activeMode); } catch (e) {}
}

// ─── Number Builder practice panel ───────────────────────────────────────────

let selectedDigits = 2;
let currentPracticeNumber = 0;

function randomForDigits(d) {
  const min = Math.pow(10, d - 1);
  const max = Math.pow(10, d) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatDisplay(n) {
  return n.toLocaleString('en-US').replace(/,/g, ' ');
}

function newPracticeNumber() {
  currentPracticeNumber = randomForDigits(selectedDigits);
  if (practiceNumber) practiceNumber.textContent = formatDisplay(currentPracticeNumber);
  if (practiceAnswer) practiceAnswer.classList.add('hidden');
  if (revealBtn) revealBtn.disabled = false;
  setAudioStatus('');
}

function revealAnswer() {
  const result = buildThaiNumber(currentPracticeNumber);
  if (practiceThai) practiceThai.textContent = result.thai;
  if (practiceRom)  practiceRom.textContent  = result.rom;
  if (practiceAnswer) practiceAnswer.classList.remove('hidden');
  if (revealBtn) revealBtn.disabled = true;
  setAudioStatus('Audio for combined numbers coming when audio files are added.');
}

// ─── Init ────────────────────────────────────────────────────────────────────

renderNumberGrid(document.getElementById('grid1to10'),      oneToTen);
renderNumberGrid(document.getElementById('gridExceptions'),  exceptions);
renderNumberGrid(document.getElementById('gridTens'),        tens);
renderNumberGrid(document.getElementById('gridPowers'),      powers);

try {
  const saved = localStorage.getItem(NUM_MODE_KEY);
  applyMode(saved === 'test' ? 'test' : 'learn');
} catch (e) {
  applyMode('learn');
}

newPracticeNumber();

// ─── Events ──────────────────────────────────────────────────────────────────

if (numLearnModeButton) numLearnModeButton.addEventListener('click', () => applyMode('learn'));
if (numTestModeButton)  numTestModeButton.addEventListener('click',  () => applyMode('test'));

document.querySelectorAll('.digit-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.digit-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    selectedDigits = parseInt(btn.dataset.digits, 10);
    newPracticeNumber();
  });
});

if (revealBtn)  revealBtn.addEventListener('click',  revealAnswer);
if (nextNumBtn) nextNumBtn.addEventListener('click',  newPracticeNumber);

['grid1to10', 'gridExceptions', 'gridTens', 'gridPowers'].forEach((id) => {
  const grid = document.getElementById(id);
  if (!grid) return;
  grid.addEventListener('click', (event) => {
    const tile = event.target.closest('.number-tile');
    if (!tile) return;
    clearTileSelection();
    tile.classList.add('active');
    if (activeMode === 'test') tile.classList.add('revealed');
    playAudio(tile.dataset.audio || null, `${tile.dataset.digit} — ${tile.dataset.thai}`);
  });
});
