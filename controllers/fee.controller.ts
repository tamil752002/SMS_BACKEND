import { Request, Response } from "express";

import {
    saveFeeStructure,
    getFeeStructures,
    collectFee,
    getStudentFees
} from "../services/fee.services.js";


/* =====================================================
   1. CREATE / UPDATE FEE STRUCTURE
===================================================== */

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


        if (
            !schoolId ||
            !className ||
            !academicYear
        ) {

            return res.status(400).json({
                error:
                    "schoolId, className, and academicYear are required"
            });
        }


        const structure =
            await saveFeeStructure(
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
            );


        return res.status(201).json({

            message:
                "Fee structure saved successfully",

            structure
        });

    } catch (error) {

        console.error(
            "Error saving fee structure:",
            error
        );

        return res.status(500).json({
            error:
                "Failed to save fee structure"
        });
    }
};


/* =====================================================
   2. GET FEE STRUCTURES
===================================================== */

export const getFeeStructuresController = async (
    req: Request,
    res: Response
) => {

    try {

        const {
            schoolId,
            academicYear
        } = req.query;


        if (!schoolId) {

            return res.status(400).json({
                error: "schoolId is required"
            });
        }


        const structures =
            await getFeeStructures(
                schoolId as string,
                academicYear as string | undefined
            );


        return res.status(200).json(
            structures
        );

    } catch (error) {

        console.error(
            "Error fetching fee structures:",
            error
        );

        return res.status(500).json({
            error:
                "Failed to fetch fee structures"
        });
    }
};


/* =====================================================
   3. COLLECT FEE
===================================================== */

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
            paidDate =
            new Date()
                .toISOString()
                .slice(0, 10),
            receiptNumber,
            collectedBy
        } = req.body;


        if (
            !studentId ||
            !academicYear ||
            !feeType ||
            paidAmount == null
        ) {

            return res.status(400).json({

                error:
                    "studentId, academicYear, feeType, and paidAmount are required"
            });
        }


        const feeRecord =
            await collectFee(
                studentId,
                academicYear,
                feeType,
                amount,
                paidAmount,
                paidDate,
                receiptNumber,
                collectedBy
            );


        return res.status(200).json({

            message:
                "Fee payment collected successfully",

            feeRecord
        });

    } catch (error: any) {

        console.error(
            "Error collecting fee:",
            error
        );


        if (
            error.message ===
            "Paid amount cannot exceed total fee amount"
        ) {

            return res.status(400).json({
                error: error.message
            });
        }


        return res.status(500).json({
            error:
                "Failed to record fee payment"
        });
    }
};


/* =====================================================
   4. GET STUDENT FEES
===================================================== */

export const getStudentFeesController = async (
    req: Request,
    res: Response
) => {

    try {

        const {
            studentId
        } = req.params;


        const {
            academicYear
        } = req.query;


        const fees =
            await getStudentFees(
                studentId as string,
                academicYear as string | undefined
            );


        return res.status(200).json(
            fees
        );

    } catch (error) {

        console.error(
            "Error fetching student fees:",
            error
        );

        return res.status(500).json({
            error:
                "Failed to fetch student fees"
        });
    }
};