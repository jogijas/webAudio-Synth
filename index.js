import samples from './samples.js';
import { reverb } from './reverb.js';
import pattern from './pattern.json' with { type: 'json' };
// ======================================================
// AUDIO ENGINE (Cross Browser)
// ======================================================

let ac = null;
let masterGain = null;
let convolver = null;
let reverbGain = null;
let audioInitialized = false;
const MGain = document.getElementById('masterGain');

async function initAudioEngine() {
    if (audioInitialized) {
        if (ac.state === "suspended") {
            await ac.resume();
        }
        return;
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    ac = new AudioCtx();
    // Safari sometimes starts suspended
    if (ac.state === "suspended") {
        await ac.resume();
    }
    // Master output
    masterGain = ac.createGain();
    masterGain.gain.value = 4;
    masterGain.connect(ac.destination);
    // Reverb
    convolver = ac.createConvolver();
    reverbGain = ac.createGain();
    reverbGain.gain.value = 1;
    convolver.connect(reverbGain);
    reverbGain.connect(masterGain);
    audioInitialized = true;
}

// If you used the Node script method:

async function loadReverb() {
    try {
        const base64 = reverb.split(",")[1];

        const binary = atob(base64);
        const bytes = Uint8Array.from(
            binary,
            c => c.charCodeAt(0)
        );

        convolver.buffer =
        await ac.decodeAudioData(bytes.buffer);

        console.log("[JAS] Reverb loaded");

    } catch (err) {
        console.warn("Couldn't load reverb", err);
    }
}


// Base64 → AudioBuffer
function base64ToArrayBuffer(dataUrl) {
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64.replace(/\s/g, ''));
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
}
async function loadSample(base64) {

    const arrayBuffer = base64ToArrayBuffer(base64);

    return await ac.decodeAudioData(arrayBuffer);
}
// STRING SAMPLER
class StringSampler {
    constructor(audioContext, audioBuffer, outputNode, options = {}) {
        this.ac = audioContext;
        this.buffer = audioBuffer;
        this.output = outputNode;
        // ADSR
        this.attack  = options.attack  ?? 0.02;
        this.decay   = options.decay   ?? 0.08;
        this.sustain = options.sustain ?? 0.90;
        this.release = options.release ?? 0.80;
        // Loop
        this.loopStart = options.loopStart ?? 0.1;
        this.loopEnd = options.loopEnd ?? (audioBuffer.duration - 0.1);
        this.loop =
            audioBuffer.duration > 0.4 &&
            this.loopEnd > this.loopStart;
        this.useReverb = options.useReverb ?? true;
        this.activeVoices = new Set();
    }
play(startTime = this.ac.currentTime, duration = null) {
    const source = this.ac.createBufferSource();
    source.buffer = this.buffer;
    if (this.loop) {
        source.loop = true;
        source.loopStart = this.loopStart;
        source.loopEnd = this.loopEnd;
    }
    const gain = this.ac.createGain();
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(
        1,
        startTime + this.attack
    );
    gain.gain.linearRampToValueAtTime(
        this.sustain,
        startTime + this.attack + this.decay
    );
    if (this.useReverb) {
        source.connect(gain);
        gain.connect(convolver);
    } else {
        source.connect(gain);
        gain.connect(this.output);
    }
    source.start(startTime);
    const voice = {
        source,
        gain,
        stopped: false
    };
    this.activeVoices.add(voice);
    source.onended = () => {
        source.disconnect();
        gain.disconnect();
        this.activeVoices.delete(voice);
    };
    // Automatically release after the requested duration
    if (duration !== null) {
        const releaseStart = startTime + duration;
        gain.gain.cancelScheduledValues(releaseStart);
        gain.gain.setValueAtTime(
            this.sustain,
            releaseStart
        );
        gain.gain.linearRampToValueAtTime(
            0,
            releaseStart + this.release
        );
        try {
            source.stop(releaseStart + this.release);
        } catch (e) {}
    }
    return () => {
        if (voice.stopped) return;
        voice.stopped = true;
        const now = this.ac.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(
            gain.gain.value,
            now
        );
        gain.gain.linearRampToValueAtTime(
            0,
            now + this.release
        );
        try {
            source.stop(now + this.release);
        } catch (e) {}
    };
}
}
const sampleRate = 44100; // Hz
// Convert seconds → sample frame
function secToSample(sec) {
  return Math.round(sec * sampleRate);
}
// Convert sample frame → seconds
function sampleToSec(frame) {
  return frame / sampleRate;
}
const noteMap = {
  "Sa": { attack: 0.1, decay: 0.1, sustain: 0.7, release: 1.8, loopStart: sampleToSec(52465), loopEnd: sampleToSec(58470) },
  "Re": { attack: 0.1, decay: 0.1, sustain: 0.7, release: 1.8, loopStart: sampleToSec(14080), loopEnd: sampleToSec(37120) },
  "Ga": { attack: 0.1, decay: 0.1, sustain: 0.7, release: 1.8, loopStart: sampleToSec(47936), loopEnd: sampleToSec(55986) },
  "Ma": { attack: 0.1, decay: 0.1, sustain: 0.7, release: 1.8, loopStart: sampleToSec(39296), loopEnd: sampleToSec(52319) },
  "Pa": { attack: 0.1, decay: 0.1, sustain: 0.7, release: 1.8, loopStart: sampleToSec(25600), loopEnd: sampleToSec(42363) },
  "Da": { attack: 0.1, decay: 0.1, sustain: 0.7, release: 1.8, loopStart: sampleToSec(16000), loopEnd: sampleToSec(28833) },
  "Ne": { attack: 0.1, decay: 0.1, sustain: 0.7, release: 1.8, loopStart: sampleToSec(28455), loopEnd: sampleToSec(47329) },
  };
