import * as z from "@medusajs/framework/zod";

export const AssignTaxCodeValidator = z.object({
  taxCodeId: z.string(),
});
export type AssignTaxCode = z.infer<typeof AssignTaxCodeValidator>;
