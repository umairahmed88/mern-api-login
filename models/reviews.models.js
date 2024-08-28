import mongoose from "mongoose";

const reviewsSchema = new mongoose.Schema(
	{
		productId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "productsMern",
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "authMern",
		},
		rating: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
		},
		comment: {
			type: String,
			required: true,
		},
		datePosted: {
			type: Date,
			default: Date.now,
		},
		likes: {
			type: Number,
			default: 0,
		},
		dislikes: {
			type: Number,
			default: 0,
		},
		verifiedPurchase: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

const Reviews = mongoose.model("reviewsMern", reviewsSchema);

export default Reviews;
