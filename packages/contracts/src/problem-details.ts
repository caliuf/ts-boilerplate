import { z } from "zod";

/**
 * RFC 9457 Problem Details, as produced by apps/api's error-mapper.
 * The schema lives in contracts so that clients can validate error responses
 * instead of casting them.
 */
export const problemDetailsSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number().int(),
  detail: z.string(),
});

export type ProblemDetailsDto = z.infer<typeof problemDetailsSchema>;
