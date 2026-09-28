import { query } from "../database/db"
export const createSchool = async (
    name: string,
    address?: string,
    contact_number?: string,
    email?: string,
    student_user_id_prefix?: string,

) => {
    const result = await query(`
        INSERT INTO schools(name,address,contact_number,email,student_user_id_prefix)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id,name,address,contact_number,email,student_user_id_prefix`,
        [name, address, contact_number, email, student_user_id_prefix
        ]
    )
    return result.rows[0];
}

export const getSchool = async () => {
    const school = await query(`SELECT id,name,address,contact_number,email,student_user_id_prefix from schools ORDER BY created_at DESC `)

    return school.rows
}