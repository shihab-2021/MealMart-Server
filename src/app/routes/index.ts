import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";
import { userRoutes } from "../modules/user/user.route";
import orderRouters from "../modules/order/order.route";
import { orgRoutes } from "../modules/organization/organization.route";
import { mealRoutes } from "../modules/meal/meal.route";
const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/orgs",
    route: orgRoutes,
  },
  {
    path: "/meals",
    route: mealRoutes,
  },
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/orders",
    route: orderRouters,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
