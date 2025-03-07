import { Document, Types } from "mongoose";

export interface IOrder extends Document {
  user: Types.ObjectId;
  products: {
    product: Types.ObjectId;
    quantity: number;
    orgId: Types.ObjectId;
    status: "Pending" | "Delivered" | "Preparing" | "Cancelled";
  }[];
  totalPrice: number;
  paymentStatus: "Pending" | "Paid" | "Failed";
  shippingStatus:
    | "Pending"
    | "Preparing"
    | "Delivered"
    | "Accepted"
    | "Cancelled";
  transaction: {
    id: string;
    transactionStatus: string;
    bank_status: string;
    sp_code: string;
    sp_message: string;
    method: string;
    date_time: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
