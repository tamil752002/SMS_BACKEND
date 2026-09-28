export interface ILoginDTO {
    username: string;
    password: string;
}

export interface IAuthUser {
    id: string;
    username: string;
    role: 'admin' | 'teacher' | 'student' | 'parent' | 'superadmin';
    name: string;
    email?: string;
    phoneNumber?: string;
    schoolId?: string;
    status?: string;
}

export interface IJwtPayload {
    id: string;
    username: string;
    role: string;
    schoolId?: string;
}
