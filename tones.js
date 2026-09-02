// Tones Lab — page-specific logic for pages/tones.html
//
// Audio strategy: each tone-example button carries a data-audio-file pointing at
// audio/tones/*.mp3. When the real recording exists it plays; when it is missing
// (e.g. before your wife records), the button politely shows "audio coming soon"
// instead of using the browser's robotic Thai TTS.
//
// Once a real .mp3 is dropped into audio/tones/ with the matching filename, the
// "coming soon" badge is hidden automatically — no markup edit needed.

const AUDIO_BASE = '../audio/tones';

const toneSpeakButtons = document.querySelectorAll('[data-audio-file]');
let currentToneAudio = null;

function setToneAudioStatus(message) {
  const el = document.getElementById('toneAudioStatus');
  if (el) el.textContent = message;
}

// Mark the tone row that is currently playing (dim the others).
function setActiveTone(audioBtn) {
  const row = audioBtn.closest('.tone-row');
  if (!row) return;
  document.querySelectorAll('.tone-row').forEach((r) => r.classList.remove('active'));
  row.classList.add('active');
}

// Hide any "coming soon" badge attached to this button once audio is real.
function hideComingSoon(audioBtn) {
  const badge = audioBtn.querySelector('.tone-coming');
  if (badge) badge.style.display = 'none';
}

function playToneAudio(filename, label, audioBtn) {
  const src = `${AUDIO_BASE}/${filename}`;

  if (currentToneAudio) {
    currentToneAudio.pause();
    currentToneAudio.currentTime = 0;
    currentToneAudio = null;
  }

  const audio = new Audio(src);
  currentToneAudio = audio;

  const comingSoon = () =>
    setToneAudioStatus(`\uD83C\uDF9A Audio coming soon for \u201C${label}\u201D \u2014 add ${filename} to audio/tones/ and it will play here.`);

  audio.addEventListener('error', comingSoon);
  audio.addEventListener('playing', () => {
    if (audioBtn) hideComingSoon(audioBtn);
    setToneAudioStatus(`\u25B6 Playing \u201C${label}\u201D`);
  });

  audio.play().catch(() => {
    comingSoon();
    currentToneAudio = null;
  });

  return audio;
}

toneSpeakButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const file = (button.getAttribute('data-audio-file') || '').trim();
    const label = button.getAttribute('aria-label') || button.textContent.trim();
    if (!file) {
      setToneAudioStatus(`\uD83C\uDF9A Audio coming soon for \u201C${label}\u201D.`);
      return;
    }
    setActiveTone(button);
    playToneAudio(file, label, button);
  });
});
