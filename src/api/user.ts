import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { User } from "../database/models/users";
import { OTP } from "../database/models/otp";
import { userValidationSchema, userValidationSchemaEdit, loginValidationSchema, validatePassword } from "../lib/validations";

const userRouter = express.Router();

userRouter.post("/add-user", async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate input
        const { error, value } = userValidationSchema.validate(req.body);
        if (error) {
            res.status(400).json({
                status: "error",
                data: null,
                message: error.details[0].message,
            });
            return;
        }

        const { username, email, password } = value;

        // Check if email is unique
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            res.status(400).json({
                status: "error",
                data: null,
                message: "Email is already registered.",
            });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            status: "success",
            data: newUser,
            message: "User created successfully.",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            data: null,
            message: "Internal server error.",
        });
    }
});

userRouter.get("/get-user/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.id;

        // Fetch user by ID
        const user = await User.findByPk(userId);

        if (!user) {
            res.status(404).json({
                status: "error",
                data: null,
                message: "User not found.",
            });
            return;
        }

        // Return user information
        res.status(200).json({
            status: "success",
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                is_active: user.is_active,
            },
            message: "User retrieved successfully.",
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({
            status: "error",
            data: null,
            message: "Internal server error.",
        });
    }
});

userRouter.get("/", async (req: Request, res: Response): Promise<void> => {
    try {
        // Fetch all users from the database
        const users = await User.findAll({
            attributes: ["id", "username", "email", "role", "is_active", "created_at", "updated_at"],
        });

        // Check if users exist
        if (!users.length) {
            res.status(404).json({
                status: "error",
                data: null,
                message: "No users found.",
            });
            return;
        }

        // Respond with user data
        res.status(200).json({
            status: "success",
            data: users,
            message: "Users retrieved successfully.",
        });

    } catch (err) {
        res.status(500).json({
            status: "error",
            data: null,
            message: "Internal server error.",
        });
    }
});

userRouter.put("/edit-user/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.id;

        // Validate inputs
        const { error, value } = userValidationSchemaEdit.validate(req.body);
        if (error) {
            res.status(400).json({
                status: "error",
                data: null,
                message: error.details[0].message,
            });
            return;
        }

        const { username, email, role, is_active } = value;

        // Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({
                status: "error",
                data: null,
                message: "User not found."
            });
            return;
        }

        // Check if the email is already in use by another user
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ where: { email } });
            if (emailExists) {
                res.status(400).json({
                    status: "error",
                    data: null,
                    message: "Email is already registered to another user.",
                });
                return;
            }
        }

        // Update the user
        await user.update({
            username: username || user.username,
            email: email || user.email,
            role: role || user.role,
            is_active: is_active || user.is_active,
        });

        res.status(200).json({
            status: "success",
            data: user,
            message: "User updated successfully.",
        });

    } catch (err) {
        res.status(500).json({
            status: "error",
            data: null,
            message: "Internal server error.",
        });
    }
});

userRouter.delete("/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Check if the user exists
        const user = await User.findByPk(id);
        if (!user) {
            res.status(404).json({
                status: "error",
                data: null,
                message: `User with id ${id} not found.`,
            });
            return;
        }

        // Delete the user
        await user.destroy();

        res.status(200).json({
            status: "success",
            data: null,
            message: "User deleted successfully.",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            data: null,
            message: "Internal server error.",
        });
    }
});


userRouter.post("/login", async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate input
        const { error, value } = loginValidationSchema.validate(req.body);
        if (error) {
            res.status(400).json({
                status: "error",
                data: null,
                message: error.details[0].message,
            });
            return;
        }

        const { email, password } = value;

        // Check if the user exists
        const user = await User.findOne({ where: { email } });
        if (!user) {
            res.status(401).json({
                status: "error",
                data: null,
                message: "Invalid email or password.",
            });
            return;
        }

        // Check if the account is active
        if (user.is_active !== "Yes") {
            res.status(403).json({
                status: "error",
                data: null,
                message: "Account is not active. Please contact support.",
            });
            return;
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                status: "error",
                data: null,
                message: "Invalid email or password.",
            });
            return;
        }

        // Generate JWT tokens
        const accessToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: "15m" } // Access token expiration
        );

        const refreshToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.REFRESH_TOKEN_SECRET!,
            { expiresIn: "7d" } // Refresh token expiration
        );

        // Save refresh token to database
        user.refresh_token = refreshToken;
        await user.save();

        // Respond with tokens
        res.status(200).json({
            status: "success",
            data: {
                access_token: accessToken,
                refresh_token: refreshToken,
            },
            message: "Login successful.",
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({
            status: "error",
            data: null,
            message: "Internal server error.",
        });
    }
});

