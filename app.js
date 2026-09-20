// app.js
import WebAudioSynth from './node_modules/@jogijas/webaudio-synth/index.js';

const startButton = document.getElementById('startBtn');
const stopButton = document.getElementById('stopBtn');

// 1. Start the sample-accurate playback loop
startButton.addEventListener('click', async () => {
    try {
        console.log("Loading instruments and initializing synth loop...");
        await WebAudioSynth.start();
    } catch (error) {
        console.error("Audio engine failed to initialize:", error);
    }
});

// 2. Stop playback loop cleanly
stopButton.addEventListener('click', () => {
    console.log("Stopping playback loop.");
    WebAudioSynth.stop();
});
