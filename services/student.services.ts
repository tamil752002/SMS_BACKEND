import { query, getClient } from "../database/db.js";
import { ICreateStudentDTO, IStudentFilter } from "../interfaces/student.interface.js";

export const createStudent = async (data: ICreateStudentDTO) => {
    const {
        schoolId,
        admissionNumber,
        password,
        firstName,
        middleName,
        lastName,
        studentAadhar,
        admissionDate,
        fatherName,
        fatherAadhar,
        motherName,
        motherAadhar,
        studentClass,
        section,
        medium,
        dateOfBirth,
        gender,
        admissionClass,
        location,
        penNumber,
        caste,
        subCaste,
        religion,
        motherTongue,
        parentMobile,
        mobileNumber,
        emailAddress,
        address,
        profilePhoto
    } = data;

    const client = await getClient();

    try {
        await client.query("BEGIN");

        // 1. Check school
        const school = await client.query(
            `SELECT id FROM schools WHERE id = $1`,
            [schoolId]
        );

        if (school.rows.length === 0) {
            throw new Error("School not found");
        }

        // 2. Check admission number
        const existingStudent = await client.query(
            `SELECT id FROM users WHERE username = $1`,
            [admissionNumber]
        );

        if (existingStudent.rows.length > 0) {
            throw new Error("Admission number already taken");
        }

        // 3. Create student user
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
            VALUES ($1, $2, 'student', $3, $4, $5, 'active')
            RETURNING id, username, role, name, email, phone_number, status`,
            [
                admissionNumber,
                password,
                `${firstName} ${lastName || ""}`.trim(),
                emailAddress || null,
                mobileNumber
            ]
        );

        const userId = userResult.rows[0].id;

        // 4. Create parent user
        const parentUsername = `p_${admissionNumber}`;

        const parentName =
            fatherName ||
            motherName ||
            `Parent of ${firstName}`;

        const parentUserResult = await client.query(
            `INSERT INTO users
            (
                username,
                password,
                role,
                name,
                phone_number,
                status
            )
            VALUES ($1, $2, 'parent', $3, $4, 'active')

            ON CONFLICT (username)
            DO UPDATE SET
                updated_at = CURRENT_TIMESTAMP

            RETURNING id`,
            [
                parentUsername,
                password,
                parentName,
                parentMobile || mobileNumber
            ]
        );

        const parentUserId = parentUserResult.rows[0].id;

        // 5. Create student
        const studentResult = await client.query(
            `INSERT INTO students
            (
                user_id,
                school_id,
                parent_user_id,
                admission_number,
                admission_date,
                first_name,
                middle_name,
                last_name,
                student_aadhar,
                father_name,
                father_aadhar,
                mother_name,
                mother_aadhar,
                student_class,
                section,
                medium,
                date_of_birth,
                gender,
                location,
                address,
                admission_class,
                mobile_number,
                parent_mobile,
                pen_number,
                caste,
                sub_caste,
                religion,
                mother_tongue,
                profile_photo,
                email_address,
                status
            )
            VALUES
            (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15,
                $16, $17, $18, $19, $20,
                $21, $22, $23, $24, $25,
                $26, $27, $28, $29, $30,
                'active'
            )
            RETURNING *`,
            [
                userId,
                schoolId,
                parentUserId,
                admissionNumber,
                admissionDate,
                firstName,
                middleName || null,
                lastName || null,
                studentAadhar || null,
                fatherName,
                fatherAadhar || null,
                motherName,
                motherAadhar || null,
                studentClass,
                section,
                medium,
                dateOfBirth,
                gender,
                location || null,
                address || null,
                admissionClass || null,
                mobileNumber,
                parentMobile,
                penNumber || null,
                caste || null,
                subCaste || null,
                religion || null,
                motherTongue || null,
                profilePhoto || null,
                emailAddress || null
            ]
        );

        // 6. Commit
        await client.query("COMMIT");

        return {
            user: userResult.rows[0],
            student: studentResult.rows[0]
        };

    } catch (err: any) {
        await client.query("ROLLBACK");

        console.error("========== CREATE STUDENT ERROR ==========");
        console.error("Message:", err.message);
        console.error("Code:", err.code);
        console.error("Detail:", err.detail);
        console.error("Hint:", err.hint);
        console.error("Table:", err.table);
        console.error("Column:", err.column);
        console.error("Constraint:", err.constraint);
        console.error("==========================================");

        throw err;

    } finally {
        client.release();
    }
};

export const getStudents = async (filter?: IStudentFilter) => {
    const { schoolId, studentClass, section } = filter || {};

    let queryText = `
        SELECT 
            s.*,
            u.status AS user_status
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE 1=1
    `;

    const params: string[] = [];

    if (schoolId) {
        params.push(schoolId);
        queryText += `
            AND s.school_id = $${params.length}
        `;
    }

    if (studentClass) {
        params.push(studentClass);
        queryText += `
            AND s.student_class = $${params.length}
        `;
    }

    if (section) {
        params.push(section);
        queryText += `
            AND s.section = $${params.length}
        `;
    }

    queryText += `
        ORDER BY s.created_at DESC
    `;

    const result = await query(queryText, params);
    return result.rows;
};
