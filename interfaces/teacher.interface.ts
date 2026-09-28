export interface ICreateTeacherDTO {
    schoolId: string;
    name: string;
    username: string;
    password: string;
    email?: string;
    phoneNumber?: string;
    salary?: number;
    joinDate?: string;
}

export interface ITeacher {
    teacher_id: string;
    school_id: string;
    salary?: number;
    join_date?: string;
    status: string;
    user_id: string;
    username: string;
    name: string;
    email?: string;
    phone_number?: string;
}
