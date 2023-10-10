const Authorization = require('../models/authorization'); // Import your models

// const Circuit = require('../models/Circuit');
// const Tourist = require('../models/Tourist');

exports.garantAuthorization = async (req,res,next)=>{
   
    const { touristId, circuitId } = req.body;

  try {
    const authorization = await Authorization.findOneAndUpdate(
      { tourist: touristId, circuit: circuitId },
      { authorized: true },
      { new: true }
    );

    if (!authorization) {
      // If there was no existing authorization record, create one
      const newAuthorization = new Authorization({
        tourist: touristId,
        circuit: circuitId,
        authorized: false,
      });
      await newAuthorization.save();
    }

    res.json({ success: true, message: 'Authorization granted successfully.' });
  } catch (error) {
    console.error('Error granting authorization:', error);
    res.status(500).json({ success: false, message: 'Authorization failed.' });
  }
   
}


// // Check authorization for a tourist and a circuit
exports.checkAutorisation =  async (req, res) => {
    const { touristId, circuitId } = req.params;
  
    try {
      const authorization = await Authorization.findOne({
        tourist: touristId,
        circuit: circuitId,
      });
  
      if (authorization) {
        if (authorization.authorized) {
          // The tourist is authorized for the circuit
          res.json({ authorized: true, found: true });
        } else {
          // The tourist is not authorized for the circuit
          res.json({ authorized: false, found: true });
        }
      } else {
        // The record was not found
        res.json({ authorized: false, found: false });
      }
    } catch (error) {
      console.error('Error checking authorization:', error);
      res.status(500).json({ authorized: false, error: 'Authorization check failed.' });
    }
  };


exports.getUnauthorizedTourist = async (req, res, next) => {
  try {
      const pageSize = +req.query.pageSize || 10; // Default page size to 10 if not provided
      const currentPage = +req.query.pageIndex || 1; // Default current page to 1 if not provided
      const skip = (currentPage - 1) * pageSize;

      const [arrets, totalArrets] = await Promise.all([
           // Fetch the list of Authorization records where authorized is false
     Authorization.find()
    .populate('circuit') 
    .populate({
      path: 'tourist',
      select: '-password' // Exclude the password field from the tourist data
      }) ,
  Authorization.countDocuments()
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

exports.changeAuthorization =  async (req, res) => {
  try {
    const authorizationId = req.params.id;

    console.log(authorizationId)

    // Find the Authorization record by ID
    const authorization = await Authorization.findById(authorizationId);

    if (!authorization) {
      return res.status(404).json({ message: 'Authorization record not found' });
    }

    // Toggle the authorized field value
    authorization.authorized = !authorization.authorized;

    // Save the updated record
    const updatedAuthorization = await authorization.save();

    res.status(200).json({ message: 'Authorization record updated successfully', authorization: updatedAuthorization });
  } catch (error) {
    console.error('Error toggling authorization:', error);
    res.status(500).json({ message: 'Toggling authorization failed', error: error.message });
  }
};