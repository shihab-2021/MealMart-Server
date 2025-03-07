/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express';
import { TErrorMessages } from '../interfaces/error';
import { ZodIssue } from 'zod';
import { StatusCodes } from 'http-status-codes';
import config from '../config';

export const handleZodError = (err: any, res: Response) => {
  const errorMessages: TErrorMessages = err.issues.map((issue: ZodIssue) => {
    return {
      path: issue?.path[issue?.path?.length - 1],
      message: issue.message,
    };
  });

  res.status(StatusCodes.BAD_REQUEST).json({
    success: false,
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Zod Validation Error',
    error: err,
    stack: config.NODE_ENV === 'development' ? err.stack : null,
    errorMessages,
  });
};
