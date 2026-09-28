import { Request, Response } from "express";
import {
    createExam,
    getExams,
    saveBulkMarks,
    getStudentReportCard
} from "../services/exam.services.js";

export const createExamController = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            schoolId,
            name,
            type,
            className,
            subjects = [],
            startDate,
            endDate,
            academicYear,
            totalMarks = 100
        } = req.body;

        if (!schoolId || !name || !type || !className || !academicYear) {
            return res.status(400).json({
                error: "schoolId, name, type, className, and academicYear are required"
            });
        }

        const exam = await createExam({
            schoolId,
            name,
            type,
            className,
            subjects,
            startDate,
            endDate,
            academicYear,
            totalMarks
        });

        return res.status(201).json({
            message: "Exam created successfully",
            exam
        });

    } catch (error) {
        console.error("Create Exam Controller Error:", error);
        return res.status(500).json({
            error: "Failed to create exam"
        });
    }
};

export const getExamsController = async (
    req: Request,
    res: Response
) => {
    try {
        const { schoolId, className, academicYear } = req.query;

        if (!schoolId) {
            return res.status(400).json({
                error: "schoolId is required"
            });
        }

        const exams = await getExams(
            schoolId as string,
            className as string | undefined,
            academicYear as string | undefined
        );

        return res.status(200).json(exams);

    } catch (error) {
        console.error("Get Exams Controller Error:", error);
        return res.status(500).json({
            error: "Failed to fetch exams"
        });
    }
};

export const saveBulkMarksController = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            examId,
            subject,
            examType = "term",
            academicYear,
            marksList
        } = req.body;

        if (!examId || !subject || !Array.isArray(marksList) || marksList.length === 0) {
            return res.status(400).json({
                error: "examId, subject, and a non-empty marksList array are required"
            });
        }

        await saveBulkMarks({
            examId,
            subject,
            examType,
            academicYear,
            marksList
        });

        return res.status(200).json({
            message: "Marks saved successfully"
        });

    } catch (error) {
        console.error("Save Bulk Marks Controller Error:", error);
        return res.status(500).json({
            error: "Failed to save marks"
        });
    }
};

export const getStudentReportCardController = async (
    req: Request,
    res: Response
) => {
    try {
        const { studentId } = req.params;
        const { examId, academicYear } = req.query;

        if (!studentId) {
            return res.status(400).json({
                error: "studentId is required"
            });
        }

        const reportCard = await getStudentReportCard(
            studentId as string,
            examId as string | undefined,
            academicYear as string | undefined
        );

        return res.status(200).json(reportCard);

    } catch (error) {
        console.error("Get Student Report Card Controller Error:", error);
        return res.status(500).json({
            error: "Failed to fetch report card"
        });
    }
};
