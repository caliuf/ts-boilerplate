import { z } from "zod";

/**
 * DTOs and validation schemas for the `hello-world` use case.
 * Types and runtime schemas derive from ONE definition (Vademecum §3).
 */

export const helloWorldInputSchema = z.object({
  name: z.string().trim().min(1).max(100).default("world"),
});

export type HelloWorldInput = z.infer<typeof helloWorldInputSchema>;

export const helloWorldOutputSchema = z.object({
  message: z.string().min(1),
});

export type HelloWorldOutput = z.infer<typeof helloWorldOutputSchema>;
