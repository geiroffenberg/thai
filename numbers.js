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
const playbackToggle = document.getElementById('playbackToggle');
const nextNumBtn     = document.getElementById('nextNumBtn');

const AUDIO_BASE   = '../audio/numbers';
const NUM_MODE_KEY = 'thai-numbers-mode';
const NUM_PLAYBACK_KEY = 'thai-numbers-playback-mode';

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
  { digit: '30', thai: 'สามสิบ',  rom: 'saam-sip', audio: `${AUDIO_BASE}/30-saam-sip.mp3` },
  { digit: '40', thai: 'สี่สิบ',  rom: 'sii-sip',  audio: `${AUDIO_BASE}/40-sii-sip.mp3` },
  { digit: '50', thai: 'ห้าสิบ',  rom: 'haa-sip',  audio: `${AUDIO_BASE}/50-haa-sip.mp3` },
  { digit: '60', thai: 'หกสิบ',   rom: 'hok-sip',  audio: `${AUDIO_BASE}/60-hok-sip.mp3` },
  { digit: '70', thai: 'เจ็ดสิบ', rom: 'jet-sip',  audio: `${AUDIO_BASE}/70-jet-sip.mp3` },
  { digit: '80', thai: 'แปดสิบ',  rom: 'paet-sip', audio: `${AUDIO_BASE}/80-paet-sip.mp3` },
  { digit: '90', thai: 'เก้าสิบ', rom: 'gao-sip',  audio: `${AUDIO_BASE}/90-gao-sip.mp3` },
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
let queuedAudios = [];
let naturalSources = [];
let naturalContext = null;
const naturalBufferCache = new Map();
const naturalAnalysisCache = new Map();

const AUDIO = {
  d1: `${AUDIO_BASE}/01-neung.mp3`,
  d2: `${AUDIO_BASE}/02-song.mp3`,
  d3: `${AUDIO_BASE}/03-saam.mp3`,
  d4: `${AUDIO_BASE}/04-sii.mp3`,
  d5: `${AUDIO_BASE}/05-haa.mp3`,
  d6: `${AUDIO_BASE}/06-hok.mp3`,
  d7: `${AUDIO_BASE}/07-jet.mp3`,
  d8: `${AUDIO_BASE}/08-paet.mp3`,
  d9: `${AUDIO_BASE}/09-gao.mp3`,
  ten: `${AUDIO_BASE}/10-sip.mp3`,
  et: `${AUDIO_BASE}/et.mp3`,
  t20: `${AUDIO_BASE}/20-yii-sip.mp3`,
  t30: `${AUDIO_BASE}/30-saam-sip.mp3`,
  t40: `${AUDIO_BASE}/40-sii-sip.mp3`,
  t50: `${AUDIO_BASE}/50-haa-sip.mp3`,
  t60: `${AUDIO_BASE}/60-hok-sip.mp3`,
  t70: `${AUDIO_BASE}/70-jet-sip.mp3`,
  t80: `${AUDIO_BASE}/80-paet-sip.mp3`,
  t90: `${AUDIO_BASE}/90-gao-sip.mp3`,
  p100: `${AUDIO_BASE}/100-roi.mp3`,
  p1000: `${AUDIO_BASE}/1000-phan.mp3`,
  p10000: `${AUDIO_BASE}/10000-muen.mp3`,
  p100000: `${AUDIO_BASE}/100000-saen.mp3`,
  p1000000: `${AUDIO_BASE}/1000000-laan.mp3`,
};

function stopCurrentAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  queuedAudios.forEach((a) => {
    a.pause();
    a.currentTime = 0;
  });
  queuedAudios = [];

  naturalSources.forEach((src) => {
    try {
      src.stop();
    } catch (e) {}
  });
  naturalSources = [];
}

function getNaturalContext() {
  if (!naturalContext) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    naturalContext = new Ctx();
  }
  return naturalContext;
}

async function getAudioBuffer(audioFile) {
  if (naturalBufferCache.has(audioFile)) return naturalBufferCache.get(audioFile);
  const response = await fetch(audioFile);
  if (!response.ok) throw new Error(`Failed to fetch ${audioFile}`);
  const arrayBuffer = await response.arrayBuffer();
  const ctx = getNaturalContext();
  if (!ctx) throw new Error('Web Audio API not available');
  const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
  naturalBufferCache.set(audioFile, decoded);
  return decoded;
}

