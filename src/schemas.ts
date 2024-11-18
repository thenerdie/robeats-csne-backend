import { z } from "zod";

export const IUser = z.object({
  name: z.string(),
  rating: z.number(),
  id: z.number(),
  playCount: z.number(),
  accuracy: z.number()
});

export const ISettings = z.object({
  coolEffects: z.boolean(),
  scrollSpeed: z.number(),
})