import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { Order } from "./order.model";
import { JwtPayload } from "jsonwebtoken";
import { orderUtils } from "./order.utils";
import { User } from "../user/user.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { Types } from "mongoose";
import { Meal } from "../meal/meal.model";
import { Organization } from "../organization/organization.model";

const createOrder = async (
  user: JwtPayload,
  payload: { products: { product: string; quantity: number }[] },
  client_ip: string,
) => {
  if (!payload?.products?.length)
    throw new AppError(StatusCodes.NOT_ACCEPTABLE, "Order is not specified");

  const products = payload.products;

  let totalPrice = 0;
  const productDetails = await Promise.all(
    products.map(async (item) => {
      const product = await Meal.findById(item.product);
      if (product) {
        // checking if car in stock
        if (product.inStock === false) {
          throw new Error("Meal out of stock!");
        }
        const subtotal = product
          ? (product.price || 0) * item.quantity * 1.1
          : 0;
        totalPrice += subtotal;
        return item;
      } else {
        throw new Error("Meal does not exists!");
      }
    }),
  );
  const userData = await User.isUserExistsByEmail(user.email);

  let order = await Order.create({
    user: userData._id,
    products: productDetails,
    totalPrice,
  });

  // return null;
  // payment integration
  const shurjopayPayload = {
    amount: totalPrice,
    order_id: order._id,
    currency: "BDT",
    customer_name: userData.name,
    customer_address: userData.address?.city || "Bangladesh",
    customer_email: userData.email,
    customer_phone: userData.phone || "01384837384",
    customer_city: userData.address?.city || "Dhaka",
    client_ip,
  };

  const payment = await orderUtils.makePaymentAsync(shurjopayPayload);

  if (payment?.transactionStatus) {
    order = await order.updateOne({
      transaction: {
        id: payment.sp_order_id,
        transactionStatus: payment.transactionStatus,
      },
    });
  }

  return payment.checkout_url;
};

const getOrders = async (query: Record<string, unknown>) => {
  const orders = new QueryBuilder(Order.find(), query)
    .sort()
    .filter()
    .paginate();

  const [result, meta] = await Promise.all([
    orders.modelQuery
      .populate({
        path: "user",
        select: "name email role",
      })
      .populate({
        path: "products.product",
        select: "mealName price category images",
      }),
    orders.countTotal(),
  ]);
  return { data: result, meta };
};

const getIndividualUserOrders = async (
  userData: JwtPayload,
  query: Record<string, unknown>,
) => {
  const user = await User.findOne({ email: userData.email });
  if (!user || user.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found or deleted");
  }

  const bookingQuery = new QueryBuilder(
    Order.find({ user: user._id })
      .populate({
        path: "user",
        select: "name email role",
      })
      .populate({
        path: "products.product",
        select: "mealName price category images",
      }),
    query,
  )
    .sort()
    .filter()
    .paginate();

  const [result, meta] = await Promise.all([
    bookingQuery.modelQuery,
    bookingQuery.countTotal(),
  ]);

  if (!result.length) {
    throw new AppError(StatusCodes.NOT_FOUND, "No Order found");
  }
  return { data: result, meta };
};

