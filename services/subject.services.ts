import { query } from "../database/db.js";
import { ICreateSubjectDTO } from "../interfaces/subject.interface.js";

export const createSubject = async (data: ICreateSubjectDTO) => {
    const { schoolId, name } = data;

    const result = await query(
        `INSERT INTO subjects (school_id, name)
         VALUES ($1, $2)
         ON CONFLICT (school_id, name)
         DO NOTHING
         RETURNING *`,
        [schoolId, name]
    );

    return result.rows[0];
};

export const getSubjects = async (schoolId: string) => {
    const result = await query(
        `SELECT *
         FROM subjects
         WHERE school_id = $1
         ORDER BY name ASC`,
        [schoolId]
    );

    return result.rows;
};
