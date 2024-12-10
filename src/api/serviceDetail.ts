import express, { Request, Response } from "express";
import { Service } from "../database/models/services"; // Import Service model
import { ServiceDetail } from "../database/models/services/serviceDetails";
import upload from "../lib/multer/multer"; // For image upload
import path from "path";
import fs from "fs";

const serviceDetailRouter = express.Router();

// 1. Add a New Service Detail
serviceDetailRouter.post("/", upload.single("image"), async (req: Request, res: Response): Promise<void> => {
    const { service_id, detail, approach } = req.body;

    try {
        // Check if the associated service exists
        const service = await Service.findByPk(service_id);
        if (!service) {
            res.status(404).json({
                status: "error",
                message: `Service with ID ${service_id} not found.`,
            });
            return;
        }

        // Handle image upload
        const image = req.file ? `/uploads/${req.file.filename}` : null;

        // Check for duplicate records
        const existingProject = await ServiceDetail.findOne({
            where: { service_id: service_id },
        });

        if (existingProject) {
            res.status(409).json({
                status: "error",
                data: null,
                message: "Service Details with the same service ID already exists.",
            });
            return;
        }
        // Create new service detail
        const serviceDetail = await ServiceDetail.create({
            service_id,
            detail,
            approach,
            image,
        });

        res.status(201).json({
            status: "success",
            data: serviceDetail,
            message: "Service detail added successfully.",
        });
    } catch (err) {
        console.error("Error adding service detail:", err);
        res.status(500).json({
            status: "error",
            message: "Internal server error.",
        });
    }
});

// 2. Get All Service Details with Service Titles
serviceDetailRouter.get("/", async (_req: Request, res: Response): Promise<void> => {
    try {
        // Fetch all service details with their corresponding service titles
        const serviceDetailsWithTitles = await ServiceDetail.findAll({
            include: [
                {
                    model: Service,
                    attributes: ['title'], // Only include the title of the service
                }
            ],
        });

        if (serviceDetailsWithTitles.length === 0) {
            res.status(404).json({
                status: "error",
                message: "No service details found.",
            });
            return;
        }

        res.status(200).json({
            status: "success",
            data: serviceDetailsWithTitles,
        });
    } catch (err) {
        console.error("Error fetching service details with titles:", err);
        res.status(500).json({
            status: "error",
            message: "Internal server error.",
        });
    }
});


// 3. Get a Single Service Detail by ID
serviceDetailRouter.get("/:id", async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const serviceDetail = await ServiceDetail.findByPk(id);

        if (!serviceDetail) {
            res.status(404).json({
                status: "error",
                message: `Service detail with ID ${id} not found.`,
            });
            return;
        }

        res.status(200).json({
            status: "success",
            data: serviceDetail,
        });
    } catch (err) {
        console.error("Error fetching service detail:", err);
        res.status(500).json({
            status: "error",
            message: "Internal server error.",
        });
    }
});

// 4. Update a Service Detail
serviceDetailRouter.put("/:id", upload.single("image"), async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { detail, approach } = req.body;

    try {
        const serviceDetail = await ServiceDetail.findByPk(id);

        if (!serviceDetail) {
            res.status(404).json({
                status: "error",
                message: `Service detail with ID ${id} not found.`,
            });
            return;
        }

        // Handle image update if a new one is uploaded
        let imagePath = serviceDetail.image;
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

        // Update the service detail
        serviceDetail.detail = detail || serviceDetail.detail;
        serviceDetail.approach = approach || serviceDetail.approach;
        serviceDetail.image = imagePath;

        await serviceDetail.save();

        res.status(200).json({
            status: "success",
            data: serviceDetail,
            message: "Service detail updated successfully.",
        });
    } catch (err) {
        console.error("Error updating service detail:", err);
        res.status(500).json({
            status: "error",
            message: "Internal server error.",
        });
    }
});

// 5. Delete a Service Detail
serviceDetailRouter.delete("/:id", async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const serviceDetail = await ServiceDetail.findByPk(id);

        if (!serviceDetail) {
            res.status(404).json({
                status: "error",
                message: `Service detail with ID ${id} not found.`,
            });
            return;
        }

        // Delete the associated image if it exists
        if (serviceDetail.image) {
            const imagePath = path.join(__dirname, "../../", serviceDetail.image);
            fs.unlink(imagePath, (err) => {
                if (err) console.error("Error deleting service detail image:", err);
            });
        }

        await serviceDetail.destroy();

        res.status(200).json({
            status: "success",
            message: `Service detail with ID ${id} deleted successfully.`,
        });
    } catch (err) {
        console.error("Error deleting service detail:", err);
        res.status(500).json({
            status: "error",
            message: "Internal server error.",
        });
    }
});

export default serviceDetailRouter;
