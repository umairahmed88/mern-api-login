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
		// Verify the JWT token
		const decoded = jwt.verify(token, jwtSecret);

		// Extract user details from token
		const { username, email, password } = decoded;

		// Check if the user already exists
		const existingUser = await Auth.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: "User already verified" });
		}

		// Create a new user instance
		const newUser = new Auth({
			username,
			email,
			password,
			isVerified: true, // Set user as verified
		});

		// Save the new user to the database
		await newUser.save();

		res
			.status(200)
			.json({ message: "Email verified successfully, user registered!" });
	} catch (error) {
		res.status(400).json({ message: "Invalid or expired token" });
	}
});

export default router;
