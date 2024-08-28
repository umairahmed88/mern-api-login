import express from "express";
import { signin, signout, signup } from "../controllers/auth.controllers.js";
import { verifyEmail } from "../utils/verifyEmail.js";
import { verifyToken } from "../utils/verifyAuth.js";


const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signout", verifyToken, signout);

router.get("/verify-email", verifyEmail);

export default router;
