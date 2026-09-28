import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { createTeacher, getTeachers } from "../services/teacher.services.js";

export const createTeacherController = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            schoolId,
            name,
            username,
            password,
            email,
            phoneNumber,
            salary,
            joinDate
        } = req.body;

        if (!schoolId || !name || !username || !password) {
            return res.status(400).json({
                error: "schoolId, name, username, and password are required"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const teacher = await createTeacher({
            schoolId,
            name,
            username,
            password: hashedPassword,
            email,
            phoneNumber,
            salary,
            joinDate
        });

        return res.status(201).json({
            message: "Teacher created successfully",
            ...teacher
        });

    } catch (error: any) {
        console.error("Create Teacher Controller Error:", error);

        if (error.message === "School not found") {
            return res.status(404).json({
                error: "School not found"
            });
        }

        if (error.message === "Username already exists") {
            return res.status(400).json({
                error: "Username already exists"
            });
        }

        return res.status(500).json({
            error: "Failed to create teacher"
        });
    }
};

export const getTeachersController = async (
    req: Request,
    res: Response
) => {
    try {
        const { schoolId } = req.query;

        if (!schoolId) {
            return res.status(400).json({
                error: "schoolId is required"
            });
        }

        const teachers = await getTeachers(schoolId as string);
        return res.status(200).json(teachers);

    } catch (error) {
        console.error("Get Teachers Controller Error:", error);
        return res.status(500).json({
            error: "Failed to fetch teachers"
        });
    }
};
