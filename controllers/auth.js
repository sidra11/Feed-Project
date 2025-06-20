const User = require("../model/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.Signup = (req, res, next) => {
  const errors = validationResult(req); // Correct usage of `validationResult`
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  bcrypt
    .hash(password, 12)
    .then((hashPw) => {
      const user = new User({
        email: email,
        password: hashPw,
        name: name,
      });
      return user.save();
    })
    .then((result) => {
      res
        .status(201) // Corrected to `status` instead of `statusCode`
        .json({ message: "User created!", userId: result._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error("User not found");
        error.statusCode = 402;
        throw error;
      }
      loadedUser = user;
     return  bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const errors = new Error("password is not correct");
        errors.statusCode = 401;
        throw errors;
      }
      const token = jwt.sign(
        { email: loadedUser.email, userId: loadedUser._id.toString() },
        "somesupersecret",
        { expiresIn: "1h" }
      );
      res.status(200).json({token: token, userId:loadedUser._id.toString()})
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
