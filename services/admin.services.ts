import { query, getClient } from "../database/db"
// CREATE TABLE users (
//     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
//     username VARCHAR(255) UNIQUE NOT NULL,
//     password VARCHAR(255) NOT NULL,
//     role VARCHAR(50) NOT NULL CHECK (role IN ('developer', 'admin', 'student', 'teacher', 'parent')),
//     name VARCHAR(255) NOT NULL,
//     email VARCHAR(255),
//     phone_number VARCHAR(20),
//     status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'inactive')),
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     last_login TIMESTAMP
// );
// CREATE TABLE admins (
//     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
//     user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
//     school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );
export const createAdmin = async (
    name: string,
    username: string,
    school_id: number,
    password: string,
    role: string,
    email?: string,
    phone_number?: string,


) => {

    const client = await getClient();

    try {
        await client.query("BEGIN");

        const userName = await query(
            "SELECT * FROM users WHERE username = $1",
            [username]
        );

        if (userName.rows.length > 0) {
            throw new Error("Username already exists");
        }
        const school = await query(`SELECT * FROM schools WHERE id=$1`, [school_id])

        if (school.rows.length == 0) {
            throw new Error("school is not available");
        }

        const result = await query(
            `INSERT INTO users
        (username, password, role, name, email, phone_number)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, username, role, name, email, phone_number, status`,
            [
                username,
                password,
                role,
                name,
                email,
                phone_number
            ]
        );

        const user_id = result.rows[0].id;

        const admin = await query(`INSERT INTO admins (user_id,school_id) VALUES($1,$2) 
            RETURNING id,user_id,school_id`, [user_id, school_id])
        await client.query("COMMIT");
        return admin.rows[0]
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }




}

export const getAdmin = async () => {
    
    const res = await query(
        `SELECT * FROM admins as Ad
        JOIN users as u on u.id=ad.user_id
        JOIN schools as s on s.id=ad.school_id`)

    return res.rows
}