import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.emails || profile.emails.length === 0) {
          return done(new Error('No email found from Google'), false);
        }

        const email = profile.emails[0].value;
        let user = await User.findOne({ email });

        if (!user) {
          // Creer usuario automáticamente usando login social si no existe
          user = await User.create({
            name: profile.displayName || email.split('@')[0],
            email,
            password: `oauth_${Date.now()}_${Math.random()}`, // Password required by schema but useless for OAuth
            role: 'user',
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export default passport;
