import express from "express";
import { config } from "dotenv"
import cors from "cors";
import { query } from "./database/db.ts"
import userRoutes from "./routes/user.routes.ts"
import schoolRoute from "./routes/school.routes.ts"
import adminRoute from "./routes/admin.routes.ts"
import auth from "./routes/auth.ts"
import studentRoute from "./routes/student.routes.ts";
import teacherRoutes from "./routes/teacher.routes.js";
import classRoutes from "./routes/class.routes.js";
import subjectRoutes from "./routes/subject.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import feeRoutes from "./routes/fee.routes.js";
import examRoutes from "./routes/exam.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

import { errorMiddleware } from "./middleware/error.middleware.ts";

config()
const PORT = process.env.PORT || 3000;
const App = express();

App.use(cors());
App.use(express.json());

App.get("/api/health", async (req, res) => {
    try {
        await query("SELECT 1");
        res.json({
            status: "ok",
            database: "connected to successfully"
        })
    }
    catch (error: any) {
        res.status(500).json({
            status: "error",
            database: "failed to connect"

        })
    }

})
App.use("/api/users", userRoutes);
App.use("/api/school", schoolRoute);
App.use("/api/admin", adminRoute);
App.use("/api/auth", auth);
App.use("/api/student", studentRoute);
App.use("/api/teachers", teacherRoutes);
App.use("/api/classes", classRoutes);
App.use("/api/subjects", subjectRoutes);
App.use("/api/fees", feeRoutes);
App.use("/api/attendance", attendanceRoutes);
App.use("/api/exams", examRoutes);
App.use("/api/leave", leaveRoutes);
App.use(
    "/api/dashboard",
    dashboardRoutes
);
App.use(errorMiddleware)
App.listen(PORT, () => {
    console.log(`Server is running on port ${PORT || 3000}`)
})