function getClipKind(audioFile) {
  const name = audioFile.split('/').pop() || '';
  if (/^0[1-9]-/.test(name)) return 'digit';
  if (/^10-sip\.mp3$/.test(name)) return 'tens';
  if (/^[2-9]0-.*\.mp3$/.test(name)) return 'tens';
  if (/^1000000-|^100000-|^10000-|^1000-|^100-/.test(name)) return 'power';
  if (/^et\.mp3$/.test(name)) return 'et';
  return 'other';
}

function getBoundaryOverlap(prevKind, nextKind) {
  if (prevKind === 'digit' && nextKind === 'power') return 0.20;
  if (prevKind === 'tens' && (nextKind === 'digit' || nextKind === 'et')) return 0.14;
  if (prevKind === 'power' && (nextKind === 'digit' || nextKind === 'tens')) return 0.08;
  return 0.10;
}

function analyzeBufferVoiceWindow(buffer, key) {
  if (naturalAnalysisCache.has(key)) return naturalAnalysisCache.get(key);

  const channel = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  const threshold = 0.015;
  const minKeep = 0.04;
  const pad = 0.01;

  let start = 0;
  while (start < channel.length && Math.abs(channel[start]) < threshold) start += 1;

  let end = channel.length - 1;
  while (end > start && Math.abs(channel[end]) < threshold) end -= 1;

  const startSec = Math.max(0, start / sampleRate - pad);
  const endSec = Math.min(buffer.duration, end / sampleRate + pad);
  const durationSec = Math.max(minKeep, endSec - startSec);

  const result = { startSec, durationSec };
  naturalAnalysisCache.set(key, result);
  return result;
}

