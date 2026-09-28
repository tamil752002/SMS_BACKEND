import { Response, Request } from "express";
import { createAdmin, getAdmin } from "../services/admin.services.js";
import bcrypt from "bcryptjs";
import { createUserSchema } from "../validators/user.validator.js";

export const createAdminController = async (req: Request, res: Response) => {
    try {
        const validatedData = createUserSchema.parse(req.body);
        const { username, password, role, name, email, phone_number } = validatedData;
        const school_id = req.body.school_id || (validatedData as any).school_id;
        const hashPassword = await bcrypt.hash(password, 10);

        const admin = await createAdmin({
            username,
            password: hashPassword,
            role,
            name,
            email,
            phone_number,
            school_id
        });

        res.status(201).json({
            message: "Admin created successfully",
            admin
        });
    } catch (error) {
        res.status(400).json({
            message: "Failed to create admin"
        });
    }
};

export const getAdminsController = async (req: Request, res: Response) => {
    try {
        const result = await getAdmin();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch admins"
        });
    }
};

export const getAdminController = getAdminsController;
