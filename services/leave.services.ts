import { query } from "../database/db.js";


// ==========================================
// TEACHER LEAVE
// ==========================================

export const applyTeacherLeave = async (
    teacherId: string,
    leaveType: string,
    fromDate: string,
    toDate: string,
    reason?: string
) => {

    const result = await query(
        `INSERT INTO teacher_leave_applications (
            teacher_id,
            leave_type,
            from_date,
            to_date,
            reason,
            status
        )
        VALUES ($1, $2, $3, $4, $5, 'pending')
        RETURNING *`,
        [
            teacherId,
            leaveType,
            fromDate,
            toDate,
            reason || null
        ]
    );

    return result.rows[0];
};


export const getTeacherLeaveApplications = async (
    schoolId: string,
    status?: string
) => {

    let sql = `
        SELECT
            tla.id,
            tla.teacher_id,
            u.name AS teacher_name,
            u.email,
            tla.leave_type,
            tla.from_date,
            tla.to_date,
            tla.reason,
            tla.status,
            tla.created_at,
            tla.reviewed_at,
            ru.name AS reviewed_by_name
        FROM teacher_leave_applications tla

        JOIN teachers t
            ON tla.teacher_id = t.id

        JOIN users u
            ON t.user_id = u.id

        LEFT JOIN users ru
            ON tla.reviewed_by = ru.id

        WHERE t.school_id = $1
    `;

    const params: string[] = [schoolId];

    if (status) {
        params.push(status);

        sql += ` AND tla.status = $${params.length}`;
    }

    sql += ` ORDER BY tla.created_at DESC`;

    const result = await query(sql, params);

    return result.rows;
};


export const updateTeacherLeave = async (
    id: string,
    status: "approved" | "rejected",
    reviewedBy?: string
) => {

    const result = await query(
        `UPDATE teacher_leave_applications

         SET
            status = $1,
            reviewed_by = $2,
            reviewed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP

         WHERE id = $3

         RETURNING *`,
        [
            status,
            reviewedBy || null,
            id
        ]
    );

    return result.rows[0];
};


// ==========================================
// STUDENT LEAVE
// ==========================================

export const applyStudentLeave = async (
    studentId: string,
    appliedBy: string,
    leaveType: string,
    fromDate: string,
    toDate: string,
    reason?: string
) => {

    const result = await query(
        `INSERT INTO student_leave_applications (
            student_id,
            applied_by,
            leave_type,
            from_date,
            to_date,
            reason,
            status
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'pending')
        RETURNING *`,
        [
            studentId,
            appliedBy,
            leaveType,
            fromDate,
            toDate,
            reason || null
        ]
    );

    return result.rows[0];
};


export const getStudentLeaveApplications = async (
    schoolId: string,
    studentClass?: string,
    status?: string
) => {

    let sql = `
        SELECT
            sla.id,
            sla.student_id,
            s.first_name,
            s.last_name,
            s.student_class,
            s.section,
            sla.leave_type,
            sla.from_date,
            sla.to_date,
            sla.reason,
            sla.status,
            sla.created_at,
            u.name AS applied_by_name

        FROM student_leave_applications sla

        JOIN students s
            ON sla.student_id = s.id

        JOIN users u
            ON sla.applied_by = u.id

        WHERE s.school_id = $1
    `;

    const params: string[] = [schoolId];

    if (studentClass) {

        params.push(studentClass);

        sql += ` AND s.student_class = $${params.length}`;
    }

    if (status) {

        params.push(status);

        sql += ` AND sla.status = $${params.length}`;
    }

    sql += ` ORDER BY sla.created_at DESC`;

    const result = await query(sql, params);

    return result.rows;
};