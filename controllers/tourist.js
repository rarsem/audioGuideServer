const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Tourist = require("../models/tourist");

exports.createTourist = (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const tourist = new Tourist({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hash,
    });
    tourist
      .save()
      .then((result) => {
        res.status(201).json({
          message: "Tourist created with success!",
          result: result,
        });
      })
      .catch((err) => {
        // Handle specific errors (e.g., validation errors) and send meaningful responses
        if (err.name === "ValidationError") {
          return res.status(400).json({
            message: "Validation failed",
            errors: err.errors,
          });
        }
        res.status(500).json({
          message: "Server error",
        });
      });
  });
};

exports.touristLogin = (req, res, next) => {
  let fetchedTourist;
  Tourist.findOne({ email: req.body.email })
    .then((tourist) => {
      if (!tourist) {
        return res.status(401).json({
          message: "Authentication failed!",
        });
      }
      fetchedTourist = tourist;
      // Compare password by bcrypt
      return bcrypt.compare(req.body.password, tourist.password);
    })
    .then((result) => {
      if (!result) {
        return res.status(401).json({
          message: "Authentication failed!",
        });
      }

      const token = jwt.sign(
        { email: fetchedTourist.email, userId: fetchedTourist._id },
        process.env.JWT_KEY,
        //{ expiresIn: "1h" }
      );

      res.status(200).json({
        token : token,
        //expiresIn: 3600,
        //userId: fetchedTourist._id,
        tourist : {
          id :fetchedTourist._id,
          firstName : fetchedTourist.firstName,
          lastName : fetchedTourist.lastName,
          email : fetchedTourist.email 
        }
      });
    })
    .catch((err) => {
      res.status(401).json({
        message: "Invalid authentication credentials!",
      });
    });
};


exports.isEmailUsed = async (req, res) => {
  const { email } = req.body;

  try {
    const existingTourist = await Tourist.findOne({ email: email });

    if (existingTourist) {
      // Email is already in use
      res.status(200).json({ used: true }); // Return { used: true } as JSON response
    } else {
      // Email is not in use
      res.status(200).json({ used: false }); // Return { used: false } as JSON response
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};