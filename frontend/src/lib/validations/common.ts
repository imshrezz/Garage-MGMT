import { z } from "zod";

// Indian mobile number validation (10 digits, starting with 6-9)
export const mobileNumberSchema = z
  .string()
  .min(10, "Mobile number must be 10 digits")
  .max(10, "Mobile number must be 10 digits")
  .regex(/^[6-9]\d{9}$/, "Invalid mobile number format. Must start with 6-9 and be 10 digits")
  .transform(val => val.replace(/\D/g, '')); // Remove any non-digit characters

// Optional mobile number validation
export const optionalMobileNumberSchema = z
  .string()
  .transform(val => val.replace(/\D/g, '')) // Remove any non-digit characters
  .refine(
    val => !val || /^[6-9]\d{9}$/.test(val),
    "Invalid mobile number format. Must start with 6-9 and be 10 digits"
  )
  .optional()
  .or(z.literal("")); 