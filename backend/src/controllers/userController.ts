import crypto from "crypto";
import jwt from "jsonwebtoken";

import bcrypt from "bcrypt";
import sendEmail from "../utils/sendEmail";
import { removeImage } from "../utils/cloudnary";
import { validate as isValidUUID } from "uuid";

import { Buffer } from "node:buffer";
import { RequestHandler } from "express";
import mongoose from "mongoose";
import { User } from "../entities/User";
import { AppDataSource, userRepository } from "../config/data-source";
import { Profile } from "../entities/Profile";

/*-----------------------------------------------------------
 * GET USER
 ------------------------------------------------------------*/

/**
 * @desc - Get user
 * @route - GET api/users
 * @access - Private
 *
 */
const getUser: RequestHandler = async (req, res) => {
  // Get current user details
  const { user } = req;
  // If no user
  if (!user) {
    return res
      .status(400)
      .json({ message: "Something isn't right. Please contact support" });
  }

  /**-----------------------------------------------------------------------------
   * RELATIONS//MANY2MANY IS UNDER ENTITY(NOT TESTED)//OTHERS/BELOW  IMPLEMENTED & WORKING
   ----------*/
   /**
  //get one2one relation//unidirectional//get profile from user side
  const users = await AppDataSource.getRepository(User)
    .createQueryBuilder("user")
    .andWhere("user.updatedAt >= :startDate", {
      startDate: "2023-03-13T00:51:38.383Z", //date must be a 'Date object' or iso string//i.e string
    })
    .leftJoinAndSelect("user.profile", "profile")
    .getMany();
  // res.json(users);
  // result{...user,  "profile": {"id": 1,"gender": "male", "photo": "me.jpg"}}

  //one2one bidirectional // you can get user from profile
  const profiles = await AppDataSource.getRepository(Profile)
    .createQueryBuilder("profile")
    .leftJoinAndSelect("profile.user", "user")
    .getMany();
  //res.json(profiles);
  //result{...profile, "user": {..user doc} "

  //one2many/many2one//
  //one2many side// you can get profiles from user side//the inverse side//non owning
  const currentUsers = await AppDataSource.getRepository(User)
    .createQueryBuilder("user")
    .andWhere("user.updatedAt >= :startDate", {
      startDate: "2023-03-13T00:51:38.383Z", //date must be a 'Date object' or iso string//i.e string
    })
    .leftJoinAndSelect("user.profiles", "profiles")
    .getMany();
  // res.json(currentUsers);
  //result{...user doc, "profiles": [{profile doc1}, {profile doc2}] "

  //many2one//owning side//get user from one of the profiles
  const xprofiles = await AppDataSource.getRepository(Profile)
    .createQueryBuilder("profile")
    .leftJoinAndSelect("profile.currentUser", "user")
    .getMany();
  //res.json(xprofiles);
  //result{...profile doc, "currentUser": {...user doc}
  */
  //---------------------------end of relations-----------------



  res.json({
    id: user._id,
    username: user.username,
    email: user.email,
    profileUrl: user.profileUrl,
    phoneNumber: user.phoneNumber,
    newEmail: user.newEmail,
  });
};

/*-----------------------------------------------------------
 * REGISTER
 ------------------------------------------------------------*/

interface SignUpBody {
  username?: string;
  email?: string;
  password?: string;
}

/**
 * @desc - Create new user
 * @route - POST /api/users/register
 * @access - Public
 *
 */

const registerUser: RequestHandler<
  unknown,
  unknown,
  SignUpBody,
  unknown
