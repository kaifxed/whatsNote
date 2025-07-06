// --- Piano Notes Setup ---
const NOTES = [
  // C2 to B6 (5 octaves)
  { note: 'C2', freq: 65.41 }, { note: 'C#2', freq: 69.30 }, { note: 'D2', freq: 73.42 }, { note: 'D#2', freq: 77.78 }, { note: 'E2', freq: 82.41 }, { note: 'F2', freq: 87.31 }, { note: 'F#2', freq: 92.50 }, { note: 'G2', freq: 98.00 }, { note: 'G#2', freq: 103.83 }, { note: 'A2', freq: 110.00 }, { note: 'A#2', freq: 116.54 }, { note: 'B2', freq: 123.47 },
  { note: 'C3', freq: 130.81 }, { note: 'C#3', freq: 138.59 }, { note: 'D3', freq: 146.83 }, { note: 'D#3', freq: 155.56 }, { note: 'E3', freq: 164.81 }, { note: 'F3', freq: 174.61 }, { note: 'F#3', freq: 185.00 }, { note: 'G3', freq: 196.00 }, { note: 'G#3', freq: 207.65 }, { note: 'A3', freq: 220.00 }, { note: 'A#3', freq: 233.08 }, { note: 'B3', freq: 246.94 },
  { note: 'C4', freq: 261.63 }, { note: 'C#4', freq: 277.18 }, { note: 'D4', freq: 293.66 }, { note: 'D#4', freq: 311.13 }, { note: 'E4', freq: 329.63 }, { note: 'F4', freq: 349.23 }, { note: 'F#4', freq: 369.99 }, { note: 'G4', freq: 392.00 }, { note: 'G#4', freq: 415.30 }, { note: 'A4', freq: 440.00 }, { note: 'A#4', freq: 466.16 }, { note: 'B4', freq: 493.88 },
  { note: 'C5', freq: 523.25 }, { note: 'C#5', freq: 554.37 }, { note: 'D5', freq: 587.33 }, { note: 'D#5', freq: 622.25 }, { note: 'E5', freq: 659.25 }, { note: 'F5', freq: 698.46 }, { note: 'F#5', freq: 739.99 }, { note: 'G5', freq: 783.99 }, { note: 'G#5', freq: 830.61 }, { note: 'A5', freq: 880.00 }, { note: 'A#5', freq: 932.33 }, { note: 'B5', freq: 987.77 },
  { note: 'C6', freq: 1046.50 }, { note: 'C#6', freq: 1108.73 }, { note: 'D6', freq: 1174.66 }, { note: 'D#6', freq: 1244.51 }, { note: 'E6', freq: 1318.51 }, { note: 'F6', freq: 1396.91 }, { note: 'F#6', freq: 1479.98 }, { note: 'G6', freq: 1567.98 }, { note: 'G#6', freq: 1661.22 }, { note: 'A6', freq: 1760.00 }, { note: 'A#6', freq: 1864.66 }, { note: 'B6', freq: 1975.53 }
];

const piano = document.getElementById('piano');
const currentNoteSpan = document.getElementById('current-note');
let activeKey = null;

// --- Piano UI ---
function createPiano() {
  piano.innerHTML = '';
  const whiteNotes = NOTES.filter(({ note }) => !note.includes('#'));
  const blackNotes = NOTES.filter(({ note }) => note.includes('#'));

  const WHITE_KEY_WIDTH = 40; // px (for min-width)
  const BLACK_KEY_WIDTH = 22; // px

  // White keys row
  const whiteRow = document.createElement('div');
  whiteRow.className = 'piano-white-row';
  whiteRow.style.minWidth = (whiteNotes.length * WHITE_KEY_WIDTH) + 'px';
  const whiteKeyEls = [];
  whiteNotes.forEach(({ note }) => {
    const whiteKey = document.createElement('div');
    whiteKey.className = 'piano-key white';
    whiteKey.dataset.note = note;
    whiteKey.innerHTML = `<span class=\"piano-key-label\">${note}</span>`;
    whiteKey.addEventListener('click', () => playNote(note));
    whiteKey.style.width = WHITE_KEY_WIDTH + 'px';
    whiteKey.style.minWidth = WHITE_KEY_WIDTH + 'px';
    whiteRow.appendChild(whiteKey);
    whiteKeyEls.push(whiteKey);
  });
  piano.appendChild(whiteRow);

  // Black keys row (absolutely positioned)
  const blackRow = document.createElement('div');
  blackRow.className = 'piano-black-row';
  blackRow.style.minWidth = (whiteNotes.length * WHITE_KEY_WIDTH) + 'px';
  // Wait for white keys to be rendered
  setTimeout(() => {
    whiteNotes.forEach(({ note }, i) => {
      const base = note.slice(0, -1);
      const octave = note.slice(-1);
      const blackNote = (base !== 'E' && base !== 'B') ? base + '#' + octave : null;
      if (blackNote && NOTES.find(n => n.note === blackNote) && whiteKeyEls[i] && whiteKeyEls[i+1]) {
        const blackKey = document.createElement('div');
        blackKey.className = 'piano-key black';
        blackKey.dataset.note = blackNote;
        blackKey.addEventListener('click', (e) => {
          e.stopPropagation();
          playNote(blackNote);
        });
        blackKey.style.width = BLACK_KEY_WIDTH + 'px';
        blackKey.style.minWidth = BLACK_KEY_WIDTH + 'px';
        // Calculate left as the midpoint between this and next white key
        const leftA = whiteKeyEls[i].offsetLeft;
        const leftB = whiteKeyEls[i+1].offsetLeft;
        const widthA = whiteKeyEls[i].offsetWidth;
        // Place black key at the midpoint between the right edge of A and left edge of B
        const left = leftA + widthA - (BLACK_KEY_WIDTH / 2);
        blackKey.style.left = left + 'px';
        blackRow.appendChild(blackKey);
      }
    });
  }, 0);
  piano.appendChild(blackRow);
}
createPiano();

