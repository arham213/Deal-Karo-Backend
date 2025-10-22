import { z } from "zod";

export const createNoteSchema = z.object({
    description: z
    .string()
    .min(1, "Descripiton is required")
}).strict()

export const updateNoteSchema = z.object({
    noteId: z
    .string()
    .min(1, "noteId is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid propertyId format"),

    description: z
    .string()
    .min(1, "Descripiton is required")
}).strict()

export const noteIdParamsSchema = z.object({
    noteId: z
    .string()
    .min(1, "noteId is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid propertyId format")
}).strict()