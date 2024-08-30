import Auth from "../models/auth.model.js";
import jwt from "jsonwebtoken";

export const verifyEmail = async (req, res) => {
	const { token } = req.query;

	if (!token) {
		return res.status(400).json({ message: "No token provided" });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		const newUser = new Auth({
			username: decoded.username,
			email: decoded.email,
			password: decoded.password,
		});

		await newUser.save();

		res.redirect(`${process.env.CLIENT_URL}/signin`);
	} catch (error) {
		console.error("Error in verifyEmail:", error.message);
		res.status(400).json({ message: "Invalid or expired token" });
	}
};
