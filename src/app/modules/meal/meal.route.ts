import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constant";
import { mealControllers } from "./meal.controller";

const router = Router();

router
  .route("/")
  .get(mealControllers.getAllMeals)
  .post(auth(USER_ROLE.provider), mealControllers.createMeal);

router
  .route("/providerMeals")
  .get(auth(USER_ROLE.provider), mealControllers.getProviderMeals);

router
  .route("/:mealId")
  .get(mealControllers.getASpecificMeal)
  .put(auth(USER_ROLE.provider), mealControllers.updateAMeal)
  .delete(
    auth(USER_ROLE.provider, USER_ROLE.admin),
    mealControllers.deleteAMeal,
  );

router
  .route("/updateStock/:mealId")
  .put(auth(USER_ROLE.provider), mealControllers.updateStock);

export const mealRoutes = router;
