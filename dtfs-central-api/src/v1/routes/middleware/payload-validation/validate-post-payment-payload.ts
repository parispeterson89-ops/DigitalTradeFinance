import z from 'zod';
import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { CurrencySchema, TfmSessionUserSchema } from './schemas';

const PostPaymentSchema = z.object({
  feeRecordIds: z.array(z.number().gte(1)).min(1),
  paymentCurrency: CurrencySchema,
  paymentAmount: z.number().gte(0),
  datePaymentReceived: z.coerce.date(),
  paymentReference: z.string().optional(),
  user: TfmSessionUserSchema,
});

export type PostPaymentPayload = z.infer<typeof PostPaymentSchema>;

export const validatePostPaymentPayload = createValidationMiddlewareForSchema(PostPaymentSchema);
