// import jwt from "jsonwebtoken";
// import Auth from "../models/auth.model.js";

// export const verifyEmail = async (req, res) => {
// 	try {
// 		const { token } = req.query;

// 		// Verify the token
// 		jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
// 			if (err) {
// 				return res.status(400).json({
// 					message:
// 						"Invalid or expired token. Please request a new verification link.",
// 				});
// 			}

// 			const { username, email, password } = decoded;

// 			// Check if the user already exists in the database
// 			const existingUser = await Auth.findOne({ email });
// 			if (existingUser) {
// 				return res.status(400).json({ message: "User already exists." });
// 			}

// 			// Create a new user in the database
// 			const newUser = new Auth({
// 				username,
// 				email,
// 				password,
// 				isVerified: true, // Mark the user as verified
// 			});

// 			await newUser.save();

// 			res.status(200).json({
// 				message: "Email verified successfully, user added to the database!",
// 			});
// 		});
// 	} catch (err) {
// 		res.status(500).json({ message: err.message });
// 	}
// };

export const verifyEmail = async (req, res) => {
	const { token } = req.query;

	try {
		// Verify the token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Check if user already exists
		const existingUser = await Auth.findOne({ email: decoded.email });
		if (existingUser) {
			return res.status(400).json({ message: "Email already verified" });
		}

		// Create a new user with the verified email and hashed password
		const newUser = new Auth({
			username: decoded.username,
			email: decoded.email,
			password: decoded.password,
		});

		await newUser.save();

		// Redirect to sign-in page
		const clientUrl =
			process.env.NODE_ENV === "production"
				? process.env.CLIENT_URL
				: `http://localhost:${process.env.DEV_PORT}`;

		res.redirect(`${clientUrl}/signin`);
	} catch (error) {
		return res.status(400).json({ message: "Invalid or expired token" });
	}
};
