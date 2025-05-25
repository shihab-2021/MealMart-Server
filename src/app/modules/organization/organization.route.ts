import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constant";
import { orgControllers } from "./organization.controller";

const router = Router();

router.route("/").post(auth(USER_ROLE.provider), orgControllers.createOrg);

router
  .route("/admin/unverifiedOrg")
  .get(auth(USER_ROLE.admin), orgControllers.getUnverifiedOrg);

router.route("/verifiedOrgs").get(orgControllers.getVerifiedOrg);

// .delete(auth(USER_ROLE.admin), orgControllers.deleteAnOrg);

router
  .route("/verifyOrg/:orgId")
  .put(auth(USER_ROLE.admin), orgControllers.verifyOrg);
//   .delete(auth(USER_ROLE.user, USER_ROLE.admin), orgControllers.deleteACar);

// router.route("/:id").put(auth(USER_ROLE.admin), orgControllers.verifyOrg);

router
  .route("/:orgId")
  .get(orgControllers.getASpecificOrg)
  .put(auth(USER_ROLE.provider), orgControllers.updateAOrg);

export const orgRoutes = router;
