import { z } from "zod";

import { Request, Response, NextFunction, RequestHandler } from "express"

export const validateRequest = (schema: z.AnyZodObject): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { success, error } = schema.safeParse(req.body);

        if (!success) {
            res.status(400).json({ error: error.toString() });
            return;
        }

        next();
    };
};

export const withUpdate = (schema: z.AnyZodObject) => {
    return schema.partial().extend({
        id: z.number()
    })
}

export const filterThrough = (schema: z.AnyZodObject, data: any) => {
    return schema.partial().parse(data);
}