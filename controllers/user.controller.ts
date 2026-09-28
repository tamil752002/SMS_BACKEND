auth.js
import bcrypt from "bcryptjs";
import { getAllUsers, createUser } from "../services/user.service.js";
import { createUserSchema } from "../validators/user.validator.js";
export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await getAllUsers();

        res.json(users);
    } catch (error: any) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
};



export const createUserController = async (
    req: Request,
    res: Response
) => {
    console.log("BODY:", req.body);
    console.log("CONTENT-TYPE:", req.headers["content-type"]);
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

    const user = await createUser(
        username,
        hashedPassword,
        role,
        name,
        email,
        phone_number
    );

    res.status(201).json(user);
};