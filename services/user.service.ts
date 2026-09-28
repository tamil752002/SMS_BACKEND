import { query } from "../database/db.js";

export const getAllUsers = async () => {
    const result = await query(
        "SELECT id, username, role, name, email, status FROM users ORDER BY created_at DESC"
    );

    return result.rows;
};

export const createUser = async (
    username: string,
    hashedPassword: string,
    role: string,
    name: string,
    email?: string,
    phone_number?: string
) => {
    const result = await query(
        `INSERT INTO users
        (username, password, role, name, email, phone_number)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, username, role, name, email, phone_number, status`,
        [
            username,
            hashedPassword,
            role,
            name,
            email,
            phone_number
        ]
    );

    return result.rows[0];
};