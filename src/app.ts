import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

import addonRoutes from "./modules/addon/addon.routes.js";
import variantRoutes from "./modules/variant/variant.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import menuRoutes from "./modules/menu/menu.routes.js";
import restaurantroutes from "./modules/restaurant/restaurant.routes.js";
import userRoutes from "./modules/user/user.routes.js";

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/restaurants", restaurantroutes);

app.use("/api/menu", menuRoutes);
app.use("/api/addon", addonRoutes);
app.use("/api/variant", variantRoutes);
export default app;
