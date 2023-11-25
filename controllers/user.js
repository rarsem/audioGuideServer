const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");

const User = require("../models/user")

exports.createUser = async (req, res, next) => {
    try {
        console.log(req.body)
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            email: req.body.email,
            password: hashedPassword
        });

        const result = await user.save();

        res.status(201).json({
            message: "User created!",
            result: result
        });
    } catch (error) {
        res.status(500).json({
            message: "Invalid authentication credentials!"
        });
    }
};

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
