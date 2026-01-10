import {
  createProperty,
  deleteProperty,
  getAllProperties,
  getPropertiesByUserId,
  getPropertyById,
  updateProperty,
  advancedSearchProperties,
  simpleSearchProperties,
} from "../services/property.js";
import { successResponse } from "../utils/response.js";
import { put } from "@vercel/blob";
import { sendNewListingNotifications } from "../services/notification.js";

export const GetAllProperties = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await getAllProperties(page, limit);
    return successResponse(
      res,
      "Properties fetched successfully",
      {
        properties: result.properties,
        pagination: result.pagination,
      },
      200
    );
  } catch (error) {
    next(error);
  }
};

export const GetMyProperties = async (req, res, next) => {
  try {
    console.log('userData:', req.user);
    const { page, limit } = req.query;
    const result = await getPropertiesByUserId(req.user.id, page, limit);
    return successResponse(
      res,
      "Properties fetched successfully",
      {
        properties: result.properties,
        pagination: result.pagination,
      },
      200
    );
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
  console.log('Create Property Request Recieved');
  try {
    console.log('userData:', req.body);

    let imageUrl = null;

    // Handle image upload to Vercel Blob if file is present
    if (req.file) {
      const filename = `properties/${Date.now()}-${req.file.originalname}`;
      const blob = await put(filename, req.file.buffer, {
        access: 'public',
        contentType: req.file.mimetype,
      });
      imageUrl = blob.url;
      console.log('Image uploaded to Vercel Blob:', imageUrl);
    }

    // Parse installment field if it's a JSON string (sent from form-data)
    let propertyData = { ...req.body };
    if (propertyData.installment && typeof propertyData.installment === 'string') {
      try {
        propertyData.installment = JSON.parse(propertyData.installment);
      } catch (e) {
        console.log('Failed to parse installment field:', e.message);
      }
    }

    // Add image URL to property data
    if (imageUrl) {
      propertyData.imageUrl = imageUrl;
    }

    const property = await createProperty(propertyData);

    // Send push notifications to all other users (non-blocking)
    sendNewListingNotifications(property, req.user.id);

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
    const property = await deleteProperty(req.user.id, req.params.propertyId);
    return successResponse(res, "Property deleted successfully", { property }, 200);
  } catch (error) {
    next(error);
  }
};

export const AdvancedSearchProperties = async (req, res, next) => {
  try {
    const result = await advancedSearchProperties(req.query);
    return successResponse(
      res,
      "Properties searched successfully",
      {
        properties: result.properties,
        pagination: result.pagination,
      },
      200
    );
  } catch (error) {
    next(error);
  }
};

export const SimpleSearchProperties = async (req, res, next) => {
  try {
    console.log('search params:', req.query);
    const result = await simpleSearchProperties(req.query);
    return successResponse(
      res,
      "Properties searched successfully",
      {
        properties: result.properties,
        pagination: result.pagination,
      },
      200
    );
  } catch (error) {
    next(error);
  }
};