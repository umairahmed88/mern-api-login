import jwt from "jsonwebtoken";
import Auth from "../models/auth.model.js";

export const verifyEmail = async (req, res) => {
	try {
		const { token } = req.query;

		// Verify the token
		jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
			if (err) {
				return res
					.status(400)
					.json({
						message:
							"Invalid or expired token. Please request a new verification link.",
					});
			}

			const { username, email, password } = decoded;

			// Check if the user already exists in the database
			const existingUser = await Auth.findOne({ email });
			if (existingUser) {
				return res.status(400).json({ message: "User already exists." });
			}

			// Create a new user in the database
			const newUser = new Auth({
				username,
				email,
				password,
				isVerified: true, // Mark the user as verified
			});

			await newUser.save();

			res
				.status(200)
				.json({
					message: "Email verified successfully, user added to the database!",
				});
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// import jwt from "jsonwebtoken";
// import Auth from "../models/auth.model.js";

// export const verifyEmail = async (req, res) => {
// 	console.log("verifyEmail middleware invoked");

// 	const isProduction = process.env.NODE_ENV === "production";
// 	const jwtSecret = isProduction
// 		? process.env.PROD_JWT_SECRET
// 		: process.env.DEV_JWT_SECRET;
// 	console.log("JWT secret used for verification:", jwtSecret);

// 	try {
// 		const { token } = req.query;
// 		console.log("Token received:", token);

// 		console.log("Using JWT secret:", jwtSecret);

// 		const decoded = jwt.verify(token, jwtSecret);
// 		console.log("Decoded token:", decoded);

// 		const existingUser = await Auth.findOne({ email: decoded.email });
// 		console.log("Existing user check result:", existingUser);

// 		if (existingUser) {
// 			console.log("Email already verified for:", decoded.email);
// 			return res.status(400).json({ message: "Email is already verified." });
// 		}

// 		console.log("Creating new user with username:", decoded.username);

// 		const newUser = new Auth({
// 			username: decoded.username,
// 			email: decoded.email,
// 			password: decoded.password,
// 			isVerified: true,
// 		});

// 		await newUser.save();
// 		console.log("New user saved successfully:", newUser);

// 		res.redirect("ua-https://mern-client.vercel.app/signin");

// 		res
// 			.status(200)
// 			.json({ message: "Email verified successfully! You can now log in." });
// 	} catch (err) {
// 		console.error("Error during email verification:", err);

// 		if (err.name === "TokenExpiredError") {
// 			return res.status(400).json({
// 				message: "Token has expired. Please request a new verification link.",
// 			});
// 		} else if (err.name === "JsonWebTokenError") {
// 			return res.status(400).json({
// 				message: "Invalid token. Please request a new verification link.",
// 			});
// 		} else {
// 			return res.status(500).json({
// 				message:
// 					"An error occurred during email verification. Please try again later.",
// 			});
// 		}
// 	}
// };

// const jwtSecret = "your_jwt_secret_here"; // Replace with actual secret

// // Generate token
// const token = jwt.sign(
// 	{ username: "testuser", email: "test@example.com" },
// 	jwtSecret,
// 	{ expiresIn: "1h" }
// );
// console.log("Generated Token:", token);

// // Verify token
// try {
// 	const decoded = jwt.verify(token, jwtSecret);
// 	console.log("Decoded Token:", decoded);
// } catch (err) {
// 	console.error("Token verification error:", err);
// }
