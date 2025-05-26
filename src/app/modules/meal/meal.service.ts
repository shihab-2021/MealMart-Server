import { StatusCodes } from "http-status-codes";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import { IMeal, IReview } from "./meal.interface";
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

const addReview = async (
  user: JwtPayload,
  id: string,
  data: Partial<IReview>,
) => {
  const userId = user?.id;
  const meal = await Meal.isMealExistsById(id);
  if (!meal) {
    throw new AppError(StatusCodes.NOT_FOUND, "No Data Found");
  }
  if (!data?.rating || typeof data?.rating !== "number") {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Rating is required and must be a number",
    );
  }
  if (!data?.description || typeof data?.description !== "string") {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Rating is required and must be a number",
    );
  }
  // Optional: check if the user has already reviewed
  const alreadyReviewed = meal.reviews.find(
    (rev: any) => rev.user.toString() === userId.toString(),
  );
  if (alreadyReviewed) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You have already reviewed this meal",
    );
  }
  // Create new review object
  const newReview = {
    rating: Number(data?.rating),
    user: userId,
    description: data?.description.trim(),
  };

  // Add review to meal
  meal.reviews.push(newReview);
  await meal.save();

  // Populate user info in the response
  await meal.populate("reviews.user", "name email");

  // Get the newly added review
  const addedReview = meal.reviews[meal.reviews.length - 1];

  return addedReview;
};

const getASpecificMealReviews = async (mealId: string) => {
  const result = await Meal.findById(mealId).populate({
    path: "reviews.user",
    select: "name email avatar", // you can customize fields
  });

  if (result === null) {
    throw new Error("Meal does not exists!");
  }

  return result.reviews;
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

const getAllMealReviews = async () => {
  const reviews = await Meal.aggregate([
    // Unwind reviews array
    { $unwind: "$reviews" },

    // Lookup user info
    {
      $lookup: {
        from: "users", // collection name
        localField: "reviews.user",
        foreignField: "_id",
        as: "userInfo",
      },
    },

    // Flatten userInfo array
    { $unwind: "$userInfo" },

    // Project only required fields
    {
      $project: {
        _id: "$reviews._id",
        rating: "$reviews.rating",
        description: "$reviews.description",
        user: {
          _id: "$userInfo._id",
          name: "$userInfo.name",
          email: "$userInfo.email",
          avatar: "$userInfo.avatar", // optional
        },
        meal: {
          _id: "$_id",
          mealName: "$mealName",
          category: "$category",
          images: "$images",
        },
      },
    },

    // Optional: sort newest first
    { $sort: { createdAt: -1 } },
  ]);

  return reviews;
};

const searchMeals = async (query: string) => {
  if (!query || typeof query !== "string") {
    throw new AppError(StatusCodes.NOT_FOUND, "Search query is required");
  }

  const regex = new RegExp(query, "i"); // case-insensitive

  const meals = await Meal.find({
    $or: [
      { mealName: regex },
      { description: regex },
      { category: regex },
      { "keyIngredients.ingredientName": regex },
    ],
  })
    .limit(20)
    .select("mealName description price category images") // return specific fields
    .populate("orgId", "name"); // populate org name
  return meals;
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
  addReview,
  getASpecificMealReviews,
  getAllMealReviews,
  searchMeals,
};
