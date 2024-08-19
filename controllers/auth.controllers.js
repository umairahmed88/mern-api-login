import jwt from "jsonwebtoken";
import Auth from "../models/auth.model.js";
import bcryptjs from "bcryptjs";

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

		res.status(201).json({
			user: {
				id: newUser._id,
				username: newUser.username,
				email: newUser.email,
			},
			message: "User registered successfully!",
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
