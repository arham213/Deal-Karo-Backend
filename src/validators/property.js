import { z } from "zod";

/**
 * CREATE schema
 */
export const createPropertySchema = z
  .object({
    userId: z
      .string()
      .min(1, "userId is required")
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid userId format"),

    propertyType: z.enum(["plot", "house", "commercial plot"], { required_error: "propertyType is required" }),

    listingType: z.enum(["cash", "rent", "installments"], { required_error: "listingType is required" }),

    block: z.string().min(1, "block is required").max(100, "block too long"),
    phase: z.string().min(1, "phase is required").max(100, "phase too long"),
    area: z.string().min(1, "area is required").max(50, "area cannot exceed 50 chars"),
    additionalArea: z.string().optional(),

    description: z.string().max(200, "description cannot exceed 200 chars").optional(),
    features: z.preprocess(
      (val) => {
        if (!val) return undefined;
        
        // If it's already an array, return as is
        if (Array.isArray(val)) return val;
        
        // If it's a string, try to parse as JSON
        if (typeof val === 'string') {
          try {
            const parsed = JSON.parse(val);
            // If parsed result is an object with hasPole/hasWire
            if (typeof parsed === 'object' && parsed !== null) {
              const featuresArray = [];
              if (parsed.hasPole === false) featuresArray.push("don't have a pole");
              if (parsed.hasWire === false) featuresArray.push("no wire");
              return featuresArray.length > 0 ? featuresArray : undefined;
            }
            // If it's already an array after parsing
            if (Array.isArray(parsed)) return parsed;
          } catch {
            // If parsing fails, treat as single string value
            return [val];
          }
        }
        
        // If it's an object directly (not stringified)
        if (typeof val === 'object' && val !== null) {
          const featuresArray = [];
          if (val.hasPole === false) featuresArray.push("don't have a pole");
          if (val.hasWire === false) featuresArray.push("no wire");
          return featuresArray.length > 0 ? featuresArray : undefined;
        }
        
        return undefined;
      },
      z.array(z.string()).optional()
    ),

    price: z.number().min(0, "Price must be non-negative").optional(),

    forContact: z
      .string()
      .min(1, "contact is required")
      .regex(/^[0-9]{10,15}$/, "Contact number must be 10–15 digits"),

    /* Plot-specific required fields (enforced via refine below) */
    plotNo: z.string().optional(),
    pricePerMarla: z.number().optional(),

    /* House-specific required fields (enforced via refine below) */
    houseNo: z.string().optional(),

    /* Installment structure */
    installment: z
      .object({
        perMonth: z.number().optional(),
        quarterly: z.number().optional(),
      })
      .optional(),
  })
  .strict()

  /* Price is required for all property types */
  .refine((d) => typeof d.price === "number", {
    message: "price is required",
    path: ["price"],
  })

  /* Plot-specific enforcement */
  .refine((d) => d.propertyType !== "plot" || !!d.plotNo, {
    message: "plotNo is required for plot properties",
    path: ["plotNo"],
  })
  .refine((d) => d.propertyType !== "plot" || typeof d.pricePerMarla === "number", {
    message: "pricePerMarla is required for plot properties",
    path: ["pricePerMarla"],
  })

  /* House-specific enforcement */
  .refine((d) => d.propertyType !== "house" || !!d.houseNo, {
    message: "houseNo is required for house properties",
    path: ["houseNo"],
  })

  /* Commercial plot-specific enforcement */
  .refine((d) => d.propertyType !== "commercial plot" || !!d.plotNo, {
    message: "plotNo is required for commercial plot properties",
    path: ["plotNo"],
  })
  .refine((d) => d.propertyType !== "commercial plot" || typeof d.pricePerMarla === "number", {
    message: "pricePerMarla is required for commercial plot properties",
    path: ["pricePerMarla"],
  })
  // If listingType === "installments", installment object must exist and its fields must be numbers
  .refine((d) => d.listingType !== "installments" || d.installment !== undefined, {
    message: "installment object is required when listingType is 'installments'",
    path: ["installment"],
  })
  .refine(
    (d) =>
      d.listingType !== "installments" ||
      (d.installment &&
        typeof d.installment.perMonth === "number" &&
        typeof d.installment.quarterly === "number"),
    {
      message: "installment.perMonth and installment.quarterly are required numbers for 'installments' listingType",
      path: ["installment"],
    }
  )

  /* Prevent nonsense fields on other types (optional but helpful) */
  .refine((d) => d.propertyType === "plot" || d.plotNo === undefined, {
    message: "plotNo is only allowed for plot properties",
    path: ["plotNo"],
  })
  .refine((d) => d.propertyType === "house" || d.houseNo === undefined, {
    message: "houseNo is only allowed for house properties",
    path: ["houseNo"],
  })
  .refine((d) => d.listingType === "installments" || d.installment === undefined, {
    message: "installment info is only allowed for 'installments' listingType",
    path: ["installment"],
  })
  .refine((d) => d.propertyType === "plot" || d.propertyType === "commercial plot" || d.plotNo === undefined, {
    message: "plotNo is only allowed for plot and commercial plot properties",
    path: ["plotNo"],
  })
  .refine((d) => d.propertyType === "plot" || d.propertyType === "commercial plot" || d.pricePerMarla === undefined, {
    message: "pricePerMarla is only allowed for plot and commercial plot properties",
    path: ["pricePerMarla"],
  });

