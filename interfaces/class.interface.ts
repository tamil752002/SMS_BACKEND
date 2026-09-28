export interface ICreateClassDTO {
    schoolId: string;
    name: string;
    sections: string[];
    medium: string[];
    classTeacher?: string;
}

export interface IClass {
    id: string;
    school_id: string;
    name: string;
    sections: string[];
    medium: string[];
    class_teacher?: string;
}
