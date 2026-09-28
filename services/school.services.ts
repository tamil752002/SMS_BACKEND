import { query } from "../database/db.js";
import { ICreateSchoolDTO } from "../interfaces/school.interface.js";

export const createSchool = async (data: ICreateSchoolDTO) => {
    const { name, address, contact_number, email, student_user_id_prefix } = data;

    const school = await query(
        `INSERT INTO schools (name, address, contact_number, email, student_user_id_prefix)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, address, contact_number, email, student_user_id_prefix`,
        [
            name,
            address || null,
            contact_number || null,
            email || null,
            student_user_id_prefix || null
        ]
    );

    return school.rows[0];
};

export const getSchool = async () => {
    const school = await query(
        `SELECT id, name, address, contact_number, email, student_user_id_prefix
         FROM schools
         ORDER BY created_at DESC`
    );

    return school.rows;
};
