import { Request, Response } from "express";
import { createSchool, getSchool } from "../services/school.services"
import { createSchoolSchema } from "../validators/school.validator"

export const createSchoolController = async (req: Request, res: Response) => {


    const validateData = createSchoolSchema.parse(req.body);

    const { name, address, contact_number, email, student_user_id_prefix } = validateData;

    const school = await createSchool(name, address, contact_number, email, student_user_id_prefix)

    res.status(201).json(school)


}

export const getSchoolController = async (req: Request, res: Response) => {

    try {
        const schools = await getSchool();

        res.json(schools)
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch schools"
        });
    }


}