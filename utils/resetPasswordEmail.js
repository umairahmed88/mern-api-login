import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { Auth } from "../models/auth.model.js";
import Token from "../models/token.model.js";

export const resetPasswordEmail = async (req, res) => {
	try {
		const { token } = req.query;
		const { newPassword, confirmNewPassword } = req.body;

		if (newPassword !== confirmNewPassword) {
			return res.status(400).json({ message: "Passwords do not match." });
		}

		const blacklistedToken = await Token.findOne({ token });
		if (blacklistedToken) {
			return res
				.status(400)
				.json({ message: "This token has already been used." });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		const user = await Auth.findById(decoded.id);

		if (!user) {
			return res.status(404).json({ message: "You are not signup." });
		}

		const hashedPassword = bcryptjs.hashSync(newPassword, 10);

		user.password = hashedPassword;

		await user.save();

		await new Token({ token }).save();

		res.status(200).json({
			message:
				"Password reset successful, please log in with your new password.",
		});
	} catch (err) {
		if (err.name === "TokenExpiredError") {
			return res.status(400).json({ message: "Reset token has expired." });
		}
		res.status(500).json({ message: err.message });
	}
};
