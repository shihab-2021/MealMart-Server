/* eslint-disable no-unused-vars */
import { Model, Types } from "mongoose";
import { USER_ROLE } from "./user.constant";

export interface IUser {
  name: string;
  email: string;
  password: string;
  passwordChangedAt?: Date;
  role?: "customer" | "provider" | "admin";
  avatar?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  isBlocked: boolean;
  isDeleted: boolean;
}

export interface ILoginUser {
  email: string;
  password: string;
}

export interface IUserInfo extends IUser {
  _id: Types.ObjectId;
}

export interface UserModel extends Model<IUser> {
  isUserExistsByEmail(email: string): Promise<IUserInfo>;
  isUserExistsById(id: string): Promise<IUser>;
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number,
  ): boolean;
}

export type TUserRole = keyof typeof USER_ROLE;
