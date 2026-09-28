import { Request, Response } from "express";

import {
    createClass,
    getClasses
} from "../services/class.services.js";


export const createClassController = async (
    req: Request,
    res: Response
) => {

    try {

        const {
            schoolId,
            name,
            sections = ["A"],
            medium = ["English"],
            classTeacher
        } = req.body;


        if (!schoolId || !name) {

            return res.status(400).json({
                error: "schoolId and name are required"
            });
        }


        const newClass = await createClass(
            schoolId,
            name,
            sections,
            medium,
            classTeacher
        );


        return res.status(201).json({
            message: "Class saved successfully",
            class: newClass
        });

    } catch (error: any) {

        console.error("Error creating class:", error);

        return res.status(500).json({
            error: "Failed to create class"
        });
    }
};


export const getClassesController = async (
    req: Request,
    res: Response
) => {

    try {

        const { schoolId } = req.query;


        if (!schoolId) {

            return res.status(400).json({
                error: "schoolId is required"
            });
        }


        const classes = await getClasses(
            schoolId as string
        );


        return res.status(200).json(classes);

    } catch (error) {

        console.error("Error fetching classes:", error);

        return res.status(500).json({
            error: "Failed to fetch classes"
        });
    }
};