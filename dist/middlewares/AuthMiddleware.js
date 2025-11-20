import Jwt from "jsonwebtoken";
export const AuthMiddleware = (req, res, next) => {
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
        req.user = decoded;
        next();
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error while authenticating user" });
    }
};
//# sourceMappingURL=AuthMiddleware.js.map