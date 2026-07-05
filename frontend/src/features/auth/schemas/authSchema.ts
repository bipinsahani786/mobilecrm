import { z } from 'zod';

const isMobile = (val: string) => /^[0-9]{10}$/.test(val);
const isEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

export const identifierSchema = z.object({
  identifier: z.string()
    .min(1, "Email or Mobile Number is required")
    .refine(val => isEmail(val) || isMobile(val), {
      message: "Please enter a valid Email address or a 10-digit Mobile Number",
    }),
});

export const loginPasswordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

export const setPasswordSchema = z.object({
  name: z.string().min(2, "Full Name is required").max(100, "Name is too long"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  password_confirmation: z.string()
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});
