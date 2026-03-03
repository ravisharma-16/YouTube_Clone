import { Router } from "express"; 
import { loginUser, logout, registerUser,refreshaccesstoken,getcurrentuser,changecurrentpassword,updateAccountDetails,
  updateUserAvater,updateUserCoverImage,getUserChannelProfile,getWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewears/multer.js";
import { verifyJWT } from "../middlewears/auth.cookie.js";

const router = Router();

// Register user with file uploads
router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

// Login user
router.post("/login", loginUser);

// Logout user (protected route)
router.post("/logout", verifyJWT, logout);

router.post("/refresh_token",refreshaccesstoken)

router.post("/change-password",verifyJWT,changecurrentpassword)

router.post("/UserGet",verifyJWT,getcurrentuser)

router.post("/change-Account-Details",verifyJWT,updateAccountDetails)

router.post("/change-user-avatar",verifyJWT,upload.single("avatar"),updateUserAvater)

router.post("/change-user-coverimage",verifyJWT,upload.single("coverImage"),updateUserCoverImage)

router.post("/c/:username",verifyJWT,getUserChannelProfile)

router.post("/watch-history",verifyJWT,getWatchHistory)



export default router;
