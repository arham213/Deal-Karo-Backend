import {
  createProperty,
  deleteProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
} from "../services/property.js";
import { successResponse } from "../utils/response.js";

export const GetAllProperties = async (req, res, next) => {
  try {
    const properties = await getAllProperties();
    return successResponse(res, "Properties fetched successfully", { properties }, 200);
  } catch (error) {
    next(error);
  }
};

export const GetPropertyById = async (req, res, next) => {
  try {
    const property = await getPropertyById(req.params.propertyId);
    return successResponse(res, "Property fetched successfully", { property }, 200);
  } catch (error) {
    next(error);
  }
};

export const CreateProperty = async (req, res, next) => {
  try {
    const property = await createProperty(req.body);
    return successResponse(res, "Property created successfully", { property }, 201);
  } catch (error) {
    next(error);
  }
};

export const UpdateProperty = async (req, res, next) => {
  try {
    const property = await updateProperty(req.body);
    return successResponse(res, "Property updated successfully", { property }, 200);
  } catch (error) {
    next(error);
  }
};

export const DeleteProperty = async (req, res, next) => {
  try {
    const property = await deleteProperty(req.params.propertyId);
    return successResponse(res, "Property deleted successfully", { property }, 200);
  } catch (error) {
    next(error);
  }
};