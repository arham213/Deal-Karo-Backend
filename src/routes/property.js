import express from 'express';
import {
  createPropertySchema,
  propertyIdParamsSchema,
  updatePropertySchema,
  advancedSearchSchema,
  simpleSearchSchema,
  getAllPropertiesSchema
} from '../validators/property.js';
import {
  GetAllProperties,
  GetPropertyById,
  CreateProperty,
  UpdateProperty,
  DeleteProperty,
  GetMyProperties,
  AdvancedSearchProperties,
  SimpleSearchProperties
} from '../controllers/property.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import upload from '../middlewares/upload.js';

const PropertyRouter = express.Router();

// Get all Properties (with pagination)
PropertyRouter.get('/', GetAllProperties);

//Get Properties by User ID
PropertyRouter.get('/my-properties', GetMyProperties);

// Advanced search with filters
PropertyRouter.get('/search/advanced', AdvancedSearchProperties);

// Simple search with search string
PropertyRouter.get('/search', SimpleSearchProperties);

// Get a single Property by ID
PropertyRouter.get('/:propertyId', validateRequest({ params: propertyIdParamsSchema }), GetPropertyById);

// Create a new Property (with image upload support)
PropertyRouter.post('/', upload.single('image'), CreateProperty);

// Update a Property by ID
PropertyRouter.put('/', upload.single('image'), UpdateProperty);

// Delete a Property by ID
PropertyRouter.delete('/:propertyId', validateRequest({ params: propertyIdParamsSchema }), DeleteProperty);

export default PropertyRouter;
