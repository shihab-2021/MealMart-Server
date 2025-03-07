import { IUser } from "./user.interface";
import { User } from "./user.model";

const getAllUsers = async () => {
  const result = await User.find();
  return result;
};

const getSingleUser = async (id: string) => {
  const result = await User.findById(id);
  return result;
};

const updateUser = async (id: string, payload: Partial<IUser>) => {
  const result = await User.findByIdAndUpdate(id, payload, {
    runValidators: true,
    new: true,
  });
  return result;
};

export const userServices = {
  getAllUsers,
  getSingleUser,
  updateUser,
};
