import mongoose from "mongoose";

const authSchema = new mongoose.Schema(
	{
		username: { type: String, required: true },
		email: { type: String, required: true },
		password: { type: String, required: true },
		avatar: { type: String, default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" },
		isVerified: { type: Boolean, default: false },
		purchaseHistory: [
			{ type: mongoose.Schema.Types.ObjectId, ref: "ordersMern" },
		],
	},
	{
		timestamps: true,
	}
);

const Auth = mongoose.model("authMern", authSchema);

export default Auth;
