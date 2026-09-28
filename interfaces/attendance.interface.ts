export interface IAttendanceItem {
    studentId: string;
    status: 'present' | 'absent' | string;
}

export interface IMarkBulkAttendanceDTO {
    date: string;
    session: string;
    records: IAttendanceItem[];
    markedBy?: string;
}

export interface IClassAttendanceFilter {
    schoolId: string;
    studentClass: string;
    date: string;
    section?: string;
    session?: string;
}

export interface IClassAttendanceSummary {
    date: string;
    session: string;
    totalStudents: number;
    presentCount: number;
    absentCount: number;
    unmarkedCount: number;
    students: any[];
}

export interface IStudentAttendanceSummary {
    studentId: string;
    summary: {
        totalDays: number;
        presentDays: number;
        absentDays: number;
        percentage: string;
    };
    history: any[];
}
