import { Router } from "express";
// import { orderController } from "./order.controller";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constant";
import { orderControllers } from "./order.controller";

const orderRouters = Router();

orderRouters
  .route("/")
  .get(auth(USER_ROLE.admin), orderControllers.getOrders)
  .post(auth(USER_ROLE.customer), orderControllers.createOrder);

orderRouters
  .route("/updateProductStatus")
  .put(auth(USER_ROLE.provider), orderControllers.updateProductStatus);

orderRouters
  .route("/updateOrderStatus")
  .put(auth(USER_ROLE.admin), orderControllers.updateShippingStatus);

orderRouters
  .route("/myOrders")
  .get(auth(USER_ROLE.customer), orderControllers.getIndividualOrders);

orderRouters
  .route("/pendingOrders")
  .get(auth(USER_ROLE.admin), orderControllers.getPendingOrders);

orderRouters
  .route("/providerOrders")
  .get(auth(USER_ROLE.provider), orderControllers.getProviderOrders);

orderRouters
  .route("/userStates")
  .get(auth(USER_ROLE.customer), orderControllers.getUserOrderStates);

orderRouters
  .route("/providerStates")
  .get(auth(USER_ROLE.provider), orderControllers.getProviderStats);

orderRouters
  .route("/adminStates")
  .get(auth(USER_ROLE.admin), orderControllers.getOrderStatesForAdmin);

orderRouters.get(
  "/verify",
  auth(USER_ROLE.customer),
  orderControllers.verifyPayment,
);

export default orderRouters;
