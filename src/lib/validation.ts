import { z } from "zod";
import { CATEGORY_SLUGS } from "@/lib/types";

export const optionLabelSchema = z.enum(["A", "B", "C", "D"]);
export const categorySchema = z.enum(CATEGORY_SLUGS);

export const submitAttemptSchema = z.object({
  category: categorySchema,
  packageNumber: z.number().int().min(1).max(10),
  elapsedSeconds: z.number().int().min(0).max(420),
  startedAt: z.string().datetime().optional(),
  answers: z.record(z.union([optionLabelSchema, z.null()])),
});

export const createUserSchema = z.object({
  phone: z.string().min(6),
  password: z.string().min(8),
  displayName: z.string().min(1).max(80),
  role: z.enum(["user", "superadmin"]).default("user"),
});

export const updateUserSchema = z.object({
  phone: z.string().min(6).optional(),
  password: z.string().min(8).optional(),
  displayName: z.string().min(1).max(80).optional(),
  role: z.enum(["user", "superadmin"]).optional(),
  isActive: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  password: z.string().min(8),
});

