const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Tourist = require("../models/tourist");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const mongoose = require('mongoose');

const touristsMap = new Map(); // Define touristsMap to store tourists temporarily

// exports.createTourist = (req, res, next) => {
//   bcrypt.hash(req.body.password, 10).then((hash) => {
//     const tourist = new Tourist({
//       firstName: req.body.firstName,
//       lastName: req.body.lastName,
//       email: req.body.email,
//       password: hash,
//     });
//     tourist
//       .save()
//       .then((result) => {
//         res.status(201).json({
//           message: "Tourist created with success!",
//           result: result,
//         });
//       })
//       .catch((err) => {
//         // Handle specific errors (e.g., validation errors) and send meaningful responses
//         if (err.name === "ValidationError") {
//           return res.status(400).json({
//             message: "Validation failed",
//             errors: err.errors,
//           });
//         }
//         res.status(500).json({
//           message: "Server error",
//         });
//       });
//   });
// };

exports.createTourist = async (req, res, next) => {
  try {
    // Check if password is provided
    if (!req.body.password) {
      return res.status(400).json({ message: "Password is required." });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Generate a confirmation token
    const confirmationToken = crypto.randomInt(1000, 10000);

    // Create a Tourist instance with confirmed set to false
    const tourist = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPassword,
        confirmed: false,
        confirmationToken: confirmationToken,
    };

    // Store the tourist in memory
    touristsMap.set(confirmationToken, tourist);

    // Send confirmation email
    //const confirmationLink = `http://localhost:3000/api/tourist/confirm?token=${confirmationToken}`;
    let params = {
      email : req.body.email,
      code : confirmationToken,
      subject : 'Confirm new registration'
    }
    
    await sendConfirmationEmail( params );

    res.status(201).json({
        message: "Email de confirmation envoyé. Vous serez enregistré après confirmation de l'email.",
    });
} catch (err) {
    // Handle errors
    console.error("Error creating tourist:", err);
    res.status(500).json({
        message: "Server error",
    });
}
};

exports.confirmTourist = async (req, res, next) => {
  try {
      const { token } = req.query;
      
      // Ensure that the token is parsed as an integer
      const tokenId = parseInt(token);

      // Retrieve the tourist from the map using the parsed integer token
      const tourist = touristsMap.get(tokenId);

      // If tourist is not found, return an error response
      if (!tourist) {
          return res.status(201).json({
              confirmed : false,
              message : 'Code invalide, Vérifiez votre adresse e-mail'
          });
      }

      // Mark tourist as confirmed
      tourist.confirmed = true;

      // Optionally, you can delete the tourist from memory after confirmation
      touristsMap.delete(tokenId);

      // Save the confirmed tourist to the database
      const savedTourist = await saveTouristToDatabase(tourist);

      // Respond to the client with a success message
      return res.status(201).json({
          confirmed : true,
          message: 'Email confirmé avec succès. Vous pouvez vous connecter avec succès',
          //savedTourist: savedTourist // Optionally, include the saved tourist in the response
      });
  } catch (err) {
      // Log and send error message to client
      console.error("Error confirming tourist:", err);
      res.status(500).json({
          error: 'Internal server error.'
      });
  }
}

// Function to save tourist to the database
async function saveTouristToDatabase(tourist) {
  try {
      // Create a new Tourist instance using the tourist object
      const newTourist = new Tourist({
          firstName: tourist.firstName,
          lastName: tourist.lastName,
          email: tourist.email,
          password: tourist.password,
          confirmed: true, // Mark tourist as confirmed
      });

      // Save the tourist to the database
      const savedTourist = await newTourist.save();

      return savedTourist;
  } catch (error) {
      console.error('Error saving tourist to database:', error);
      throw error;
  }
}

// Email sending function

