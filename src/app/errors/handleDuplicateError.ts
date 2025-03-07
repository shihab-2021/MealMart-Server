/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import config from '../config';

export const handleDuplicateError = (err: any, res: Response) => {
  res.status(StatusCodes.CONFLICT).json({
    success: false,
    statusCode: StatusCodes.CONFLICT,
    message: err.message,
    error: err,
    stack: config.NODE_ENV === 'development' ? err?.stack : null,
  });
};