> = async (req, res) => {
  const { username, password, email } = req.body;

  // Confirm data
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate email
  //perform case insensitive validation

  const duplicate = await userRepository
    .createQueryBuilder("user")
    .where("LOWER(user.email) = :email", { email: email.toLowerCase() })
    .getOne();

  if (duplicate) {
    return res
      .status(409)
      .json({ message: "Account already exists. Please log in" });
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  //gen verify token & hash it
  const verifyToken = crypto.randomBytes(10).toString("hex");
  const verifyEmailToken = crypto
    .createHash("sha256")
    .update(verifyToken)
    .digest("hex");

  //send verify token
  const emailOptions = {
    subject: "Please verify your email",
    to: email,
    body: `
                <p>Hi ${username}, </p>
                <p>Welcome to clientlance.io</p>
                <p>Please click the button below to confirm your email address:</p>             
                <a href ='${process.env.VERIFY_EMAIL_URL}/${verifyToken}' target='_blank' style='display: inline-block; color: #ffffff; background-color: #3498db; border: solid 1px #3498db; border-radius: 5px; box-sizing: border-box; cursor: pointer; text-decoration: none; font-size: 14px; font-weight: bold; margin: 15px 0px; padding: 5px 15px; text-transform: capitalize; border-color: #3498db;'>Confirm your email</a>  
                 
                <p>Thanks!</p>
                 <p>Clientlance team</p>
                             
                `,
  };
  //don't wait//they can resend if it fails
  const response = sendEmail(emailOptions);

  // if (!response) {
  //   return res.status(400).json({ message: "Check details and try again" });
  // }

  //create and save user
  const user = new User();
  user.username = username;
  user.password = hashedPwd;
  user.email = email;
  user.verifyEmailToken = verifyEmailToken;

  //if using validate class inside entity//call validate before saving//
  // const errors = await validate(user);
  // if (errors.length > 0) {
  //   throw new Error(`Validation failed!`);
  // } else {
  //    await userRepository.save(user);
  // }

  /**-----------------------------------------------------------------------------
   * SAVING RELATIONS//MANY2MANY IS UNDER ENTITY(NOT TESTED)//OTHERS/BELOW  IMPLEMENTED & WORKING
   ----------*/
  //1.---------------saving a OneToOne relation//for both uni/bidirectional relations-----------
  /**
  const profile = new Profile();
  profile.gender = "male";
  profile.photo = "me.jpg";
  // first we should save a profile
  await AppDataSource.manager.save(profile);

  user.profile = profile; //// this way we connect them//profile will be added to use -->profile field as foreign key
  //then save user with relation
  await userRepository.save(user);
  

  //2----------saving a Many-to-one / one-to-many relations relation---------------
  const profile1 = new Profile();
  profile1.gender = "male";
  profile1.photo = "me-and-bears.jpg";
  //await AppDataSource.manager.save(profile1);

  const profile2 = new Profile();
  profile2.gender = "male";
  profile2.photo = "me.jpg";
  //await AppDataSource.manager.save(profile2);
  user.profiles = [profile1, profile2];
  */
  //---------------------------end of relations-----------------

  await userRepository.save(user);

  if (!user) {
    return res.status(400).json({ message: "Check details and try again" });
  }

  //create a token that will be sent back as cookie//for resending email
  const resendEmailToken = jwt.sign(
    { id: user._id, email },
    process.env.RESEND_EMAIL_TOKEN_SECRET,
    { expiresIn: "15m" } //expires in 15 min
  );

  // Create secure cookie with user id in token
  res.cookie("resend", resendEmailToken, {
    httpOnly: false, //readable for displaying email
    secure: true,
    sameSite: "none", //
    maxAge: 15 * 60 * 1000, //expire in 15 min
  });

  res.status(201).json({ message: "Registered successfully" });
};

/*-----------------------------------------------------------
 * RESEND EMAIL
 ------------------------------------------------------------*/

/**
 * @desc - Resend email token
 * @route - POST api/users/resend/email
 * @access - Public
 *
 */
const resendVerifyEmail: RequestHandler = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.resend) {
    return res.status(400).json({ message: "Email could not be sent" });
  }

  const resendEmailToken: string = cookies.resend; //cookies.jwt is of any type//must be converted to string for err & decoded types to be inferred
  //else you must pass type: err: VerifyErrors | null,  decoded: JwtPayload | string | undefined

  jwt.verify(
    resendEmailToken,
    process.env.RESEND_EMAIL_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        return res.status(400).json({ message: "Email could not be sent" });
      }

      const foundUser = await userRepository
        .createQueryBuilder("user")
        .where("user._id = :id", { id: (<{ id: string }>decoded).id })
        .getOne();

      if (!foundUser) {
        return res.status(400).json({ message: "Email could not be sent" });
      }
      //now resend email with new verify token
      //gen verify token
      const verifyToken = crypto.randomBytes(10).toString("hex");
      const verifyEmailToken = crypto
        .createHash("sha256")
        .update(verifyToken)
        .digest("hex");

      //resend email
      const emailOptions = {
        subject: "Please verify your email",
        to: foundUser.email,
        body: `
                <p>Hi ${foundUser.username}, </p>
                <p>Welcome to clientlance.io</p>
                <p>Please click the button below to confirm your email address:</p>             
                <a href ='${process.env.VERIFY_EMAIL_URL}/${verifyToken}' target='_blank' style='display: inline-block; color: #ffffff; background-color: #3498db; border: solid 1px #3498db; border-radius: 5px; box-sizing: border-box; cursor: pointer; text-decoration: none; font-size: 14px; font-weight: bold; margin: 15px 0px; padding: 5px 15px; text-transform: capitalize; border-color: #3498db;'>Confirm your email</a>  
                 
                <p>Thanks!</p>
                 <p>Clientlance team</p>
                             
                `,
      };
      //don't wait//they can resend if it fails
      const response = sendEmail(emailOptions);
      // if (!response) {
      //   return res.status(400).json({ message: "Check details and try again" });
      // }

      //update verify token
      foundUser.verifyEmailToken = verifyEmailToken;
      await foundUser.save();

      res.json({ message: "Email sent" });
    }
  );
};

