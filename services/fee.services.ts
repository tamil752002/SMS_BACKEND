import { getClient, query } from "../database/db.js";
import { ISaveFeeStructureDTO, ICollectFeeDTO } from "../interfaces/fee.interface.js";

export const saveFeeStructure = async (data: ISaveFeeStructureDTO) => {
    const {
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
    } = data;

    const result = await query(
        `INSERT INTO fee_structures (
            school_id,
            class_name,
            academic_year,
            tuition_fee,
            school_fee,
            exam_fee,
            van_fee,
            books_fee,
            uniform_fee,
            other_fees
        )
        VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10::jsonb
        )
        ON CONFLICT (class_name, academic_year, school_id)
        DO UPDATE SET
            tuition_fee = EXCLUDED.tuition_fee,
            school_fee = EXCLUDED.school_fee,
            exam_fee = EXCLUDED.exam_fee,
            van_fee = EXCLUDED.van_fee,
            books_fee = EXCLUDED.books_fee,
            uniform_fee = EXCLUDED.uniform_fee,
            other_fees = EXCLUDED.other_fees,
            updated_at = CURRENT_TIMESTAMP
        RETURNING *`,
        [
            schoolId,
            className,
            academicYear,
            tuitionFee,
            schoolFee,
            examFee,
            vanFee,
            booksFee,
            uniformFee,
            JSON.stringify(otherFees)
        ]
    );

    return result.rows[0];
};

export const getFeeStructures = async (
    schoolId: string,
    academicYear?: string
) => {
    let sql = `
        SELECT *
        FROM fee_structures
        WHERE school_id = $1
    `;

    const params: string[] = [schoolId];

    if (academicYear) {
        params.push(academicYear);
        sql += ` AND academic_year = $2`;
    }

    sql += ` ORDER BY class_name ASC`;

    const result = await query(sql, params);
    return result.rows;
};

export const collectFee = async (data: ICollectFeeDTO) => {
    const {
        studentId,
        academicYear,
        feeType,
        amount,
        paidAmount,
        paidDate,
        receiptNumber,
        collectedBy
    } = data;

    const client = await getClient();

    try {
        await client.query("BEGIN");

        const existingResult = await client.query(
            `SELECT * FROM fee_records
             WHERE student_id = $1
               AND academic_year = $2
               AND fee_type = $3`,
            [studentId, academicYear, feeType]
        );

        let feeRecord;

        if (existingResult.rows.length > 0) {
            const existing = existingResult.rows[0];
            const newPaid = Number(existing.paid_amount) + paidAmount;
            const remaining = Number(existing.amount) - newPaid;
            const status = remaining <= 0 ? "paid" : "partial";

            const updateResult = await client.query(
                `UPDATE fee_records
                 SET paid_amount = $1,
                     remaining_fee = $2,
                     paid_date = $3,
                     status = $4,
                     receipt_number = COALESCE($5, receipt_number),
                     collected_by = COALESCE($6, collected_by),
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $7
                 RETURNING *`,
                [
                    newPaid,
                    Math.max(0, remaining),
                    paidDate,
                    status,
                    receiptNumber || null,
                    collectedBy || null,
                    existing.id
                ]
            );

            feeRecord = updateResult.rows[0];

        } else {
            const totalAmount = amount || paidAmount;
            const remaining = totalAmount - paidAmount;
            const status = remaining <= 0 ? "paid" : "partial";

            const insertResult = await client.query(
                `INSERT INTO fee_records (
                    student_id,
                    academic_year,
                    fee_type,
                    amount,
                    paid_amount,
                    remaining_fee,
                    paid_date,
                    status,
                    receipt_number,
                    collected_by
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *`,
                [
                    studentId,
                    academicYear,
                    feeType,
                    totalAmount,
                    paidAmount,
                    Math.max(0, remaining),
                    paidDate,
                    status,
                    receiptNumber || null,
                    collectedBy || null
                ]
            );

            feeRecord = insertResult.rows[0];
        }

        await client.query("COMMIT");
        return feeRecord;

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Collect Fee Error:", error);
        throw error;
    } finally {
        client.release();
    }
};

export const getStudentFees = async (
    studentId: string,
    academicYear?: string
) => {
    let sql = `
        SELECT *
        FROM fee_records
        WHERE student_id = $1
    `;

    const params: string[] = [studentId];

    if (academicYear) {
        params.push(academicYear);
        sql += ` AND academic_year = $2`;
    }

    sql += ` ORDER BY created_at DESC`;

    const result = await query(sql, params);
    return result.rows;
};
