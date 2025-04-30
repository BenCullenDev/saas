import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  emailVerified: z.date().optional(),
  image: z.string().optional(),
});

export const sessionSchema = z.object({
  user: userSchema,
  expires: z.string(),
});

export type User = z.infer<typeof userSchema>;
export type Session = z.infer<typeof sessionSchema>; 