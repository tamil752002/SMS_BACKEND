export interface ICreateStudentDTO {
    schoolId: string;
    admissionNumber: string;
    password: string;
    firstName: string;
    middleName?: string;
    lastName?: string;
    studentAadhar?: string;
    admissionDate: string;
    fatherName: string;
    fatherAadhar?: string;
    motherName: string;
    motherAadhar?: string;
    studentClass: string;
    section: string;
    medium: string;
    dateOfBirth: string;
    gender: string;
    admissionClass?: string;
    location?: string;
    penNumber?: string;
    caste?: string;
    subCaste?: string;
    religion?: string;
    motherTongue?: string;
    parentMobile: string;
    mobileNumber: string;
    emailAddress?: string;
    address?: string;
    profilePhoto?: string;
}

export interface IStudentFilter {
    schoolId?: string;
    studentClass?: string;
    section?: string;
}

export interface IStudent {
    id: string;
    school_id: string;
    admission_number: string;
    first_name: string;
    middle_name?: string;
    last_name?: string;
    student_aadhar?: string;
    admission_date: string;
    father_name: string;
    father_aadhar?: string;
    mother_name: string;
    mother_aadhar?: string;
    student_class: string;
    section: string;
    medium: string;
    date_of_birth: string;
    gender: string;
    parent_mobile: string;
    mobile_number: string;
    email_address?: string;
    address?: string;
    status: string;
}
