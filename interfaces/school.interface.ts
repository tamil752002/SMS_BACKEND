export interface ICreateSchoolDTO {
    name: string;
    address?: string;
    contact_number?: string;
    email?: string;
    student_user_id_prefix?: string;
}

export interface ISchool {
    id: string;
    name: string;
    address?: string;
    contact_number?: string;
    email?: string;
    student_user_id_prefix?: string;
    created_at?: string;
    updated_at?: string;
}
