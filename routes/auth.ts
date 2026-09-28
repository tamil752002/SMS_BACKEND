import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { query } from "../database/db.js";

const router = express.Router();

// POST /api/auth/login
router.post(
    "/login",
    async (req: Request, res: Response): Promise<void> => {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({
                error: "Username and password are required"
            });
            return;
        }

        try {
            // 1. Check users table
            const result = await query(
                "SELECT * FROM users WHERE username = $1",
                [username]
            );

            if (result.rows.length === 0) {
                res.status(401).json({
                    error: "Invalid credentials"
                });
                return;
            }

            const user = result.rows[0];

            // 2. Compare hashed password
            const isPasswordValid = await bcrypt.compare(
                password,
                user.password
            );

            if (!isPasswordValid) {
                res.status(401).json({
                    error: "Invalid credentials"
                });
                return;
            }

            // 3. Check if user is active
            if (user.status !== "active") {
                res.status(403).json({
                    error: "Account is inactive. Contact administrator."
                });
                return;
            }

            let schoolId: string | null = null;
            let teacherId: string | null = null;
            let studentIds: string[] | null = null;

            // 4. Role-based lookup

            if (user.role === "admin") {
                const adminResult = await query(
                    "SELECT school_id FROM admins WHERE user_id = $1",
                    [user.id]
                );

                if (adminResult.rows.length > 0) {
                    schoolId = String(adminResult.rows[0].school_id);
                }
            }

            else if (user.role === "teacher") {
                const teacherResult = await query(
                    "SELECT id, school_id, status FROM teachers WHERE user_id = $1",
                    [user.id]
                );

                const teacher = teacherResult.rows[0];

                if (!teacher || teacher.status !== "active") {
                    res.status(403).json({
                        error: "Teacher account is inactive."
                    });
                    return;
                }

                teacherId = String(teacher.id);
                schoolId = String(teacher.school_id);
            }

            else if (user.role === "student") {
                const studentResult = await query(
                    "SELECT id, school_id, status FROM students WHERE user_id = $1",
                    [user.id]
                );

                const student = studentResult.rows[0];

                if (!student || student.status !== "active") {
                    res.status(403).json({
                        error: "Student account is inactive."
                    });
                    return;
                }

                schoolId = String(student.school_id);
            }

            else if (user.role === "parent") {
                const parentResult = await query(
                    "SELECT id, school_id FROM students WHERE parent_user_id = $1",
                    [user.id]
                );

                if (parentResult.rows.length > 0) {
                    studentIds = parentResult.rows.map(
                        (row) => String(row.id)
                    );

                    schoolId = String(
                        parentResult.rows[0].school_id
                    );
                }
            }

            // 5. Return user data without password
            res.json({
                message: "Login successful",
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    name: user.name,
                    email: user.email,
                    schoolId,
                    ...(teacherId && { teacherId }),
                    ...(studentIds && { studentIds })
                }
            });

        } catch (error: unknown) {
            console.error("Login error:", error);

            res.status(500).json({
                error: "Internal server error"
            });
        }
    }
);

export default router;