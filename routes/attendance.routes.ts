import { Router } from "express";

import {
    markBulkAttendanceController,
    getClassAttendanceController,
    getStudentAttendanceController
} from "../controllers/attendance.controller.js";


const router = Router();


/*
    POST /api/attendance/bulk
*/
router.post(
    "/bulk",
    markBulkAttendanceController
);


/*
    GET /api/attendance
*/
router.get(
    "/",
    getClassAttendanceController
);


/*
    GET /api/attendance/student/:studentId
*/
router.get(
    "/student/:studentId",
    getStudentAttendanceController
);


export default router;