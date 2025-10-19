import {z} from "zod";

export const signupSchema = z.object({
    name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters'),

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

    role: z
    .enum(['dealer', 'admin'])
}).strict();

export const verifyNumberSchema = z.object({
    userId: z
    .string()
    .min(1, "userId is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid userId format"),

    OTP: z
    .string()
    .min(4, "OTP is required and should be of 4 digits")
    .max(4)
}).strict()

export const loginSchema = z.object({
    contactNo: z
    .string()
    .regex(/^[0-9]{10,15}$/, 'Contact number must be 10–15 digits'),

    password: z
    .string()
    .min(1, "Password is required")
}).strict()

export const resetPasswordSchema = z.object({
    newPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password is too long'),

    OTP: z
    .string()
    .min(4, "OTP is required and should be of 4 digits")
    .max(4)
}).strict()

export const editUserSchema = z.object({
  name: z
    .string()
    .min(1, "First name cannot be empty")
    .max(50, "First name cannot exceed 50 characters")
    .optional(),

  contactNo: z
    .string()
    .regex(/^[0-9]{10,15}$/, "Contact number must be between 10 to 15 digits")
    .optional(),
}).strict();

export const objectIdParamsSchema = z.object({
    userId: z
    .string()
    .min(1, "userId is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid userId format")
}).strict()