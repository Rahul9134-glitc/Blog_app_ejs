import express from "express";
const router = express.Router();

import { getRegisterPage , registerUser , loginUser , getLoginPage, logoutUser } from "../controllers/auth.controllers.js";

router.get("/register", getRegisterPage);
router.post("/register", registerUser);
router.get("/login", getLoginPage);
router.post("/login", loginUser);
router.get("/logout" , logoutUser);

export default router;