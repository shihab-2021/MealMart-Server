/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express';
import config from '../config';
import { StatusCodes } from 'http-status-codes';

export const handleNotFoundError = (err: any, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    statusCode: err?.statusCode | StatusCodes.NOT_FOUND,
    message: err?.message,
    error: err,
    stack: config?.NODE_ENV === 'development' ? err.stack : null,
  });
};
