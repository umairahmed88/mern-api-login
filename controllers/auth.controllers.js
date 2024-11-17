import { Auth } from "../models/auth.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import sgMail from "@sendgrid/mail";
import validator from "validator";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const isPasswordValid = (password) => {
	if (!validator.isLength(password, { min: 8 }))
		return "Password must be at least 8 characters long.";
	if (!/[A-Z]/.test(password))
		return "Password must contain at least one uppercase letter.";
	if (!/[a-z]/.test(password))
		return "Password must contain at least one lowercase letter.";
	if (!/[0-9]/.test(password))
		return "Password must contain at least one number.";
	if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
		return "Password must contain at least one special character.";
	const commonPasswords = ["123456", "password", "12345678"];
	if (commonPasswords.includes(password))
		return "Please choose a stronger password.";
	return null;
};

const sanitizeUser = (user) => ({
	id: user._id,
	username: user.username,
	email: user.email,
	role: user.role,
	avatar: user.avatar,
});

// updated
export const signup = async (req, res) => {
	try {
		const { username, email, password, confirmPassword, avatar } = req.body;

		if (password !== confirmPassword) {
			return res.status(400).json({ message: "Passwords do not match." });
		}

		const passwordError = isPasswordValid(password);
		if (passwordError) {
			return res.status(400).json({ message: passwordError });
		}

		const isUser = await Auth.findOne({ email });
		if (isUser) {
			return res.status(400).json({
				message:
					"User with this email already signed up. Please signup with other email.",
			});
		}

		const role = req.body.role || "user";

		const hashedPassword = bcryptjs.hashSync(password, 10);

		const verificationToken = jwt.sign(
			{
				username,
				email,
				password: hashedPassword,
				role,
				avatar,
			},
			process.env.JWT_SECRET,
			{ expiresIn: "1h" }
		);

		const verificationLink = `${
			process.env.CLIENT_URL
		}/verify-email?token=${encodeURIComponent(verificationToken)}`;

		const msg = {
			to: email,
			from: process.env.VERIFICATION_EMAIL_FROM,
			subject: "Verify your email address",
			text: `Hello ${username}, welcome to our e-commerce web app, please verify email by clicking on the following link: ${verificationLink}`,
			html: `<p>Hello ${username},</p><p> welcome to our e-commerce web app, please verify email by clicking on the following link:</p><a href="${verificationLink}">Verify Email</a>`,
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

// updated
export const signin = async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await Auth.findOne({ email });
		if (!user) {
			return res.status(404).json({
				message:
					"User not found. Please enter a valid email address or signup.",
			});
		}

		const isValidPassword = bcryptjs.compareSync(password, user.password);
		if (!isValidPassword) {
			return res.status(403).json({ message: "Invalid credentials" });
		}

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "1h",
		});

		const sanitizedUser = {
			...sanitizeUser(user),
			token,
		};

		res.status(200).json({ message: "Login Successful", sanitizedUser });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// updated
export const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;

		const user = await Auth.findOne({ email });

		if (!user) {
			return res
				.status(404)
				.json({ message: "Please signup, you have not signed up" });
		}

		const resetPasswordToken = jwt.sign(
			{ id: user._id },
			process.env.JWT_SECRET,
			{
				expiresIn: "20m",
			}
		);

		const resetPasswordVerificationLink = `${
			process.env.CLIENT_URL
		}/reset-password?token=${encodeURIComponent(resetPasswordToken)}`;

		const msg = {
			to: email,
			from: process.env.VERIFICATION_EMAIL_FROM,
			subject: "Password Reset Request",
			html: `<p>Hello ${user.username}, <p>
			<p>You requested to reset your password. Please click the link below to reset your password: <p>
			<a href="${resetPasswordVerificationLink}">Reset Password</a>
			<p>If you did not request this, please ignore this email.</p>`,
		};

		await sgMail.send(msg);

		res
			.status(200)
			.json({ message: "Password reset link has been sent to your email." });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// updated
export const google = async (req, res) => {
	try {
		const { email, name, avatar } = req.body;

		const user = await Auth.findOne({ email });

		if (user) {
			const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
				expiresIn: "1h",
			});

			const sanitizedUser = {
				...sanitizeUser(user),
				token,
			};
			return res
				.status(200)
				.json({ message: "singed in with google", sanitizedUser });
		} else {
			const generatedPassword =
				Math.random().toString(36).slice(-8) +
				Math.random().toString(36).slice(-8);

			const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

			const newUser = new Auth({
				username: name,
				email: email,
				password: hashedPassword,
				avatar: avatar,
			});

			await newUser.save();

			const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
				expiresIn: "1h",
			});

			const sanitizedUser = {
				...sanitizeUser(newUser),
				token,
			};

			return res
				.status(200)
				.json({ message: "signed up with google", sanitizedUser });
		}
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// updated
export const updateUser = async (req, res) => {
	try {
		const { id } = req.params;

		const { username, email: newEmail, password, avatar } = req.body;

		const user = await Auth.findById(id);
		if (!user) {
			return res.status(404).json({ message: "Please login first." });
		}

		if (newEmail && newEmail !== user.email) {
			const existingUser = await Auth.findOne({ email: newEmail });
			if (existingUser) {
				return res.status(400).json({
					message: `Email ${newEmail} is already signed up, try another email.`,
				});
			}

			const verificationToken = jwt.sign(
				{
					id: user._id,
					username: user.username,
					email: newEmail,
					password: user.password,
					avatar: user.avatar,
				},
				process.env.JWT_SECRET,
				{ expiresIn: "1h" }
			);

			const verificationLink = `${
				process.env.CLIENT_URL
			}/verify-email?token=${encodeURIComponent(verificationToken)}`;

			const msg = {
				to: newEmail,
				from: process.env.VERIFICATION_EMAIL_FROM,
				subject: "Verify your new email address",
				text: `Hello ${user.username}, please verify your new email address by clicking the following link: ${verificationLink}`,
				html: `<p>Hello ${user.username},</p><p>Please verify your new email address by clicking the following link:</p><a href="${verificationLink}">Verify Email</a>`,
			};

			await sgMail.send(msg);

			return res.status(200).json({
				message:
					"An email has been sent to your new email address. Please verify your new email address to complete the update.",
			});
		}

		if (password) {
			const passwordError = isPasswordValid(password);
			if (passwordError) {
				return res.status(400).status({ message: passwordError });
			}

			req.body.password = bcryptjs.hashSync(password, 10);
		}

		const updatedUser = await Auth.findByIdAndUpdate(
			id,
			{ $set: req.body },
			{ new: true }
		);

		const token = jwt.sign({ id: updatedUser._id }, process.env.JWT_SECRET, {
			expiresIn: "1h",
		});

		const sanitizedUser = {
			...sanitizeUser(updatedUser),
			token,
		};

		res.status(200).json({ message: "Profile updated", sanitizedUser });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

export const signout = async (req, res) => {
	try {
		res.status(200).json({ message: "signed out" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
