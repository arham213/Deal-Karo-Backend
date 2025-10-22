import { Property, Plot, House } from "../models/index.js";
import { AppError } from "../utils/AppError.js";

export const getAllProperties = async () => {
    const properties = await Property.find().populate('dealerId');

    return properties;
}

export const getPropertyById = async (propertyId) => {
    const property = await Property.findById(propertyId).populate('dealerId');

    if (!property) throw new AppError("Property not found", 404);

    return property;
}

export const createProperty = async (propertyData) => {
    const Model = getModel(propertyData.type);
    
    const newProperty = await Model.create(propertyData);

    return newProperty;
}

export const updateProperty = async (propertyData) => {
    console.log('propertyData:', propertyData.propertyId)
    const property = await Plot.findById(propertyData.propertyId) || await House.findById(propertyData.propertyId);

    if (!property) throw new AppError("Property not found", 404);

    const Model = getModel(property.type);
    
    const updatedProperty = await Model.findByIdAndUpdate(
        propertyData.propertyId,
        propertyData,
        { new: true, runValidators: true }
    )

    return updatedProperty;
}

export const deleteProperty = async (propertyId) => {
    const property = await Plot.findById(propertyId) || await House.findById(propertyId);

    if (!property) throw new AppError("Property not found", 404);

    await property.deleteOne();

    return property;
}

const getModel = (type) => {
    let Model;

    switch (type) {
      case "plot":
        Model = Plot;
        break;
      case "house":
        Model = House;
        break;
      default:
        throw new AppError("Invalid property type", 400);
    }

    return Model;
}