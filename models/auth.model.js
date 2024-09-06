import mongoose from "mongoose";

const authSchema = new mongoose.Schema(
	{
		username: { type: String, required: true },
		email: { type: String, required: true },
		password: { type: String, required: true },
		avatar: { type: String, default: "" },
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
