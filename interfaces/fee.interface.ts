export interface IOtherFeeItem {
    name: string;
    amount: number;
}

export interface ISaveFeeStructureDTO {
    schoolId: string;
    className: string;
    academicYear: string;
    tuitionFee: number;
    schoolFee: number;
    examFee: number;
    vanFee: number;
    booksFee: number;
    uniformFee: number;
    otherFees: IOtherFeeItem[];
}

export interface ICollectFeeDTO {
    studentId: string;
    academicYear: string;
    feeType: string;
    amount?: number;
    paidAmount: number;
    paidDate: string;
    receiptNumber?: string;
    collectedBy?: string;
}

export interface IFeeRecord {
    id: string;
    student_id: string;
    academic_year: string;
    fee_type: string;
    amount: number;
    paid_amount: number;
    remaining_fee: number;
    paid_date?: string;
    status: 'pending' | 'partial' | 'paid' | 'overdue';
    receipt_number?: string;
    collected_by?: string;
}
