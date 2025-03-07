import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { ILoginUser, IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import { createToken, verifyToken } from "./auth.utils";
import config from "../../config";
import { JwtPayload } from "jsonwebtoken";

const registerUser = async (payload: IUser) => {
  const user = await User.isUserExistsByEmail(payload.email);
  if (user) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "User with this email already exists!",
    );
  }

  const result = await User.create(payload);
  return result;
};

const oauthRegister = async (payload: {
  email: string;
  name: string;
  role: string;
}) => {
  const user = await User.isUserExistsByEmail(payload.email);
  if (user) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "User with this email already exists!",
    );
  }

  // await User.create({
  //   ...payload,
  //   password: payload?.email + "oauth",
  //   role: "user",
  // });
  const result = await User.create({
    ...payload,
    password: payload?.email + "oauth",
  });
  // creating token
  const jwtPayload = {
    email: result.email,
    role: result.role,
  };
  const accessToken = createToken(
    jwtPayload as { role: string; email: string },
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );
  const refreshToken = createToken(
    jwtPayload as { role: string; email: string },
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  return { accessToken, refreshToken, role: result?.role };
  // return result;
};

const loginUser = async (payload: ILoginUser) => {
  // checking if the user is exists
  const user = await User.isUserExistsByEmail(payload.email);
  if (!user) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Not Found Error: User does not exists!",
      "NOT_FOUND_ERROR",
    );
  }

  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Authorization Error: This user is deleted!",
      "AUTHORIZATION_ERROR",
    );
  }

  // checking if the user is blocked
  const userStatus = user?.isBlocked;
  if (userStatus === true) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Authorization Error: This user is blocked!",
      "AUTHORIZATION_ERROR",
    );
  }

  // checking if the password is correct
  if (!(await User.isPasswordMatched(payload?.password, user?.password))) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Authorization Error: Password didn't matched!",
      "AUTHORIZATION_ERROR",
    );
  }

  // creating token
  const jwtPayload = {
    email: user.email,
    role: user.role,
  };
  const accessToken = createToken(
    jwtPayload as { role: string; email: string },
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );
  const refreshToken = createToken(
    jwtPayload as { role: string; email: string },
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  return { accessToken, refreshToken, role: user?.role };
};

const oauthLogin = async (payload: { email: string }) => {
  // Check if the user already exists
  console.log(payload);
  const user = await User.findOne({ email: payload.email });

  // If the user doesn't exist, create a new one
  if (!user) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Not Found Error: User does not exists!",
      "NOT_FOUND_ERROR",
    );
    // await User.create({
    //   ...payload,
    //   password: payload?.email + "oauth",
    //   role: "user",
    // });
  }

  // creating token
  const jwtPayload = {
    id: user?._id,
    email: user?.email,
    role: user?.role,
  };
  const accessToken = createToken(
    jwtPayload as { role: string; email: string },
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );
  const refreshToken = createToken(
    jwtPayload as { role: string; email: string },
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  return { accessToken, refreshToken, role: user?.role };
};

const refreshToken = async (token: string) => {
  // token validation checking
  const decoded = verifyToken(token, config.jwt_refresh_secret as string);
  const { email, iat } = decoded;

  // checking user's existence
  const user = await User.isUserExistsByEmail(email);
  if (!user) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Not Found Error: User does not exists!",
      "NOT_FOUND_ERROR",
    );
  }

  // checking if the user is blocked
  const userStatus = user?.isBlocked;
  if (userStatus === true) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Authorization Error: This user is blocked!",
      "AUTHORIZATION_ERROR",
    );
  }

  if (
    user.passwordChangedAt &&
    User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat as number)
  ) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Authorization Error: You are not authorized!",
      "AUTHORIZATION_ERROR",
    );
  }

  const jwtPayload = {
    email: user.email,
    role: user.role,
  };
  const accessToken = createToken(
    jwtPayload as { role: string; email: string },
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return { accessToken };
};

const getUserProfileData = async (payload: JwtPayload) => {
  // checking user's existence
  const user = await User.isUserExistsByEmail(payload.email);
  if (!user) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Not Found Error: User does not exists!",
      "NOT_FOUND_ERROR",
    );
  }

  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Authorization Error: This user is deleted!",
      "AUTHORIZATION_ERROR",
    );
  }

  // checking if the user is blocked
  const userStatus = user?.isBlocked;
  if (userStatus === true) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Authorization Error: This user is blocked!",
      "AUTHORIZATION_ERROR",
    );
  }

  user.password = "";

  return user;
};

export const authServices = {
  registerUser,
  oauthRegister,
  loginUser,
  oauthLogin,
  refreshToken,
  getUserProfileData,
};
