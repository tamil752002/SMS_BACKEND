export interface IDashboardStats {
    schoolId: string;
    overview: {
        totalStudents: number;
        totalTeachers: number;
        totalClasses: number;
    };
    todayAttendance: {
        date: string;
        totalMarked: number;
        presentCount: number;
        absentCount: number;
        percentage: string;
    };
    financials: {
        totalFeeAmount: number;
        totalCollected: number;
        totalPending: number;
        collectedPercentage: string;
    };
    pendingActions: {
        teacherLeaves: number;
        studentLeaves: number;
    };
}
