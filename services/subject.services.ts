import { query } from "../database/db.js";

export const createSubject = async (
    schoolId: string,
    name: string
) => {

    const result = await query(
        `INSERT INTO subjects
        (
            school_id,
            name
        )
        VALUES ($1, $2)
        RETURNING *`,
        [
            schoolId,
            name
        ]
    );

    return result.rows[0];
};


export const getSubjects = async (
    schoolId: string
) => {

    const result = await query(
        `SELECT *
         FROM subjects
         WHERE school_id = $1
         ORDER BY name ASC`,
        [schoolId]
    );

    return result.rows;
};