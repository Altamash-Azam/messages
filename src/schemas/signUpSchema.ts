import { z } from "zod";

export const usernameValidation = z.string()
    .min(2,"username should be longer than 2 chars")
    .max(20, "too long")
    .regex(/^[a-zA-Z0-9_]+$/, "not valid")

export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({message: "Invalid Email"}),
    password: z.string().min(6, {message: "password must be atleast 6 characters"})
})

