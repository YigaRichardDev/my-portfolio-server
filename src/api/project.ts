import express, { Request, Response } from "express";
import upload from "../lib/multer/multer";
import path from "path";
import fs from "fs";
import { Project } from "../database/models/projects";

const projectRouter = express.Router();

// 1. Add a New Project
projectRouter.post("/", upload.single("image"), async (req: Request, res: Response): Promise<void> => {
    const { name, category, link } = req.body;

    try {
        const image = req.file ? `/uploads/${req.file.filename}` : null;

        // Check for duplicate records
        const existingProject = await Project.findOne({
            where: { name, category, link },
        });

        if (existingProject) {
            res.status(409).json({
                status: "error",
                data: null,
                message: "A project with the same name and category already exists.",
            });
            return;
        }

        // Create a new project
        const project = await Project.create({
            name,
            category,
            image,
            link,
        });

        res.status(201).json({
            status: "success",
            data: project,
            message: "Project added successfully.",
        });
    } catch (err) {
        console.error("Error adding project:", err);
        res.status(500).json({
            status: "error",
            data: null,
            message: "Internal server error.",
        });
    }
});

// 2. Get All Projects
projectRouter.get("/", async (_req: Request, res: Response): Promise<void> => {
    try {
        const projects = await Project.findAll();
        res.status(200).json({
            status: "success",
            data: projects,
        });
    } catch (err) {
        console.error("Error fetching projects:", err);
        res.status(500).json({
            status: "error",
            data: null,
            message: "Internal server error.",
        });
    }
});

// 3. Get a Single Project by ID
projectRouter.get("/:id", async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const project = await Project.findByPk(id);

        if (!project) {
            res.status(404).json({
                status: "error",
                data: null,
                message: `Project with ID ${id} not found.`,
            });
            return;
        }

        res.status(200).json({
            status: "success",
            data: project,
        });
    } catch (err) {
        console.error("Error fetching project:", err);
        res.status(500).json({
            status: "error",
            data: null,
            message: "Internal server error.",
        });
    }
});

// 4. Update a Project
projectRouter.put("/:id", upload.single("image"), async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, category, link } = req.body;

    try {
        const project = await Project.findByPk(id);

        if (!project) {
            res.status(404).json({
                status: "error",
                data: null,
                message: `Project with ID ${id} not found.`,
            });
            return;
        }

        let imagePath = project.image;

        // Handle new image upload
        if (req.file) {
            const newImagePath = `/uploads/${req.file.filename}`;

            // Delete old image if it exists
            if (imagePath) {
                const oldImagePath = path.join(__dirname, "../../", imagePath);
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.error("Error deleting old image:", err);
                });
            }

            imagePath = newImagePath;
        }

        // Update project details
        project.name = name || project.name;
        project.category = category || project.category;
        project.link = link || project.link;
        project.image = imagePath;

        await project.save();

        res.status(200).json({
            status: "success",
            data: project,
            message: "Project updated successfully.",
        });
    } catch (err) {
        console.error("Error updating project:", err);
        res.status(500).json({
            status: "error",
            data: null,
            message: "Internal server error.",
        });
    }
});

// 5. Delete a Project
projectRouter.delete("/:id", async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const project = await Project.findByPk(id);

        if (!project) {
            res.status(404).json({
                status: "error",
                data: null,
                message: `Project with ID ${id} not found.`,
            });
            return;
        }

        // Delete the associated image if it exists
        if (project.image) {
            const imagePath = path.join(__dirname, "../../", project.image);
            fs.unlink(imagePath, (err) => {
                if (err) console.error("Error deleting project image:", err);
            });
        }

        await project.destroy();

        res.status(200).json({
            status: "success",
            data: null,
            message: `Project with ID ${id} deleted successfully.`,
        });
    } catch (err) {
        console.error("Error deleting project:", err);
        res.status(500).json({
            status: "error",
            data: null,
            message: "Internal server error.",
        });
    }
});

export default projectRouter;
