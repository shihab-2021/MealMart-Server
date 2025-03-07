/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import config from '../config';

export const handleCastError = (err: any, res: Response) => {
  res.status(StatusCodes.BAD_REQUEST).json({
    success: false,
    statusCode: StatusCodes.BAD_REQUEST,
    message: err.message,
    error: err,
    stack: config.NODE_ENV === 'development' ? err?.stack : null,
  });
};
