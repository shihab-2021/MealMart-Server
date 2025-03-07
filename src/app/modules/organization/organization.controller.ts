import sendResponse from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import { orgServices } from "./organization.service";

const createOrg = catchAsync(async (req, res) => {
  const result = await orgServices.createOrg(req.user, req.body);

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.CREATED,
    message: "Car created successfully",
    data: result,
  });
});

const updateAOrg = catchAsync(async (req, res) => {
  const orgId = req.params.orgId;
  const body = req.body;

  const result = await orgServices.updateAOrg(orgId, body);

  if (result === null) {
    sendResponse(res, {
      status: false,
      statusCode: StatusCodes.NOT_FOUND,
      message: `No organization with the org id: ${orgId}!`,
      data: result,
    });
  } else {
    sendResponse(res, {
      status: true,
      statusCode: StatusCodes.OK,
      message: "Organization updated successfully",
      data: result,
    });
  }
});

const getUnverifiedOrg = catchAsync(async (req, res) => {
  const result = await orgServices.getUnverifiedOrg();

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "Organization retrieved successfully!",
    data: result,
  });
});

const getASpecificOrg = catchAsync(async (req, res) => {
  const orgId = req.params.orgId;
  const result = await orgServices.getASpecificOrg(orgId);

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "Org retrieved successfully",
    data: result,
  });
});

const verifyOrg = catchAsync(async (req, res) => {
  const result = await orgServices.verifyOrg(req.params.orgId);

  sendResponse(res, {
    status: true,
    statusCode: StatusCodes.OK,
    message: "Organization updated successfully!",
    data: result,
  });
});

const deleteAnOrg = catchAsync(async (req, res) => {
  const orgId = req.params.orgId;

  const result = await orgServices.deleteAnOrg(orgId);

  if (result === null) {
    sendResponse(res, {
      status: true,
      statusCode: StatusCodes.NOT_FOUND,
      message: `No organization with the organization id: ${orgId}!`,
      data: result,
    });
  } else {
    sendResponse(res, {
      status: true,
      statusCode: StatusCodes.OK,
      message: "Organization deleted successfully!",
      data: result,
    });
  }
});

export const orgControllers = {
  createOrg,
  getASpecificOrg,
  verifyOrg,
  getUnverifiedOrg,
  deleteAnOrg,
  updateAOrg,
};
