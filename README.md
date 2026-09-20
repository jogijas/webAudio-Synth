# webAudio-Synth

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
├── index.html     # Main UI markup with integrated asset styling hooks
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
npm install @jogijas/webAudio-Synth
```

### 2. Compiling the Production Bundle
To resolve the import statements and generate a client-safe codebase optimized for local execution, use the following compilation string:

```bash
npm run build
 ```

### 3. Execution
Once compiled, you can interact with the sequencer in two different ways:

**Serverless**: Simply double-click your local `demo/demo.html` file to run the project over the `file://` protocol.

**Local Dev Server**: Launch a lightweight service wrapper (e.g., `npx serve . -l 5000` or VS Code Live Server extension) to preview over `http://localhost`.

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
