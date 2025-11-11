
export type PaymentTransaction = {
  id: string;
  projectId: string;
  type: 'Expense' | 'Payment';
  category: 'Material' | 'Labor' | 'Government Fee' | 'Miscellaneous' | 'Design Fee' | 'Construction Advance' | 'Installment';
  amount: number;
  description: string;
  date: { seconds: number; nanoseconds: number; };
  relatedTo?: string;
};

export type ProjectService = {
  id: string;
  label: string;
  charge?: number;
  remarks?: string;
  selected: boolean;
};

export type DailyAttendance = {
    id: string;
    date: Date;
    numberOfLaborers: number;
    wagePerLaborer: number;
}
