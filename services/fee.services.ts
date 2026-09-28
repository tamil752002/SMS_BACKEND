import { getClient, query } from "../database/db.js";


/* =====================================================
   1. CREATE / UPDATE FEE STRUCTURE
===================================================== */

export const saveFeeStructure = async (
    schoolId: string,
    className: string,
    academicYear: string,
    tuitionFee: number,
    schoolFee: number,
    examFee: number,
    vanFee: number,
    booksFee: number,
    uniformFee: number,
    otherFees: any[]
) => {

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

        ON CONFLICT (
            class_name,
            academic_year,
            structure_type,
            school_id
        )

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


/* =====================================================
   2. GET FEE STRUCTURES
===================================================== */

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

        sql += `
            AND academic_year = $2
        `;

        params.push(academicYear);
    }


    sql += `
        ORDER BY class_name ASC
    `;


    const result = await query(
        sql,
        params
    );


    return result.rows;
};


/* =====================================================
   3. COLLECT FEE
===================================================== */

export const collectFee = async (
    studentId: string,
    academicYear: string,
    feeType: string,
    amount: number | undefined,
    paidAmount: number,
    paidDate: string,
    receiptNumber?: string,
    collectedBy?: string
) => {

    const client = await getClient();


    try {

        await client.query("BEGIN");


        // Check existing fee record
        const existing = await client.query(
            `SELECT
                id,
                amount,
                paid_amount

             FROM fee_records

             WHERE student_id = $1
             AND fee_type = $2
             AND academic_year = $3`,
            [
                studentId,
                feeType,
                academicYear
            ]
        );


        const totalAmount =
            existing.rows.length > 0
                ? parseFloat(existing.rows[0].amount)
                : parseFloat(
                    String(amount || paidAmount)
                );


        const currentPaid =
            parseFloat(String(paidAmount));


        if (currentPaid > totalAmount) {

            throw new Error(
                "Paid amount cannot exceed total fee amount"
            );
        }


        const status =
            currentPaid >= totalAmount
                ? "paid"
                : currentPaid > 0
                    ? "partial"
                    : "pending";


        const autoReceipt =
            receiptNumber ||
            `REC-${Date.now()}`;


        let result;


        // UPDATE existing record
        if (existing.rows.length > 0) {

            result = await client.query(
                `UPDATE fee_records

                 SET
                    paid_amount = $1,
                    paid_date = $2,
                    status = $3,
                    receipt_number = $4,
                    collected_by = $5,
                    updated_at = CURRENT_TIMESTAMP

                 WHERE id = $6

                 RETURNING *`,
                [
                    currentPaid,
                    paidDate,
                    status,
                    autoReceipt,
                    collectedBy || null,
                    existing.rows[0].id
                ]
            );


        } else {

            // INSERT new record
            result = await client.query(
                `INSERT INTO fee_records (
                    student_id,
                    academic_year,
                    fee_type,
                    amount,
                    paid_amount,
                    paid_date,
                    status,
                    receipt_number,
                    collected_by
                )

                VALUES (
                    $1, $2, $3, $4, $5,
                    $6, $7, $8, $9
                )

                RETURNING *`,
                [
                    studentId,
                    academicYear,
                    feeType,
                    totalAmount,
                    currentPaid,
                    paidDate,
                    status,
                    autoReceipt,
                    collectedBy || null
                ]
            );
        }


        await client.query("COMMIT");


        return result.rows[0];

    } catch (error) {

        await client.query("ROLLBACK");

        console.error(
            "Collect Fee Error:",
            error
        );

        throw error;

    } finally {

        client.release();
    }
};


/* =====================================================
   4. GET STUDENT FEES
===================================================== */

export const getStudentFees = async (
    studentId: string,
    academicYear?: string
) => {

    let sql = `
        SELECT
            id,
            fee_type,
            other_fee_name,
            amount,
            paid_amount,
            remaining_fee,
            status,
            paid_date,
            receipt_number,
            academic_year

        FROM fee_records

        WHERE student_id = $1
    `;


    const params: string[] = [
        studentId
    ];


    if (academicYear) {

        sql += `
            AND academic_year = $2
        `;

        params.push(academicYear);
    }


    sql += `
        ORDER BY fee_type ASC
    `;


    const result = await query(
        sql,
        params
    );


    const records = result.rows;


    const totalFees = records.reduce(
        (sum, record) =>
            sum + parseFloat(record.amount || 0),
        0
    );


    const totalPaid = records.reduce(
        (sum, record) =>
            sum + parseFloat(record.paid_amount || 0),
        0
    );


    const totalRemaining =
        totalFees - totalPaid;


    const status =
        totalRemaining <= 0 && totalFees > 0
            ? "fully_paid"
            : totalPaid > 0
                ? "partially_paid"
                : "unpaid";


    return {
        studentId,

        summary: {
            totalFees,
            totalPaid,
            totalRemaining,
            status
        },

        records
    };
};