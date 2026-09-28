import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { createStudent, getStudents } from "../services/student.services.js";
import { createStudentSchema } from "../validators/student.controller.js";
import { IStudentFilter } from "../interfaces/student.interface.js";

export const getStudentsController = async (
    req: Request,
    res: Response
) => {
    try {
        const { schoolId, studentClass, section } = req.query as IStudentFilter;

        const students = await getStudents({
            schoolId,
            studentClass,
            section
        });

        res.status(200).json(students);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({
            error: "Failed to fetch students"
        });
    }
};

export const createStudentController = async (
    req: Request,
    res: Response
) => {
    try {
        const validatedData = createStudentSchema.parse(req.body);
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        const student = await createStudent({
            ...validatedData,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Student created successfully",
            student
        });
    } catch (error: unknown) {
        console.error("Create Student Controller Error:", error);

        if (error instanceof Error) {
            res.status(400).json({
                message: error.message
            });
            return;
        }

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};
