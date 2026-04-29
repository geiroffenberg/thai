// Shared site-wide JS — runs on every page.
const speakButtons = document.querySelectorAll('.speak-btn');

function speakThai(text) {
  if (!('speechSynthesis' in window)) {
    alert('Speech is not supported in this browser.');
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'th-TH';
  utterance.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

speakButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const phrase = button.getAttribute('data-phrase');
    if (phrase) {
      speakThai(phrase);
    }
  });
});

// --- Theme toggle (light / dark) ---
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.querySelector('.theme-toggle');
  if (btn) {
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
}

const themeToggle = document.querySelector('.theme-toggle');
if (themeToggle) {
  // Initialize icon based on current attribute (set early in <head>)
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current);

  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('thai-theme', next);
    } catch (_) {}
    applyTheme(next);
  });
}

