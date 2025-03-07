import { z } from 'zod';

export const orderValidationSchema = z.object({
  email: z.string().email(),
  car: z.string(),
  quantity: z.number(),
  totalPrice: z.number(),
});

export default orderValidationSchema;
