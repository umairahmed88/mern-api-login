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
const corsOptions = {
	origin: "https://mern-client-login.vercel.app",
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
	credentials: true,
};

app.use(cors(corsOptions));
app.use("/api/v1/auth", authRouter);
app.get("/", (req, res) => {
	res.send("API is running");
});

app.listen(process.env.PORT, () => {
	console.log(`Listening on port ${process.env.PORT}`);
});
