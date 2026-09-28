import { Request, Response } from "express";
import {
    saveFeeStructure,
    getFeeStructures,
    collectFee,
    getStudentFees
} from "../services/fee.services.js";

export const saveFeeStructureController = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            schoolId,
            className,
            academicYear,
            tuitionFee = 0,
            schoolFee = 0,
            examFee = 0,
            vanFee = 0,
            booksFee = 0,
            uniformFee = 0,
            otherFees = []
        } = req.body;

        if (!schoolId || !className || !academicYear) {
            return res.status(400).json({
                error: "schoolId, className, and academicYear are required"
            });
        }

        const structure = await saveFeeStructure({
            schoolId,
            className,
            academicYear,
            tuitionFee,
            schoolFee,
            examFee,
            vanFee,
            booksFee,
            uniformFee,
            otherFees
        });

        return res.status(200).json({
            message: "Fee structure saved successfully",
            structure
        });

    } catch (error) {
        console.error("Save Fee Structure Controller Error:", error);
        return res.status(500).json({
            error: "Failed to save fee structure"
        });
    }
};

export const getFeeStructuresController = async (
    req: Request,
    res: Response
) => {
    try {
        const { schoolId, academicYear } = req.query;

        if (!schoolId) {
            return res.status(400).json({
                error: "schoolId is required"
            });
        }

        const structures = await getFeeStructures(
            schoolId as string,
            academicYear as string | undefined
        );

        return res.status(200).json(structures);

    } catch (error) {
        console.error("Get Fee Structures Controller Error:", error);
        return res.status(500).json({
            error: "Failed to fetch fee structures"
        });
    }
};

export const collectFeeController = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            studentId,
            academicYear,
            feeType,
            amount,
            paidAmount,
            paidDate = new Date().toISOString().split("T")[0],
            receiptNumber,
            collectedBy
        } = req.body;

        if (!studentId || !academicYear || !feeType || paidAmount === undefined) {
            return res.status(400).json({
                error: "studentId, academicYear, feeType, and paidAmount are required"
            });
        }

        const feeRecord = await collectFee({
            studentId,
            academicYear,
            feeType,
            amount,
            paidAmount,
            paidDate,
            receiptNumber,
            collectedBy
        });

        return res.status(200).json({
            message: "Fee collected successfully",
            feeRecord
        });

    } catch (error) {
        console.error("Collect Fee Controller Error:", error);
        return res.status(500).json({
            error: "Failed to collect fee"
        });
    }
};

export const getStudentFeesController = async (
    req: Request,
    res: Response
) => {
    try {
        const { studentId } = req.params;
        const { academicYear } = req.query;

        if (!studentId) {
            return res.status(400).json({
                error: "studentId is required"
            });
        }

        const fees = await getStudentFees(
            studentId as string,
            academicYear as string | undefined
        );

        return res.status(200).json(fees);

    } catch (error) {
        console.error("Get Student Fees Controller Error:", error);
        return res.status(500).json({
            error: "Failed to fetch student fees"
        });
    }
};
