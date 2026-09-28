export interface ICreateAdminDTO {
    username: string;
    password: string;
    role: string;
    name: string;
    email?: string;
    phone_number?: string;
    school_id: string;
}

export interface IAdmin {
    id: string;
    user_id: string;
    school_id: string;
    username?: string;
    name?: string;
    email?: string;
    phone_number?: string;
    role?: string;
}
