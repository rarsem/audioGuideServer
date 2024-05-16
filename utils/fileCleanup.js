const fs = require('fs');
const path = require('path');
const Circuit = require('../models/circuit');
const Arret = require('../models/arret');

const getFilesFromDirectory = (dirPath) => {
    return fs.readdirSync(dirPath).map(file => path.join(dirPath, file));
};

const normalizePath = (filePath) => {
    return filePath.replace(/\\/g, '/'); // Normalize backslashes to forward slashes
};

const getAllCircuitFilePaths = async () => {
    const circuits = await Circuit.find({}, 'imagePath audioPath').exec();
    const arrets = await Arret.find({}, 'imagePath audioPath').exec(); // Assuming Arret is your model for "arret" documents

    // Combine the paths from both types of documents
    const circuitFilePaths = circuits.flatMap(circuit => [circuit.imagePath, circuit.audioPath].filter(Boolean).map(normalizePath));
    const arretFilePaths = arrets.flatMap(arret => [arret.imagePath, arret.audioPath].filter(Boolean).map(normalizePath));

    // Concatenate the arrays
    const allFilePaths = circuitFilePaths.concat(arretFilePaths);

    return allFilePaths;
};

const removeUnreferencedCircuitFiles = async () => {
    try {
        const allFiles = getFilesFromDirectory('uploads/images');
        console.log( allFiles )
        const filePaths = await getAllCircuitFilePaths();

        console.log( filePaths )
        const filesToDelete = allFiles.filter(file => {
            const normalizedFile = normalizePath(file);
            return !filePaths.includes(normalizedFile);
        });

        filesToDelete.forEach(file => {
            fs.unlink(file, (err) => {
                if (err) {
                    console.error(`Error deleting file ${file}:`, err);
                } else {
                    console.log(`Deleted unreferenced file: ${file}`);
                }
            });
        });
    } catch (err) {
        console.error('Error during file cleanup:', err);
    }
};

module.exports = {
    removeUnreferencedCircuitFiles
};