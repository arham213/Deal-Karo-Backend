import { Property, Plot, House, CommercialPlot } from "../models/index.js";
import { AppError } from "../utils/AppError.js";

export const getAllProperties = async (page = 1, limit = 10) => {
    // Ensure page and limit are integers
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    // Calculate pagination
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination and sorting
    const properties = await Property.find()
        .populate('userId', '_id name estateName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

    // Get total count for pagination
    const total = await Property.countDocuments();

    return {
        properties,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
        }
    };
}

export const getPropertiesByUserId = async (userId, page = 1, limit = 10) => {
    // Ensure page and limit are integers
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    // Calculate pagination
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination and sorting
    const properties = await Property.find({ userId })
        .populate('userId', '_id name estateName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

    // Get total count for pagination
    const total = await Property.countDocuments({ userId });

    return {
        properties,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
        }
    };
}

export const getPropertyById = async (propertyId) => {
    const property = await Property.findById(propertyId).populate('dealerId');

    if (!property) throw new AppError("Property not found", 404);

    return property;
}

// export const createProperty = async (propertyData) => {
//     console.log('propertyData:', propertyData);
//     const Model = getModel(propertyData.propertyType);

//     console.log('Model:', Model);

//     const oldProperty = await Model.find({ plotNo: propertyData.plotNo, propertyType: propertyData.propertyType }) || await Model.find({ houseNo: propertyData.houseNo, propertyType: propertyData.propertyType })
    
//     if (oldProperty) throw new AppError("Property with this No already exists")

//     const newProperty = await Model.create(propertyData);

//     return newProperty;
// }

export const createProperty = async (propertyData) => {
    console.log('propertyData:', propertyData);
  
    const Model = getModel(propertyData.propertyType);
    console.log('Model:', Model);
  
    // Find existing property by plotNo or houseNo
    const query = {}

    if (propertyData?.plotNo) {
        query.plotNo = propertyData.plotNo
    } else if (propertyData?.houseNo) {
        query.houseNo = propertyData.houseNo
    }

    query.propertyType = propertyData.propertyType;
    query.listingType = propertyData.listingType;

    const oldProperty = await Model.findOne(query);

    console.log('oldProperty:', oldProperty);
  
    if (oldProperty) {
      throw new AppError("Property with this No already exists");
    }
  
    const newProperty = await Model.create(propertyData);
    return newProperty;
  };

export const updateProperty = async (propertyData) => {
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

export const advancedSearchProperties = async (filters) => {
    console.log('filters:', filters);
    const {
        userId,
        propertyType,
        listingType,
        phase,
        block,
        area,
        minPrice,
        maxPrice,
        features,
        page = 1,
        limit = 10
    } = filters;

    // Ensure page and limit are integers
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    // Build query object
    const query = {};

    // User Id
    if (userId) {
        query.userId = userId;
    }

    // Property type filter
    if (propertyType) {
        query.propertyType = propertyType;
    }

    // Listing type filter (cash, rent, installments)
    if (listingType) {
        query.listingType = listingType;
    }

    // Phase filter
    if (phase) {
        query.phase = phase;
    }

    // Block filter
    if (block) {
        query.block = block;
    }

    // Area filter
    if (area && area !== 'Custom') {
        query.area = area;
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice !== undefined) {
            query.price.$gte = typeof minPrice === 'string' ? parseFloat(minPrice) : minPrice;
        }
        if (maxPrice !== undefined) {
            query.price.$lte = typeof maxPrice === 'string' ? parseFloat(maxPrice) : maxPrice;
        }
    }

    // Features filter (array match)
    if (features && Array.isArray(features) && features.length > 0) {
        query.features = { $all: features };
    }

    // Calculate pagination
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination and sorting
    const properties = await Property.find(query)
        .populate('userId', '_id name estateName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

    // Get total count for pagination
    const total = await Property.countDocuments(query);

    return {
        properties,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
        }
    };
};