const getProviderStats = async (userId: string) => {
  // 1. Get provider's organization
  const organization = await Organization.findOne({ ownerId: userId });
  if (!organization) {
    throw new Error("Organization not found for this provider");
  }
  const orgId = organization._id.toString();

  // 3. Aggregation pipelines
  const [totalOrders, totalProducts, lowStockProducts] = await Promise.all([
    // Total orders containing provider's products
    Order.countDocuments({ "products.orgId": orgId }),

    // Total meals belonging to the provider
    Meal.countDocuments({ orgId }),

    // Low stock meals (quantity < 10)
    Meal.countDocuments({ orgId, quantity: { $lt: 10 } }),
  ]);

  // 4. Revenue and status statistics
  const revenueStats = await Order.aggregate([
    { $match: { "products.orgId": orgId } },
    { $unwind: "$products" },
    { $match: { "products.orgId": orgId } },
    {
      $lookup: {
        from: "meals",
        localField: "products.product",
        foreignField: "_id",
        as: "meal",
      },
    },
    { $unwind: "$meal" },
    {
      $group: {
        _id: "$paymentStatus",
        totalRevenue: {
          $sum: { $multiply: ["$meal.price", "$products.quantity"] },
        },
        orderCount: { $sum: 1 },
      },
    },
  ]);

  // 5. Monthly sales data
  const salesData = await Order.aggregate([
    {
      $match: {
        "products.orgId": orgId,
        paymentStatus: "Paid",
      },
    },
    { $unwind: "$products" },
    { $match: { "products.orgId": orgId } },
    {
      $lookup: {
        from: "meals",
        localField: "products.product",
        foreignField: "_id",
        as: "meal",
      },
    },
    { $unwind: "$meal" },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: {
          $sum: { $multiply: ["$meal.price", "$products.quantity"] },
        },
        orders: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: {
          $let: {
            vars: {
              months: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ],
            },
            in: { $arrayElemAt: ["$$months", "$_id.month"] },
          },
        },
        revenue: 1,
        orders: 1,
      },
    },
    { $sort: { year: 1, month: 1 } },
  ]);

  // 6. Format results
  const stats = {
    organization: {
      name: organization.name,
      contact: organization.contactInfo,
    },
    totalOrders,
    totalProducts,
    lowStockProducts,
    totalRevenue: revenueStats.reduce(
      (acc, curr) => acc + curr.totalRevenue,
      0,
    ),
    paymentStatus: revenueStats.reduce(
      (acc, curr) => ({
        ...acc,
        [curr._id]: {
          revenue: curr.totalRevenue,
          orders: curr.orderCount,
        },
      }),
      {},
    ),
    salesData,
    productStatus: await getProductStatusStats(orgId), // Helper function
  };

  return stats;
};

// Helper function for product status statistics
const getProductStatusStats = async (orgId: string) => {
  return Order.aggregate([
    { $match: { "products.orgId": orgId } },
    { $unwind: "$products" },
    { $match: { "products.orgId": orgId } },
    {
      $group: {
        _id: "$products.status",
        count: { $sum: 1 },
        totalQuantity: { $sum: "$products.quantity" },
      },
    },
    {
      $project: {
        status: "$_id",
        count: 1,
        totalQuantity: 1,
        _id: 0,
      },
    },
  ]);
};

const getOrderStatesForAdmin = async () => {
  // Aggregate total orders
  const totalOrders = await Order.countDocuments();

  // Aggregate total revenue (only paid orders)
  const totalRevenueResult = await Order.aggregate([
    { $match: { paymentStatus: "Paid" } },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);
  const totalRevenue = totalRevenueResult[0]?.total || 0;

  // Aggregate total meals (products)
  const totalProducts = await Meal.countDocuments();

  // Aggregate low stock meals (quantity < 10)
  const lowStockProducts = await Meal.countDocuments({ quantity: { $lt: 10 } });

  // Aggregate payment status counts
  const paymentStatusStats = await Order.aggregate([
    {
      $group: {
        _id: "$paymentStatus",
        count: { $sum: 1 },
        revenue: { $sum: "$totalPrice" },
      },
    },
  ]);

  // Aggregate shipping status counts
  const shippingStatusStats = await Order.aggregate([
    {
      $group: {
        _id: "$shippingStatus",
        count: { $sum: 1 },
      },
    },
  ]);

  // Convert to more usable format
  const paymentStatusMap = paymentStatusStats.reduce(
    (acc, { _id, count, revenue }) => ({
      ...acc,
      [_id]: { count, revenue: revenue || 0 },
    }),
    {},
  );

  const shippingStatusMap = shippingStatusStats.reduce(
    (acc, { _id, count }) => ({
      ...acc,
      [_id]: count,
    }),
    {},
  );

  // Aggregate sales data (monthly revenue for paid orders)
  const salesData = await Order.aggregate([
    { $match: { paymentStatus: "Paid" } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: { $sum: "$totalPrice" },
        ordersCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: {
          $let: {
            vars: {
              monthsInString: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ],
            },
            in: { $arrayElemAt: ["$$monthsInString", "$_id.month"] },
          },
        },
        revenue: 1,
        ordersCount: 1,
      },
    },
    { $sort: { year: 1, month: 1 } },
  ]);

  // Prepare the response object
  const stats = {
    totalOrders,
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalProducts,
    lowStockProducts,
    paymentStatus: {
      Pending: paymentStatusMap.Pending || { count: 0, revenue: 0 },
      Paid: paymentStatusMap.Paid || { count: 0, revenue: 0 },
      Failed: paymentStatusMap.Failed || { count: 0, revenue: 0 },
    },
    shippingStatus: {
      Pending: shippingStatusMap.Pending || 0,
      Accepted: shippingStatusMap.Accepted || 0,
      Preparing: shippingStatusMap.Preparing || 0,
      Delivered: shippingStatusMap.Delivered || 0,
      Cancelled: shippingStatusMap.Cancelled || 0,
    },
    salesData,
  };

  return { stats };
};