// INSTRUMENT LOADING
const instruments = {};
const stopFunctions = {};
let samplesLoaded = false;
async function loadInstruments() {
    if (samplesLoaded) return;
    await initAudioEngine();
    await loadReverb();
    for (const [note, base64] of Object.entries(samples)) {
        const buffer = await loadSample(base64);
        instruments[note] = new StringSampler(
            ac,
            buffer,
            masterGain,
            noteMap[note] || {}
        );
    }
    samplesLoaded = true;
}
// STEP SEQUENCER (sample-accurate)
let tempo = 10; // BPM
let steps = 16;
let currentStep = 0;
let isPlaying = false;
let intervalId = null;
// Scheduler variables
let nextNoteTime = 0;
let scheduleAheadTime = 0.5;
let lookahead = 25;
// Schedule a single step
/*
function playStep(step) {
    const secondsPerBeat = 60 / tempo;
    const stepDuration = secondsPerBeat / 4;
    Object.entries(pattern).forEach(([note, stepsArray]) => {
        if (!stepsArray.includes(step)) return;
        instruments[note].play(
            nextNoteTime,
            stepDuration * 0.95
        );
    });
}
*/

function playStep(step) {
    const secondsPerBeat = 60 / tempo;
    const stepDuration = secondsPerBeat / 4;

    // Apply global volumes if your master/reverb audio nodes exist
    if (pattern.masterGain !== undefined) {
        masterGain.gain.value = pattern.masterGain;
    }
    if (pattern.reverbLevel !== undefined) {
        reverbGain.gain.value = pattern.reverbLevel;
    }

    Object.entries(pattern).forEach(([key, stepsArray]) => {
        // Skip metadata keys so they don't trigger instrument errors
        if (key === 'masterGain' ||
            key === 'reverbLevel') return;

        // Safety check to ensure we are dealing with a step array
        //if (!Array.includes(step)) return;
        if (!stepsArray.includes(step)) return;

        // Trigger the corresponding note instrument
        if (instruments[key]) {
            instruments[key].play(
                nextNoteTime,
                stepDuration * 0.95
            );
        }
    });
}


// Scheduler loop
function scheduler() {
  while (nextNoteTime < ac.currentTime + scheduleAheadTime) {
    playStep(currentStep);
    nextNote();
  }
}
// Advance to next step
function nextNote() {
  const secondsPerBeat = 60 / tempo;
  nextNoteTime += secondsPerBeat / 4;
  currentStep = (currentStep + 1) % steps;
}
async function ensureAudioReady() {
    if (!samplesLoaded) {
        await loadInstruments();
    }
    if (ac.state === "suspended") {
        await ac.resume();
    }
}
// Start / Stop Sequencer
async function startSequencer() {
    await ensureAudioReady();
    if (isPlaying) return;
    isPlaying = true;
    currentStep = 0;
    nextNoteTime = ac.currentTime;
    intervalId = setInterval(scheduler, lookahead);

}
function stopSequencer() {
  isPlaying = false;
  clearInterval(intervalId);
  currentStep = 0;
}
// KEYBOARD RENDER
function renderKeyboard() {
    const keyboard = document.getElementById("keyboard");
    keyboard.innerHTML = "";
    Object.keys(samples).forEach(note => {
        const key = document.createElement("div");
        key.className = "key";
        key.textContent = note;
        let stopFn = null;
        async function startNote(e) {
            e.preventDefault();
            await ensureAudioReady();
            stopFn = instruments[note].play();
            key.classList.add("active");
        }
        function stopNote(e) {
            if (e) e.preventDefault();
            if (stopFn) {
                stopFn();
                stopFn = null;
            }
            key.classList.remove("active");
        }
        key.addEventListener("pointerdown", startNote);
        key.addEventListener("pointerup", stopNote);
        key.addEventListener("pointercancel", stopNote);
        key.addEventListener("pointerleave", stopNote);
        keyboard.appendChild(key);
    });
}
renderKeyboard();
window.startSequencer = startSequencer;
window.stopSequencer = stopSequencer;
