import { z } from 'zod';

export const signinAuthDtoSchema = z.object({
  email: z.email({ message: 'Email must be a valid email!' }),
  password: z.string().min(8),
});
// .strict();

export type SigninAuthDto = z.infer<typeof signinAuthDtoSchema>;

// TRADITIONAL WAY

// import { IsEmail, IsString } from 'class-validator';

// export class CreateAuthDto {
//   @IsEmail()
//   email: string;
//   @IsString()
//   password: string;
// }
