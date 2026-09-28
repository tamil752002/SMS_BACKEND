import { Router } from "express";
import { createAdminController, getAdminsController } from "../controllers/admin.controller"
const route = Router();
route.get("/", getAdminsController);
route.post("/", createAdminController);
export default route;