import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ message: "Login to proceed." });
		}

		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET,
			(err, decoded) => {
				if (err) {
					if (err.name === "TokenExpiredError") {
						return res.status(401).json({ message: "Login to proceed." });
					}
					return res.status(500).json({ message: err.message });
				}
				req.user = decoded;
				next();
			}
		);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
