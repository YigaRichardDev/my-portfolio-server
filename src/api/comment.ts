import express, { Request, Response } from "express";
import { Blog } from "../database/models/blogs";
import { Comment } from "../database/models/comments";

const commentRouter = express.Router();

// Add a comment to a blog
commentRouter.post("/", async (req: Request, res: Response): Promise<void> => {
    const { blog_id, parent_comment_id, comment, name, date } = req.body;

    try {
        // Validate the blog exists
        const blogExists = await Blog.findByPk(blog_id);
        if (!blogExists) {
            res.status(404).json({
                status: "error",
                data: null,
                message: `Blog with ID ${blog_id} not found.`,
            });
            return;
        }

        // Check if parent_comment_id exists (for nested comments)
        if (parent_comment_id) {
            const parentComment = await Comment.findByPk(parent_comment_id);
            if (!parentComment) {
                res.status(400).json({
                    status: "error",
                    data: null,
                    message: `Parent comment with ID ${parent_comment_id} not found.`,
                });
                return;
            }
        }

        // Create the comment
        const newComment = await Comment.create({
            blog_id,
            parent_comment_id: parent_comment_id || null,
            comment,
            name,
            date: date || new Date(), // Default to today's date
        });

        res.status(201).json({
            status: "success",
            data: newComment,
            message: "Comment added successfully.",
        });
    } catch (err) {
        console.error("Error adding comment:", err);
        res.status(500).json({
            status: "error",
            data: null,
            message: "Internal server error.",
        });
    }
});

commentRouter.get("/:id", async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        // Find the comment by ID
        const comment = await Comment.findByPk(id, {
            include: [
                {
                    model: Blog, // Include the associated blog
                    attributes: ["id", "title"], // Select only required fields
                },
                {
                    model: Comment, // Include parent comment
                    as: "parentComment", // Use the alias defined in the model
                    attributes: ["id", "comment", "name", "date"],
                },
                {
                    model: Comment, // Include replies
                    as: "replies", // Use the alias defined in the model
                    attributes: ["id", "comment", "name", "date"],
                },
            ],
        });

        if (!comment) {
            res.status(404).json({
                status: "error",
                data: null,
                message: `Comment with ID ${id} not found.`,
            });
            return;
        }

        res.status(200).json({
            status: "success",
            data: comment,
            message: "Comment fetched successfully.",
        });
    } catch (err) {
        console.error("Error fetching comment:", err);
        res.status(500).json({
            status: "error",
            data: null,
            message: "Internal server error.",
        });
    }
});


commentRouter.get("/", async (req: Request, res: Response): Promise<void> => {
    try {
        // Fetch all comments and include the associated blog's title
        const comments = await Comment.findAll({
            include: [
                {
                    model: Blog,
                    attributes: ["title"], // Include only the blog title
                },
            ],
            order: [["created_at", "DESC"]], // Sort by creation date
        });

        res.status(200).json({
            status: "success",
            data: comments,
            message: "Comments fetched successfully.",
        });
    } catch (err) {
        console.error("Error fetching comments:", err);
        res.status(500).json({
            status: "error",
            data: null,
            message: "Internal server error.",
        });
    }
});

commentRouter.delete("/:id", async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        // Find the comment by ID
        const comment = await Comment.findByPk(id);

        if (!comment) {
            res.status(404).json({
                status: "error",
                data: null,
                message: `Comment with ID ${id} not found.`,
            });
            return;
        }

        // Delete the comment
        await comment.destroy();

        res.status(200).json({
            status: "success",
            data: null,
            message: `Comment with ID ${id} deleted successfully.`,
        });
    } catch (err) {
        console.error("Error deleting comment:", err);
        res.status(500).json({
            status: "error",
            data: null,
            message: "Internal server error.",
        });
    }
});


export default commentRouter;