function playAudio(audioFile, label) {
  if (!audioFile) {
    setAudioStatus(`No audio file recorded for "${label}" yet.`);
    return;
  }
  stopCurrentAudio();
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

function pushDigitAndPower(clips, digit, powerClip) {
  const digitMap = {
    1: AUDIO.d1,
    2: AUDIO.d2,
    3: AUDIO.d3,
    4: AUDIO.d4,
    5: AUDIO.d5,
    6: AUDIO.d6,
    7: AUDIO.d7,
    8: AUDIO.d8,
    9: AUDIO.d9,
  };
  clips.push(digitMap[digit], powerClip);
}

function buildNumberAudioSequence(n) {
  if (!Number.isFinite(n) || n <= 0) return [];

  const clips = [];
  const powersDef = [
    { value: 1000000, clip: AUDIO.p1000000 },
    { value: 100000, clip: AUDIO.p100000 },
    { value: 10000, clip: AUDIO.p10000 },
    { value: 1000, clip: AUDIO.p1000 },
    { value: 100, clip: AUDIO.p100 },
  ];

  let rest = n;
  for (const p of powersDef) {
    const d = Math.floor(rest / p.value);
    if (d > 0 && d <= 9) {
      pushDigitAndPower(clips, d, p.clip);
      rest %= p.value;
    }
  }

  if (rest >= 10) {
    const t = Math.floor(rest / 10);
    const u = rest % 10;
    const tensMap = {
      1: AUDIO.ten,
      2: AUDIO.t20,
      3: AUDIO.t30,
      4: AUDIO.t40,
      5: AUDIO.t50,
      6: AUDIO.t60,
      7: AUDIO.t70,
      8: AUDIO.t80,
      9: AUDIO.t90,
    };
    clips.push(tensMap[t]);
    if (u === 1) clips.push(AUDIO.et);
    else if (u > 1) {
      const unitMap = {
        2: AUDIO.d2,
        3: AUDIO.d3,
        4: AUDIO.d4,
        5: AUDIO.d5,
        6: AUDIO.d6,
        7: AUDIO.d7,
        8: AUDIO.d8,
        9: AUDIO.d9,
      };
      clips.push(unitMap[u]);
    }
  } else if (rest > 0) {
    const unitMap = {
      1: AUDIO.d1,
      2: AUDIO.d2,
      3: AUDIO.d3,
      4: AUDIO.d4,
      5: AUDIO.d5,
      6: AUDIO.d6,
      7: AUDIO.d7,
      8: AUDIO.d8,
      9: AUDIO.d9,
    };
    clips.push(unitMap[rest]);
  }

  return clips.filter(Boolean);
}

function playAudioSequence(audioFiles, label) {
  if (!audioFiles.length) {
    setAudioStatus(`No composed audio available for ${label}.`);
    return;
  }

  stopCurrentAudio();
  const queue = audioFiles.map((f) => new Audio(f));
  queuedAudios = queue;
  let index = 0;

  const playNext = () => {
    if (index >= queue.length) {
      currentAudio = null;
      queuedAudios = [];
      setAudioStatus(`Played ${label}.`);
      return;
    }
    const audio = queue[index];
    currentAudio = audio;
    audio.addEventListener('ended', () => {
      index += 1;
      playNext();
    }, { once: true });
    audio.play()
      .then(() => setAudioStatus(`Playing ${label} (${index + 1}/${queue.length})`))
      .catch(() => setAudioStatus(`Could not play ${label}. Missing or blocked audio.`));
  };

  playNext();
}

async function playAudioSequenceNatural(audioFiles, label) {
  if (!audioFiles.length) {
    setAudioStatus(`No composed audio available for ${label}.`);
    return;
  }

  const ctx = getNaturalContext();
  if (!ctx) {
    setAudioStatus('Natural speed is not supported in this browser.');
    return;
  }

  stopCurrentAudio();

  try {
    if (ctx.state === 'suspended') await ctx.resume();

    setAudioStatus(`Loading natural audio for ${label}…`);
    const parts = [];
    for (const file of audioFiles) {
      const buffer = await getAudioBuffer(file);
      const window = analyzeBufferVoiceWindow(buffer, file);
      parts.push({ file, buffer, ...window, kind: getClipKind(file) });
    }

    const playbackRate = 1.0;
    let nextStart = ctx.currentTime + 0.04;

    parts.forEach((part, index) => {
      const src = ctx.createBufferSource();
      src.buffer = part.buffer;
      src.playbackRate.value = playbackRate;
      src.connect(ctx.destination);
      src.start(nextStart, part.startSec, part.durationSec);
      naturalSources.push(src);

      const adjustedDuration = part.durationSec / playbackRate;
      const nextKind = index < parts.length - 1 ? parts[index + 1].kind : 'other';
      const overlapSeconds = getBoundaryOverlap(part.kind, nextKind);
      nextStart += Math.max(0.06, adjustedDuration - overlapSeconds);

      if (index === parts.length - 1) {
        src.addEventListener('ended', () => {
          naturalSources = [];
          setAudioStatus(`Played ${label} (natural speed).`);
        }, { once: true });
      }
    });

    setAudioStatus(`Playing ${label} (natural speed)`);
  } catch (err) {
    naturalSources = [];
    setAudioStatus(`Could not play natural speed for ${label}.`);
  }
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
let lastPracticeAudioClips = [];
let lastPracticeAudioLabel = '';
let preferredPlayback = 'clear';

function setPreferredPlayback(mode) {
  preferredPlayback = mode === 'natural' ? 'natural' : 'clear';
  try { localStorage.setItem(NUM_PLAYBACK_KEY, preferredPlayback); } catch (e) {}
}

function applyPlaybackPreference(mode) {
  setPreferredPlayback(mode);
  if (playbackToggle) playbackToggle.checked = preferredPlayback === 'natural';
}

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
  lastPracticeAudioClips = [];
  lastPracticeAudioLabel = '';
  setAudioStatus('');
}

function revealAnswer() {
  const isAlreadyRevealed = practiceAnswer && !practiceAnswer.classList.contains('hidden');

  if (!isAlreadyRevealed) {
    const result = buildThaiNumber(currentPracticeNumber);
    if (practiceThai) practiceThai.textContent = result.thai;
    if (practiceRom)  practiceRom.textContent  = result.rom;
    if (practiceAnswer) practiceAnswer.classList.remove('hidden');
    const clips = buildNumberAudioSequence(currentPracticeNumber);
    const label = `${formatDisplay(currentPracticeNumber)} — ${result.thai}`;
    lastPracticeAudioClips = clips;
    lastPracticeAudioLabel = label;
  }

  if (!lastPracticeAudioClips.length) {
    setAudioStatus('No composed audio available for this number yet.');
    return;
  }

  if (preferredPlayback === 'natural') {
    playAudioSequenceNatural(lastPracticeAudioClips, lastPracticeAudioLabel || 'number');
  } else {
    playAudioSequence(lastPracticeAudioClips, lastPracticeAudioLabel || 'number');
  }
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

try {
  const savedPlayback = localStorage.getItem(NUM_PLAYBACK_KEY);
  applyPlaybackPreference(savedPlayback === 'natural' ? 'natural' : 'clear');
} catch (e) {
  applyPlaybackPreference('clear');
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
if (playbackToggle) playbackToggle.addEventListener('change', () => {
  applyPlaybackPreference(playbackToggle.checked ? 'natural' : 'clear');
});
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
