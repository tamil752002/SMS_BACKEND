import { Router } from "express";

import {
    createExamController,
    getExamsController,
    saveBulkMarksController,
    getStudentReportCardController
} from "../controllers/exam.controller.js";

const router = Router();


// Create Exam
router.post("/", createExamController);


// Get Exams
router.get("/", getExamsController);


// Enter Marks
router.post(
    "/marks/bulk",
    saveBulkMarksController
);


// Student Report Card
router.get(
    "/report-card/:studentId",
    getStudentReportCardController
);


export default router;