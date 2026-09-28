import { getClient, query } from "../database/db.js";


/* =====================================================
   1. BULK ATTENDANCE
===================================================== */

export const markBulkAttendance = async (
    date: string,
    session: string,
    records: {
        studentId: string;
        status: string;
    }[],
    markedBy?: string
) => {

    const client = await getClient();

    try {

        await client.query("BEGIN");


        const upsertQuery = `
            INSERT INTO attendance_records
            (
                student_id,
                date,
                session,
                status,
                marked_by
            )
            VALUES ($1, $2, $3, $4, $5)

            ON CONFLICT (student_id, date, session)

            DO UPDATE SET
                status = EXCLUDED.status,
                marked_by = EXCLUDED.marked_by,
                timestamp = CURRENT_TIMESTAMP
        `;


        for (const record of records) {

            const {
                studentId,
                status
            } = record;


            if (
                !studentId ||
                !["present", "absent"].includes(status)
            ) {
                continue;
            }


            await client.query(
                upsertQuery,
                [
                    studentId,
                    date,
                    session,
                    status,
                    markedBy || null
                ]
            );
        }


        await client.query("COMMIT");

    } catch (error) {

        await client.query("ROLLBACK");

        console.error(
            "Mark Attendance Error:",
            error
        );

        throw error;

    } finally {

        client.release();
    }
};


/* =====================================================
   2. GET CLASS ATTENDANCE
===================================================== */

export const getClassAttendance = async (
    schoolId: string,
    studentClass: string,
    date: string,
    section?: string,
    session: string = "morning"
) => {

    const result = await query(
        `SELECT
            s.id AS student_id,
            s.admission_number,
            s.first_name,
            s.last_name,
            s.student_class,
            s.section,

            ar.date,
            ar.session,

            COALESCE(
                ar.status,
                'unmarked'
            ) AS status,

            ar.timestamp AS marked_at

        FROM students s

        LEFT JOIN attendance_records ar
            ON s.id = ar.student_id
            AND ar.date = $1
            AND ar.session = $2

        WHERE s.school_id = $3
          AND s.student_class = $4
          AND ($5::text IS NULL OR s.section = $5)
          AND s.status = 'active'

        ORDER BY s.first_name ASC`,
        [
            date,
            session,
            schoolId,
            studentClass,
            section || null
        ]
    );


    const rows = result.rows;


    const totalStudents = rows.length;

    const presentCount = rows.filter(
        (student) => student.status === "present"
    ).length;

    const absentCount = rows.filter(
        (student) => student.status === "absent"
    ).length;

    const unmarkedCount = rows.filter(
        (student) => student.status === "unmarked"
    ).length;


    return {
        date,
        session,
        totalStudents,
        presentCount,
        absentCount,
        unmarkedCount,
        students: rows
    };
};


/* =====================================================
   3. SINGLE STUDENT ATTENDANCE
===================================================== */

export const getStudentAttendance = async (
    studentId: string,
    month?: string,
    year?: string
) => {

    let filterQuery = "";

    const params: string[] = [
        studentId
    ];


    if (month && year) {

        params.push(
            year,
            month
        );

        filterQuery = `
            AND EXTRACT(YEAR FROM date) = $2
            AND EXTRACT(MONTH FROM date) = $3
        `;
    }


    const historyResult = await query(
        `SELECT
            id,
            date,
            session,
            status,
            timestamp

         FROM attendance_records

         WHERE student_id = $1
         ${filterQuery}

         ORDER BY date DESC, session ASC`,
        params
    );


    const rows = historyResult.rows;


    const totalDays = rows.length;

    const presentDays = rows.filter(
        (row) => row.status === "present"
    ).length;

    const absentDays = rows.filter(
        (row) => row.status === "absent"
    ).length;


    const percentage =
        totalDays > 0
            ? ((presentDays / totalDays) * 100).toFixed(1)
            : "0";


    return {
        studentId,

        summary: {
            totalDays,
            presentDays,
            absentDays,
            percentage: `${percentage}%`
        },

        history: rows
    };
};