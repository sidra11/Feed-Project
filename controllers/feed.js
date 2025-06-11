const Post = require("../model/post");
const fs = require("fs");
const path = require("path");
const User = require('../model/user');


const validateRest = require("express-validator");
exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems
  Post.find()
    .countDocuments()
    .then((count) => {
     totalItems = count;
      return Post.find().populate('creator')
      .skip((currentPage-1)*perPage)
      .limit(perPage);
    })
    .then((posts) => {
      res.status(200).json({
        message: "Fetched posts successfully.",
        posts: posts,
        totalItems:totalItems
      });
    }).catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
    console.log("jj", totalItems);
};

exports.createPost = (req, res, next) => {
  // const errors = validateRest(req);
  // if (!errors.isEmpty()) {
  //     const error = new Error(
  //         'Validation failed, entered data is incorrect.'
  //     );
  //     error.statusCode = 422;
  //     throw error;
  // }
  if (!req.file) {
      const error = new Error('No image provided.');
      error.statusCode = 422;
      throw error;
  }
  /** REPLACE ALL '\' WITH '/' */
  const imageUrl = req.file.path.replace("\\", '/');
  const title = req.body.title;
  const content = req.body.content;
  let creator;
  const post = new Post({
      title: title,
      content: content,
      imageUrl: imageUrl,
      creator: req.userId,
  });
  post.save()
      .then(() => {
          return User.findById(req.userId);
      })
      .then((user) => {
          creator = user;
          user.posts.push(post);
          return user.save();
      })
      .then((result) => {
          res.status(201).json({
              message: 'Post created successfully!',
              post: post,
              creator: {
                  _id: creator._id,
                  name: creator.name,
              },
          });
      })
      .catch((err) => {
          if (!err.statusCode) {
              err.statusCode = 500;
          }
          next(err);
      });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId).populate('creator')
      .then((post) => {
          if (!post) {
              const error = new Error('Could not find post.');
              error.statusCode = 404;
              throw error;
          }
          res.status(200).json({
              message: 'Post fetched.',
              post: post,
          });
      })
      .catch((err) => {
          if (!err.statusCode) {
              err.statusCode = 500;
          }
          next(err);
      });
};

// exports.getPost = (req, res, next) => {
//   const postId = req.params.postId;
//   Post.findById(postId).populate('creator')
//     .then((post) => {
//       if (!post) {
//         const error = new Error("could not find post");
//         error.statusCode = 404;
//         throw error;
//       }
//       res.status(200).json({ message: "Post get successfully!", post: post });
//     })
//     .catch((err) => {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//       }
//       next(err);
//     });
// };

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const { title, content } = req.body;
  let imageUrl = req.body.image;

  if (req.file) {
    imageUrl = req.file.path.replace(/\\/g, "/");
  }

  if (!title || !content || !imageUrl) {
    return res.status(422).json({ message: "Missing required fields." });
  }

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }

      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not authorized.");
        error.statusCode = 403;
        throw error;
      }

      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }

      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;

      return post.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Post updated.", post: result });
    })
    .catch((err) => {
      console.error("Error updating post:", err);
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }
      // Check logged in user
      clearImage(post.imageUrl);
      /** .findByIdAndRemove -- REMOVED */
      return Post.findByIdAndDelete(postId);
    })
    .then((result) => {
      console.log(result);
      res.status(200).json({ message: "Deleted post." });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
