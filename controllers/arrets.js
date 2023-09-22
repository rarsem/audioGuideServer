//const circuit = require('../models/circuit');
const ArretModel = require('../models/arret');

exports.createArret = async (req, res, next) => {
    try {
    
      const idCircuit = req.body.idCircuit
      const maxOrderArret = await ArretModel.findOne({ idCircuit }).sort({ order: -1 }).exec();
      const order = maxOrderArret ? maxOrderArret.order + 1 : 1; // Increment the order

      // Access the uploaded files using req.files
        const imageFile = req.files['image'][0];
        const audioFile = req.files['audio'][0];

        // Do something with the files, e.g., save their paths to a database
        const imagePath = imageFile.path.replace(/\\/g, '/');
        const audioPath = audioFile.path.replace(/\\/g, '/');

  
      //const imagePath = req.file.path.replace(/\\/g, '/'); // Replace backslashes with forward slashes for the imagePath
      const arret = new ArretModel({
        title: req.body.title,
        description: req.body.description,
        idCircuit: req.body.idCircuit,
        imagePath: imagePath,
        audioPath : audioPath,
        mapContent: {
          lat: req.body.mapContentLat,
          lng: req.body.mapContentLng
        },
        specificDestinations: req.body.specificDestinations,
        order: order // Assign the order value
      });
  
      const result = await arret.save();

        res.status(201).json({
        message: 'Arret created successfully',
        arret: result
        });
    } catch (error) {
        console.error('Error creating Arret:', error);
        res.status(500).json({ message: 'Creating Arret failed', error: error.message });
  } 
};

exports.getArrets = async (req, res, next) => {
    try {
        const pageSize = +req.query.pageSize || 10; // Default page size to 10 if not provided
        const currentPage = +req.query.pageIndex || 1; // Default current page to 1 if not provided
        const skip = (currentPage - 1) * pageSize;

        const [arrets, totalArrets] = await Promise.all([
            ArretModel.find().skip(skip).limit(pageSize),
            ArretModel.countDocuments()
        ]);

        const response = {
            items: arrets, // Renamed 'arrets' to 'items' to match the Angular code
            totalItems: totalArrets, // Renamed 'maxPosts' to 'totalItems' to match the Angular code
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching arrets:', error);
        res.status(500).json({
            message: 'Fetching arrets failed',
            error: error.message
        });
    }
};

exports.getArretsByCircuitId = async (req, res, next) => {
    try {
        const idCircuit = req.params.id; // Assuming you pass the idCircuit as a route parameter

        const pageSize = +req.query.pageSize || 10; // Default page size to 10 if not provided
        const currentPage = +req.query.pageIndex || 1; // Default current page to 1 if not provided
        const skip = (currentPage - 1) * pageSize;

        const [arrets, totalArrets] = await Promise.all([
            ArretModel.find({ idCircuit }).skip(skip).limit(pageSize),
            ArretModel.countDocuments({ idCircuit }) // Count documents for the specified circuit
        ]);

        // Check if arrets were found
        if (arrets.length === 0) {
            return res.status(404).json({ message: 'Arrets not found for the specified circuit' });
        }

        const response = {
            items: arrets,
            totalItems: totalArrets,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching arrets:', error);
        res.status(500).json({
            message: 'Fetching arrets failed',
            error: error.message
        });
    }
};

exports.getArretById = async (req, res, next) => {
    try {
        const arret = await ArretModel.findById({ 
            _id: req.params.id,
            idCircuit : req.params.idCircuit 
        });

        if (arret) {
            return res.status(200).json(arret);
        }

        return res.status(404).json({ message: 'Arret not found' });
    } catch (error) {
        return res.status(500).json({ 
            message: 'Fetching arret failed', 
            error: error.message 
        });
    }
};

exports.updateArret = async (req, res, next) => {
    try {
        const arretId = req.params.id;
        const updatedArretData = {
            title: req.body.title,
            description: req.body.description,
            mapContent: {
              lat: req.body.mapContentLat,
              lng: req.body.mapContentLng
            },
            specificDestinations: req.body.specificDestinations,
        };

        // Handle file updates (if needed)
        if (req.files && req.files['image'] && req.files['image'][0]) {
            // Access the uploaded image file using req.files
            const imageFile = req.files['image'][0];
            // Do something with the image file, e.g., save its path to a database
            updatedArretData.imagePath = imageFile.path.replace(/\\/g, '/');
        }

        if (req.files && req.files['audio'] && req.files['audio'][0]) {
            // Access the uploaded audio file using req.files
            const audioFile = req.files['audio'][0];
            // Do something with the audio file, e.g., save its path to a database
            updatedArretData.audioPath = audioFile.path.replace(/\\/g, '/');
        }


        // Update the circuit by ID
        const result = await ArretModel.findByIdAndUpdate(arretId, updatedArretData);

        if (!result) {
            // Circuit with the given ID was not found
            return res.status(404).json({ message: 'Circuit not found.' });
        }

        // Successful update
        res.status(200).json({
            message: 'Update Successful',
            arretId: result._id
        });
    } catch (error) {
        console.error('Error updating Arret:', error);
        res.status(500).json({ message: 'Updating Arret failed', error: error.message });
    }
};

exports.deleteArret = async (req, res, next) => {
    try {
        const result = await ArretModel.deleteOne({ _id: req.params.id });

        if (result.deletedCount > 0) {
            return res.status(200).json({ message: 'Circuit deleted' });
        }

        return res.status(404).json({ message: 'Circuit not found' });
    } catch (error) {
        return res.status(500).json({ message: 'Deleting Circuit failed', error: error.message });
    }
};