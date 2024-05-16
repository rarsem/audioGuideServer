const express = require('express');
const { removeUnreferencedCircuitFiles } = require('../utils/fileCleanup');

const router = express.Router();

// Define a route to trigger the file cleanup
router.get('/cleanup-files', async (req, res) => {
    try {
        // Call the function to remove unreferenced files
        await removeUnreferencedCircuitFiles();
        
        res.send('File cleanup completed');
    } catch (err) {
        res.status(500).send('Error during file cleanup: ' + err.message);
    }
});

module.exports = router;