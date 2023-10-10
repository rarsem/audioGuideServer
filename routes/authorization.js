const express = require("express");
const AuthController = require('../controllers/authorization')

const router = express.Router();

router.post('',AuthController.garantAuthorization)


router.get('',AuthController.getUnauthorizedTourist);

router.put('/:id',AuthController.changeAuthorization);

router.get('/check-authorization/:touristId/:circuitId',AuthController.checkAutorisation);



module.exports = router;