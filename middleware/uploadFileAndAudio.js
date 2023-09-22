const multer = require('multer');
const path = require('path');

// Define storage destinations for image and audio uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // // Determine the destination based on file type (image or audio)
    // if (file.fieldname === 'image') {
    //   cb(null, 'uploads/arret/images'); // Store image files in 'uploads/arret/images'
    // } else if (file.fieldname === 'audio') {
    //   cb(null, 'uploads/arret/audios'); // Store audio files in 'uploads/arret/audios'
    // } else {
    //   cb(new Error('Invalid fieldname'), false);
    // }
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + file.originalname);
  },

  destination: (req, file, cb) => {
    cb(null, 'uploads/images'); // Set the destination folder for uploaded images
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, uniqueSuffix + fileExtension); // Generate a unique filename
  },
});

// Define file filters for image and audio uploads
const fileFilter = (req, file, cb) => {
  // Check file type and allowed formats for both image and audio
  if (
    (file.fieldname === 'image' && /\.(jpg|jpeg|png)$/.test(file.originalname.toLowerCase())) ||
    (file.fieldname === 'audio' && /\.(mp3|wav)$/.test(file.originalname.toLowerCase()))
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

// Create a combined multer instance for both image and audio uploads
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = upload;