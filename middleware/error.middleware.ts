import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const errorMiddleware = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(error);

    if (error instanceof ZodError) {
        return res.status(400).json({
            message: "Validation failed",
            errors: error.issues
        });
    }

    return res.status(500).json({
        message: "Internal server error"
    });
};