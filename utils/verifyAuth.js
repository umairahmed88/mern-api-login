export const verifyToken = async (req, res, next) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({
				message: "Sign in please.",
			});
		}

        const isProduction = process.env.NODE_ENV=== 'production' 

        const jwtSecret = isProduction ? process.env.PROD_JWT_SECRET : process.env.DEV_JWT_SECRET

		const decoded = jwt.verify(token, jwtSecret, 
            (err, decoded) => {
                if(err) {
                    if(err.name === 'TokenExpiredError') {
                        return res.status(401).json('Token expired, please sign in again.')
                    }
                    return res.status(500).json({message: err.message})
                }
                req.user = decoded
                next()
            });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

