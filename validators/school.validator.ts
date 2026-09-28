import { z } from "zod";

export const createSchoolSchema = z.object({
    name: z.string().min(2).max(255),

    address: z.string().min(5).max(500),

    contact_number: z.string().min(10).max(20),

    email: z.string().email(),

    student_user_id_prefix: z.string().min(2).max(10)
});

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;