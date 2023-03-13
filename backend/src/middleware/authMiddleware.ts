import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { userRepository } from "../config/data-source";

//import { userRepository } from "../entities/User";

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

    const user = await userRepository
      .createQueryBuilder("user")
      .where("user._id = :id", { id: (<{ id: string }>decoded).id })
      .getOne();

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
