import { Router } from "express";
import { getUsers, createUserController } from "../controllers/user.controller.ts";

const router = Router();

router.get("/", getUsers);
router.post("/", createUserController)

export default router;