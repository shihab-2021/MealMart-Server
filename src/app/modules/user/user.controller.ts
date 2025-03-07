import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { userServices } from "./user.service";

const getAllUsers = catchAsync(async (req, res) => {
  const result = await userServices.getAllUsers();

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "Users retrieved successfully",
    data: result,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const result = await userServices.getSingleUser(req.params.id);

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "User Fetched successfully!",
    data: result,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const result = await userServices.updateUser(req.params.id, req.body);

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "User Updated successfully!",
    data: result,
  });
});

export const userControllers = {
  getAllUsers,
  getSingleUser,
  updateUser,
};
