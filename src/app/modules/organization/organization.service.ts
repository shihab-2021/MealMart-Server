import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { IProviderOrganization } from "./organization.interface";
import { Organization } from "./organization.model";
import { JwtPayload } from "jsonwebtoken";

const createOrg = async (
  user: JwtPayload,
  payload: IProviderOrganization,
): Promise<IProviderOrganization> => {
  const org = await Organization.findOne({ ownerId: user.id });
  if (org) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Forbidden: Each provider can only create only one organization!",
      "FORBIDDEN",
    );
  }
  const result = await Organization.create({ ...payload, ownerId: user.id });

  return result;
};

const getASpecificOrg = async (
  ownerId: string,
): Promise<IProviderOrganization | null> => {
  const result = await Organization.findOne({ ownerId: ownerId });

  if (result === null) {
    throw new Error("Owner didn't create any organization!");
  }

  return result;
};

const verifyOrg = async (id: string) => {
  const result = await Organization.findByIdAndUpdate(
    id,
    { isVerified: true },
    {
      runValidators: true,
      new: true,
    },
  );

  return result;
};

const getUnverifiedOrg = async (): Promise<IProviderOrganization[]> => {
  const result = await Organization.find({ isVerified: false });

  return result;
};

const deleteAnOrg = async (id: string) => {
  const result = await Organization.findByIdAndDelete(id);

  return result;
};

const updateAOrg = async (id: string, data: IProviderOrganization) => {
  const car = await Organization.isOrgExistsById(id);
  if (!car) {
    throw new AppError(StatusCodes.NOT_FOUND, "No Data Found");
  }
  const result = await Organization.findByIdAndUpdate(id, data, {
    new: true,
  });

  return result;
};

export const orgServices = {
  createOrg,
  getASpecificOrg,
  verifyOrg,
  getUnverifiedOrg,
  deleteAnOrg,
  updateAOrg,
};