/**
 * UPDATE schema
 * - userId excluded (immutable)
 * - propertyId required
 * - partial() so partial updates allowed, refinements adapted to optional presence
 */
export const updatePropertySchema = createPropertySchema
  .omit({ userId: true })
  .extend({
    propertyId: z
      .string()
      .min(1, "propertyId is required")
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid propertyId format"),
  })
  .partial()
  // If listingType is provided and it's 'installments' then installment must be provided and valid
  .refine(
    (d) =>
      !d.listingType ||
      d.listingType !== "installments" ||
      (d.installment &&
        typeof d.installment.perMonth === "number" &&
        typeof d.installment.quarterly === "number"),
    {
      message: "installment.perMonth and installment.quarterly are required numbers when listingType is 'installments'",
      path: ["installment"],
    }
  )
  // If propertyType provided = 'plot', require plot fields if they are being set (or if propertyType is changed)
  .refine((d) => !d.propertyType || d.propertyType !== "plot" || !!d.plotNo, {
    message: "plotNo is required for plot properties",
    path: ["plotNo"],
  })
  .refine((d) => !d.propertyType || d.propertyType !== "plot" || typeof d.pricePerMarla === "number", {
    message: "pricePerMarla is required for plot properties",
    path: ["pricePerMarla"],
  })
  // If propertyType provided = 'house', require house fields
  .refine((d) => !d.propertyType || d.propertyType !== "house" || !!d.houseNo, {
    message: "houseNo is required for house properties",
    path: ["houseNo"],
  })
  // If propertyType provided = 'commercial plot', require commercial plot fields
  .refine((d) => !d.propertyType || d.propertyType !== "commercial plot" || !!d.plotNo, {
    message: "plotNo is required for commercial plot properties",
    path: ["plotNo"],
  })
  .refine((d) => !d.propertyType || d.propertyType !== "commercial plot" || typeof d.pricePerMarla === "number", {
    message: "pricePerMarla is required for commercial plot properties",
    path: ["pricePerMarla"],
  });

/**
 * Params schema for routes
 */
export const propertyIdParamsSchema = z.object({
  propertyId: z.string().min(1).regex(/^[0-9a-fA-F]{24}$/, "Invalid propertyId format"),
}).strict();

/**
 * Advanced Search schema
 */
export const advancedSearchSchema = z.object({
  propertyType: z.enum(["plot", "house", "commercial plot"]).optional(),
  listingType: z.enum(["cash", "rent", "installments"]).optional(),
  phase: z.string().optional(),
  block: z.string().optional(),
  area: z.string().optional(),
  minPrice: z.preprocess(
    (val) => (val === undefined || val === '' ? undefined : typeof val === 'string' ? parseFloat(val) : val),
    z.number().min(0, "Min price must be non-negative").optional()
  ),
  maxPrice: z.preprocess(
    (val) => (val === undefined || val === '' ? undefined : typeof val === 'string' ? parseFloat(val) : val),
    z.number().min(0, "Max price must be non-negative").optional()
  ),
  features: z.preprocess(
    (val) => {
      if (!val) return undefined;
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        // Handle comma-separated string or single value
        return val.split(',').map(f => f.trim()).filter(f => f.length > 0);
      }
      return [val];
    },
    z.array(z.string()).optional()
  ),
  page: z.preprocess(
    (val) => (val === undefined || val === '' ? 1 : typeof val === 'string' ? parseInt(val) : val),
    z.number().int().min(1, "Page must be at least 1").default(1)
  ),
  limit: z.preprocess(
    (val) => (val === undefined || val === '' ? 10 : typeof val === 'string' ? parseInt(val) : val),
    z.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").default(10)
  ),
}).refine((data) => !data.minPrice || !data.maxPrice || data.minPrice <= data.maxPrice, {
  message: "Min price must be less than or equal to max price",
  path: ["minPrice"],
}).strict();

/**
 * Simple Search schema
 */
export const simpleSearchSchema = z.object({
  searchString: z.string().min(1, "Search string is required").max(200, "Search string too long"),
  propertyType: z.enum(["plot", "house", "commercial plot"]).optional(),
  listingType: z.enum(["cash", "rent", "installments"]).optional(),
  page: z.preprocess(
    (val) => (val === undefined || val === '' ? 1 : typeof val === 'string' ? parseInt(val) : val),
    z.number().int().min(1, "Page must be at least 1").default(1)
  ),
  limit: z.preprocess(
    (val) => (val === undefined || val === '' ? 10 : typeof val === 'string' ? parseInt(val) : val),
    z.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").default(10)
  ),
}).strict();

/**
 * Pagination schema for GetAllProperties
 */
export const getAllPropertiesSchema = z.object({
  page: z.preprocess(
    (val) => (val === undefined || val === '' ? 1 : typeof val === 'string' ? parseInt(val) : val),
    z.number().int().min(1, "Page must be at least 1").default(1)
  ),
  limit: z.preprocess(
    (val) => (val === undefined || val === '' ? 10 : typeof val === 'string' ? parseInt(val) : val),
    z.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").default(10)
  ),
}).strict();