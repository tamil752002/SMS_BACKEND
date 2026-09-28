import { Response, Request } from "express"
import { createAdmin, getAdmin } from "../services/admin.services";
import bcrypt from "bcryptjs";
import { createUserSchema } from "../validators/user.validator.js";



export const createAdminController = async (req: Request, res: Response) => {

    const validatedData = createUserSchema.parse(req.body);
    const {
        username,
        password,
        role,
        name,
        email,
        phone_number
    } = validatedData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const school_id = req.body?.school_id;

    const admin = await createAdmin(
        name,
        username,
        school_id,
        hashedPassword,
        role,
        email,
        phone_number,

    );

    res.status(201).json(admin);

}

export const getAdminsController = async (req: Request, res: Response) => {
    try {
        const admin = await getAdmin();
        res.json(admin)
    }
    catch (err) {
        res.status(500).json({
            message: "Failed to fetch admins"
        });
    }


}