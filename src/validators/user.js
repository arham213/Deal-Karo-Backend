import { z } from "zod";

export const signupSchema = z.object({
    name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters'),

    email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),

    contactNo: z
    .string()
    .regex(/^[0-9]{10,15}$/, 'Contact number must be 10–15 digits'),

    estateName: z
    .string()
    .min(1, 'Estate Name is required')
    .max(100, 'Estate Name cannot exceed 100 characters'),

    password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password is too long'),

    role: z.literal("dealer")
}).strict();

export const adminSignupSchema = z.object({
  adminSecret: z
    .string()
    .min(1, "Admin Secret is required"),

  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),

  contactNo: z
    .string()
    .regex(/^[0-9]{10,15}$/, "Contact number must be 10–15 digits"),

  estateName: z
    .string()
    .min(1, "Estate Name is required")
    .max(100, "Estate Name cannot exceed 100 characters"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password is too long"),

  role: z.literal("admin"), // ✅ more precise than enum(["admin"])

  isAccountVerified: z.boolean().optional(),
}).strict();

export const verifyEmailSchema = z.object({
    email: z
    .string()
    .min(1, "Email is required")
    .email(),

    OTP: z
    .string()
    .min(4, "OTP is required and should be of 4 digits")
    .max(4)
}).strict();

export const resendOTPSchema = z.object({
    userId: z
    .string()
    .min(1, "userId is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid userId format"),

    isSimpleOTP: z
    .boolean({
        required_error: "isSimpleOTP is required",
        invalid_type_error: "isSimpleOTP must be a boolean",
    })
})

export const loginSchema = z.object({
    email: z
    .string()
    .min(1, "Email is required")
    .email(),

    password: z
    .string()
    .min(1, "Password is required")
}).strict();

export const forgotPasswordSchema = z.object({
    email: z
    .string()
    .min(1, "Email is required")
    .email(),
}).strict();

export const verifyResetPasswordOTPSchema = z.object({
    userId: z
    .string()
    .min(1, "userId is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid userId format"),

    OTP: z
    .string()
    .min(4, "OTP is required and should be of 4 digits")
    .max(4)
}).strict()

export const resetPasswordSchema = z.object({
    userId: z
    .string()
    .min(1, "userId is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid userId format"),

    password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password is too long')
}).strict();

export const editUserSchema = z.object({
    _id: z
    .string()
    .min(1, "userId is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid userId format"),

    name: z
    .string()
    .min(1, "First name cannot be empty")
    .max(50, "First name cannot exceed 50 characters")
    .optional(),

    email: z
    .string()
    .min(1, "Email is required")
    .email()
    .optional(),

    contactNo: z
    .string()
    .regex(/^[0-9]{10,15}$/, 'Contact number must be 10–15 digits')
    .optional(),

    estateName: z
    .string()
    .min(1, 'Estate Name is required')
    .max(100, 'Estate Name cannot exceed 100 characters')
    .optional()
}).strict();

export const userIdParamsSchema = z.object({
    userId: z
    .string()
    .min(1, "userId is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid userId format")
}).strict();