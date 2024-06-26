//const circuit = require('../models/circuit');
const CircuitModel = require('../models/circuit');
const ArretModel = require('../models/arret')
const fs = require('fs');

exports.createCircuit = (req,res,next)=>{
   
    if (!req.files) {
        // Handle cases where no image file is provided
        return res.status(400).json({ message: 'Image file is required.' });
    }
    
    // The rest of your circuit creation logic here

    // Access the uploaded files using req.files
    const imageFile = req.files['image'][0];
    const audioFile = req.files['audio'][0];

    // Do something with the files, e.g., save their paths to a database
    const imagePath = imageFile.path.replace(/\\/g, '/');
    const audioPath = audioFile.path.replace(/\\/g, '/');

    const Circuit = new CircuitModel({
        title : req.body.title,
        city : req.body.city,
        country: req.body.country,
        description: req.body.description,
        languages: req.body.languages.split(','),
        distance: 0,
        duration: '',
        imagePath: imagePath,
        audioPath : audioPath,
        mapContent: {
            lat : req.body.mapContentLat,
            lng : req.body.mapContentLng
        },
        showPolyline : req.body.showPolyline === 'true' ? true : false,
        showMap : req.body.showMap === 'true' ? true : false 
    });
    Circuit.save().then((result) => {
        res.status(201).json({
            message : 'Post added succefuly',
            circuit  :  {
                ...result, 
                id : result._id,
                //imagePath : url + '/images/' + req.file.filename
            }
        })
    }).catch(err => {
        return res.status(500).json({
            message : "Creating Post failed!" 
        })
    });
   
}

exports.getCircuitsWithArrets = async (req, res, next) => {
    try {
      // Step 1: Retrieve all circuits
      const circuits = await CircuitModel.find({});
  
      // Step 2: For each circuit, retrieve associated arrets
      const circuitsWithArrets = await Promise.all(
        circuits.map(async (circuit) => {
          const arrets = await ArretModel.find({ idCircuit: circuit._id });
          return { ...circuit.toObject(), arrets };
        })
      );
  
      res.json(circuitsWithArrets);
    } catch (error) {
      console.error('Error retrieving circuits with arrets:', error);
      res.status(500).json({
        message: 'Fetching circuits with arrets failed',
        error: error.message
      });
    }
};


exports.getCircuits = async (req, res, next) => {
    try {
        const pageSize = +req.query.pageSize || 10; // Default page size to 10 if not provided
        const currentPage = +req.query.pageIndex || 1; // Default current page to 1 if not provided
        const skip = (currentPage - 1) * pageSize;

        const [circuits, totalCircuits] = await Promise.all([
            CircuitModel.find().skip(skip).limit(pageSize),
            CircuitModel.countDocuments()
        ]);

        res.status(200).json({
            message: 'Circuits fetched successfully',
            circuits: circuits,
            //maxPosts: totalCircuits,
            totalItems: totalCircuits,
        });
    } catch (error) {
        console.error('Error fetching circuits:', error);
        res.status(500).json({
            message: 'Fetching circuits failed',
            error: error.message
        });
    }
};

exports.updateCircuit = async (req, res, next) => {
    try {

        const circuitId = req.params.id;
        const updatedCircuitData = {
            city: req.body.city,
            country: req.body.country,
            title: req.body.title,
            description: req.body.description,
            languages: req.body.languages,
            mapContent: req.body.mapContent,
            showPolyline: req.body.showPolyline === 'true' ? true : false,
            showMap : req.body.showMap === 'true' ? true : false 
        };

        // Handle file updates (if needed)
        if (req.files && req.files['image'] && req.files['image'][0]) {
            // Access the uploaded image file using req.files
            const imageFile = req.files['image'][0];
            // Do something with the image file, e.g., save its path to a database
            updatedCircuitData.imagePath = imageFile.path.replace(/\\/g, '/');
        }

        if (req.files && req.files['audio'] && req.files['audio'][0]) {
            // Access the uploaded audio file using req.files
            const audioFile = req.files['audio'][0];
            // Do something with the audio file, e.g., save its path to a database
            updatedCircuitData.audioPath = audioFile.path.replace(/\\/g, '/');
        }

        // Update the circuit by ID
        const result = await CircuitModel.findByIdAndUpdate(circuitId, updatedCircuitData);

        if (!result) {
            // Circuit with the given ID was not found
            return res.status(404).json({ message: 'Circuit not found.' });
        }

        // Successful update
        res.status(200).json({
            message: 'Update Successful',
            circuitId: result._id
        });
    } catch (error) {
        // Handle errors
        console.error('Error updating circuit:', error);
        res.status(500).json({ message: "Couldn't update circuit." });
    }
};

exports.getCircuitById = async (req, res, next) => {
    try {
        const circuit = await CircuitModel.findById(req.params.id);

        if (circuit) {
            return res.status(200).json(circuit);
        }

        return res.status(404).json({ message: 'Circuit not found' });
    } catch (error) {
        return res.status(500).json({ message: 'Fetching Circuit failed', error: error.message });
    }
};

// exports.deleteCircuit = async (req, res, next) => {
//     try {
//         const result = await CircuitModel.deleteOne({ _id: req.params.id });

//         if (result.deletedCount > 0) {
//             return res.status(200).json({ message: 'Circuit deleted' });
//         }

//         return res.status(404).json({ message: 'Circuit not found' });
//     } catch (error) {
//         return res.status(500).json({ message: 'Deleting Circuit failed', error: error.message });
//     }
// };

exports.deleteCircuit = async (req, res, next) => {
    try {
        // Find the Circuit document by ID
        const circuit = await CircuitModel.findOne({ _id: req.params.id });

        if (!circuit) {
            return res.status(404).json({ message: 'Circuit not found' });
        }

        // Delete the Circuit document from the database
        const result = await CircuitModel.deleteOne({ _id: req.params.id });

        if (result.deletedCount > 0) {
            // Delete associated files from the file system
            if (circuit.imagePath) {
                fs.unlinkSync(circuit.imagePath);
            }
            if (circuit.audioPath) {
                fs.unlinkSync(circuit.audioPath);
            }

            return res.status(200).json({ message: 'Circuit and associated files deleted' });
        }

        return res.status(404).json({ message: 'Circuit not found' });
    } catch (error) {
        return res.status(500).json({ message: 'Deleting Circuit failed', error: error.message });
    }
};