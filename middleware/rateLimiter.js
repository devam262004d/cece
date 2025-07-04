const rateLimit = require("express-rate-limit");

const signupLimiter = rateLimit({
  windowMs: 5 * 1000, 
  max: 2,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    console.log("🔒 Rate limit hit for IP:", req.ip); 
    res.status(options.statusCode).json({
      success: false,
      message: "Wait a moment before retrying.",
    });
  },
});

module.exports = signupLimiter;
