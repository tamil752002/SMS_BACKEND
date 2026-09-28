import { Router } from "express";

import {
    createClassController,
    getClassesController
} from "../controllers/class.controller.js";


const router = Router();


router.post(
    "/",
    createClassController
);


router.get(
    "/",
    getClassesController
);


export default router;