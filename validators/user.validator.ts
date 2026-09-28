import { z } from "zod";

export const createUserSchema = z.object({
    username: z.string().min(3).max(255),

    password: z.string().min(6).max(100),

    role: z.enum([
        "developer",
        "admin",
        "student",
        "teacher",
        "parent"
    ]),

    name: z.string().min(2).max(255),

    email: z.string().email().optional(),

    phone_number: z.string().max(20).optional()
});

export type CreateUserInput = z.infer<typeof createUserSchema>;