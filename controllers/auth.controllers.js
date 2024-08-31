import Auth from "../models/auth.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const signup = async (req, res) => {
	try {
		const { username, email, password, confirmPassword } = req.body;

		if (password !== confirmPassword) {
			return res.status(400).json({ message: "Passwords do not match" });
		}

		const existingUser = await Auth.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: "User already exists" });
		}

		const hashedPassword = bcryptjs.hashSync(password, 10);

		// Generate a verification token
		const verificationToken = jwt.sign(
			{ username, email, password: hashedPassword },
			process.env.JWT_SECRET,
			{ expiresIn: "1h" }
		);

		const verificationLink = `${
			process.env.CLIENT_URL
		}/verify-email?token=${encodeURIComponent(verificationToken)}`;
		const msg = {
			to: email,
			from: "umairahmedawn@gmail.com",
			subject: "Verify Your Email",
			text: `Hello ${username}, welcome to our family, please verify your email by clicking on the following link: ${verificationLink}`,
			html: `<p>Hello ${username},</p><p> welcome to our family, Please verify your email by clicking on the following link:</p><a href="${verificationLink}">Verify Email</a>`,
		};

		await sgMail.send(msg);
		res.status(201).json({
			message:
				"Signup successful! Please check your email to verify your account.",
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

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
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

export const signout = async (req, res) => {
	try {
		res.status(200).json("User signout successful");
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
