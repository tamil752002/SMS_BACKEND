import { Request, Response } from "express";

import {
    createSubject,
    getSubjects
} from "../services/subject.services.js";


export const createSubjectController = async (
    req: Request,
    res: Response
) => {

    try {

        const {
            schoolId,
            name
        } = req.body;


        if (!schoolId || !name) {

            return res.status(400).json({
                error: "schoolId and name are required"
            });
        }


        const subject = await createSubject(
            schoolId,
            name
        );


        return res.status(201).json({
            message: "Subject created successfully",
            subject
        });

    } catch (error) {

        console.error("Error creating subject:", error);

        return res.status(500).json({
            error: "Failed to create subject"
        });
    }
};


export const getSubjectsController = async (
    req: Request,
    res: Response
) => {

    try {

        const {
            schoolId
        } = req.query;


        if (!schoolId) {

            return res.status(400).json({
                error: "schoolId is required"
            });
        }


        const subjects = await getSubjects(
            schoolId as string
        );


        return res.status(200).json(subjects);

    } catch (error) {

        console.error("Error fetching subjects:", error);

        return res.status(500).json({
            error: "Failed to fetch subjects"
        });
    }
};