//const circuit = require('../models/circuit');
const CircuitModel = require('../models/circuit');
const ApkVersionModel = require('../models/apiVersion')
const fs = require('fs');

// Insert or Update APK Version
exports.insertVersion = async (req, res, next) => {
    const { version, description } = req.body;
  
    if (!version) {
      return res.status(400).json({ error: 'Version is required' });
    }
  
    try {
      // Remove existing versions
      await ApkVersionModel.deleteMany();
  
      // Insert new version
      const newVersion = await ApkVersionModel.create({ version, description });
  
      res.json({ message: 'Version inserted successfully', newVersion });
    } catch (err) {
        next(err);
    }
};
  
// Get the Current APK Version
exports.getCurrentVersion = async (req, res, next) => {
    try {
      const currentVersion = await ApkVersionModel.findOne();
      
      if (!currentVersion) {
        return res.status(404).json({ error: 'No version found' });
      }
      
      res.json(currentVersion);
    } catch (err) {
      next(err);
    }
};