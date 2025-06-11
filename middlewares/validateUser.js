
const { body } = require('express-validator');
const User = require("../model/user");
const validateUser = [body('email').isEmail().withMessage("Please enter the valid email").custom((value, {req})=> {
    return User.findOne({email:value}).then(userDoc => {
        if(userDoc){
            return Promise.reject("E=Mail address already exists")
        }
    })

}).normalizeEmail(),
body('password').trim().isLength({ min: 5 }),
body('name').trim().not().isEmpty()]

module.exports = validateUser;