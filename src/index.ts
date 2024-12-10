import express, {Request, Response} from "express";
import dotenv from "dotenv";
import path from "path";
import { connection } from "./database";
import userRouter from "./api/user";
import blogRouter from "./api/blog";
import commentRouter from "./api/comment";
import contactRouter from "./api/contact";
import testimonialRouter from "./api/testimonial";
import projectRouter from "./api/project";
import serviceRouter from "./api/service";
import serviceDetailRouter from "./api/serviceDetail";

dotenv.config();

const app = express();
app.use(express.json());

// Serve the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req: Request, res: Response) => {
    res.send("Server is running!");
});

app.use("/api/users", userRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/comments", commentRouter);
app.use("/api/contacts", contactRouter);
app.use("/api/testimonials", testimonialRouter);
app.use("/api/projects", projectRouter);
app.use("/api/services", serviceRouter);
app.use("/api/service-details", serviceDetailRouter);

connection();

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
