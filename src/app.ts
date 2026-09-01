import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { corsMiddleware } from "./middlewares/cors.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import router from "./routes/index.js";

const app = express();

app.use(corsMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.use("/api", router);

app.use(errorMiddleware.notFoundHandler);
app.use(errorMiddleware.errorHandler);

export default app;
