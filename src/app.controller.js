import path from "node:path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.join("./src/config/.env.dev") });
import express from "express";
import checkConnectionDB from "./DB/connectionDB.js";
import authController from "./modules/auth/auth.controller.js";
import userController from "./modules/users/user.controller.js";
import messageController from "./modules/Message/message.controller.js";
import { globalErrorHandler } from "./utils/response.js";
import morgan from "morgan"
import cors from "cors";
import helmet from "helmet";
import {rateLimit} from 'express-rate-limit'
const bootstrap = async () => {
  const app = express();
  const port = process.env.PORT || 5000;

  app.use(cors());
  app.use(helmet());
  app.use(morgan("common"));

  const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 10,
    message: {
      error: "Too many requests from this IP, please try again later.",
    },
    statusCode: 429,
    handler: (req, res, next, options) => {
      return res.status(options.statusCode).json(options.message);
    },
    legacyHeaders: true,
    standardHeaders: 'draft-8',

  });
  app.use('/auth',limiter);

  await checkConnectionDB();
  app.use(express.json());

  app.use("/uploads", express.static(path.resolve("./src/uploads")));

  app.get("/", (req, res) => {
    res.status(200).send("Welcome to the E3terefly");
  });
  app.use("/auth", authController);
  app.use("/users", userController);
  app.use("/messages", messageController);

  app.all("{/*dummy}", (req, res, next) => {
    return res.status(404).send({ messege: "Page Not Found" });
  });

  app.use(globalErrorHandler);

  app.listen(port, () => console.log(`app listening on port ${port}!`));
};

export default bootstrap;
