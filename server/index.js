require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connection = require("./config/dbConfig");
const corsMiddleware = require("./middlewares/corsMiddleware");
const departmentRoutes = require("./routes/departmentRoutes");
const digitalSignatureRoutes = require("./routes/digitalSignatureRoutes");
const userRoutes = require("./routes/userRoutes");
const voucherRoutes = require("./routes/voucherRoutes");

// Connect to the database
connection;

app.use(express.json());
app.use(cookieParser());
app.use(corsMiddleware);
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    exposedHeaders: ["Set-Cookie"],
  })
);

app.use("/v1/api/departments", departmentRoutes);
app.use("/v1/api/digitalsignatures", digitalSignatureRoutes);
app.use("/v1/api/users", userRoutes);
app.use("/v1/api/vouchers", voucherRoutes);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
