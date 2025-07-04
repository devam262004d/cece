const express = require('express');
const router = express.Router();
const passport = require("passport");
const tokenVerify =  require("../middleware/verifyToken");
const signupLimiter  = require( "../middleware/rateLimiter");



// Manual signup
const { signUp, login, logout } = require('./auth');
router.post('/signUp', signupLimiter, signUp);
router.post('/login',signupLimiter, login);


// Google OAuth Start
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/auth/failure",
    session: false, 
  }),
  (req, res) => {
    const token = req.user.token;

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: "Lax",
      maxAge: 1000 * 60 * 60 * 24, 
    });
    res.redirect("http://localhost:3000");
  }
);


router.get('/me', tokenVerify , (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token verified successfully',
    user: req.user, 
  });});


router.get('/logout',logout );


// router.get('/success', (req, res) => {
//   res.send(`✅ Google Login Successful! Welcome ${req.user?.name || "User"}`);
// });
// router.get('/failure', (req, res) => {
//   res.send("❌ Google Login Failed");
// });

module.exports = router;
