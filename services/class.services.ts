import { query } from "../database/db.js";

export const createClass = async (
    schoolId: string,
    name: string,
    sections: string[],
    medium: string[],
    classTeacher?: string
) => {

    const result = await query(
        `INSERT INTO classes
        (
            school_id,
            name,
            sections,
            medium,
            class_teacher
        )
        VALUES ($1, $2, $3::jsonb, $4::jsonb, $5)

        ON CONFLICT (name, school_id)
        DO UPDATE SET
            sections = EXCLUDED.sections,
            medium = EXCLUDED.medium,
            class_teacher = EXCLUDED.class_teacher,
            updated_at = CURRENT_TIMESTAMP

        RETURNING *`,
        [
            schoolId,
            name,
            JSON.stringify(sections),
            JSON.stringify(medium),
            classTeacher || null
        ]
    );

    return result.rows[0];
};


export const getClasses = async (
    schoolId: string
) => {

    const result = await query(
        `SELECT *
         FROM classes
         WHERE school_id = $1
         ORDER BY name ASC`,
        [schoolId]
    );

    return result.rows;
};