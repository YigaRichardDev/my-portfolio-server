import express, { Request, Response } from "express";
import { Contact } from "../database/models/contacts";

const contactRouter = express.Router();

/// 1. Add a New Contact
contactRouter.post("/", async (req: Request, res: Response): Promise<void> => {
    const { name, email, phone, message } = req.body;

    try {
        // Check if a contact with the same name, email, phone, and message exists
        const existingContact = await Contact.findOne({
            where: { name, email, phone, message },
        });

        if (existingContact) {
            res.status(400).json({
                status: "error",
                data: null,
                message: "A contact with the same name, email, phone, and message already exists.",
            });
            return;
        }

        // Create a new contact
        const contact = await Contact.create({ name, email, phone, message });

        res.status(201).json({
            status: "success",
            data: contact,
            message: "Contact added successfully.",
        });
    } catch (err) {
        console.error("Error adding contact:", err);
        res.status(500).json({
            status: "error",
            data: null,
            message: "Internal server error.",
        });
    }
});


/// 2. Get All Contacts
contactRouter.get("/", async (_req: Request, res: Response): Promise<void> => {
    try {
        const contacts = await Contact.findAll();
        res.status(200).json({
            status: "success",
            data: contacts,
        });
    } catch (err) {
        console.error("Error fetching contacts:", err);
        res.status(500).json({
            status: "error",
            data: null,
            message: "Internal server error.",
        });
    }
});

/// 3. Get a Single Contact by ID
contactRouter.get("/:id", async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const contact = await Contact.findByPk(id);

        if (!contact) {
            res.status(404).json({
                status: "error",
                data: null,
                message: `Contact with ID ${id} not found.`,
            });
            return;
        }

        res.status(200).json({
            status: "success",
            data: contact,
        });
    } catch (err) {
        console.error("Error fetching contact:", err);
        res.status(500).json({
            status: "error",
            data: null,
            message: "Internal server error.",
        });
    }
});


/// 4. Delete a Contact
contactRouter.delete("/:id", async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const contact = await Contact.findByPk(id);

        if (!contact) {
            res.status(404).json({
                status: "error",
                data: null,
                message: `Contact with ID ${id} not found.`,
            });
            return;
        }

        await contact.destroy();

        res.status(200).json({
            status: "success",
            data: null,
            message: `Contact with ID ${id} deleted successfully.`,
        });
    } catch (err) {
        console.error("Error deleting contact:", err);
        res.status(500).json({
            status: "error",
            data: null,
            message: "Internal server error.",
        });
    }
});

export default contactRouter;