/*-----------------------------------------------------------
 * UPDATE/PATCH
 ------------------------------------------------------------*/
//ALLOW USERS TO CHANGE EMAIL BUT DON'T USE EMAIL AS UNIQUE IDENTIFY IN OTHER COLLECTION//USE user: object id //the can populate
//so you will only need to update email in user collection only//id remains the same

/**
 * @desc - Update user
 * @route - PATCH api/users/:id
 * @access - Private
 *
 */
const updateUser: RequestHandler = async (req, res) => {
  const { username, email, phoneNumber, password, newPassword } = req.body;

  const profileUrl = req.file?.path;
  const publicId = req.file?.filename;

  const { id } = req.params;

  //check if id is a valid ObjectId//ObjectIds is constructed only from 24 hex character strings
  if (!isValidUUID(id)) {
    await removeImage(publicId);
    return res.status(400).json({ message: "User not found" });
  }

  // Does the user exist to update//exists since we are already here
  const user = await userRepository
    .createQueryBuilder("user")
    .addSelect("user.password") //retrieve pass also. hidden with select:false
    .where("user._id = :id", { id })
    .getOne();

  if (!user) {
    await removeImage(publicId);
    return res.status(400).json({ message: "User not found" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    await removeImage(publicId);
    return res.status(400).json({ message: "Wrong password" });
  }

  // update user
  if (newPassword) user.password = await bcrypt.hash(newPassword, 10);
  if (username) user.username = username;
  if (phoneNumber) user.phoneNumber = phoneNumber;
  //upload and store public id
  if (profileUrl) user.profileUrl = profileUrl;
  //email changed
  if (email && user.email !== email) {
    //gen verify token & hash it
    const verifyToken = crypto.randomBytes(10).toString("hex");
    const verifyEmailToken = crypto
      .createHash("sha256")
      .update(verifyToken)
      .digest("hex");

    // Check for duplicate email//case insensitive
    const duplicate = await userRepository
      .createQueryBuilder("user")
      .where("LOWER(user.email) = :email", { email: email.toLowerCase() })
      .getOne();

    // Allow only updates to the original user
    if (duplicate) {
      await removeImage(publicId);
      return res.status(409).json({ message: "Duplicate email" });
    }

    //update new email and token
    user.newEmail = email;
    user.verifyEmailToken = verifyEmailToken;

    //send un hashed token
    const emailOptions = {
      subject: "Please verify your email",
      to: email,
      body: `
                <p>Hi ${user.username}, </p>
                <p>Complete changing your email address by confirming it below:</p> 
                <a href ='${process.env.VERIFY_EMAIL_URL}/${verifyToken}' target='_blank' style='display: inline-block; color: #ffffff; background-color: #3498db; border: solid 1px #3498db; border-radius: 5px; box-sizing: border-box; cursor: pointer; text-decoration: none; font-size: 14px; font-weight: bold; margin: 15px 0px; padding: 5px 15px; text-transform: capitalize; border-color: #3498db;'>Confirm your email</a> 
                <p>If you didn't initiate this request, please disregard this email</p>
                <p>Thanks!</p>
                <p>Clientlance team</p>
                             
                `,
    };

    //wait for fail or success//can't resend email
    const response = await sendEmail(emailOptions);
    if (!response) {
      await removeImage(publicId);
      return res.status(400).json({
        message: "Account could not be updated. Please try again",
      });
    }
  }
  //update user
  await userRepository.save(user);

  if (!user) {
    await removeImage(publicId);
    return res.status(400).json({
      message: "Account could not be updated. Please try again",
    });
  }

  //res =  updated user details
  return res.json({
    id: user._id,
    username: user.username,
    email: user.email,
    profileUrl: user.profileUrl,
    phoneNumber: user.phoneNumber,
    newEmail: user.newEmail,
  });
};

/*-----------------------------------------------------------
 * DELETE USER
 ------------------------------------------------------------*/

/**
 * @desc - Delete a user
 * @route - DELETE api/users/:id
 * @access - Private
 *
 */
const deleteUser: RequestHandler = async (req, res) => {
  const { id } = req.params;

  //check if id is a valid ObjectId//ObjectIds is constructed only from 24 hex character strings
  if (!isValidUUID(id)) {
    return res.status(400).json({ message: "User not found" });
  }
  // if (!mongoose.isValidObjectId(id)) {
  //   return res.status(400).json({ message: "User not found" });
  // }

  // Does the user exist to delete?
  const user = await userRepository
    .createQueryBuilder("user")
    .where("user._id = :id", { id })
    .getOne();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  await userRepository.remove(user);

  //clear refresh token cookie
  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
  //204 don't have a response body
  //res.status(204).json({ message: "Account deactivated" }); //on frontend, success = clear state and redirect to home
  res.json({ message: "Account deactivated" }); //on frontend, success = clear state and redirect to home
};

export { getUser, registerUser, updateUser, deleteUser, resendVerifyEmail };
