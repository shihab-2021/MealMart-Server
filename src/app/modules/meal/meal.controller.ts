import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { mealServices } from "./meal.service";

const createMeal = catchAsync(async (req, res) => {
  const result = await mealServices.createMeal(req.user, req.body);

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.CREATED,
    message: "Car created successfully",
    data: result,
  });
});

const getProviderMeals = catchAsync(async (req, res) => {
  const result = await mealServices.getProviderMeals(req.user);

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "Meals retrieved successfully!",
    data: result,
  });
});

const updateStock = catchAsync(async (req, res) => {
  const result = await mealServices.updateStock(req.params.mealId, req.body);

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "Stock updated successfully!",
    data: result,
  });
});

const addReview = catchAsync(async (req, res) => {
  const result = await mealServices.addReview(
    req.user,
    req.params.mealId,
    req.body,
  );

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "Review added successfully!",
    data: result,
  });
});

const getASpecificMeal = catchAsync(async (req, res) => {
  const mealId = req.params.mealId;
  const result = await mealServices.getASpecificMeal(mealId);

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "Meal retrieved successfully!",
    data: result,
  });
});

const getASpecificMealReviews = catchAsync(async (req, res) => {
  const mealId = req.params.mealId;
  const result = await mealServices.getASpecificMealReviews(mealId);

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "Meal reviews retrieved successfully!",
    data: result,
  });
});

const getAllMealReviews = catchAsync(async (req, res) => {
  const result = await mealServices.getAllMealReviews();

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "Meal reviews retrieved successfully!",
    data: result,
  });
});

const searchMeals = catchAsync(async (req, res) => {
  const { query } = req.query;
  const result = await mealServices.searchMeals(query as string);

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "Meal retrieved successfully!",
    data: result,
  });
});

const updateAMeal = catchAsync(async (req, res) => {
  const mealId = req.params.mealId;
  const body = req.body;

  const result = await mealServices.updateAMeal(mealId, body);

  if (result === null) {
    sendResponse(res, {
      status: false,
      statusCode: StatusCodes.NOT_FOUND,
      message: `No meal with the car id: ${mealId}!`,
      data: result,
    });
  } else {
    sendResponse(res, {
      status: true,
      statusCode: StatusCodes.OK,
      message: "Meal updated successfully",
      data: result,
    });
  }
});

const deleteAMeal = catchAsync(async (req, res) => {
  const mealId = req.params.mealId;

  const result = await mealServices.deleteAMeal(mealId);

  if (result === null) {
    sendResponse(res, {
      status: true,
      statusCode: StatusCodes.NOT_FOUND,
      message: `No meal with the meal id: ${mealId}!`,
      data: result,
    });
  } else {
    sendResponse(res, {
      status: true,
      statusCode: StatusCodes.OK,
      message: "Meal deleted successfully",
      data: result,
    });
  }
});

const getAllMeals = catchAsync(async (req, res) => {
  const result = await mealServices.getAllMeals();

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "Meals retrieved successfully",
    data: result,
  });
});

export const mealControllers = {
  createMeal,
  getProviderMeals,
  updateStock,
  getASpecificMeal,
  updateAMeal,
  deleteAMeal,
  getAllMeals,
  addReview,
  getASpecificMealReviews,
  getAllMealReviews,
  searchMeals,
};
