# @jogijas/webaudio-synth

A lightweight, high-performance **Web Audio API Step Sequencer and Synthesizer** built with plain vanilla JavaScript. This project is configured as a pure ES Module distribution that can easily be compiled into a completely **standalone, serverless web app** running directly from local storage (`file://` protocol) without encountering CORS issues.

## 🚀 Features

- **Sample-Accurate Timing**: Built with a custom lookahead scheduler loop for flawless rhythm timing.
- **Dynamic ADSR Envelope**: Individually tuned Attack, Decay, Sustain, and Release parameters mapped across traditional Indian musical notes (`Sa, Re, Ga, Ma, Pa, Da, Ne`).
- **Custom Reverb Convolver**: Premium spatial room acoustics powered by an impulse response buffer.
- **Pure Serverless Portability**: Implements **Base64 string data URLs** for audio assets, completely bypassing browser Same-Origin Policy (CORS) blocks on local machines.
- **Cross-Browser Engine**: Native compatibility layers covering standard browser implementations alongside custom Safari lifecycle adjustments.

---

## 🛠️ Tech Stack & Tooling

- **Language**: Vanilla JavaScript (ES6+ ES Modules)
- **Audio Core**: HTML5 Web Audio API (`AudioContext`, `ConvolverNode`, `GainNode`)
- **Optional Bundler**: [esbuild](https://github.io) (Can be used by consumers for high-speed module resolution and asset inlining)

---

## 📦 Project Structure

```text
├── encode.cjs     # Main encoder utility converting mp3 files to base64 soundfont structures.
├── index.js       # Audio engine core, step sequencer scheduler, and UI controller (Default Export).
├── LICENSE        # MIT License file.
├── list.txt       # List file for ordering sequencer notes.
├── package.json   # Local registry scripts and dependency configurations.
├── pattern.json   # Base configuration pattern for sequence play.
├── README.md      # Project documentation layout.
├── reverb.js      # Base64 encoded impulse response audio for premium convolution spatial acoustics.
├── samples.js     # Generated asset file containing Base64 encoded audio strings.
└── mp3/           # Folder containing the source raw .mp3 audio clips.
```

---

## 💻 Local Setup & Execution

### Prerequisites
Ensure you have [Node.js](https://nodejs.org) installed on your machine to manage standard compiler tooling.

### 1. Installation

```bash
npm install @jogijas/webaudio-synth
```

### 2. Compiling the Audio Assets
To compile your own audio clips for this engine, place your customized `.mp3` files inside the `mp3/` directory, update the `list.txt` file layout to match, and execute the internal encoder script:

```bash
cd node_modules/@jogijas/webaudio-synth
npm run encode
```
This utility automatically reads your sound files and generates the modern embedded `samples.js` file mapping layer.

### 3. Local Execution Example

To test the package locally on your web application layout, establish these two root file configurations inside your workspace:

#### Create an `index.html` file:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Webaudio Synth Test</title>
    <style>
        body { font-family: sans-serif; text-align: center; }
        #keyboard {
            display: flex;
            gap: 5px;
            margin-top: 20px;
            align-items: center;
            justify-content: center;
        }
        .key { 
            padding: 20px; border: 1px solid #000;
            cursor: pointer; user-select: none; height: 160px; 
        }
        .key.active { background-color: #ddd; }
    </style>
</head>
<body>
    <h1>Testing webaudio-synth</h1>
    <button id="startBtn">Start Sequencer Engine</button>
    <button id="stopBtn">Stop Sequencer Engine</button>

    <!-- Required visual container hook for the script's renderKeyboard() engine -->
    <div id="keyboard"></div>
    
    <!-- Required hidden input hook for master audio gain routing control mapping -->
    <input type="range" id="masterGain" min="0" max="5" step="0.1" value="4" style="display:none;">

    <!-- Main Module Application Router Entry Point -->
    <script type="module" src="main.js"></script>
</body>
</html>
```

#### Create a `main.js` file:
```javascript
import WebAudioSynth from './node_modules/@jogijas/webaudio-synth/index.js';

document.getElementById('startBtn').addEventListener('click', async () => {
    console.log("Initializing and playing audio sequencer...");
    await WebAudioSynth.start();
});

document.getElementById('stopBtn').addEventListener('click', () => {
    console.log("Stopping audio sequencer...");
    WebAudioSynth.stop();
});
```

Launch a lightweight development service wrapper (e.g., run `npx serve .` or click the VS Code Live Server extension hook) to securely preview the application over your local address network.

---

## 🛠️ Optional: Generating a Serverless Standalone App

If you want to package this entire framework down into a single standalone application code file that can run locally using the `file://` protocol without a server, add `esbuild` to your application workspace:

```bash
npm install esbuild
```

Add this build task configuration property directly inside your root `package.json` file:

```json
"scripts": {
    "build": "esbuild main.js --bundle --minify --outfile=bundle.js --format=iife"
}
```

Execute the bundling pipeline layout command:
```bash
npm run build
```
You can now update your `index.html` file to replace `<script type="module" src="main.js"></script>` with a standard scripts declaration `<script src="bundle.js"></script>` to open it directly off your computer without any CORS security constraints!

---

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
