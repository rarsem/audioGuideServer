const express = require("express");

const TouristController = require('../controllers/tourist')

const router = express.Router();

router.post("/create", TouristController.createTourist)

router.put("/update/:id", TouristController.updateTourist)

router.post("/login", TouristController.touristLogin )

router.post("/check-email", TouristController.isEmailUsed )


module.exports = router;