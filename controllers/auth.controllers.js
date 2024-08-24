import jwt from "jsonwebtoken";
import Auth from "../models/auth.model.js";
import bcryptjs from "bcryptjs";
import sgMail from "@sendgrid/mail";
import "dotenv/config.js";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const signup = async (req, res) => {
	try {
		const { username, email, password, confirmPassword } = req.body;

		if (password !== confirmPassword) {
			return res.status(400).json({ message: "Passwords do not match" });
		}

		const existingUser = await Auth.findOne({ email });
		if (existingUser) {
			return res
				.status(400)
				.json({ message: "User with email already exists" });
		}

		const hashedPassword = bcryptjs.hashSync(password, 10);

		const newUser = new Auth({
			username,
			email,
			password: hashedPassword,
		});

		await newUser.save();

		const isProduction = process.env.NODE_ENV === "production";
		const jwtSecret = isProduction
			? process.env.PROD_JWT_SECRET
			: process.env.DEV_JWT_SECRET;
		const verificationToken = jwt.sign({ id: newUser._id }, jwtSecret, {
			expiresIn: "1h",
		});

		const verificationLink = `https://ua-mern-api-login.vercel.app/api/v1/auth/verify-email?token=${verificationToken}`;

		const msg = {
			to: newUser.email,
			from: {
				name: "UA",
				email: process.env.FROM_EMAIL,
			},
			subject: "Verify Your Email",
			text: `Hello ${newUser.username}, please verify your email by clicking on the following link: ${verificationLink}`,
			html: `<p>Hello ${newUser.username},</p><p>Please verify your email by clicking on the following link:</p><a href="${verificationLink}">Verify Email</a>`,
		};

		console.log(
			"SendGrid API Key Loaded:",
			process.env.SENDGRID_API_KEY ? "Yes" : "No"
		);

		sgMail
			.send(msg)
			.then(() => {
				console.log("Verification email sent");
				res.status(201).json({
					user: {
						id: newUser._id,
						username: newUser.username,
						email: newUser.email,
					},
					message:
						"User registered successfully! Please check your email to verify your account.",
				});
			})
			.catch((error) => {
				console.error("Error sending email:", error);
				res.status(500).json({ message: "Error sending verification email" });
			});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

export const signin = async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await Auth.findOne({ email });
		if (!user) {
			return res.status(404).json("User does not exist, please sign up!");
		}

		const isValidPassword = bcryptjs.compareSync(password, user.password);
		if (!isValidPassword) {
			return res.status(403).json("Invalid credentials!");
		}

		const isProduction = process.env.NODE_ENV === "production";

		const jwtSecret = isProduction
			? process.env.PROD_JWT_SECRET
			: process.env.DEV_JWT_SECRET;

		const token = jwt.sign({ id: user._id }, jwtSecret, {
			expiresIn: 18000,
		});

		const loginUser = {
			id: user._id,
			username: user.username,
			email: user.email,
			token,
		};

		res.status(200).json({ message: "User logged in", loginUser });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
