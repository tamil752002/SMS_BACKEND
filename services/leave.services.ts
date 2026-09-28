import { query } from "../database/db.js";
import {
    IApplyTeacherLeaveDTO,
    IUpdateTeacherLeaveDTO,
    IApplyStudentLeaveDTO
} from "../interfaces/leave.interface.js";

export const applyTeacherLeave = async (data: IApplyTeacherLeaveDTO) => {
    const { teacherId, leaveType, fromDate, toDate, reason } = data;

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
        [teacherId, leaveType, fromDate, toDate, reason || null]
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
            tla.leave_type,
            tla.from_date,
            tla.to_date,
            tla.reason,
            tla.status,
            tla.reviewed_by,
            tla.created_at,

            t.school_id,

            u.name  AS teacher_name,
            u.email AS teacher_email

        FROM teacher_leave_applications tla
        JOIN teachers t ON tla.teacher_id = t.id
        JOIN users u    ON t.user_id = u.id

        WHERE t.school_id = $1
    `;

    const params: string[] = [schoolId];

    if (status) {
        params.push(status);
        sql += ` AND tla.status = $2`;
    }

    sql += ` ORDER BY tla.created_at DESC`;

    const result = await query(sql, params);
    return result.rows;
};

export const updateTeacherLeave = async (data: IUpdateTeacherLeaveDTO) => {
    const { id, status, reviewedBy } = data;

    const result = await query(
        `UPDATE teacher_leave_applications
         SET status = $1,
             reviewed_by = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [status, reviewedBy || null, id]
    );

    return result.rows[0];
};

export const applyStudentLeave = async (data: IApplyStudentLeaveDTO) => {
    const { studentId, appliedBy, leaveType, fromDate, toDate, reason } = data;

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
        [studentId, appliedBy, leaveType, fromDate, toDate, reason || null]
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
            sla.applied_by,
            sla.leave_type,
            sla.from_date,
            sla.to_date,
            sla.reason,
            sla.status,
            sla.created_at,

            s.admission_number,
            s.first_name,
            s.last_name,
            s.student_class,
            s.section,
            s.school_id

        FROM student_leave_applications sla
        JOIN students s ON sla.student_id = s.id

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
