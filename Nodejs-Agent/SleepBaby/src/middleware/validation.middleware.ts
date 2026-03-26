import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ status: 'error', errors: error.issues });
      } else {
        res.status(500).json({ status: 'error', message: (error as Error).message });
      }
    }
  };
};