// Helper function to parse search string and extract criteria
const parseSearchString = (searchString) => {
    const lowerSearch = searchString.toLowerCase().trim();
    const extracted = {
        propertyType: null,
        listingType: null,
        phase: null,
        block: null,
        area: null,
        areaNumber: null,
        areaUnit: null
    };

    // Extract property type (check for commercial plot first to avoid false matches)
    if (lowerSearch.includes('commercial plot') || lowerSearch.includes('commercial')) {
        extracted.propertyType = 'commercial plot';
    } else if (lowerSearch.includes('plot')) {
        extracted.propertyType = 'plot';
    } else if (lowerSearch.includes('house')) {
        extracted.propertyType = 'house';
    }

    // Extract listing type
    if (lowerSearch.includes('cash')) {
        extracted.listingType = 'cash';
    } else if (lowerSearch.includes('rent')) {
        extracted.listingType = 'rent';
    } else if (lowerSearch.includes('installment') || lowerSearch.includes('installments')) {
        extracted.listingType = 'installments';
    }

    // Extract phase (Phase 1, Phase 2, etc.) - must be followed by a number
    const phaseMatch = lowerSearch.match(/phase\s*(\d+)/i);
    if (phaseMatch) {
        extracted.phase = `Phase ${phaseMatch[1]}`;
    }

    // Extract block (Block A, Block B, etc.) - handle both "block b" and "phase b" (common mistake)
    const blockMatch = lowerSearch.match(/(?:block|phase)\s*([ab])/i);
    if (blockMatch) {
        extracted.block = `Block ${blockMatch[1].toUpperCase()}`;
    }

    // Extract area with decimal support (5 marla, 5.5 marla, 10.25 kanal, etc.)
    // Pattern matches: "5 marla", "5.5 marla", "10.25 kanal", "5m", "5.5m", etc.
    const areaPatterns = [
        { pattern: /(\d+\.?\d*)\s*marla/i, unit: 'marla' },
        { pattern: /(\d+\.?\d*)\s*kanal/i, unit: 'kanal' },
        { pattern: /(\d+\.?\d*)\s*m\b/i, unit: 'marla' }, // Short form "m" (word boundary to avoid matching "m" in other words)
        { pattern: /(\d+\.?\d*)\s*k\b/i, unit: 'kanal' }  // Short form "k" (word boundary)
    ];

    for (const { pattern, unit } of areaPatterns) {
        const match = lowerSearch.match(pattern);
        if (match) {
            extracted.areaNumber = match[1];
            extracted.areaUnit = unit;
            // Store normalized area for display (e.g., "5.5 Marla")
            extracted.area = `${extracted.areaNumber} ${extracted.areaUnit.charAt(0).toUpperCase() + extracted.areaUnit.slice(1)}`;
            break;
        }
    }

    return extracted;
};

