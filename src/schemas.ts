import { z } from "zod";

export const IUser = z.object({
  name: z.string(),
  rating: z.number(),
  id: z.number(),
  playCount: z.number(),
  accuracy: z.number()
});

const Instance = z.object({
  "_classname": z.string(),
  "value": z.any()
})

export const ISettings = z.object({
  coolEffects: z.boolean(),
  scrollSpeed: z.number(),
  keybinds: z.array(Instance),
  od: z.number().min(0).max(20)
})