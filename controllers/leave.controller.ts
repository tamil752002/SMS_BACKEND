import { Request, Response } from "express";

import {
    applyTeacherLeave,
    getTeacherLeaveApplications,
    updateTeacherLeave,
    applyStudentLeave,
    getStudentLeaveApplications
} from "../services/leave.services.js";


// ==========================================
// TEACHER LEAVE
// ==========================================

// Teacher Apply Leave
export const applyTeacherLeaveController = async (
    req: Request,
    res: Response
) => {

    try {

        const {
            teacherId,
            leaveType,
            fromDate,
            toDate,
            reason
        } = req.body;


        if (
            !teacherId ||
            !leaveType ||
            !fromDate ||
            !toDate
        ) {

            return res.status(400).json({
                error:
                    "teacherId, leaveType, fromDate, and toDate are required"
            });

        }


        const application = await applyTeacherLeave(
            teacherId,
            leaveType,
            fromDate,
            toDate,
            reason
        );


        return res.status(201).json({
            message:
                "Leave application submitted successfully",
            application
        });

    } catch (error) {

        console.error(
            "Error applying teacher leave:",
            error
        );

        return res.status(500).json({
            error:
                "Failed to submit leave application"
        });
    }
};


// Admin View Teacher Leaves
export const getTeacherLeaveApplicationsController = async (
    req: Request,
    res: Response
) => {

    try {

        const {
            schoolId,
            status
        } = req.query;


        if (!schoolId) {

            return res.status(400).json({
                error: "schoolId is required"
            });

        }


        const applications =
            await getTeacherLeaveApplications(
                schoolId as string,
                status as string | undefined
            );


        return res.status(200).json(
            applications
        );

    } catch (error) {

        console.error(
            "Error fetching teacher leaves:",
            error
        );

        return res.status(500).json({
            error:
                "Failed to fetch leave applications"
        });
    }
};


// Admin Approve / Reject Teacher Leave
export const updateTeacherLeaveController = async (
    req: Request,
    res: Response
) => {

    try {

        // const { id } = req.params;
        const id = req.params.id as string;
        const {
            status,
            reviewedBy
        } = req.body;


        if (
            !["approved", "rejected"].includes(status)
        ) {

            return res.status(400).json({
                error:
                    "status must be 'approved' or 'rejected'"
            });

        }


        const application =
            await updateTeacherLeave(
                id,
                status,
                reviewedBy
            );


        if (!application) {

            return res.status(404).json({
                error:
                    "Leave application not found"
            });

        }


        return res.status(200).json({
            message:
                `Leave application ${status} successfully`,
            application
        });

    } catch (error) {

        console.error(
            "Error updating teacher leave:",
            error
        );

        return res.status(500).json({
            error:
                "Failed to update leave application"
        });
    }
};


// ==========================================
// STUDENT LEAVE
// ==========================================

// Student / Parent Apply Leave
export const applyStudentLeaveController = async (
    req: Request,
    res: Response
) => {

    try {

        const {
            studentId,
            appliedBy,
            leaveType,
            fromDate,
            toDate,
            reason
        } = req.body;


        if (
            !studentId ||
            !appliedBy ||
            !leaveType ||
            !fromDate ||
            !toDate
        ) {

            return res.status(400).json({
                error:
                    "studentId, appliedBy, leaveType, fromDate, and toDate are required"
            });

        }


        const application =
            await applyStudentLeave(
                studentId,
                appliedBy,
                leaveType,
                fromDate,
                toDate,
                reason
            );


        return res.status(201).json({
            message:
                "Student leave application submitted",
            application
        });

    } catch (error) {

        console.error(
            "Error applying student leave:",
            error
        );

        return res.status(500).json({
            error:
                "Failed to submit student leave"
        });
    }
};


// List Student Leaves
export const getStudentLeaveApplicationsController = async (
    req: Request,
    res: Response
) => {

    try {

        const {
            schoolId,
            studentClass,
            status
        } = req.query;


        if (!schoolId) {

            return res.status(400).json({
                error: "schoolId is required"
            });

        }


        const applications =
            await getStudentLeaveApplications(
                schoolId as string,
                studentClass as string | undefined,
                status as string | undefined
            );


        return res.status(200).json(
            applications
        );

    } catch (error) {

        console.error(
            "Error fetching student leaves:",
            error
        );

        return res.status(500).json({
            error:
                "Failed to fetch student leaves"
        });
    }
};