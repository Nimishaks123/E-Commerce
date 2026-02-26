const passport = require('passport');
require('dotenv').config();
const User = require('../models/userModel');

console.log("GOOGLE CALLBACK URL:", process.env.GOOGLE_CALLBACK_URL);

const GoogleStrategy = require('passport-google-oauth2').Strategy;

/* =========================
   Serialize & Deserialize
========================= */

// Serialize user to session
passport.serializeUser((user, done) => {
  done(null, user.id); // store only user ID
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) return done(new Error('User not found'));
    done(null, user);
  } catch (err) {
    done(err);
  }
});

/* =========================
   Google OAuth Strategy
========================= */

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email: profile.emails?.[0]?.value || '',
            username: profile.displayName || '',
            isBlocked: false,
            password: '',
            mobile: '',
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

module.exports = passport;
