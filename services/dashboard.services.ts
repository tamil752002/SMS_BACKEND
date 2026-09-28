import { query } from "../database/db.js";

export const getDashboardStats = async (schoolId: string) => {

    const today = new Date().toISOString().slice(0, 10);

    const [
        countsResult,
        attendanceResult,
        feeResult,
        pendingLeavesResult
    ] = await Promise.all([

        // 1. Basic counts
        query(
            `
            SELECT
                (SELECT COUNT(*)
                 FROM students
                 WHERE school_id = $1
                 AND status = 'active') AS total_students,

                (SELECT COUNT(*)
                 FROM teachers
                 WHERE school_id = $1
                 AND status = 'active') AS total_teachers,

                (SELECT COUNT(*)
                 FROM classes
                 WHERE school_id = $1) AS total_classes
            `,
            [schoolId]
        ),

        // 2. Today's attendance
        query(
            `
            SELECT
                COUNT(*) AS total_marked,

                COUNT(*) FILTER (
                    WHERE ar.status = 'present'
                ) AS present_count,

                COUNT(*) FILTER (
                    WHERE ar.status = 'absent'
                ) AS absent_count

            FROM attendance_records ar

            JOIN students s
                ON ar.student_id = s.id

            WHERE s.school_id = $1
            AND ar.date = $2
            `,
            [schoolId, today]
        ),

        // 3. Fee statistics
        query(
            `
            SELECT
                COALESCE(SUM(fr.amount), 0) AS total_amount,

                COALESCE(SUM(fr.paid_amount), 0) AS total_paid

            FROM fee_records fr

            JOIN students s
                ON fr.student_id = s.id

            WHERE s.school_id = $1
            `,
            [schoolId]
        ),

        // 4. Pending leaves
        query(
            `
            SELECT

                (
                    SELECT COUNT(*)
                    FROM teacher_leave_applications tla

                    JOIN teachers t
                        ON tla.teacher_id = t.id

                    WHERE t.school_id = $1
                    AND tla.status = 'pending'
                ) AS teacher_pending_leaves,

                (
                    SELECT COUNT(*)
                    FROM student_leave_applications sla

                    JOIN students s
                        ON sla.student_id = s.id

                    WHERE s.school_id = $1
                    AND sla.status = 'pending'
                ) AS student_pending_leaves
            `,
            [schoolId]
        )
    ]);

    // -------------------------
    // Attendance calculation
    // -------------------------

    const attendance = attendanceResult.rows[0];

    const totalMarked = Number(attendance.total_marked || 0);
    const presentCount = Number(attendance.present_count || 0);
    const absentCount = Number(attendance.absent_count || 0);

    const attendancePercentage =
        totalMarked > 0
            ? ((presentCount / totalMarked) * 100).toFixed(1)
            : "0.0";


    // -------------------------
    // Fee calculation
    // -------------------------

    const fees = feeResult.rows[0];

    const totalFeeAmount = Number(fees.total_amount || 0);
    const totalCollected = Number(fees.total_paid || 0);

    const totalPending =
        totalFeeAmount - totalCollected;

    const feePercentage =
        totalFeeAmount > 0
            ? ((totalCollected / totalFeeAmount) * 100).toFixed(1)
            : "0.0";


    // -------------------------
    // Counts
    // -------------------------

    const counts = countsResult.rows[0];

    const leaves = pendingLeavesResult.rows[0];


    // -------------------------
    // Final response
    // -------------------------

    return {
        schoolId,

        overview: {
            totalStudents: Number(counts.total_students || 0),
            totalTeachers: Number(counts.total_teachers || 0),
            totalClasses: Number(counts.total_classes || 0)
        },

        todayAttendance: {
            date: today,
            totalMarked,
            presentCount,
            absentCount,
            percentage: `${attendancePercentage}%`
        },

        financials: {
            totalFeeAmount,
            totalCollected,
            totalPending,
            collectedPercentage: `${feePercentage}%`
        },

        pendingActions: {
            teacherLeaves: Number(
                leaves.teacher_pending_leaves || 0
            ),

            studentLeaves: Number(
                leaves.student_pending_leaves || 0
            )
        }
    };
};