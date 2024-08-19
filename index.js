import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";

const app = express();

mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => {
		console.log(`Connected to MongoDB`);
	})
	.catch((err) => {
		console.log("Error connecting to MongoDB", err);
	});

app.use(express.json());
app.use(cors());
app.use("/api/v1/auth", authRouter); //http://localhost:3000/api/v1/auth

app.listen(process.env.PORT, () => {
	console.log(`Listening on port ${process.env.PORT}`);
});
