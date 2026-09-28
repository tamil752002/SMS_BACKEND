import { Router } from "express";

import {
    createSubjectController,
    getSubjectsController
} from "../controllers/subject.controller.js";


const router = Router();


router.post(
    "/",
    createSubjectController
);


router.get(
    "/",
    getSubjectsController
);


export default router;