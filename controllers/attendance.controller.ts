import { Request, Response } from "express";
import {
    markBulkAttendance,
    getClassAttendance,
    getStudentAttendance
} from "../services/attendance.services.js";

export const markBulkAttendanceController = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            date,
            session = "morning",
            records,
            markedBy
        } = req.body;

        if (!date || !Array.isArray(records) || records.length === 0) {
            return res.status(400).json({
                error: "date and a non-empty records array are required"
            });
        }

        await markBulkAttendance({
            date,
            session,
            records,
            markedBy
        });

        return res.status(200).json({
            message: "Attendance marked successfully"
        });

    } catch (error) {
        console.error("Mark Attendance Controller Error:", error);
        return res.status(500).json({
            error: "Failed to mark attendance"
        });
    }
};

export const getClassAttendanceController = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            schoolId,
            studentClass,
            date,
            section,
            session = "morning"
        } = req.query;

        if (!schoolId || !studentClass || !date) {
            return res.status(400).json({
                error: "schoolId, studentClass, and date are required"
            });
        }

        const attendance = await getClassAttendance(
            schoolId as string,
            studentClass as string,
            date as string,
            section as string | undefined,
            session as string
        );

        return res.status(200).json(attendance);

    } catch (error) {
        console.error("Get Class Attendance Controller Error:", error);
        return res.status(500).json({
            error: "Failed to fetch class attendance"
        });
    }
};

export const getStudentAttendanceController = async (
    req: Request,
    res: Response
) => {
    try {
        const { studentId } = req.params;
        const { month, year } = req.query;

        if (!studentId) {
            return res.status(400).json({
                error: "studentId is required"
            });
        }

        const attendance = await getStudentAttendance(
            studentId as string,
            month as string | undefined,
            year as string | undefined
        );

        return res.status(200).json(attendance);

    } catch (error) {
        console.error("Get Student Attendance Controller Error:", error);
        return res.status(500).json({
            error: "Failed to fetch student attendance"
        });
    }
};
