import express, { Application, Request, Response } from "express";
import router from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/middlewares/notFound";
import cors from "cors";
import cookieParser from "cookie-parser";

const app: Application = express();

// parsers
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://mealmart.vercel.app",
    ],
    credentials: true,
  }),
);

// routes
app.use("/api", router);

app.get("/", (req: Request, res: Response) => {
  res.send({
    status: true,
    message: "Server Live ⚡",
  });
});

// middlewares
app.use(globalErrorHandler);
//Not Found
app.use(notFound);

export default app;
