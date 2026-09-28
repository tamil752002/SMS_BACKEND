import { getClient, query } from "../database/db.js";

const calculateGrade = (percentage: number): string => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
};

// Create Exam
export const createExam = async (
    schoolId: string,
    name: string,
    type: string,
    className: string,
    subjects: string[],
    startDate: string | undefined,
    endDate: string | undefined,
    academicYear: string,
    totalMarks: number
) => {

    const result = await query(
        `INSERT INTO exams (
            school_id,
            name,
            type,
            class_name,
            subjects,
            start_date,
            end_date,
            academic_year,
            total_marks,
            status
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5::jsonb,
            $6,
            $7,
            $8,
            $9,
            'scheduled'
        )
        RETURNING *`,
        [
            schoolId,
            name,
            type,
            className,
            JSON.stringify(subjects),
            startDate || null,
            endDate || null,
            academicYear,
            totalMarks
        ]
    );

    return result.rows[0];
};


// Get Exams
export const getExams = async (
    schoolId: string,
    className?: string,
    academicYear?: string
) => {

    let sql = `
        SELECT *
        FROM exams
        WHERE school_id = $1
    `;

    const params: string[] = [schoolId];

    if (className) {
        params.push(className);
        sql += ` AND class_name = $${params.length}`;
    }

    if (academicYear) {
        params.push(academicYear);
        sql += ` AND academic_year = $${params.length}`;
    }

    sql += ` ORDER BY created_at DESC`;

    const result = await query(sql, params);

    return result.rows;
};


// Bulk Marks
export const saveBulkMarks = async (
    examId: string,
    subject: string,
    examType: string,
    academicYear: string | undefined,
    marksList: {
        studentId: string;
        maxMarks?: number;
        obtainedMarks?: number;
        remarks?: string;
        isAbsent?: boolean;
    }[]
) => {

    const client = await getClient();

    try {

        await client.query("BEGIN");

        for (const item of marksList) {

            const maxMarks = Number(item.maxMarks || 100);

            const isAbsent = Boolean(item.isAbsent);

            const obtainedMarks = isAbsent
                ? 0
                : Number(item.obtainedMarks || 0);

            const percentage =
                maxMarks > 0
                    ? (obtainedMarks / maxMarks) * 100
                    : 0;

            const grade = isAbsent
                ? "AB"
                : calculateGrade(percentage);

            const status = isAbsent
                ? "absent"
                : "scored";

            await client.query(
                `INSERT INTO exam_records (
                    student_id,
                    exam_id,
                    exam_type,
                    subject,
                    max_marks,
                    obtained_marks,
                    grade,
                    academic_year,
                    remarks,
                    status
                )
                VALUES (
                    $1,$2,$3,$4,$5,
                    $6,$7,$8,$9,$10
                )`,
                [
                    item.studentId,
                    examId,
                    examType,
                    subject,
                    maxMarks,
                    obtainedMarks,
                    grade,
                    academicYear || null,
                    item.remarks || null,
                    status
                ]
            );
        }

        await client.query("COMMIT");

        return {
            count: marksList.length,
            subject
        };

    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();

    }
};


// Student Report Card
export const getStudentReportCard = async (
    studentId: string,
    examId?: string,
    academicYear?: string
) => {

    let sql = `
        SELECT
            er.id AS record_id,
            er.subject,
            er.max_marks,
            er.obtained_marks,
            er.grade,
            er.status,
            er.remarks,
            e.name AS exam_name,
            e.type AS exam_type,
            e.academic_year
        FROM exam_records er

        LEFT JOIN exams e
            ON er.exam_id = e.id

        WHERE er.student_id = $1
    `;

    const params: string[] = [studentId];

    if (examId) {

        params.push(examId);

        sql += ` AND er.exam_id = $${params.length}`;
    }

    if (academicYear) {

        params.push(academicYear);

        sql += ` AND er.academic_year = $${params.length}`;
    }

    sql += ` ORDER BY er.subject ASC`;

    const result = await query(sql, params);

    const rows = result.rows;

    const totalMax = rows.reduce(
        (sum, row) => sum + Number(row.max_marks || 0),
        0
    );

    const totalObtained = rows.reduce(
        (sum, row) => sum + Number(row.obtained_marks || 0),
        0
    );

    const overallPercentage =
        totalMax > 0
            ? (totalObtained / totalMax) * 100
            : 0;

    const overallGrade =
        calculateGrade(overallPercentage);

    return {
        studentId,

        summary: {
            totalSubjects: rows.length,
            totalMaxMarks: totalMax,
            totalObtainedMarks: totalObtained,
            overallPercentage: `${overallPercentage.toFixed(1)}%`,
            overallGrade
        },

        subjects: rows
    };
};