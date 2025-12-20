import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

export interface OptionalAuthRequest extends Request {
  user?: any;
}

export const optionalAuth = async (req: OptionalAuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any;
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (user) req.user = user;
  } catch (err) {
    // invalid token — ignore and continue unauthenticated
  }
  next();
};