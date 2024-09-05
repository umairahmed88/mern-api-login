import Auth from "../models/auth.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sanitizeUser = (user) => ({
	id: user._id,
	username: user.username,
	email: user.email,
	avatar: user.avatar,
});

export const signup = async (req, res) => {
	try {
		const { username, email, password, confirmPassword, avatar } = req.body;

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
			{ username, email, password: hashedPassword, avatar },
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
			expiresIn: "1h",
		});

		const sanitizedUser = {
			...sanitizeUser(user),
			token,
		};

		res.status(200).json({ message: "User logged in", sanitizedUser });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

export const updateUser = async (req, res) => {
	try {
		const { id } = req.params;
		const { username, email: newEmail, password, avatar } = req.body;

		const user = await Auth.findById(id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Check if the email is being changed
		if (newEmail && newEmail !== user.email) {
			const existingUser = await Auth.findOne({ email: newEmail });
			if (existingUser) {
				return res.status(400).json({
					message: "User with this email already exists. Try another email.",
				});
			}

			// Generate a new verification token for the new email
			const verificationToken = jwt.sign(
				{ email: newEmail, username: user.username },
				process.env.JWT_SECRET,
				{ expiresIn: "1h" }
			);
			const verificationLink = `${
				process.env.CLIENT_URL
			}/verify-email?token=${encodeURIComponent(verificationToken)}`;
			const msg = {
				to: newEmail,
				from: "umairahmedawn@gmail.com",
				subject: "Verify Your New Email Address",
				text: `Hello ${user.username}, please verify your new email address by clicking on the following link: ${verificationLink}`,
				html: `<p>Hello ${user.username},</p><p>Please verify your new email address by clicking on the following link:</p><a href="${verificationLink}">Verify Email</a>`,
			};

			await sgMail.send(msg);

			return res.status(200).json({
				message:
					"User updated. Email has sent to your provided email. Please verify your new email address by following the link sent to your new email.",
			});
		}

		// Hash the password if it is being updated
		if (password) {
			req.body.password = bcryptjs.hashSync(password, 10);
		}

		const updatedUser = await Auth.findByIdAndUpdate(
			id,
			{ $set: Object.assign(user.toObject(), req.body) },
			{ new: true }
		);

		if (!updatedUser) {
			return res.status(500).json({ message: "Failed to update user" });
		}

		const token = jwt.sign({ id: updatedUser._id }, process.env.JWT_SECRET, {
			expiresIn: "1h",
		});

		const sanitizedUser = {
			...sanitizeUser(updatedUser),
			token,
		};

		res
			.status(200)
			.json({ message: "User updated successfully.", sanitizedUser });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

export const signout = async (req, res) => {
	try {
		res.status(200).clearCookie("token").json("User signout successful");
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
