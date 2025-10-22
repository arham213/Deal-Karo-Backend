import express from 'express';
import { createPropertySchema, propertyIdParamsSchema, updatePropertySchema } from '../validators/property.js';
import { GetAllProperties, GetPropertyById, CreateProperty, UpdateProperty, DeleteProperty } from '../controllers/property.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const PropertyRouter = express.Router();

// Get all Properties
PropertyRouter.get('/', GetAllProperties);

// Get a single Property by ID
PropertyRouter.get('/:propertyId', validateRequest({ params: propertyIdParamsSchema }), GetPropertyById);

// Create a new Property
PropertyRouter.post('/', validateRequest({ body: createPropertySchema }), CreateProperty);

// Update an Property by ID
PropertyRouter.put('/', validateRequest({ body: updatePropertySchema }), UpdateProperty);

// Delete an Property by ID
PropertyRouter.delete('/:propertyId', validateRequest({ params: propertyIdParamsSchema }), DeleteProperty);

export default PropertyRouter;
