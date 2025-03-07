import { Model, Types } from "mongoose";

export interface IProviderOrganization {
  name: string; // Business/brand name
  ownerId: Types.ObjectId; // References User._id of the owner
  logo?: string; // URL to logo image
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  isVerified: boolean; // Official verification status
}

export interface OrganizationModel extends Model<IProviderOrganization> {
  // eslint-disable-next-line no-unused-vars
  isOrgExistsById(id: string): Promise<IProviderOrganization>;
}
