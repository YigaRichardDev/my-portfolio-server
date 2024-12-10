import express, { Request, Response } from "express";
import { Testimonial } from "../database/models/testimonials";
import upload from "../lib/multer/multer";
import path from "path";
import fs from "fs";

const testimonialRouter = express.Router();


// 1. Add a New Testimonial
testimonialRouter.post("/", upload.single("image"), async (req: Request, res: Response): Promise<void> => {
    const { name, message } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        // Check for duplicates by name and message
        const existingTestimonial = await Testimonial.findOne({
            where: { name, message },
        });

        if (existingTestimonial) {
            res.status(400).json({
                status: "error",
                data: null,
                message: "A testimonial with the same name and message already exists.",
            });
            return;
        }

        const testimonial = await Testimonial.create({ name, message, image });
        res.status(201).json({
            status: "success",
            data: testimonial,
            message: "Testimonial added successfully.",
        });
    } catch (err) {
        console.error("Error adding testimonial:", err);
        res.status(500).json({
            status: "error",
            data: null,
            message: "Internal server error.",
        });
    }
}
);

// 2. Get All Testimonials
testimonialRouter.get("/", async (_req: Request, res: Response): Promise<void> => {
    try {
        const testimonials = await Testimonial.findAll();
        res.status(200).json({
            status: "success",
            data: testimonials,
        });
    } catch (err) {
        console.error("Error fetching testimonials:", err);
        res.status(500).json({
            status: "error",
            data: null,
            message: "Internal server error.",
        });
    }
});

// 3. Get a Single Testimonial by ID
testimonialRouter.get("/:id", async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const testimonial = await Testimonial.findByPk(id);

        if (!testimonial) {
            res.status(404).json({
                status: "error",
                data: null,
                message: `Testimonial with ID ${id} not found.`,
            });
            return;
        }

        res.status(200).json({
            status: "success",
            data: testimonial,
        });
    } catch (err) {
        console.error("Error fetching testimonial:", err);
        res.status(500).json({
            status: "error",
            data: null,
            message: "Internal server error.",
        });
    }
});

// 4. Update a Testimonial
testimonialRouter.put("/:id", upload.single("image"), async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, message } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        // Check if the testimonial exists
        const testimonial = await Testimonial.findByPk(id);

        if (!testimonial) {
            res.status(404).json({
                status: "error",
                data: null,
                message: `Testimonial with ID ${id} not found.`,
            });
            return;
        }

        // Delete the old image if a new one is uploaded
        if (image && testimonial.image) {
            const oldImagePath = path.join(__dirname, "../../", testimonial.image);
            fs.unlinkSync(oldImagePath);
        }

        // Update the testimonial fields
        testimonial.name = name || testimonial.name;
        testimonial.message = message || testimonial.message;
        testimonial.image = image || testimonial.image;

        // Save the updated testimonial
        await testimonial.save();

        res.status(200).json({
            status: "success",
            data: testimonial,
            message: "Testimonial updated successfully.",
        });
    } catch (err) {
        console.error("Error updating testimonial:", err);
        res.status(500).json({
            status: "error",
            data: null,
            message: "Internal server error.",
        });
    }
});

// 5. Delete a Testimonial
testimonialRouter.delete("/:id", async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const testimonial = await Testimonial.findByPk(id);

        if (!testimonial) {
            res.status(404).json({
                status: "error",
                data: null,
                message: `Testimonial with ID ${id} not found.`,
            });
            return;
        }

        // Delete the associated image
        if (testimonial.image) {
            const oldImagePath = path.join(__dirname, "../../", testimonial.image);
            fs.unlinkSync(oldImagePath);
        }

        await testimonial.destroy();

        res.status(200).json({
            status: "success",
            data: null,
            message: `Testimonial with ID ${id} deleted successfully.`,
        });
    } catch (err) {
        console.error("Error deleting testimonial:", err);
        res.status(500).json({
            status: "error",
            data: null,
            message: "Internal server error.",
        });
    }
});

export default testimonialRouter;