// --- Note Playback ---
const synth = new Tone.Synth({ oscillator: { type: 'triangle' } }).toDestination();
function playNote(note) {
  const noteObj = NOTES.find(n => n.note === note);
  if (noteObj) {
    synth.triggerAttackRelease(note, '8n');
    highlightKey(note);
  }
}

function highlightKey(note) {
  if (activeKey) activeKey.classList.remove('active');
  const key = [...document.querySelectorAll('.piano-key')].find(k => k.dataset.note === note);
  if (key) {
    key.classList.add('active');
    activeKey = key;
  } else {
    activeKey = null;
  }
}

function clearHighlight() {
  if (activeKey) {
    activeKey.classList.remove('active');
    activeKey = null;
  }
}

// --- Pitch Detection ---
let pitch;
let mic;
let running = false;
let audioContext;
let analyser;
let microphone;
let stopDetection = null; // function to stop detection

// --- Debounce for note smoothing ---
let lastDetectedNote = null;
let noteHoldCount = 0;
const NOTE_HOLD_THRESHOLD = 3; // Number of consecutive frames before updating UI

function freqToNote(freq) {
  if (!freq || freq < 60 || freq > 2000) return null; // Expanded range for C2-B6
  
  // Use a more accurate frequency-to-note conversion
  const A4 = 440;
  const C0 = A4 * Math.pow(2, -4.75);
  const halfStepsBelowMiddleC = Math.round(12 * Math.log2(freq / C0));
  const octave = Math.floor(halfStepsBelowMiddleC / 12);
  const noteIndex = (halfStepsBelowMiddleC % 12 + 12) % 12;
  
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const noteName = noteNames[noteIndex];
  const noteOctave = octave;
  
  // Allow a wider range, e.g., C2 to B6
  if (noteOctave >= 2 && noteOctave <= 6) {
    return noteName + noteOctave;
  }
  
  return null;
}

async function startPitchDetection() {
  if (running) return;
  
  // Resume AudioContext on user gesture
  if (Tone.context.state !== 'running') {
    await Tone.context.resume();
  }
  
  running = true;
  document.getElementById('start-btn').disabled = false;
  document.getElementById('start-btn').textContent = 'Stop Detection';
  
  try {
    // Get microphone stream using modern Web API
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        sampleRate: 44100,
        channelCount: 1
      } 
    });
    
    // Create audio context and analyser
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    
    // Connect microphone to analyser
    microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);
    
    // Initialize ml5 pitch detection
    pitch = ml5.pitchDetection(
      'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/',
      audioContext,
      stream,
      modelLoaded
    );
    
    // Provide a stop function
    stopDetection = () => {
      running = false;
      if (stream && stream.getTracks) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
      document.getElementById('start-btn').textContent = 'Start Mic & Detect';
      currentNoteSpan.textContent = '--';
      clearHighlight();
    };
    
  } catch (error) {
    console.error('Error starting mic:', error);
    alert('Please allow microphone access and try again.');
    running = false;
    document.getElementById('start-btn').disabled = false;
    document.getElementById('start-btn').textContent = 'Start Mic & Detect';
  }
}

function modelLoaded() {
  detectPitch();
}

function detectPitch() {
  if (!pitch) return;
  pitch.getPitch((err, freq) => {
    if (err) {
      requestAnimationFrame(detectPitch);
      return;
    }
    
    let note = null;
    if (freq && freq > 60) {
      note = freqToNote(freq);
    }

    if (note && note === lastDetectedNote) {
      noteHoldCount++;
    } else {
      noteHoldCount = 1;
      lastDetectedNote = note;
    }

    if (note && noteHoldCount >= NOTE_HOLD_THRESHOLD) {
      currentNoteSpan.textContent = note;
      highlightKey(note);
    } else {
      currentNoteSpan.textContent = '--';
      clearHighlight();
    }
    
    requestAnimationFrame(detectPitch);
  });
}

document.getElementById('start-btn').addEventListener('click', () => {
  if (!running) {
    startPitchDetection();
  } else if (stopDetection) {
    stopDetection();
  }
});

// --- Audio Context Unlock for all devices ---
document.addEventListener('click', async () => {
  if (Tone.context.state !== 'running') {
    await Tone.context.resume();
  }
}, { once: true });

document.addEventListener('touchstart', async () => {
  if (Tone.context.state !== 'running') {
    await Tone.context.resume();
  }
}, { once: true }); 