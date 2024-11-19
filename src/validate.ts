import { z, ZodError } from "zod";

import { Request, Response, NextFunction, RequestHandler } from "express"

export const validateRequest = (schema: z.AnyZodObject): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = schema.parse(req.body);

            if (!result) {
                req.body = result;
                return;
            }

            next();
        } catch (e: any) {
            if (e instanceof ZodError) {
                res.status(400).json({ error: "Invalid request body", details: e.errors });
            } else {
                next(e);
            }
        }
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