import catchAsync from "../../utils/catchAsync";
import { orderServices } from "./order.service";
import sendResponse from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";

const createOrder = catchAsync(async (req, res) => {
  const user = req.user;
  const order = await orderServices.createOrder(user, req.body, req.ip!);

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.CREATED,
    message: "Order placed successfully!",
    data: order,
  });
});

const getOrders = catchAsync(async (req, res) => {
  const order = await orderServices.getOrders(req.query);

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "Order retrieved successfully",
    data: order,
  });
});

const getIndividualOrders = catchAsync(async (req, res) => {
  const result = await orderServices.getIndividualUserOrders(
    req.user,
    req.query,
  );

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "My Bookings retrieved successfully",
    data: result,
  });
});

const getProviderOrders = catchAsync(async (req, res) => {
  const result = await orderServices.getProviderOrders(req.user);

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "Orders retrieved successfully",
    data: result,
  });
});

const getUserOrderStates = catchAsync(async (req, res) => {
  const result = await orderServices.getUserOrderStates(req.user);

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "My orders retrieved successfully",
    data: result,
  });
});

const getProviderStats = catchAsync(async (req, res) => {
  const result = await orderServices.getProviderStats(req.user.id);

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "Stats retrieved successfully",
    data: result,
  });
});

const getOrderStatesForAdmin = catchAsync(async (req, res) => {
  const result = await orderServices.getOrderStatesForAdmin();

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "Orders retrieved successfully",
    data: result,
  });
});

const verifyPayment = catchAsync(async (req, res) => {
  const order = await orderServices.verifyPayment(req.query.order_id as string);

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "Order verified successfully",
    data: order,
  });
});

const updateProductStatus = catchAsync(async (req, res) => {
  const result = await orderServices.updateProductStatus(req.body);

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "Product status updated successfully!",
    data: result,
  });
});

const getPendingOrders = catchAsync(async (req, res) => {
  const result = await orderServices.getPendingOrders();

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "Orders retrieved successfully",
    data: result,
  });
});

const updateShippingStatus = catchAsync(async (req, res) => {
  const result = await orderServices.updateShippingStatus(req.body);

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "Order status updated successfully!",
    data: result,
  });
});

export const orderControllers = {
  createOrder,
  getOrders,
  verifyPayment,
  getIndividualOrders,
  getUserOrderStates,
  getOrderStatesForAdmin,
  getProviderOrders,
  updateProductStatus,
  getPendingOrders,
  updateShippingStatus,
  getProviderStats,
};
