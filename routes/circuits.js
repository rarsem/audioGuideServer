const express = require("express");
const CircuitsController = require('../controllers/circuits')

//const upload = require('../middleware/uploadImage'); 

const upload = require('../middleware/uploadFileAndAudio');

// Import the multer configuration

//const checkAuth = require('../middleware/check-auth')
//const extractFile = require('../middleware/file')
const router = express.Router();

//multer for add image 
//checkAuth add middleware to protect the root 
//chackAuth will run every time and can add req to it 
//router.post('', checkAuth , extractFile, PostsController.createPost)

router.post('',upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), CircuitsController.createCircuit)

//all posts
router.get('', CircuitsController.getCircuits)


router.get('/getCircuitsWithArrets', CircuitsController.getCircuitsWithArrets)

// get post by id
router.get('/:id' , CircuitsController.getCircuitById)

//update methode

//router.put('/:id',checkAuth, extractFile, PostsController.updatePost)
router.put('/:id',upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), CircuitsController.updateCircuit)

//router.delete('/:id',checkAuth , PostsController.deletePost)
router.delete('/:id', CircuitsController.deleteCircuit)

module.exports = router;