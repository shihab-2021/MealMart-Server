/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express';
import config from '../config';
import { StatusCodes } from 'http-status-codes';

export const handleAuthorizationError = (err: any, res: Response) => {
  res.status(err?.statusCode | StatusCodes.UNAUTHORIZED).json({
    success: false,
    statusCode: err?.statusCode | StatusCodes.UNAUTHORIZED,
    message: err?.message,
    error: err,
    stack: config.NODE_ENV === 'development' ? err?.stack : null,
  });
};
