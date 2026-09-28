import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { createStudent, getStudents } from "../services/student.services";
import { createStudentSchema } from "../validators/student.controller";

export const getStudentsController = async (
    req: Request,
    res: Response
) => {
    try {

        const {
            schoolId,
            studentClass,
            section
        } = req.query;

        const students = await getStudents(
            schoolId as string | undefined,
            studentClass as string | undefined,
            section as string | undefined
        );

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

        const {
            schoolId,
            admissionNumber,
            password,
            firstName,
            middleName,
            lastName,
            studentAadhar,
            admissionDate,
            fatherName,
            fatherAadhar,
            motherName,
            motherAadhar,
            studentClass,
            section,
            medium,
            dateOfBirth,
            gender,
            admissionClass,
            location,
            penNumber,
            caste,
            subCaste,
            religion,
            motherTongue,
            parentMobile,
            mobileNumber,
            emailAddress,
            address,
            profilePhoto
        } = validatedData;

        const hashedPassword = await bcrypt.hash(password, 10);

        const student = await createStudent(
            schoolId,
            admissionNumber,
            hashedPassword,
            firstName,
            middleName,
            lastName,
            studentAadhar,
            admissionDate,
            fatherName,
            fatherAadhar,
            motherName,
            motherAadhar,
            studentClass,
            section,
            medium,
            dateOfBirth,
            gender,
            admissionClass,
            location,
            penNumber,
            caste,
            subCaste,
            religion,
            motherTongue,
            parentMobile,
            mobileNumber,
            emailAddress,
            address,
            profilePhoto
        );

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