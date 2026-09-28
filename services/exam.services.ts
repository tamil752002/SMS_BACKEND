import { getClient, query } from "../database/db.js";
import { ICreateExamDTO, ISaveBulkMarksDTO } from "../interfaces/exam.interface.js";

const calculateGrade = (percentage: number): string => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
};

export const createExam = async (data: ICreateExamDTO) => {
    const {
        schoolId,
        name,
        type,
        className,
        subjects,
        startDate,
        endDate,
        academicYear,
        totalMarks
    } = data;

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
            'upcoming'
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

export const saveBulkMarks = async (data: ISaveBulkMarksDTO) => {
    const {
        examId,
        subject,
        examType,
        academicYear,
        marksList
    } = data;

    const client = await getClient();

    try {
        await client.query("BEGIN");

        const upsertQuery = `
            INSERT INTO exam_records (
                student_id,
                exam_id,
                subject,
                exam_type,
                max_marks,
                obtained_marks,
                grade,
                remarks,
                is_absent,
                academic_year
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (student_id, exam_id, subject)
            DO UPDATE SET
                obtained_marks = EXCLUDED.obtained_marks,
                max_marks      = EXCLUDED.max_marks,
                grade          = EXCLUDED.grade,
                remarks        = EXCLUDED.remarks,
                is_absent      = EXCLUDED.is_absent,
                exam_type      = EXCLUDED.exam_type,
                academic_year  = EXCLUDED.academic_year
        `;

        for (const item of marksList) {
            const {
                studentId,
                maxMarks = 100,
                obtainedMarks = 0,
                remarks,
                isAbsent = false
            } = item;

            const percentage = isAbsent
                ? 0
                : maxMarks > 0
                ? (obtainedMarks / maxMarks) * 100
                : 0;

            const grade = isAbsent
                ? "AB"
                : calculateGrade(percentage);

            await client.query(upsertQuery, [
                studentId,
                examId,
                subject,
                examType,
                maxMarks,
                isAbsent ? 0 : obtainedMarks,
                grade,
                remarks || null,
                isAbsent,
                academicYear || null
            ]);
        }

        await client.query("COMMIT");

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Save Bulk Marks Error:", error);
        throw error;
    } finally {
        client.release();
    }
};

export const getStudentReportCard = async (
    studentId: string,
    examId?: string,
    academicYear?: string
) => {
    let sql = `
        SELECT
            er.id,
            er.subject,
            er.max_marks,
            er.obtained_marks,
            er.grade,
            er.remarks,
            er.is_absent,
            er.exam_type,
            er.academic_year,

            e.id AS exam_id,
            e.name AS exam_name,
            e.type AS exam_category,

            s.admission_number,
            s.first_name,
            s.last_name,
            s.student_class,
            s.section

        FROM exam_records er
        JOIN exams e ON er.exam_id = e.id
        JOIN students s ON er.student_id = s.id

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
        (sum, r) => sum + Number(r.max_marks || 0),
        0
    );

    const totalObtained = rows.reduce(
        (sum, r) => sum + Number(r.obtained_marks || 0),
        0
    );

    const overallPercentage =
        totalMax > 0
            ? ((totalObtained / totalMax) * 100).toFixed(1)
            : "0.0";

    const overallGrade = calculateGrade(
        Number(overallPercentage)
    );

    return {
        student: rows[0]
            ? {
                  admissionNumber: rows[0].admission_number,
                  name: `${rows[0].first_name} ${rows[0].last_name || ""}`.trim(),
                  class: rows[0].student_class,
                  section: rows[0].section
              }
            : null,
        subjects: rows,
        summary: {
            totalMaxMarks: totalMax,
            totalObtainedMarks: totalObtained,
            percentage: `${overallPercentage}%`,
            grade: overallGrade
        }
    };
};