export const simpleSearchProperties = async (filters) => {
    const {
        userId,
        searchString,
        propertyType: queryPropertyType,
        listingType: queryListingType,
        page = 1, 
        limit = 10
    } = filters;

    console.log('propertyType:', queryPropertyType);
    console.log('listingType:', queryListingType);

    if (!searchString || searchString.trim().length === 0) {
        throw new AppError("Search string is required", 400);
    }

    // Parse search string to extract criteria
    const extracted = parseSearchString(searchString);
    
    // Use query params if provided, otherwise use extracted values
    const propertyType = queryPropertyType || extracted.propertyType;
    const listingType = queryListingType || extracted.listingType;
    const phase = extracted.phase;
    const block = extracted.block;

    // Build base query with exact matches for extracted/provided criteria
    const baseQuery = {};

    if (userId) {
        baseQuery.userId = userId;
    }
    
    if (propertyType) {
        baseQuery.propertyType = propertyType;
    }
    
    if (listingType) {
        baseQuery.listingType = listingType;
    }
    
    if (phase) {
        baseQuery.phase = phase;
    }
    
    if (block) {
        baseQuery.block = block;
    }
    
    // For area, use flexible regex matching to handle format variations and decimals
    if (extracted.areaNumber && extracted.areaUnit) {
        // Escape the number for regex (handle decimals)
        const escapedNumber = extracted.areaNumber.replace('.', '\\.');
        const unit = extracted.areaUnit.toLowerCase();
        
        // Build a precise pattern that matches the exact number
        // Ensure the number is not part of a larger decimal (e.g., "5" shouldn't match in "7.5 marla")
        // For whole numbers: match "5 marla" but not "7.5 marla" or "15 marla"
        // For decimals: match "5.5 marla" exactly
        let areaPattern;
        if (extracted.areaNumber.includes('.')) {
            // For decimal numbers like "5.5", match exactly - ensure not preceded by digit
            areaPattern = `(^|[^\\d.])${escapedNumber}\\s*${unit}\\b`;
        } else {
            // For whole numbers like "5", ensure it's standalone
            // Pattern: (start OR non-digit/non-dot) + exact number + (not followed by .digit) + whitespace + unit
            // This prevents "5" from matching in "7.5 marla" or "15 marla"
            areaPattern = `(^|[^\\d.])${escapedNumber}(?![.\\d])\\s*${unit}\\b`;
        }
        
        baseQuery.area = { 
            $regex: new RegExp(areaPattern, 'i') 
        };
    }

    // Build text/regex search conditions for remaining search terms
    // Remove extracted terms from search string to avoid redundant matching
    let remainingSearch = searchString.trim();
    
    // Remove extracted terms from search string
    if (extracted.propertyType) {
        remainingSearch = remainingSearch.replace(new RegExp(extracted.propertyType.replace(' ', '\\s*'), 'gi'), '').trim();
        if (extracted.propertyType === 'commercial plot') {
            remainingSearch = remainingSearch.replace(/commercial/gi, '').trim();
        }
    }
    if (extracted.listingType) {
        remainingSearch = remainingSearch.replace(new RegExp(extracted.listingType, 'gi'), '').trim();
    }
    if (extracted.phase) {
        remainingSearch = remainingSearch.replace(new RegExp(`phase\\s*${extracted.phase.match(/\d+/)[0]}`, 'gi'), '').trim();
    }
    if (extracted.block) {
        remainingSearch = remainingSearch.replace(new RegExp(`(?:block|phase)\\s*${extracted.block.match(/[AB]/)[0]}`, 'gi'), '').trim();
    }
    if (extracted.areaNumber && extracted.areaUnit) {
        // Remove area pattern from search string
        remainingSearch = remainingSearch.replace(new RegExp(`${extracted.areaNumber}\\s*${extracted.areaUnit}`, 'gi'), '').trim();
        remainingSearch = remainingSearch.replace(new RegExp(`${extracted.areaNumber}\\s*[mk]\\b`, 'gi'), '').trim();
    }

    // Build the final query
    // Strategy: Use extracted criteria as exact filters
    // If we have extracted criteria, they act as filters
    // If we have remaining search terms, also search in text fields
    // If we have both, combine with $and (must match extracted criteria AND text search)
    // If we only have extracted criteria, use them alone (most common case)
    
    let query = {};
    
    if (Object.keys(baseQuery).length > 0) {
        // We have extracted criteria - use them as primary filters
        query = baseQuery;
        
        // If there's remaining search text, add it as an additional condition
        if (remainingSearch.length > 0) {
            query = {
                $and: [
                    baseQuery,
                    {
                        $or: [
                            { description: { $regex: remainingSearch, $options: 'i' } },
                            { phase: { $regex: remainingSearch, $options: 'i' } },
                            { block: { $regex: remainingSearch, $options: 'i' } },
                            { area: { $regex: remainingSearch, $options: 'i' } },
                            { features: { $regex: remainingSearch, $options: 'i' } }
                        ]
                    }
                ]
            };
        }
    } else {
        // No extracted criteria - use text search only
        query = {
            $or: [
                { description: { $regex: searchString.trim(), $options: 'i' } },
                { phase: { $regex: searchString.trim(), $options: 'i' } },
                { block: { $regex: searchString.trim(), $options: 'i' } },
                { area: { $regex: searchString.trim(), $options: 'i' } },
                { features: { $regex: searchString.trim(), $options: 'i' } }
            ]
        };
    }

    // Ensure page and limit are integers
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination and sorting
    const properties = await Property.find(query)
        .populate('userId', '_id name estateName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

    // Get total count for pagination
    const total = await Property.countDocuments(query);

    return {
        properties,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
        }
    };
};

const getModel = (type) => {
    let Model;

    switch (type) {
      case "plot":
        Model = Plot;
        break;
      case "house":
        Model = House;
        break;
      case "commercial plot":
        Model = CommercialPlot;
        break;
      default:
        throw new AppError("Invalid property type", 400);
    }

    return Model;
}