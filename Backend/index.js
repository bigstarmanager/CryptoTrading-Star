import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./config/Database.js";
import router from "./routes/index.js";
import adminRouter from "./routes/admin_route.js";
import { SERVER_URL, SERVER_URL1 } from "./config/server.js";
dotenv.config();
const app = express();

app.use(cors({ credentials: true, origin: [SERVER_URL, SERVER_URL1] }));
app.use(cookieParser());
app.use(express.json());
app.use(router);
app.use("/admin", adminRouter);

app.listen(5000, () => console.log("Server running at port 5000"));
