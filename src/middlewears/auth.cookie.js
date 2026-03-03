import { asyncfunction } from "../utils/asyncfunction.js";
import { ApiError } from "../utils/Api_error.js";
import jsonwebtoken from "jsonwebtoken";
import { User } from "../models/User.js";

export const verifyJWT = asyncfunction(async (req, res, next) => {
  const token =
    req.cookies?.AccessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request: Token not found");
  }

  let decodedToken;

  try {
    // ✅ Proper decoding with environment secret
    decodedToken = jsonwebtoken.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    // ⛔ This happens when token is expired, malformed, or secret is wrong
    console.error("JWT verification failed:", err.message);
    throw new ApiError(401, "Invalid access token");
  }

  const user = await User.findById(decodedToken?._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(401, "Access token invalid: User not found");
  }

  req.user = user;
  next();
});
