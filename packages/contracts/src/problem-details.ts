import { z } from "zod";

import { ERROR_CODES, httpErrorStatusSchema } from "./errors.ts";

/**
 * RFC 9457 Problem Details, as produced by apps/api's error-mapper.
 * The schema lives in contracts so that clients can validate error responses
 * instead of casting them.
 */
export const problemDetailsSchema = z.object({
  code: z.enum(ERROR_CODES),
  type: z.string(),
  title: z.string(),
  status: httpErrorStatusSchema,
  detail: z.string(),
});

export type ProblemDetailsDto = z.infer<typeof problemDetailsSchema>;
