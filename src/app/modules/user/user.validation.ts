import { z } from "zod";

const userValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Name is required!",
      })
      .min(3)
      .max(50),
    email: z
      .string({
        required_error: "Email is required!",
      })
      .email(),
    password: z
      .string({
        required_error: "Password is required!",
      })
      .max(20, "Password can't be more than 20 character!"),
    role: z
      .enum(["admin", "user"], {
        invalid_type_error: "Please enter a valid role!",
      })
      .optional()
      .default("user"),
    phone: z.string().optional().nullable().default(null),
    address: z.string().optional().nullable().default(null),
  }),
});

const updateUserValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Name is required!",
      })
      .min(3)
      .max(50)
      .optional(),
    email: z
      .string({
        required_error: "Email is required!",
      })
      .email()
      .optional(),
    role: z
      .enum(["admin", "customer", "provider"], {
        invalid_type_error: "Please enter a valid role!",
      })
      .optional()
      .default("customer")
      .optional(),
    phone: z.string().optional().nullable().default(null),
    address: z.string().optional().nullable().default(null),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required!" }).email(),
    password: z.string({ required_error: "Password is required!" }),
  }),
});

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: "Refresh token is required!",
    }),
  }),
});

export const userValidations = {
  userValidationSchema,
  loginValidationSchema,
  refreshTokenValidationSchema,
  updateUserValidationSchema,
};
