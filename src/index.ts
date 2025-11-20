import express from "express";
import "dotenv/config"
import { postsRouter } from "./routes/Posts.js";
import { authRouter } from "./routes/Auth.js";


export const app = express();
app.use(express.json())


app.use("/api/auth", authRouter)
app.use("/api/posts", postsRouter)




