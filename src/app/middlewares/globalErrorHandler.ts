/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { handleZodError } from "../errors/handleZodError";
import { handleCastError } from "../errors/handleCastError";
import { handleValidationError } from "../errors/handleValidationError";
import { handleDuplicateError } from "../errors/handleDuplicateError";
import { handleGenericError } from "../errors/handleGenericError";
import { handleAuthenticationError } from "../errors/handleAuthenticationError";
import { handleAuthorizationError } from "../errors/handleAuthorizationError";
import { handleNotFoundError } from "../errors/handleNotFoundError";

type TErrorResponse = {
  success: boolean;
  message: string;
  error: any;
  name?: string;
  code?: number;
  stack?: string;
};

export const globalErrorHandler = (
  err: TErrorResponse,
  req: Request,
  res: Response,
  // eslint-disable-next-line no-unused-vars
  _next: NextFunction,
) => {
  if (err.name && err.name === "ZodError") {
    handleZodError(err, res);
  } else if (err instanceof mongoose.Error.CastError) {
    handleCastError(err, res);
  } else if (err instanceof mongoose.Error.ValidationError) {
    handleValidationError(err, res);
  } else if (err.code && err.code === 11000) {
    handleDuplicateError(err, res);
  } else if (
    (err.stack && err.stack === "AUTH_ERROR") ||
    (err.name && err.name === "JsonWebTokenError") ||
    (err.name && err.name === "TokenExpiredError")
  ) {
    handleAuthenticationError(err, res);
  } else if (err.stack && err.stack === "AUTHORIZATION_ERROR") {
    handleAuthorizationError(err, res);
  } else if (err.stack && err.stack === "NOT_FOUND_ERROR") {
    handleNotFoundError(err, res);
  } else if (err instanceof Error) {
    handleGenericError(err, res);
  }
};
