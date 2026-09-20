# webaudio-synth.

A lightweight, high-performance **Web Audio API Step Sequencer and Synthesizer** built with plain vanilla JavaScript. This project is configured to bundle into a completely **standalone, serverless distribution** that runs smoothly directly from local storage (`file://` protocol) without encountering CORS issues.

## 🚀 Features

- **Sample-Accurate Timing**: Built with a custom lookahead scheduler loop for flawless rhythm timing.
- **Dynamic ADSR Envelope**: Individually tuned Attack, Decay, Sustain, and Release parameters mapped across traditional Indian musical notes (`Sa, Re, Ga, Ma, Pa, Da, Ne`).
- **Custom Reverb Convolver**: Premium spatial room acoustics powered by an impulse response buffer.
- **Pure Serverless Portability**: Implements **Base64 string data URLs** for audio assets, completely bypassing browser Same-Origin Policy (CORS) blocks on local machines.
- **Cross-Browser Engine**: Native compatibility layers covering standard browser implementations alongside custom Safari lifecycle adjustments.

---

## 🛠️ Tech Stack & Tooling

- **Language**: Vanilla JavaScript (ES6+)
- **Audio Core**: HTML5 Web Audio API (`AudioContext`, `ConvolverNode`, `GainNode`)
- **Bundler**: [esbuild](https://esbuild.github.io/) (Used for high-speed module resolution and dependency inlining)

---

## 📦 Project Structure

```text
├── encode.js      # Main encoder for mp3 files to soundfont file
├── index.js       # Audio engine core, step sequencer scheduler, and UI controller
├── LICENSE        # MIT License file
├── list.txt       # List file for ordering seqencer notes.
├── package.json   # Local developer scripts and dependency configurations
├── pattern.json   # Paettern of sequence play
├── README.md      # README file for project.
├── reverb.js      # Base64 encoded impulse response audio for reverb
├── demo/ demo.html 
└── mp3/ mp3 files
    
```

---

## 💻 Local Setup & Compilation

### Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your machine to manage standard compiler tooling.

### 1. Installation

```bash
npm install @jogijas/webaudio-synth.
```

### 2. Compiling the Production Bundle
To resolve the import statements and generate a client-safe codebase optimized for local execution, run the following cmd only for first time after install:


```bash
cd node_modules/@jogijas/webaudio-synth
npm run build
 ```
 It will generate samples.js soundfonts from mp3 files
 and standalone bundle.js in demo folder.
 
### 3. Execution
Once compiled, you can interact with the sequencer in two different ways:

**Serverless**: Simply double-click your local

```text
node_modules/@jogijas/webaudio-synthdemo/demo.html
```
file to run the project over the `file://` protocol.Copy demo foler any where and use.

### Local Dev Server:
**Create index.html file and copy to it the following code:**

```text
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Webaudio Synth Test</title>
<style>
body { font-family:sans-serif; text-align:center; }

#keyboard {
        display: flex;
        gap: 5px;
        margin-top: 20px;
        align-items: center;
        justify-content: center;
    }
.key { padding: 20px; border: 1px solid #000;
    cursor: pointer; user-select: none;height: 160px; }
.key.active { background-color: #ddd; }
</style>
</head>
<body>
    <h1>Testing webaudio-synth</h1>
    <button id="startBtn">Start Sequencer Engine</button>
    <button id="stopBtn">Stop Sequencer Engine</button>
<!-- Required visual container hook for
   your script's renderKeyboard() -->
    <div id="keyboard"></div>
    <script type="module" src="main.js">
</script>
</body>
</html>

```
**Create main.js file and copy to it the following code:**

```javascript
import WebAudioSynth
from './node_modules/@jogijas/webaudio-synth/index.js';

document
.getElementById('startBtn')
.addEventListener('click', async () => {
console.log("Initializing and playing audio sequencer...");
await WebAudioSynth.start();
});

document.getElementById('stopBtn')
.addEventListener('click', () => {
console.log("Stopping audio sequencer...");
WebAudioSynth.stop();
});
```
Launch a lightweight service wrapper (e.g., `npx serve . -l 5000` or VS Code Live Server extension) to preview over `http://localhost:`.

---
### To generate server Serverless standalone edit your project package.json to include:
```text
"scripts": {
"build":"esbuild main.js --bundle --minify --outfile=bundle.js --format=iife"
    },
```

## ⚙️ Audio Architecture Details

### The String Sampler Engine
Individual node triggers process voice lifecycles inside the `StringSampler` construct. If a target reverb asset is fully resolved, audio flows via the spatial framework before reaching output destinations:

```text
[BufferSourceNode] ---> [GainNode (ADSR)] ---> [ConvolverNode] ---> [ReverbGainNode] ---> [MasterGainNode] ---> Speakers
                                       \                                           /
                                        -----------------> (Dry Fallback Method) --
```

---

## 📝 License
This project is licensed under the [MIT License](LICENSE).
