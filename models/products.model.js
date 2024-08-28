import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		description: { type: String },
		price: { type: Number, required: true },
		category: { type: String },
		quantity: { type: Number, required: true },
		discount: { type: Number },
		link: { type: String },
		brand: { type: String },
		manufacturerPartNumber: { type: String },
		countryOfOrigin: { type: String },
		imageUrls: [
			{
				type: String,
				default:
					"https://wallpapers.com/images/high/beautiful-hd-flowers-in-a-vase-y15tgmdmq9vgvvbz.webp",
			},
		],
		specifications: [
			{
				size: String,
				color: String,
				material: String,
				weight: Number,
				dimensions: String,
				warrantyPeriod: String,
			},
		],
		reviews: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "reviewsMern",
			},
		],
	},
	{
		timestamps: true,
	}
);

const Product = mongoose.models("productsMern", productSchema);

export default Product;
