// import { Router } from "express";
// import { getUsers, createUserController } from "../controllers/user.controller.ts";

// const router = Router();

// router.get("/", getUsers);
// router.post("/", createUserController)

// export default router;

import { Router } from "express";
import { createSchoolController, getSchoolController } from "../controllers/school.controller";

const router = Router();
router.get("/", getSchoolController);
router.post("/", createSchoolController);

export default router;