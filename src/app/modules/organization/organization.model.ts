import { model, Schema } from "mongoose";
import {
  IProviderOrganization,
  OrganizationModel,
} from "./organization.interface";

const organizationSchema = new Schema<IProviderOrganization>({
  name: {
    type: String,
    required: [true, "Please provide organization name!"],
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Please provide owner id!"],
  },
  logo: {
    type: String,
  },
  description: {
    type: String,
  },
  address: {
    street: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    zip: {
      type: String,
      trim: true,
    },
  },
  contactInfo: {
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      validate: {
        validator: function (value: string) {
          return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,6}/.test(value);
        },
        message: "{VALUE} is not a valid email",
      },
    },
    website: {
      type: String,
    },
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

// checking if the meal exist by _id
organizationSchema.statics.isOrgExistsById = async function (id: string) {
  return await Organization.findById(id);
};

export const Organization = model<IProviderOrganization, OrganizationModel>(
  "Organization",
  organizationSchema,
);
