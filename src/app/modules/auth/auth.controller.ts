import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { authServices } from "./auth.service";

const registerUser = catchAsync(async (req, res) => {
  const result = await authServices.registerUser(req.body);
  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.CREATED,
    message: "User is registered successfully!",
    data: result,
  });
});

const oauthRegister = catchAsync(async (req, res) => {
  const result = await authServices.oauthRegister(req.body);

  res.cookie("refreshToken", result.refreshToken, {
    secure: true,
    // secure: config.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.CREATED,
    message: "User is registered successfully!",
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      role: result.role,
    },
  });
});

const loginUser = catchAsync(async (req, res) => {
  const result = await authServices.loginUser(req.body);

  res.cookie("refreshToken", result.refreshToken, {
    secure: true,
    // secure: config.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "Login successful!",
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      role: result.role,
    },
  });
});

const oauthLogin = catchAsync(async (req, res) => {
  const result = await authServices.oauthLogin(req.body);

  res.cookie("refreshToken", result.refreshToken, {
    secure: true,
    // secure: config.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "Login successful!",
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      role: result.role,
    },
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await authServices.refreshToken(refreshToken);
  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "Access token is retrieved successfully!",
    data: result,
  });
});

const getUserProfileData = catchAsync(async (req, res) => {
  const user = await authServices.getUserProfileData(req.user);
  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "Profile data fetched successfully!",
    data: user,
  });
});

export const authControllers = {
  registerUser,
  oauthRegister,
  loginUser,
  oauthLogin,
  refreshToken,
  getUserProfileData,
};
