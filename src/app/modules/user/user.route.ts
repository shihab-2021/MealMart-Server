import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "./user.constant";
import { userControllers } from "./user.controller";

const router = Router();
router.route("/").get(auth(USER_ROLE.admin), userControllers.getAllUsers);

router
  .route("/:id")
  .get(
    auth(USER_ROLE.admin, USER_ROLE.customer, USER_ROLE.provider),
    userControllers.getSingleUser,
  )
  .put(
    auth(USER_ROLE.admin, USER_ROLE.customer, USER_ROLE.provider),
    userControllers.updateUser,
  );

export const userRoutes = router;
