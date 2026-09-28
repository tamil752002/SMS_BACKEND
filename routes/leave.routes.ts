import { Router } from "express";

import {
    applyTeacherLeaveController,
    getTeacherLeaveApplicationsController,
    updateTeacherLeaveController,
    applyStudentLeaveController,
    getStudentLeaveApplicationsController
} from "../controllers/leave.controller.js";

const router = Router();


// ==========================================
// TEACHER LEAVE
// ==========================================

router.post(
    "/teacher/apply",
    applyTeacherLeaveController
);

router.get(
    "/teacher/applications",
    getTeacherLeaveApplicationsController
);

router.patch(
    "/teacher/applications/:id",
    updateTeacherLeaveController
);


// ==========================================
// STUDENT LEAVE
// ==========================================

router.post(
    "/student/apply",
    applyStudentLeaveController
);

router.get(
    "/student/applications",
    getStudentLeaveApplicationsController
);


export default router;