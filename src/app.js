import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import articleRouter from "./routes/article.routes.js";

import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import followRouter from "./routes/follow.routes.js";
import bookmarkRouter from "./routes/bookmark.routes.js";

dotenv.config({
  path: "./.env",
});

const app = express();
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

app.use("/api/v1/users", userRouter);

app.use("/api/v1/articles", articleRouter);

app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/follows",followRouter);
app.use("/api/v1/bookmarks",bookmarkRouter);


export { app };