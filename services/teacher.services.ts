import { getClient, query } from "../database/db.js";
import { ICreateTeacherDTO } from "../interfaces/teacher.interface.js";

export const createTeacher = async (data: ICreateTeacherDTO) => {
    const {
        schoolId,
        name,
        username,
        password,
        email,
        phoneNumber,
        salary,
        joinDate
    } = data;

    const client = await getClient();

    try {
        await client.query("BEGIN");

        // 1. Check school
        const schoolCheck = await client.query(
            `SELECT id FROM schools WHERE id = $1`,
            [schoolId]
        );

        if (schoolCheck.rows.length === 0) {
            throw new Error("School not found");
        }

        // 2. Check username
        const userCheck = await client.query(
            `SELECT id FROM users WHERE username = $1`,
            [username]
        );

        if (userCheck.rows.length > 0) {
            throw new Error("Username already exists");
        }

        // 3. Create user
        const userResult = await client.query(
            `INSERT INTO users
            (
                username,
                password,
                role,
                name,
                email,
                phone_number,
                status
            )
            VALUES ($1, $2, 'teacher', $3, $4, $5, 'active')
            RETURNING id, username, role, name, email, phone_number, status`,
            [
                username,
                password,
                name,
                email || null,
                phoneNumber || null
            ]
        );

        const user = userResult.rows[0];

        // 4. Create teacher
        const teacherResult = await client.query(
            `INSERT INTO teachers
            (
                user_id,
                school_id,
                salary,
                join_date,
                status
            )
            VALUES ($1, $2, $3, $4, 'active')
            RETURNING *`,
            [
                user.id,
                schoolId,
                salary || null,
                joinDate || new Date()
            ]
        );

        const teacher = teacherResult.rows[0];

        await client.query("COMMIT");

        return {
            teacher: {
                id: teacher.id,
                userId: user.id,
                schoolId: schoolId,
                name: user.name,
                username: user.username,
                email: user.email,
                phoneNumber: user.phone_number,
                salary: teacher.salary,
                joinDate: teacher.join_date,
                status: teacher.status
            }
        };

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Create Teacher Error:", error);
        throw error;
    } finally {
        client.release();
    }
};

export const getTeachers = async (schoolId: string) => {
    const result = await query(
        `SELECT
            t.id AS teacher_id,
            t.school_id,
            t.salary,
            t.join_date,
            t.status,

            u.id AS user_id,
            u.username,
            u.name,
            u.email,
            u.phone_number

        FROM teachers t

        JOIN users u
            ON t.user_id = u.id

        WHERE t.school_id = $1

        ORDER BY u.name ASC`,
        [schoolId]
    );

    return result.rows;
};
