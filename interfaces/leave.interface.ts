export interface IApplyTeacherLeaveDTO {
    teacherId: string;
    leaveType: string;
    fromDate: string;
    toDate: string;
    reason?: string;
}

export interface IUpdateTeacherLeaveDTO {
    id: string;
    status: 'approved' | 'rejected';
    reviewedBy?: string;
}

export interface IApplyStudentLeaveDTO {
    studentId: string;
    appliedBy: string;
    leaveType: string;
    fromDate: string;
    toDate: string;
    reason?: string;
}

export interface ITeacherLeaveApplication {
    id: string;
    teacher_id: string;
    leave_type: string;
    from_date: string;
    to_date: string;
    reason?: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewed_by?: string;
    created_at?: string;
}

export interface IStudentLeaveApplication {
    id: string;
    student_id: string;
    applied_by: string;
    leave_type: string;
    from_date: string;
    to_date: string;
    reason?: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at?: string;
}
