const express = require('express');
const authController = require("../controllers/auth")
const validateUser = require ("../middlewares/validateUser");
const router = express.Router();
router.put('/signup',validateUser,authController.Signup );
router.post('/login', authController.login);

module.exports = router;