// usage: node encode.js ./audio_files ./order.txt ./samples.js

const fs = require('fs');
const path = require('path');

// Extract command line arguments
const inputDir = process.argv[2];
const orderFile = process.argv[3]; // Path to a text file containing the ordered list
const outputFile = process.argv[4];

if (!inputDir || !orderFile || !outputFile) {
    console.error('Error: Please provide input directory, order file, and output file paths.');
    console.error('Usage: node script.js <input_dir> <order_file> <output_file>');
    process.exit(1);
}

try {
    // 1. Read and parse the given order file (one file name per line)
    if (!fs.existsSync(orderFile)) {
        throw new Error(`Order file "${orderFile}" does not exist.`);
    }

    const orderedFileNames = fs.readFileSync(orderFile, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0); // Remove empty lines

    let jsContent = 'const samples = {\n';
    let processedCount = 0;

    // 2. Loop through the exact order given
    orderedFileNames.forEach(file => {
        // Automatically append .mp3 if the user forgot it in the order list
        const fileName = path.extname(file).toLowerCase() === '.mp3' ? file : `${file}.mp3`;
        const fullPath = path.join(inputDir, fileName);

        // Check if the file actually exists in the directory
        if (fs.existsSync(fullPath)) {
            const data = fs.readFileSync(fullPath);
            const base64 = data.toString('base64');
            const key = path.basename(fileName, '.mp3');

            jsContent += `  "${key}": "data:audio/mp3;base64,${base64}",\n`;
            processedCount++;
        } else {
            console.warn(`Warning: File "${fileName}" listed in order file was not found in "${inputDir}". Skipping.`);
        }
    });

    jsContent += '};\nexport default samples;\n';

    // Write the output file
    fs.writeFileSync(outputFile, jsContent);
    console.log(`Successfully compiled ${processedCount} samples in the given order into "${outputFile}" ✅`);

} catch (error) {
    console.error('An error occurred:', error.message);
    process.exit(1);
}
