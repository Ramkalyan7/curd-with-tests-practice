import { Router } from "express";
export const usersRouter = Router();
usersRouter.get("/", (req, res) => {
    res.send("hellow world");
});
//# sourceMappingURL=Users.js.map