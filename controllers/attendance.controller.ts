import { Request, Response } from "express";

import {
    markBulkAttendance,
    getClassAttendance,
    getStudentAttendance
} from "../services/attendance.services.js";


/* =====================================================
   1. BULK ATTENDANCE
===================================================== */

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


        if (
            !date ||
            !Array.isArray(records) ||
            records.length === 0
        ) {

            return res.status(400).json({
                error: "date and a non-empty records array are required"
            });
        }


        await markBulkAttendance(
            date,
            session,
            records,
            markedBy
        );


        return res.status(200).json({

            message: `Attendance marked successfully for ${records.length} students`,

            date,

            session
        });

    } catch (error) {

        console.error(
            "Error saving attendance:",
            error
        );

        return res.status(500).json({
            error: "Failed to record attendance"
        });
    }
};


/* =====================================================
   2. GET CLASS ATTENDANCE
===================================================== */

export const getClassAttendanceController = async (
    req: Request,
    res: Response
) => {

    try {

        const {
            schoolId,
            studentClass,
            section,
            date,
            session = "morning"
        } = req.query;


        if (
            !schoolId ||
            !studentClass ||
            !date
        ) {

            return res.status(400).json({

                error:
                    "schoolId, studentClass, and date are required query parameters"
            });
        }


        const attendance =
            await getClassAttendance(
                schoolId as string,
                studentClass as string,
                date as string,
                section as string | undefined,
                session as string
            );


        return res.status(200).json(
            attendance
        );

    } catch (error) {

        console.error(
            "Error fetching class attendance:",
            error
        );

        return res.status(500).json({
            error: "Failed to fetch attendance"
        });
    }
};


/* =====================================================
   3. SINGLE STUDENT ATTENDANCE
===================================================== */

export const getStudentAttendanceController = async (
    req: Request,
    res: Response
) => {

    try {

        const {
            studentId
        } = req.params;


        const {
            month,
            year
        } = req.query;


        const attendance =
            await getStudentAttendance(
                studentId as string,
                month as string | undefined,
                year as string | undefined
            );


        return res.status(200).json(
            attendance
        );

    } catch (error) {

        console.error(
            "Error fetching student attendance:",
            error
        );

        return res.status(500).json({
            error: "Failed to fetch student attendance"
        });
    }
};