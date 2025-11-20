import { Router, type Request } from "express";
import { AuthMiddleware } from "../middlewares/AuthMiddleware.js";
import type { UserPayload } from "../types/express.js";
import { prisma } from "../db/db.js";

export const postsRouter = Router()


//typescript assertion function
function assertUser(req: Request): asserts req is Request & { user: UserPayload } {
    if (!req.user) {
        throw new Error("User not found on request");
    }
}


postsRouter.get("/", (req, res) => {
    res.send("hellow world")
})




postsRouter.get("/user", AuthMiddleware, async (req, res) => {
    try {
        assertUser(req)

        const blogs = await prisma.blog.findMany({
            where: {
                user_id: req.user.user_id
            }
        })
        console.log(blogs, "blogs")

        if (!blogs) {
            res.status(401).json("Error bad request");
            return;
        }

        res.status(400).json(blogs);

    } catch (error) {

        console.log(error)
        res.status(500).json("Unexpected while fetching Posts");
    }
})


postsRouter.get("/:blogId", AuthMiddleware, async (req, res) => {
    try {
        const { blogId } = req.params;

        if (!blogId) {
            res.status(400).json({ error: "error bad request" })
            return;
        }

        const blog = await prisma.blog.findFirst({
            where: {
                id: blogId
            }
        })

        res.status(200).json(blog);

    } catch (error) {
        console.log(error)
        res.status(500).json("Error while getting the post")
    }
})


postsRouter.post("/create", AuthMiddleware, async (req, res) => {
    try {
        assertUser(req)

        const { title, description } = req.body;

        if (!title || title.length <= 0 || !description || description.length <= 0) {
            res.status(400).json({ message: "Error , bad request" })
            return
        }

        const blog = await prisma.blog.create({
            data: {
                title,
                description,
                user_id: req.user.user_id
            }
        })
        res.status(201).json({ blog })
    } catch (error) {

        console.log(error)
        res.status(500).json({ error: "Error while creating the post" })
    }

})


postsRouter.delete("/delete/:blogId", async (req, res) => {

    try {
        const { blogId } = req.params;

        if (!blogId) {
            res.status(400).json({ error: "Error bad request" });
            return;
        }

        const response = await prisma.blog.delete({
            where: {
                id: blogId
            }
        })

        if (!response) {
            res.status(400).json("Error while deleteing the post");
            return;
        }

        res.status(200).json(response);
    } catch (error) {
        console.log(error)
        res.status(500).json({ Error: "Unexpected Error while deleting the post" })
    }
})




postsRouter.put("/update", async (req, res) => {

    try {
        const { title, description, id } = req.body;

        if (!title || title.length <= 0 || !description || description.length <= 0 || !id) {
            res.status(400).json({ message: "Error , bad request" })
            return;
        }

        const blog = await prisma.blog.update({
            where: {
                id
            },
            data: {
                title, description
            }

        })

        if (!blog) {
            res.status(400).json("Error while Updating the post");
            return;
        }
        res.status(200).json(blog)
    } catch (error) {
        console.log(error)
        res.status(500).json({ Error: "Error while updating the post" })
    }
})




