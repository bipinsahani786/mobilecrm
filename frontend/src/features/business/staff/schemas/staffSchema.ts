import * as z from 'zod';

export const staffSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Valid phone is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  password: z.string().optional(),
  role: z.string(),
  salary_type: z.enum(['monthly', 'daily']),
  monthly_salary: z.number().min(0),
  daily_salary: z.number().min(0).optional().nullable(),
  commission_rate: z.number().min(0).max(100),
  join_date: z.string().optional(),
  status: z.string().optional(),
  salary_components: z.array(z.object({
    id: z.number().optional(),
    name: z.string(),
    type: z.enum(['earning', 'deduction']),
    amount: z.number().min(0),
  })).optional(),
});

export type StaffFormData = z.infer<typeof staffSchema>;
