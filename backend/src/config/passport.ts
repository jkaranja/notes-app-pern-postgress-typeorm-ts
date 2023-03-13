import { compareSync } from "bcrypt";
import passport from "passport";

import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as TwitterStrategy } from "@superfaceai/passport-twitter-oauth2";

import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";

import express from "express";
import { User } from "../entities/User";
import { IUser } from "../types/user";
import { userRepository } from "./data-source";

const app = express();

//TS REF
//https://github.com/microsoft/TypeScript-Node-Starter/blob/master/src/config/passport.ts

//initialize passport to connect with express
app.use(passport.initialize());

//this middleware will be called when passport.authenticate() runs
//google
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/sso/google/callback`,
    },

    async (accessToken, refreshToken, profile, cb): Promise<void> => {
      // console.log(accessToken, profile);
      //if no email, fail & redirect to login again//messages not shown tho
      const email = profile.emails?.[0]?.value;

      if (!email) {
        //to trigger failure redirect, err arg must be null and no user arg supplied
        //provide only one arg as null to trigger failure

        return cb(null);
        //below will not trigger failure redirect//it will just return the the error object in empty page
        //it won't trigger success redirect since user arg is null too
        // return cb(
        //   new Error(`Failed! Please choose a different way to sign in`)
        // );
      }

      //check if user/email already exists
      try {
        const user = await userRepository
          .createQueryBuilder("user")
          .where("user.email = :email", { email })
          .getOne();
        //add user if null
        if (!user) {
          //save using active record approach
          const newUser = User.create({
            username: profile.displayName,
            email,
            isVerified: true,
          });

          await newUser.save();

          return cb(null, newUser);
        } else if (!user.isVerified) {
          //user has account bt not verified//fail/redirect home
          return cb(null);
        } else {
          return cb(null, user);
        }
      } catch (error) {
        return cb(error as Error);
      }
    }
  )
);

//fb
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/sso/facebook/callback`,
      profileFields: ["id", "displayName", "email"],
      //passReqToCallback: true,
    },
    async (accessToken, refreshToken, profile, cb): Promise<void> => {
      // console.log(accessToken, profile);
      //if no email, fail & redirect to login again//messages not shown tho
      const email = profile.emails?.[0]?.value;

      if (!email) {
        return cb(null);
      }

      //check if user/email already exists
      try {
        const user = await userRepository
          .createQueryBuilder("user")
          .where("user.email = :email", { email })
          .getOne();
        //add user if null
        if (!user) {
          //save using active record approach
          const newUser = User.create({
            username: profile.displayName,
            email,
            isVerified: true,
          });

          await newUser.save();

          return cb(null, newUser);
        } else if (!user.isVerified) {
          //user has account bt not verified//fail/redirect home
          return cb(null);
        } else {
          return cb(null, user);
        }
      } catch (error) {
        return cb(error as Error);
      }
    }
  )
);

//twitter//not working//requires session
passport.use(
  new TwitterStrategy(
    {
      clientID: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/sso/twitter/callback`,
      clientType: "confidential",
      //profileFields: ["id", "displayName", "photos", "email"],
      // includeEmail: true,
    },
    async (accessToken, refreshToken, profile, cb): Promise<void> => {
      // console.log(accessToken, profile);
      //if no email, fail
      const email = profile.emails?.[0]?.value;

      if (!email) {
        return cb(null);
      }

      //check if user/email already exists
      try {
        const user = await userRepository
          .createQueryBuilder("user")
          .where("user.email = :email", { email })
          .getOne();
        //add user if null
        if (!user) {
          //save using active record approach
          const newUser = User.create({
            username: profile.displayName,
            email,
            isVerified: true,
          });

          await newUser.save();

          return cb(null, newUser);
        } else if (!user.isVerified) {
          //user has account bt not verified//fail/redirect home
          return cb(null);
        } else {
          return cb(null, user);
        }
      } catch (error) {
        return cb(error as Error);
      }
    }
  )
);

interface StrategyProfile {
  emails: Array<{ value: string }>;
  displayName: string;
}

//github
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/sso/github/callback`,
    },

    async (
      accessToken: string,
      refreshToken: string,
      profile: StrategyProfile,
      cb: (err: Error | null, user?: IUser) => void
    ): Promise<void> => {
      // console.log(accessToken, profile);
      //if no email, fail & redirect to login again//messages not shown tho
      const email = profile.emails?.[0]?.value;

      if (!email) {
        return cb(null);
      }

      //check if user/email already exists
      try {
        const user = await userRepository
          .createQueryBuilder("user")
          .where("user.email = :email", { email })
          .getOne();
        //add user if null
        if (!user) {
          //save using active record approach
          const newUser = User.create({
            username: profile.displayName,
            email,
            isVerified: true,
          });

          await newUser.save();

          return cb(null, newUser);
        } else if (!user.isVerified) {
          //user has account bt not verified//fail/redirect home
          return cb(null);
        } else {
          return cb(null, user);
        }
      } catch (error) {
        return cb(error as Error);
      }
    }
  )
);

//LinkedIn//have to use other port other than 5000//use 4000
passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/sso/linkedin/callback`,
      scope: ["r_emailaddress", "r_liteprofile"],
      //state: false, //must to not use session
    },
    async (accessToken, refreshToken, profile, cb): Promise<void> => {
      // console.log(accessToken, profile);
      //if no email, fail & redirect to login again//messages not shown tho
      const email = profile.emails?.[0]?.value;

      if (!email) {
        return cb(null);
      }

      //check if user/email already exists
      try {
        const user = await userRepository
          .createQueryBuilder("user")
          .where("user.email = :email", { email })
          .getOne();
        //add user if null
        if (!user) {
          //save using active record approach
          const newUser = User.create({
            username: profile.displayName,
            email,
            isVerified: true,
          });

          await newUser.save();

          return cb(null, newUser);
        } else if (!user.isVerified) {
          //user has account bt not verified//fail/redirect home
          return cb(null);
        } else {
          return cb(null, user);
        }
      } catch (error) {
        return cb(error as Error);
      }
    }
  )
);
