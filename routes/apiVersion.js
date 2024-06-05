const express = require("express");
const apiVersionController = require('../controllers/apiVersion')

const router = express.Router();

router.post('', apiVersionController.insertVersion)

router.get('', apiVersionController.getCurrentVersion)

module.exports = router;