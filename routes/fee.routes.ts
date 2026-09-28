import { Router } from "express";

import {
    saveFeeStructureController,
    getFeeStructuresController,
    collectFeeController,
    getStudentFeesController
} from "../controllers/fee.controller.js";


const router = Router();


/*
    POST /api/fees/structures
*/
router.post(
    "/structures",
    saveFeeStructureController
);


/*
    GET /api/fees/structures
*/
router.get(
    "/structures",
    getFeeStructuresController
);


/*
    POST /api/fees/collect
*/
router.post(
    "/collect",
    collectFeeController
);


/*
    GET /api/fees/student/:studentId
*/
router.get(
    "/student/:studentId",
    getStudentFeesController
);


export default router;