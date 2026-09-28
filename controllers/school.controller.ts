import { Request, Response } from "express";
import { createSchool, getSchool } from "../services/school.services.js";
import { createSchoolSchema } from "../validators/school.validator.js";

export const createSchoolController = async (req: Request, res: Response) => {
    try {
        const validateData = createSchoolSchema.parse(req.body);
        const result = await createSchool(validateData);

        res.status(201).json({
            message: "School created successfully",
            school: result
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create school"
        });
    }
};

export const getSchoolController = async (req: Request, res: Response) => {
    try {
        const result = await getSchool();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch schools"
        });
    }
};
