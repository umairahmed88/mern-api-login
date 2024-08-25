import express from "express";
import { signin, signup } from "../controllers/auth.controllers.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);

router.get("/verify-email", async (req, res) => {
	const { token } = req.query;
	const jwtSecret =
		process.env.NODE_ENV === "production"
			? process.env.PROD_JWT_SECRET
			: process.env.DEV_JWT_SECRET;

	try {
		const decoded = jwt.verify(token, jwtSecret);
		const user = await Auth.findById(decoded.id);

		if (!user) {
			return res.status(400).json({ message: "Invalid verification link" });
		}

		user.isVerified = true;
		await user.save();

		res.status(200).json({ message: "Email verified successfully" });
	} catch (error) {
		res.status(400).json({ message: error.response.body });
	}
});

export default router;
