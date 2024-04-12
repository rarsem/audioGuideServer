const express = require("express");

const TouristController = require('../controllers/tourist')

const router = express.Router();

router.post("/create", TouristController.createTourist)

router.put("/update/:id", TouristController.updateTourist)

router.post("/login", TouristController.touristLogin )

router.get("/confirm", TouristController.confirmTourist )

router.post("/check-email", TouristController.isEmailUsed )

router.post('/reset-password', TouristController.resetPassword)

router.post('/confirm-reset-password', TouristController.confirmResetPassword);

router.post('/update-password', TouristController.saveNewPassword);

///forgot-password

module.exports = router;