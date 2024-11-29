import express, {Request, Response} from "express";
import dotenv from "dotenv";
import { connection } from "./database";
dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Server is running!");
});

connection();

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
