import { Router } from "express";

import {
    createTeacherController,
    getTeachersController
} from "../controllers/teacher.controller.js";


const router = Router();


router.post(
    "/",
    createTeacherController
);


router.get(
    "/",
    getTeachersController
);


export default router;