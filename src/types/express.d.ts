import { IUser } from '../models/User.model';

declare global {
  namespace Express {
    interface Request {
      /** Populated by authMiddleware after JWT verification */
      user?: Pick<IUser, '_id' | 'name' | 'email' | 'role'>;
    }
  }
}
