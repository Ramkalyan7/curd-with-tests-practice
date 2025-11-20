import type { Request, Response, NextFunction } from "express"
import Jwt from "jsonwebtoken"
import type { UserPayload } from "../types/express.js";



export const AuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.trim().split(" ")[1];


        if (!token) {
            res.status(401).json({ error: "Invalid Token" });
            return;
        }

        const decoded = Jwt.verify(token, process.env.JWT_SECRET || "secret");

        if (!decoded) {
            res.status(401).json({ error: "Invalid Token" });
            return;
        }

        req.user = decoded as UserPayload;
        next();
    } catch (error) {

        console.log(error)
        res.status(500).json({ error: "Error while authenticating user" })
    }
}
