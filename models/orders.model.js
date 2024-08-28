import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "authMern",
			required: true,
		},
		totalAmount: {
			type: Number,
			required: true,
		},
		orderStatus: {
			type: String,
			enum: [
				"Pending",
				"Confirmed",
				"Processing",
				"Shipped",
				"Delivered",
				"Cancelled",
			],
			default: "Pending",
		},
		shippingAddress: {
			addressLine1: { type: String, required: true },
			addressLine2: { type: String },
			city: { type: String, required: true },
			state: { type: String, required: true },
			postalCode: { type: String, required: true },
			country: { type: String, required: true },
		},
		contactNum: { type: String },
		paymentMethod: {
			type: String,
			enum: ["COD", "Stripe"],
			required: true,
		},
		paymentStatus: {
			type: String,
			enum: ["Pending", "Paid", "COD", "Failed"],
			default: "Pending",
		},
		deliveryStatus: {
			type: String,
			enum: [
				"Pending",
				"Processing",
				"Dispatched",
				"Shipped",
				"Delivered",
				"Cancelled",
				"Returned",
			],
			default: "Pending",
		},
		cartItems: [
			{
				productId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "productsMern",
				},
				quantity: { type: Number, required: true },
			},
		],
	},
	{ timestamps: true }
);

const Order = mongoose.model("ordersMern", orderSchema);

export default Order;
