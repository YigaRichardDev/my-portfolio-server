import Joi from "joi";

export const userValidationSchema = Joi.object({
    username: Joi.string()
        .pattern(/^[a-zA-Z]+$/)
        .min(4)
        .required()
        .messages({
            "string.pattern.base": "Username must contain only letters.",
            "string.min": "Username must be at least 4 characters.",
            "any.required": "Username is required.",
        }),

    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.email": "Email must be a valid email address.",
            "any.required": "Email is required.",
        }),

    password: Joi.string()
        .pattern(/(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&])/)
        .min(8)
        .required()
        .messages({
            "string.pattern.base": "Password must contain at least one number, one symbol, and one capital letter.",
            "string.min": "Password must be at least 8 characters.",
            "any.required": "Password is required.",
        }),
});

export const userValidationSchemaEdit = Joi.object({
    username: Joi.string()
        .pattern(/^[a-zA-Z]+$/)
        .min(4)
        .required()
        .messages({
            "string.pattern.base": "Username must contain only letters.",
            "string.min": "Username must be at least 4 characters.",
            "any.required": "Username is required.",
        }),

    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.email": "Email must be a valid email address.",
            "any.required": "Email is required.",
        }),

    role: Joi.string()
        .required()
        .messages({
            "any.required": "Role is required.",
        }),

    is_active: Joi.string()
        .required()
        .messages({
            "any.required": "Is_active is required.",
        }),

});


export const loginValidationSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "any.required": "Email is required.",
    }),
    password: Joi.string().min(6).required().messages({
        "any.required": "Password is required.",
    }),
});

// Password Validation (Minimum 8 characters, at least one uppercase, one lowercase, one digit, and one special character)
export const validatePassword = (password: string): boolean => {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    return passwordPattern.test(password);
};
