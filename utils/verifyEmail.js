import Auth from "../models/auth.model.js";
import jwt from "jsonwebtoken";

export const verifyEmail = async (req, res) => {
	const { token } = req.query;

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		const existingUser = await Auth.findOne({ email: decoded.email });
		if (existingUser) {
			return res.status(400).json({ message: "Email already verified" });
		}

		const newUser = new Auth({
			username: decoded.username,
			email: decoded.email,
			password: decoded.password,
		});

		user.isVerified = true;

		await newUser.save();

		// Redirect to sign-in page
		const clientUrl =
			process.env.NODE_ENV === "production"
				? process.env.CLIENT_URL
				: `http://localhost:${process.env.DEV_PORT}`;

		res.redirect(`${clientUrl}/signin`);
	} catch (error) {
		console.error("Error in verifyEmail:", error);
		res.status(400).json({ message: "Invalid or expired token" });
	}
};
