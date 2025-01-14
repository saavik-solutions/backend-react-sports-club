import passport from 'passport';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import { roleRights } from '../config/roles';
import { Request, Response, NextFunction } from 'express';
import { Permission } from '../config/roles'; // Import Permission type

const verifyCallback =
  (
    req: Request,
    resolve: (value: void | PromiseLike<void>) => void,
    reject: (reason?: any) => void,
    requiredRights: Permission[] // Update type here
  ) =>
  async (err: any, user: any, info: any) => {
    if (err || info || !user) {
      return reject(new ApiError('Please authenticate', httpStatus.UNAUTHORIZED));
    }
    req.user = user;

    if (requiredRights.length) {
      const userRights = roleRights.get(user.role) || [];
      const hasRequiredRights = requiredRights.every((requiredRight) =>
        userRights.includes(requiredRight)
      );
      if (!hasRequiredRights && req.params.userId !== user.id) {
        return reject(new ApiError('Forbidden', httpStatus.FORBIDDEN));
      }
    }

    resolve();
  };

const auth =
  (...requiredRights: Permission[]) => // Update type here
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    new Promise<void>((resolve, reject) => {
      passport.authenticate(
        'jwt',
        { session: false },
        verifyCallback(req, resolve, reject, requiredRights)
      )(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

export default auth;
