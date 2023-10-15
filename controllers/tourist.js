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
  const { email, password } = req.body;

  // Step 1: Find the tourist by email and select the password field
  Tourist.findOne({ email }).select('+password').exec()
    .then((tourist) => {
      if (!tourist) {
        return res.status(401).json({
          message: 'Authentication failed! Tourist not found.',
        });
      }

      // Step 2: Compare the provided password with the hashed password
      bcrypt.compare(password, tourist.password, (err, result) => {
        if (err) {
          return res.status(500).json({
            error: err,
          });
        }
        if (result) {
          // Step 3: If passwords match, create a JWT token
          const token = jwt.sign(
            {
              email: tourist.email,
              userId: tourist._id,
            },
            process.env.JWT_KEY, // Your secret key
            { expiresIn: '1h' } // Token expiration time
          );

          res.status(200).json({
            message: 'Authentication successful',
            token,
            tourist: {
              id: tourist._id,
              firstName: tourist.firstName,
              lastName: tourist.lastName,
              email: tourist.email,
            },
          });
        } else {
          res.status(401).json({
            message: 'Authentication failed! Invalid password.',
          });
        }
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
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