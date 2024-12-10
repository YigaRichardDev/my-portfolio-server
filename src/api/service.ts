import express, { Request, Response } from "express";
import { Service } from "../database/models/services";
import upload from "../lib/multer/multer";
import path from "path";
import fs from "fs";

const serviceRouter = express.Router();

// 1. Add a New Service
serviceRouter.post("/", upload.single("image"), async (req: Request, res: Response): Promise<void> => {
    const { title, description } = req.body;

    try {
        // Check for duplicate service with the same slug
        const existingService = await Service.findOne({
            where: { title: title },
        });

        if (existingService) {
            res.status(409).json({
                status: "error",
                message: "A service with this title already exists.",
            });
            return;
        }

        // Handle image upload
        const image = req.file ? `/uploads/${req.file.filename}` : null;

        // Create the new service
        const service = await Service.create({
            title,
            description,
            image,
            slug: title.toLowerCase().replace(/\s+/g, "-"),
        });

        res.status(201).json({
            status: "success",
            data: service,
            message: "Service added successfully.",
        });
    } catch (err) {
        console.error("Error adding service:", err);
        res.status(500).json({
            status: "error",
            message: "Internal server error.",
        });
    }
});

// 2. Get All Services
serviceRouter.get("/", async (_req: Request, res: Response): Promise<void> => {
    try {
        const services = await Service.findAll();
        res.status(200).json({
            status: "success",
            data: services,
        });
    } catch (err) {
        console.error("Error fetching services:", err);
        res.status(500).json({
            status: "error",
            message: "Internal server error.",
        });
    }
});

// 3. Get a Single Service by ID
serviceRouter.get("/:id", async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const service = await Service.findByPk(id);

        if (!service) {
            res.status(404).json({
                status: "error",
                message: `Service with ID ${id} not found.`,
            });
            return;
        }

        res.status(200).json({
            status: "success",
            data: service,
        });
    } catch (err) {
        console.error("Error fetching service:", err);
        res.status(500).json({
            status: "error",
            message: "Internal server error.",
        });
    }
});

// 4. Update a Service
serviceRouter.put("/:id", upload.single("image"), async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { title, description } = req.body;

    try {
        const service = await Service.findByPk(id);

        if (!service) {
            res.status(404).json({
                status: "error",
                message: `Service with ID ${id} not found.`,
            });
            return;
        }

        // Handle image update if a new one is uploaded
        let imagePath = service.image;
        if (req.file) {
            imagePath = `/uploads/${req.file.filename}`;
            // Delete old image if it exists
            if (imagePath) {
                const oldImagePath = path.join(__dirname, "../../", imagePath);
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.error("Error deleting old image:", err);
                });
            }
        }

        // Update service details
        service.title = title || service.title;
        service.description = description || service.description;
        service.image = imagePath;
        // Update the slug if the title is updated
        if (title) {
            service.slug = title.toLowerCase().replace(/\s+/g, "-");
        }

        await service.save();

        res.status(200).json({
            status: "success",
            data: service,
            message: "Service updated successfully.",
        });
    } catch (err) {
        console.error("Error updating service:", err);
        res.status(500).json({
            status: "error",
            message: "Internal server error.",
        });
    }
});

// 5. Delete a Service
serviceRouter.delete("/:id", async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const service = await Service.findByPk(id);

        if (!service) {
            res.status(404).json({
                status: "error",
                message: `Service with ID ${id} not found.`,
            });
            return;
        }

        // Delete the associated image if it exists
        if (service.image) {
            const imagePath = path.join(__dirname, "../../", service.image);
            fs.unlink(imagePath, (err) => {
                if (err) console.error("Error deleting project image:", err);
            });
        }

        await service.destroy();

        res.status(200).json({
            status: "success",
            message: `Service with ID ${id} deleted successfully.`,
        });
    } catch (err) {
        console.error("Error deleting service:", err);
        res.status(500).json({
            status: "error",
            message: "Internal server error.",
        });
    }
});

export default serviceRouter;