userRouter.post("/reset-password", async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email) {
            res.status(400).json({
                status: "error",
                message: "Email is required.",
            });
            return;
        }

        // Check if user exists
        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            res.status(404).json({
                status: "error",
                message: "User with this email does not exist.",
            });
            return;
        }

        // Generate a 6-digit OTP code
        const otpCode = crypto.randomInt(100000, 999999).toString();

        // Set expiration time (3 minutes from now)
        const expirationTime = new Date(Date.now() + 3 * 60 * 1000);

        // Save OTP to database
        await OTP.create({
            user_id: user.id,
            otp_code: otpCode,
            expiration_time: expirationTime,
        });

        // Send OTP to email
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // or other email services
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: "your-email@gmail.com",
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP code is: ${otpCode}. It is valid for 3 minutes.`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            status: "success",
            message: "OTP has been sent to your email.",
        });
    } catch (error) {
        console.error("Error in reset-password route:", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error.",
        });
    }
});

userRouter.post('/validate-otp', async (req: Request, res: Response): Promise<void> => {
    const { otp_code } = req.body;

    try {
        // 1. Check if the OTP exists
        const otp = await OTP.findOne({
            where: { otp_code: otp_code },
            order: [['created_at', 'DESC']] // Get the most recent OTP entry if duplicates exist
        });

        if (!otp) {
            res.status(404).json({
                status: "error",
                data: null,
                message: "Invalid OTP."
            });
            return;
        }

        // 2. Check if the OTP is expired
        const now = new Date();
        if (otp.expiration_time < now) {
            res.status(400).json({
                status: "error",
                data: null,
                message: "OTP has expired."
            });
            return;
        }

        // 3. If OTP is valid, pass the user's ID or email to the next step
        const user = await User.findByPk(otp.user_id);
        if (!user) {
            res.status(404).json({
                status: "error",
                data: null,
                message: "User not found."
            });
            return;
        }

        // Generate a JWT token containing user_id 
        const token = jwt.sign(
            { user_id: user.id },
            process.env.JWT_SECRET!,
            { expiresIn: '10m' }
        );

        res.status(200).json({
            status: 'success',
            data: { token },
            message: "OTP validated successfully."
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "error",
            data: null,
            message: "Internal server error."
        });
    }
});

userRouter.post('/change-password', async (req: Request, res: Response): Promise<void> => {
    const { token, new_password, confirm_password } = req.body;

    try {
        // Verify the token
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const { user_id } = decoded;
        if (!new_password || !confirm_password) {
            res.status(400).json({
                status: "error",
                message: "Both fields are required.",
            });
            return;
        }
        // Validate Password 
        if (!validatePassword(new_password)) {
            res.status(400).json({
                status: 'error',
                data: null,
                message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one digit, and one special character.',
            });
            return;
        }

        // Check if the passwords match
        if (new_password !== confirm_password) {
            res.status(400).json({
                status: 'error',
                data: null,
                message: 'Passwords do not match.'
            });
            return;
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Update the user's password in the database
        await User.update({ password: hashedPassword }, { where: { id: user_id } });

        res.status(200).json({
            status: "success",
            data: null,
            message: "Password updated successfully."
        });

    } catch (error) {
        console.error(error);

        if (error instanceof Error && error.name === 'TokenExpiredError') {
            res.status(401).json({
                status: "error",
                data: null,
                message: "Token has expired, please try the reset process again."
            });
            return;
        }

        res.status(500).json({
            status: "error",
            data: null,
            message: "Internal server error."
        });
    }
});

export default userRouter;
