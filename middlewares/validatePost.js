const Joi = require("joi");

const validatePost = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().trim().min(5).max(100).required()
      .messages({
        "string.empty": "Title is required.",
        "string.min": "Title must be at least 5 characters long.",
        "string.max": "Title must not exceed 100 characters."
      }),
    content: Joi.string().trim().min(5).required()
      .messages({
        "string.empty": "Content is required.",
        "string.min": "Content must be at least 5 characters long."
      })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(422).json({
      error: "Validation failed",
      details: error.details.map(detail => ({
        field: detail.context.key,
        message: detail.message
      }))
    });
  }

  next();
  console.log("Incoming Request Body:", req.body);
};


module.exports = validatePost;

