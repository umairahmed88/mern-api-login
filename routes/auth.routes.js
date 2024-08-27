import express from "express";
import { signin, signup } from "../controllers/auth.controllers.js";
import { verifyEmail } from "../utils/verifyEmail.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);

router.get("/verify-email", verifyEmail);

export default router;
