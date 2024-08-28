import jwt from "jsonwebtoken";
import Auth from "../models/auth.model.js";

export const verifyEmail = async (req, res) => {
	try {
		const { token } = req.query;
		console.log("Verifying email with token:", token);

		const isProduction = process.env.NODE_ENV === "production";
		const jwtSecret = isProduction
			? process.env.PROD_JWT_SECRET
			: process.env.DEV_JWT_SECRET;

		console.log("Using JWT secret:", jwtSecret);

		const decoded = jwt.verify(token, jwtSecret);
		console.log("Decoded token:", decoded);

		const existingUser = await Auth.findOne({ email: decoded.email });
		console.log("Existing user check result:", existingUser);

		if (existingUser) {
			console.log("Email already verified for:", decoded.email);
			return res.status(400).json({ message: "Email is already verified." });
		}

		console.log("Creating new user with username:", decoded.username);

		const newUser = new Auth({
			username: decoded.username,
			email: decoded.email,
			password: decoded.password,
		});

		await newUser.save();
		console.log("New user saved successfully:", newUser);

		res
			.status(200)
			.json({ message: "Email verified successfully! You can now log in." });
	} catch (err) {
		console.error("Error during email verification:", err);

		if (err.name === "TokenExpiredError") {
			return res.status(400).json({
				message: "Token has expired. Please request a new verification link.",
			});
		} else if (err.name === "JsonWebTokenError") {
			return res.status(400).json({
				message: "Invalid token. Please request a new verification link.",
			});
		} else {
			return res.status(500).json({
				message:
					"An error occurred during email verification. Please try again later.",
			});
		}
	}
};
