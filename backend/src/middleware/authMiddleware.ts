import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel";

const verifyJWT: RequestHandler = (req, res, next) => {
  const authHeader =
    (req.headers.authorization as string) ||
    (req.headers.Authorization as string);

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Forbidden" });

    const user = await User.findById((<{ id: string }>decoded).id)
      .select("-password")
      .lean()
      .exec();

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized. Please try again or contact support",
      });
    }

    req.user = user;

    next();
  });
};

export default verifyJWT;
