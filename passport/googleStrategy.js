const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const User = require("../Auth/user");
const dotenv = require("dotenv");
dotenv.config(); // ✅ Load environment variables

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || "",           
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || " ",   
        callbackURL: "http://localhost:5000/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ email: profile.emails[0].value });

          if (!user) {
            user = new User({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
              photo: profile.photos[0].value,
              signupType: "google",
              accountType: "user", // Optional default
            });
            await user.save();
          }

          // ✅ Fixed typo: accoutnType → accountType
          const token = jwt.sign(
            { id: user._id, accountType: user.accountType },
            process.env.JWT_SECRET || "secret", // ✅ Load secret from env
            { expiresIn: "1d" }
          );

          user.token = token;

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