async function sendConfirmationEmail( params ) {
  try {
      // Create a Nodemailer transporter
      const transporter = nodemailer.createTransport({
          service: 'gmail',
          host: "smtp.gmail.com", // SMTP server address (usually mail.your-domain.com)
          port: 465, // Port for SMTP (usually 465)
          secure: true, // Usually true if connecting to port 465
          auth: {
            user: "m.mesrar.m@gmail.com", // Your email address
            pass: "fotx ggzl wcsy cjib", // Password (for gmail, your app password)
            // ⚠️ For better security, use environment variables set on the server for these values when deploying
          },
      });

      //   const transporter = nodemailer.createTransport({
      //     //service: 'gmail',
      //     service: 'ionos',
      //     host: "smtp.ionos.fr", // SMTP server address (usually mail.your-domain.com)
      //     port: 587, // Port for SMTP (usually 465)
      //     secure: false, // Usually true if connecting to port 465
      //     auth: {
      //       user: "noreply@mcovery.com", // Your email address
      //       pass: "@Zerty11.ma", // Password (for gmail, your app password)
      //       // ⚠️ For better security, use environment variables set on the server for these values when deploying
      //     },
      // });

      // Email content
      const mailOptions = {
          from: 'm.mesrar.m@gmail.com',
          to: params.email,
          subject: params.subject,
          html: `<p>Your confirmation code is: ${params.code}</p>`
      };

      // Send email
      //const info = await transporter.sendMail(mailOptions);

      // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error('Error occurred:', error.message);
          return;
      }
    });
      //console.log('Email sent:', info.messageId);
  } catch (error) {
      console.error('Error sending email:', error);
      throw error;
  }
}

//------------------------------------Reset password -----------------------------------------
// 1. Request Password Reset
exports.resetPassword =  async (req, res) => {

  const { email } = req.body;

  try {
    // Find user by email
    const user = await Tourist.findOne({ email });

    if (!user) {
      return res.status(201).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetCode = crypto.randomInt(1000, 10000);
    user.resetCode = resetCode;
    user.resetCodeExpires = Date.now() + 3600000; // Token expires in 1 hour

    await user.save();

    // Send reset email
    let params = {
      email : user.email, 
      code  : user.resetCode,
      subject : 'Confirm Reset password',
    }
    await sendConfirmationEmail( params );

    res.status(200).json({ idTourist : user._id,
       message: 'Code de réinitialisation envoyé à votre adresse e-mail' });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 4. Update Password

exports.confirmResetPassword =  async (req, res) => {
  const { id, code } = req.body;
  //console.log(id, code)
  try {
    // Find user by reset token
    const user = await Tourist.findOne({ 
      _id: new mongoose.Types.ObjectId(id),
      resetCode: parseInt(code), 
      resetCodeExpires: { $gt: new Date() } 
    });

    if (!user) {
      return res.status(201).json({ 
        confirmed : false,
        message: 'Code invalide ou expiré' });
    }else{
      return res.status(200).json({
        id : user.id, 
        confirmed : true,
        code : user.resetCode,
        message: 'Autorisation mise à jour avec succès, vous pouvez changer votre mot de passe' });
    }
    // // Update password and clear reset token
    // user.password = await bcrypt.hash(password, 10);
    // user.resetToken = undefined;
    // user.resetTokenExpires = undefined;

    //await user.save();
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.saveNewPassword =  async (req, res) => {
  const { id , password } = req.body;
  //console.log(id, code)
  try {
    // Find user by reset token
    const user = await Tourist.findOne({ _id: new mongoose.Types.ObjectId(id)});

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Update password and clear reset token
    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;

    await user.save();

    return res.status(200).json({
      message: 'Mot de passe mis à jour avec succès"' }
    );

  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//-------------------------------------------------------------------------------

exports.updateTourist = async (req, res) => {
  const { id } = req.params;
  //console.log(id);
  const updatedTourist = req.body;
  //console.log(updatedTourist)
  // Extract only the allowed fields (name and firstName)
  const { lastName , firstName } = updatedTourist;
  const allowedUpdates = { lastName, firstName };

  try {
    // Update circuit in MongoDB using findOneAndUpdate
    const result = await Tourist.findOneAndUpdate(
      { _id: id }, // assuming id is a string
      { $set: allowedUpdates },
      { new: true } // Return the updated document
    );

    res.json(result);

  } catch (error) {
    console.error('Error updating tourist in MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
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
            // { 
            //   expiresIn: '30s' 
            // } // Token expiration time
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