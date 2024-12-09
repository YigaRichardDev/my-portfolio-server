import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import upload from "../lib/multer/multer";
import { Blog } from "../database/models/blogs";

const blogRouter = express.Router();

blogRouter.post("/add-blog", upload.single("image"), async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, user_id, category, meta_description } = req.body;

    if (!title || !content || !user_id || !category) {
      res.status(400).json({
        status: "error",
        message: "Title, content, user_id, and category are required.",
      });
      return;
    }

    const filePath = req.file ? `/uploads/${req.file.filename}` : null;

    const newBlog = await Blog.create({
      title,
      content,
      image: filePath,
      user_id,
      category,
      slug: title.toLowerCase().replace(/\s+/g, "-"),
      meta_description,
      date: new Date(),
    });

    res.status(201).json({
      status: "success",
      data: newBlog,
      message: "Blog added successfully.",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error.",
    });
  }
});

blogRouter.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const blogs = await Blog.findAll();

    if (!blogs.length) {
      res.status(404).json({
        status: "error",
        data: null,
        message: "No blogs found.",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      data: blogs,
      message: "Blogs retrieved successfully.",
    });
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res.status(500).json({
      status: "error",
      data: null,
      message: "Internal server error.",
    });
  }
});

blogRouter.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // Fetch the blog by ID
    const blog = await Blog.findByPk(id);

    if (!blog) {
      res.status(404).json({
        status: "error",
        data: null,
        message: `Blog with ID ${id} not found.`,
      });
      return;
    }

    res.status(200).json({
      status: "success",
      data: blog,
      message: "Blog retrieved successfully.",
    });
  } catch (err) {
    console.error("Error fetching blog:", err);
    res.status(500).json({
      status: "error",
      data: null,
      message: "Internal server error.",
    });
  }
});

blogRouter.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // Check if the blog exists
    const blog = await Blog.findByPk(id);

    if (!blog) {
      res.status(404).json({
        status: "error",
        data: null,
        message: `Blog with ID ${id} not found.`,
      });
      return;
    }

    // Delete the blog
    await blog.destroy();

    res.status(200).json({
      status: "success",
      data: null,
      message: `Blog deleted successfully.`,
    });
  } catch (err) {
    console.error("Error deleting blog:", err);
    res.status(500).json({
      status: "error",
      data: null,
      message: "Internal server error.",
    });
  }
});

blogRouter.put("/:id", upload.single("image"), async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { title, content, category, meta_description } = req.body;

    try {
      // Find the blog by ID
      const blog = await Blog.findByPk(id);

      if (!blog) {
        res.status(404).json({
          status: "error",
          data: null,
          message: `Blog with ID ${id} not found.`,
        });
        return;
      }

      let imagePath = blog.image;

      // Handle new image upload
      if (req.file) {
        // Construct the path for the uploaded file
        const newImagePath = `/uploads/${req.file.filename}`;

        // If there's an old image, delete it
        if (imagePath) {
          const oldImagePath = path.join(__dirname, "../../", imagePath);
          fs.unlink(oldImagePath, (err) => {
            if (err) console.error("Error deleting old image:", err);
          });
        }

        // Update the image path
        imagePath = newImagePath;
      }

      // Update blog details
      blog.title = title || blog.title;
      blog.content = content || blog.content;
      blog.category = category || blog.category;
      blog.meta_description = meta_description || blog.meta_description;
      blog.image = imagePath;
      // Update the slug if the title is updated
      if (title) {
        blog.slug =title.toLowerCase().replace(/\s+/g, "-");
      }

      await blog.save();

      res.status(200).json({
        status: "success",
        data: blog,
        message: "Blog updated successfully.",
      });
    } catch (err) {
      console.error("Error updating blog:", err);
      res.status(500).json({
        status: "error",
        data: null,
        message: "Internal server error.",
      });
    }
  }
);

export default blogRouter;
