import { z } from 'zod';

export const signupAuthDtoSchema = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.email({ message: 'Email must be a valid email!' }),
    password: z.string().min(8),
    username: z.string().min(3).max(20).optional(),
    phone: z.string().optional(),
  })
  .strict();

export type SignupAuthDto = z.infer<typeof signupAuthDtoSchema>;
