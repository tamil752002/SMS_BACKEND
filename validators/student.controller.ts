import { z } from "zod";

export const createStudentSchema = z.object({
    schoolId: z
        .string()
        .uuid(),

    admissionNumber: z
        .string()
        .min(1, "Admission number is required")
        .max(100),

    admissionDate: z
        .string()
        .min(1, "Admission date is required"),

    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(100),

    firstName: z
        .string()
        .min(2, "First name is required")
        .max(255),

    middleName: z
        .string()
        .max(255)
        .optional(),

    lastName: z
        .string()
        .max(255)
        .optional(),

    studentAadhar: z
        .string()
        .max(20)
        .optional(),

    fatherName: z
        .string()
        .min(2, "Father's name is required")
        .max(255),

    fatherAadhar: z
        .string()
        .max(20)
        .optional(),

    motherName: z
        .string()
        .min(2, "Mother's name is required")
        .max(255),

    motherAadhar: z
        .string()
        .max(20)
        .optional(),

    parentMobile: z
        .string()
        .min(10, "Mobile number must be at least 10 digits")
        .max(20),

    mobileNumber: z
        .string()
        .min(10, "Mobile number must be at least 10 digits")
        .max(20),

    studentClass: z
        .string()
        .min(1, "Class is required")
        .max(50),

    section: z
        .string()
        .min(1, "Section is required")
        .max(50),

    medium: z
        .string()
        .min(1, "Medium is required")
        .max(50),

    dateOfBirth: z
        .string()
        .min(1, "Date of birth is required"),

    gender: z.enum(["male", "female", "other"]),

    admissionClass: z
        .string()
        .max(50)
        .optional(),

    location: z
        .string()
        .max(255)
        .optional(),

    penNumber: z
        .string()
        .max(50)
        .optional(),

    caste: z
        .string()
        .max(100)
        .optional(),

    subCaste: z
        .string()
        .max(100)
        .optional(),

    religion: z
        .string()
        .max(100)
        .optional(),

    motherTongue: z
        .string()
        .max(100)
        .optional(),

    emailAddress: z
        .string()
        .email("Invalid email address")
        .optional(),

    address: z
        .string()
        .max(500)
        .optional(),

    profilePhoto: z
        .string()
        .optional()
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;