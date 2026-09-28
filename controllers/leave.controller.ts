import { Request, Response } from "express";
import {
    applyTeacherLeave,
    getTeacherLeaveApplications,
    updateTeacherLeave,
    applyStudentLeave,
    getStudentLeaveApplications
} from "../services/leave.services.js";

export const applyTeacherLeaveController = async (
    req: Request,
    res: Response
) => {
    try {
        const { teacherId, leaveType, fromDate, toDate, reason } = req.body;

        if (!teacherId || !leaveType || !fromDate || !toDate) {
            return res.status(400).json({
                error: "teacherId, leaveType, fromDate, and toDate are required"
            });
        }

        const application = await applyTeacherLeave({
            teacherId,
            leaveType,
            fromDate,
            toDate,
            reason
        });

        return res.status(201).json({
            message: "Leave application submitted successfully",
            application
        });

    } catch (error) {
        console.error("Apply Teacher Leave Controller Error:", error);
        return res.status(500).json({
            error: "Failed to submit leave application"
        });
    }
};

export const getTeacherLeaveApplicationsController = async (
    req: Request,
    res: Response
) => {
    try {
        const { schoolId, status } = req.query;

        if (!schoolId) {
            return res.status(400).json({
                error: "schoolId is required"
            });
        }

        const applications = await getTeacherLeaveApplications(
            schoolId as string,
            status as string | undefined
        );

        return res.status(200).json(applications);

    } catch (error) {
        console.error("Get Teacher Leave Applications Controller Error:", error);
        return res.status(500).json({
            error: "Failed to fetch leave applications"
        });
    }
};

export const updateTeacherLeaveController = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;
        const { status, reviewedBy } = req.body;

        if (!id || !["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                error: "id and status ('approved' | 'rejected') are required"
            });
        }

        const updated = await updateTeacherLeave({
            id: id as string,
            status,
            reviewedBy
        });

        if (!updated) {
            return res.status(404).json({
                error: "Leave application not found"
            });
        }

        return res.status(200).json({
            message: `Leave application ${status} successfully`,
            application: updated
        });

    } catch (error) {
        console.error("Update Teacher Leave Controller Error:", error);
        return res.status(500).json({
            error: "Failed to update leave application"
        });
    }
};

export const applyStudentLeaveController = async (
    req: Request,
    res: Response
) => {
    try {
        const { studentId, appliedBy, leaveType, fromDate, toDate, reason } = req.body;

        if (!studentId || !appliedBy || !leaveType || !fromDate || !toDate) {
            return res.status(400).json({
                error: "studentId, appliedBy, leaveType, fromDate, and toDate are required"
            });
        }

        const application = await applyStudentLeave({
            studentId,
            appliedBy,
            leaveType,
            fromDate,
            toDate,
            reason
        });

        return res.status(201).json({
            message: "Student leave applied successfully",
            application
        });

    } catch (error) {
        console.error("Apply Student Leave Controller Error:", error);
        return res.status(500).json({
            error: "Failed to apply student leave"
        });
    }
};

export const getStudentLeaveApplicationsController = async (
    req: Request,
    res: Response
) => {
    try {
        const { schoolId, studentClass, status } = req.query;

        if (!schoolId) {
            return res.status(400).json({
                error: "schoolId is required"
            });
        }

        const applications = await getStudentLeaveApplications(
            schoolId as string,
            studentClass as string | undefined,
            status as string | undefined
        );

        return res.status(200).json(applications);

    } catch (error) {
        console.error("Get Student Leave Applications Controller Error:", error);
        return res.status(500).json({
            error: "Failed to fetch student leave applications"
        });
    }
};
