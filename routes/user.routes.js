import express from "express";
const router = express.Router();
import { getUserProfile, updateProfile, getEditProfilePage , getChangePasswordPage , updatePassword } from "../controllers/user.controllers.js"
import { isLoggedIn } from "../middleware/auth.js";
import { uploadProfileImage } from "../middleware/multer.js";

router.get('/:id', getUserProfile);
router.get('/:id/edit', isLoggedIn, getEditProfilePage);
router.post('/:id/edit', isLoggedIn, uploadProfileImage, updateProfile);
router.get('/:id/password', isLoggedIn, getChangePasswordPage);
router.post('/:id/password', isLoggedIn, updatePassword);


export default router;