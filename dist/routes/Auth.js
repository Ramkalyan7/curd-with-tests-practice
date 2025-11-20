import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../db/db.js";
export const authRouter = Router();
authRouter.get("/", (req, res) => {
    res.send("hellow world");
});
authRouter.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await prisma.user.findFirst({
            where: {
                email
            }
        });
        if (existingUser) {
            res.status(403).json("User with this email already exists");
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 3);
        const user = await prisma.user.create({
            data: {
                email, password: hashedPassword
            }
        });
        res.status(201).json({ user });
    }
    catch (error) {
        console.log(req);
        res.status(500).json({ error: "Error while registering" });
    }
});
authRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findFirst({
            where: {
                email
            }
        });
        if (!user) {
            res.status(500).json({ error: "User doesnot exist" });
            return;
        }
        const isPasswordVerified = await bcrypt.compare(password, user.password);
        if (!isPasswordVerified) {
            res.status(500).json({ error: "User doesnot exist" });
            return;
        }
        const jwtToken = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET || "secret");
        res.status(200).json({ token: jwtToken });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error while Loggin In" });
    }
});
//# sourceMappingURL=Auth.js.map