const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");

const User = require("../models/user")


exports.createUser = (req, res, next) => {
    bcrypt.hash(req.body.password, 10).then(hash=>{
        const user = new User({
            email : req.body.email,
            password : hash
        })
        user.save()
        .then(result => {
            res.status(201).json({
                message : "user created ! ",
                result : result
            })
        }).
        catch(err => {
            res.status(500).json({
                message : "Invalid authentication credentials!" 
            })
        })
    })
}

exports.userLogin = (req, res, next) => {
    let fetchedUser;

    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return Promise.reject("User not found.");
            }
            fetchedUser = user;
            // If the user is found, proceed with password comparison and token generation.
            return bcrypt.compare(req.body.password, user.password);
        })
        .then(result => {
            if (!result) {
                return Promise.reject("Auth failed!");
            }
            const token = jwt.sign(
                { email: req.body.email, userId: fetchedUser._id },
                process.env.JWT_KEY,
                { expiresIn: "1h" }
            );
            res.status(200).json({
                token: token,
                expiresIn: 3600,
                userId: fetchedUser._id
            });
        })
        .catch(error => {
            res.status(401).json({
                message: error || "Invalid authentication credentials!"
            });
        });
}
