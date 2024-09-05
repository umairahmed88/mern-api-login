import Auth from "../models/auth.model.js";
import jwt from "jsonwebtoken";

export const verifyEmail = async (req, res) => {
	const { token } = req.query;

	if (!token) {
		return res.status(400).json({ message: "No token provided" });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const { email, username, password, avatar } = decoded;

		let user = await Auth.findOne({ email });

		if (user) {
			// Email already verified or user exists with the new email
			if (user.email === email) {
				return res.status(400).json({ message: "Email already verified" });
			}

			const sanitizedUser = new Auth({
				username,
				email,
				password,
				avatar,
			});

			await sanitizedUser.save();
			return res.redirect(`${process.env.CLIENT_URL}/signin`);
		}

		const sanitizedUser = new Auth(decoded);

		await sanitizedUser.save();

		res.redirect(`${process.env.CLIENT_URL}/signin`);
	} catch (error) {
		console.error("Error in verifyEmail:", error.message);
		res.status(400).json({ message: error.message });
	}
};
