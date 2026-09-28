import { getClient, query } from "../database/db.js";
import { ICreateAdminDTO } from "../interfaces/admin.interface.js";

export const createAdmin = async (data: ICreateAdminDTO) => {
    const { username, password, role, name, email, phone_number, school_id } = data;
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

        const school = await query(`SELECT * FROM schools WHERE id=$1`, [school_id]);

        if (school.rows.length === 0) {
            throw new Error("school is not available");
        }

        const result = await query(
            `INSERT INTO users (username, password, role, name, email, phone_number)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, username, role, name, email, phone_number, status`,
            [username, password, role, name, email || null, phone_number || null]
        );

        const user_id = result.rows[0].id;

        const admin = await query(
            `INSERT INTO admins (user_id, school_id) VALUES ($1, $2)
             RETURNING id, user_id, school_id`,
            [user_id, school_id]
        );

        await client.query("COMMIT");
        return admin.rows[0];

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

export const getAdmin = async () => {
    const res = await query(
        `SELECT * FROM admins as Ad
         JOIN users as u on u.id = ad.user_id
         JOIN schools as s on s.id = ad.school_id`
    );

    return res.rows;
};
