import { z } from 'zod';

// URL ထဲက :id (string အဖြစ်လာတာကို ကိန်းဂဏန်းပြောင်း)
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
