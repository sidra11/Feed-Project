const express = require("express");
const feedController = require("../controllers/feed");
const validatePost = require("../middlewares/validatePost"); 
const isAuth = require('../middlewares/isAuth');
const { valid } = require("joi");

const router = express.Router();

// GET /feed/posts
router.get("/posts",isAuth, feedController.getPosts);

// POST /feed/post
router.post("/post",isAuth, validatePost, feedController.createPost);
router.get("/post/:postId",isAuth,feedController.getPost);
router.put("/post/:postId", isAuth, validatePost,feedController.updatePost );
router.delete("/post/:postId",isAuth,feedController.deletePost )
module.exports = router;