const getUserOrderStates = async (userData: JwtPayload) => {
  const user = await User.findOne({ email: userData.email });
  if (!user || user.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found or deleted");
  }

  const stats = await Order.aggregate([
    {
      $match: { user: new Types.ObjectId(user._id) }, // Filter orders by user
    },
    {
      $facet: {
        // Count total orders for the user
        totalOrders: [{ $count: "count" }],

        // Sum up total spending
        totalSpent: [{ $group: { _id: null, total: { $sum: "$totalPrice" } } }],

        // Count total products ordered
        totalProducts: [
          { $unwind: "$products" },
          { $group: { _id: null, total: { $sum: "$products.quantity" } } },
        ],

        // Count products by status
        orderStatus: [
          { $unwind: "$products" }, // Unwind products array to access individual product statuses
          { $group: { _id: "$products.status", count: { $sum: 1 } } },
        ],
      },
    },
    {
      $project: {
        totalOrders: {
          $ifNull: [{ $arrayElemAt: ["$totalOrders.count", 0] }, 0],
        },
        totalSpent: {
          $ifNull: [{ $arrayElemAt: ["$totalSpent.total", 0] }, 0],
        },
        totalProducts: {
          $ifNull: [{ $arrayElemAt: ["$totalProducts.total", 0] }, 0],
        },
        orderStatus: {
          $arrayToObject: {
            $map: {
              input: "$orderStatus",
              as: "status",
              in: { k: "$$status._id", v: "$$status.count" },
            },
          },
        },
      },
    },
  ]);

  return { stats: stats[0] }; // Return first element since aggregation returns an array
};

const verifyPayment = async (order_id: string) => {
  const verifiedPayment = await orderUtils.verifyPaymentAsync(order_id);

  if (verifiedPayment.length) {
    await Order.findOneAndUpdate(
      {
        "transaction.id": order_id,
      },
      {
        "transaction.bank_status": verifiedPayment[0].bank_status,
        "transaction.sp_code": verifiedPayment[0].sp_code,
        "transaction.sp_message": verifiedPayment[0].sp_message,
        "transaction.transactionStatus": verifiedPayment[0].transaction_status,
        "transaction.method": verifiedPayment[0].method,
        "transaction.date_time": verifiedPayment[0].date_time,
        paymentStatus:
          verifiedPayment[0].bank_status == "Success"
            ? "Paid"
            : verifiedPayment[0].bank_status == "Failed"
              ? "Failed"
              : verifiedPayment[0].bank_status == "Cancel"
                ? "Cancelled"
                : "",
      },
    );
  }

  return verifiedPayment;
};

