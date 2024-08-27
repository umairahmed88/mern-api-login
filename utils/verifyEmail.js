import Auth from "../models/auth.model.js";

export const verifyEmail = async (req, res) => {
	try {
		const { token } = req.query;

		const isProduction = process.env.NODE_ENV === "production";
		const jwtSecret = isProduction
			? process.env.PROD_JWT_SECRET
			: process.env.DEV_JWT_SECRET;

		const decoded = jwt.verify(token, jwtSecret);

		const existingUser = await Auth.findOne({ email: decoded.email });
		if (existingUser) {
			return res.status(400).json({ message: "Email is already verified." });
		}

		const newUser = new Auth({
			username: decoded.username,
			email: decoded.email,
			password: decoded.password,
		});

		await newUser.save();

		res
			.status(200)
			.json({ message: "Email verified successfully! You can now log in." });
	} catch (err) {
		console.error("Error during email verification:", err);

		// Send appropriate error response
		if (err.name === "TokenExpiredError") {
			return res
				.status(400)
				.json({
					message: "Token has expired. Please request a new verification link.",
				});
		} else if (err.name === "JsonWebTokenError") {
			return res
				.status(400)
				.json({
					message: "Invalid token. Please request a new verification link.",
				});
		} else {
			return res
				.status(500)
				.json({
					message:
						"An error occurred during email verification. Please try again later.",
				});
		}
	}
};
