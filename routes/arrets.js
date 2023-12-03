const express = require("express");
const ArretsController = require('../controllers/arrets')

//const upload = require('../middleware/uploadImage'); 
const upload = require('../middleware/uploadFileAndAudio'); // Import the multer configurations


// Import the multer configuration

//const checkAuth = require('../middleware/check-auth')
//const extractFile = require('../middleware/file')
const router = express.Router();

//multer for add image tt
//checkAuth add middleware to protect the root 
//chackAuth will run every time and can add req to it 
//router.post('', checkAuth , extractFile, PostsController.createPost)

router.post('', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]) , ArretsController.createArret)


//update methode

// //router.put('/:id',checkAuth, extractFile, PostsController.updatePost)
router.put('/:id',upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), ArretsController.updateArret)


// // get arret by id
router.get('/:idCircuit/:id' , ArretsController.getArretById);

//get arrets by circui id
router.get('/:id', ArretsController.getArretsByCircuitId)

//all arrets
router.get('', ArretsController.getArrets)

// //router.delete('/:id',checkAuth , PostsController.deletePost)
router.delete('/:id', ArretsController.deleteArret)
//test push
module.exports = router;