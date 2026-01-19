import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./utils/db.js";
import { notFound, errorHandler } from "./middleware/error.js";
import userRoutes from "./routes/user.js";



// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json({ limit: "15mb" }));

// CORS
app.use(cors());

// Routes
app.use("/api/users", userRoutes);


// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