const getProviderOrders = async (user: JwtPayload) => {
  const org = await Organization.findOne({ ownerId: user.id });
  if (!org) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Organization not found!",
      "NOT_FOUND",
    );
  }

  const orders = await Order.aggregate([
    // Match orders containing at least one product from the provider's organization
    {
      $match: {
        "products.orgId": org._id,
      },
    },
    // Filter products array to include only the provider's products
    {
      $addFields: {
        products: {
          $filter: {
            input: "$products",
            as: "product",
            cond: { $eq: ["$$product.orgId", org._id] },
          },
        },
      },
    },
    // Lookup Meal (Product) details (Only fetch required fields)
    {
      $lookup: {
        from: "meals", // Assuming meals collection
        localField: "products.product",
        foreignField: "_id",
        as: "mealDetails",
        pipeline: [
          {
            $project: {
              mealName: 1,
              price: 1,
              images: 1,
            },
          },
        ],
      },
    },
    // Lookup User details (Only fetch email and name)
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userDetails",
        pipeline: [
          {
            $project: {
              name: 1,
              email: 1,
            },
          },
        ],
      },
    },
    // Lookup Organization details (if needed)
    {
      $lookup: {
        from: "organizations",
        localField: "products.orgId",
        foreignField: "_id",
        as: "organizationDetails",
        pipeline: [
          {
            $project: {
              name: 1, // Example: Only include name (add more fields if needed)
            },
          },
        ],
      },
    },
    // Unwind the userDetails array (since it's a single user)
    {
      $unwind: "$userDetails",
    },
    // Map products to include meal and organization details
    {
      $addFields: {
        products: {
          $map: {
            input: "$products",
            as: "prod",
            in: {
              $mergeObjects: [
                "$$prod",
                {
                  mealDetails: {
                    $arrayElemAt: [
                      "$mealDetails",
                      {
                        $indexOfArray: ["$mealDetails._id", "$$prod.product"],
                      },
                    ],
                  },
                  organizationDetails: {
                    $arrayElemAt: [
                      "$organizationDetails",
                      {
                        $indexOfArray: [
                          "$organizationDetails._id",
                          "$$prod.orgId",
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    },
    // Sort orders by createdAt in descending order
    {
      $sort: {
        createdAt: -1, // Change to the field you want to sort by, e.g., createdAt
      },
    },
    // Final projection to exclude unnecessary fields
    {
      $project: {
        "products.orgId": 0,
        mealDetails: 0, // Remove temporary mealDetails field
        organizationDetails: 0, // Remove temporary organizationDetails field
        __v: 0,
      },
    },
  ]);

  return orders;
};

const revenueFromOrders = async () => {
  const result = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalPrice" },
      },
    },
  ]);

  return { totalRevenue: result[0]?.totalRevenue };
};

const updateProductStatus = async (payload: {
  orderId: string;
  productId: string;
  status: string;
}) => {
  const { orderId, productId, status } = payload;

  // Validate input
  if (!orderId || !productId || !status) {
    throw new AppError(
      400,
      "orderId, productId, and status are required!",
      "BAD_REQUEST",
    );
  }

  // Find and update the specific product's status within the order
  const updatedOrder = await Order.findOneAndUpdate(
    {
      _id: orderId,
      "products.product": productId, // Ensure the product exists in the order
    },
    {
      $set: { "products.$.status": status }, // Update only the status of the matching product
    },
    { new: true }, // Return updated document
  );

  // If order or product is not found, return error
  if (!updatedOrder) {
    throw new AppError(404, "Order or Product not found!", "NOT_FOUND");
  }

  return updatedOrder;
};

const getPendingOrders = async () => {
  const pendingOrders = await Order.aggregate([
    // Match orders where shippingStatus is "Pending"
    {
      $match: {
        shippingStatus: { $in: ["Pending", "Preparing"] },
      },
    },
    // Lookup user details (Only fetch email and name)
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userDetails",
        pipeline: [
          {
            $project: {
              name: 1,
              email: 1,
            },
          },
        ],
      },
    },
    // Unwind user details (since it's a single user)
    {
      $unwind: "$userDetails",
    },
    // Lookup Meal (Product) details (Only fetch required fields)
    {
      $lookup: {
        from: "meals", // Assuming 'meals' collection stores products
        localField: "products.product",
        foreignField: "_id",
        as: "mealDetails",
        pipeline: [
          {
            $project: {
              mealName: 1,
              price: 1,
              images: 1,
            },
          },
        ],
      },
    },
    // Lookup Organization details (if needed)
    {
      $lookup: {
        from: "organizations",
        localField: "products.orgId",
        foreignField: "_id",
        as: "organizationDetails",
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
      },
    },
    // Map products to include meal and organization details
    {
      $addFields: {
        products: {
          $map: {
            input: "$products",
            as: "prod",
            in: {
              $mergeObjects: [
                "$$prod",
                {
                  mealDetails: {
                    $arrayElemAt: [
                      "$mealDetails",
                      {
                        $indexOfArray: ["$mealDetails._id", "$$prod.product"],
                      },
                    ],
                  },
                  organizationDetails: {
                    $arrayElemAt: [
                      "$organizationDetails",
                      {
                        $indexOfArray: [
                          "$organizationDetails._id",
                          "$$prod.orgId",
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    },
    {
      $sort: {
        createdAt: -1, // Change to the field you want to sort by, e.g., createdAt
      },
    },
    // Final projection to exclude unnecessary fields
    {
      $project: {
        "products.orgId": 0,
        mealDetails: 0,
        organizationDetails: 0,
        __v: 0,
      },
    },
  ]);

  return pendingOrders;
};

const updateShippingStatus = async (payload: {
  orderId: string;
  status: string;
}) => {
  const result = await Order.findByIdAndUpdate(
    payload.orderId,
    { shippingStatus: payload.status },
    {
      runValidators: true,
      new: true,
    },
  );

  return result;
};

export const orderServices = {
  createOrder,
  getOrders,
  verifyPayment,
  revenueFromOrders,
  getIndividualUserOrders,
  getUserOrderStates,
  getOrderStatesForAdmin,
  getProviderOrders,
  updateProductStatus,
  getPendingOrders,
  updateShippingStatus,
  getProviderStats,
};
