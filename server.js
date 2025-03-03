require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

const AuthRoutes = require("./routes/authRoutes");
// password: 7LczopiVjQ6X4cg2

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json());

connectDB();
app.use("/api/v1/auth", AuthRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
