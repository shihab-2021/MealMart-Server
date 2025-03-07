import { StatusCodes } from "http-status-codes";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import { IMeal } from "./meal.interface";
import { Meal } from "./meal.model";
import { JwtPayload } from "jsonwebtoken";
import { Organization } from "../organization/organization.model";

const createMeal = async (user: JwtPayload, payload: IMeal): Promise<IMeal> => {
  const org = await Organization.findOne({ ownerId: user.id });
  if (!org) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Please create an organization or brand first!",
      "NOT_FOUND",
    );
  } else if (!org.isVerified) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Organization not verified yet!",
      "FORBIDDEN",
    );
  }

  const result = await Meal.create({ ...payload, orgId: org._id });

  return result;
};

const getProviderMeals = async (user: JwtPayload): Promise<IMeal[]> => {
  const org = await Organization.findOne({ ownerId: user.id });
  if (!org) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Please create an organization or brand first!",
      "NOT_FOUND",
    );
  } else if (!org.isVerified) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Organization not verified yet!",
      "FORBIDDEN",
    );
  }
  const result = await Meal.find({ orgId: org?._id });

  return result;
};

const updateStock = async (id: string, payload: Partial<IMeal>) => {
  const result = await Meal.findByIdAndUpdate(id, payload, {
    runValidators: true,
    new: true,
  });

  return result;
};

const getASpecificMeal = async (mealId: string): Promise<IMeal | null> => {
  const result = await Meal.findById(mealId).populate("orgId");

  if (result === null) {
    throw new Error("Meal does not exists!");
  }

  return result;
};

const updateAMeal = async (id: string, data: IMeal) => {
  const meal = await Meal.isMealExistsById(id);
  if (!meal) {
    throw new AppError(StatusCodes.NOT_FOUND, "No Data Found");
  }
  const result = await Meal.findByIdAndUpdate(id, data, {
    new: true,
  });

  return result;
};

const deleteAMeal = async (id: string) => {
  const result = await Meal.findByIdAndDelete(id);

  return result;
};

const getAllMeals = async () => {
  const result = await Meal.find({ inStock: true });

  return result;
};

const getAllCars = async (query: Record<string, unknown>) => {
  const searchableFields = [
    "name",
    "brand",
    "model",
    "exteriorColor",
    "interiorColor",
    "fuelType",
    "transmission",
    "category",
  ];
  const carQuery = new QueryBuilder(Meal.find(), query)
    .search(searchableFields)
    .filter()
    .filterBySpecifications()
    .filterByPriceRange()
    .sort()
    .paginate()
    .fields();

  const [result, meta] = await Promise.all([
    carQuery.modelQuery,
    carQuery.countTotal(),
  ]);

  if (result.length === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, "No Cars Found");
  }

  return {
    result,
    meta,
  };
};

const getASpecificCar = async (carId: string): Promise<IMeal | null> => {
  const result = await Meal.findById(carId);

  if (result === null) {
    throw new Error("Car does not exists!");
  }

  return result;
};

const updateACar = async (id: string, data: IMeal) => {
  const car = await Meal.isMealExistsById(id);
  if (!car) {
    throw new AppError(StatusCodes.NOT_FOUND, "No Data Found");
  }
  const result = await Meal.findByIdAndUpdate(id, data, {
    new: true,
  });

  return result;
};

const deleteACar = async (id: string) => {
  const result = await Meal.findByIdAndDelete(id);

  return result;
};

export const mealServices = {
  createMeal,
  getProviderMeals,
  updateStock,
  getASpecificMeal,
  getAllMeals,
  updateAMeal,
  deleteAMeal,
  getAllCars,
  getASpecificCar,
  updateACar,
  deleteACar,
};
