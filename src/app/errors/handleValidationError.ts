/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import config from '../config';

export const handleValidationError = (err: any, res: Response) => {
  const issues = Object.values(err.errors).map((item: any) => {
    return {
      path: item.path,
      message: item.message,
    };
  });

  res.status(StatusCodes.BAD_REQUEST).json({
    success: false,
    statusCode: StatusCodes.BAD_REQUEST,
    message: err.message,
    error: err,
    stack: config?.NODE_ENV === 'development' ? err.stack : null,
    issues,
  });
};
