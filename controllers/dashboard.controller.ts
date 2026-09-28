import { Request, Response } from "express";
import { getDashboardStats } from "../services/dashboard.services.js";

export const getDashboardStatsController = async (
    req: Request,
    res: Response
) => {

    try {

        const { schoolId } = req.query;

        if (!schoolId || typeof schoolId !== "string") {
            return res.status(400).json({
                error: "schoolId is required"
            });
        }

        const stats = await getDashboardStats(schoolId);

        return res.status(200).json(stats);

    } catch (error) {

        console.error(
            "Error fetching dashboard stats:",
            error
        );

        return res.status(500).json({
            error: "Failed to fetch dashboard stats"
        });
    }
};