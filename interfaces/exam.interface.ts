export interface ICreateExamDTO {
    schoolId: string;
    name: string;
    type: string;
    className: string;
    subjects: string[];
    startDate?: string;
    endDate?: string;
    academicYear: string;
    totalMarks: number;
}

export interface IBulkMarksItem {
    studentId: string;
    maxMarks?: number;
    obtainedMarks?: number;
    remarks?: string;
    isAbsent?: boolean;
}

export interface ISaveBulkMarksDTO {
    examId: string;
    subject: string;
    examType: string;
    academicYear?: string;
    marksList: IBulkMarksItem[];
}

export interface IExam {
    id: string;
    school_id: string;
    name: string;
    type: string;
    class_name: string;
    subjects: string[];
    start_date?: string;
    end_date?: string;
    academic_year: string;
    total_marks: number;
}
