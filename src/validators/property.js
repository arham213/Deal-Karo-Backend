import { z } from "zod";

export const createPropertySchema = z.object({
    dealerId: z
    .string()
    .min(1, "dealerId is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid dealerId format"),

    type: z
    .enum(['plot', 'house']),

    category: z
    .enum(['sale', 'rent', 'installments']),

    title: z
    .string()
    .min(1, "title is required")
    .max(50, "Title cannot exceed 50 characters"),

    location: z
    .string()
    .min(1, "location is required")
    .max(50, "Location cannot exceed 50 characters"),

    area: z
    .string()
    .min(1, "area is required")
    .max(50, "Area cannot exceed 50 characters"),

    price: z
    .number()
    .min(0, "price is required and must be greater than zero"),

    description: z
    .string()
    .max(200, "descripion cannot exceed 200 characters")
    .optional(),

    moreOptions: z
    .string()
    .optional(),

    forContact: z
    .string()
    .min(1, "contact No is required")
    .regex(/^[0-9]{10,15}$/, 'Contact number must be 10–15 digits'),

    plotNumber: z
    .number()
    .optional(),

    rentPerMonth: z
    .number()
    .optional(),

    installments: z
    .object({
        perMonth: z
        .number()
        .optional(),

        quarterly:z
        .number()
        .optional()
    })
    .optional()
})
.strict()
  .refine(
    (data) =>
      data.category !== "installments" || data.installments !== undefined,
    {
      message: "Installment details are required for installments properties",
      path: ["installments"],
    }
  )
  .refine((data) => data.category !== "rent" || data.rentPerMonth !== undefined, {
    message: "rentPerMonth is required when category is 'rent'",
    path: ["rentPerMonth"],
  })
  .refine(
    (data) =>
      data.category === "installments" || data.installments === undefined,
    {
      message: "Installment info is only allowed for installments properties",
      path: ["installments"],
    }
  )
  .refine((data) => data.category === "rent" || data.rentPerMonth === undefined, {
    message: "rentPerMonth is only allowed for rent properties",
    path: ["rentPerMonth"],
  })
  .refine((data) => data.type !== "plot" || !!data.plotNumber, {
    message: "plotNumber is required for all plots",
    path: ["plotNumber"],
  })
  .refine((data) => data.type === "plot" || data.plotNumber === undefined, {
    message: "plotNumber is only allowed for plot properties",
    path: ["plotNumber"],
  });

export const updatePropertySchema = createPropertySchema
  .omit({ dealerId: true })
  .extend({
    propertyId: z
      .string()
      .min(1, "propertyId is required")
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid propertyId format"),
  })
  .partial()
  .refine(
    (data) =>
      !data.category ||
      data.category !== "installments" ||
      data.installments !== undefined,
    {
      message: "Installment details are required for installments properties",
      path: ["installments"],
    }
  )
  // 2️⃣ If updating category to "rent", rentPerMonth must be provided
  .refine(
    (data) =>
      !data.category ||
      data.category !== "rent" ||
      data.rentPerMonth !== undefined,
    {
      message: "rentPerMonth is required when category is 'rent'",
      path: ["rentPerMonth"],
    }
  )
  .refine(
    (data) =>
      !data.category ||
      data.category === "installments" ||
      data.installments === undefined,
    {
      message: "Installment info is only allowed for installments properties",
      path: ["installments"],
    }
  )
  .refine(
    (data) =>
      !data.category ||
      data.category === "rent" ||
      data.rentPerMonth === undefined,
    {
      message: "rentPerMonth is only allowed for rent properties",
      path: ["rentPerMonth"],
    }
  )
  .refine((data) => !data.type || data.type !== "plot" || !!data.plotNumber, {
    message: "plotNumber is required for all plots",
    path: ["plotNumber"],
  })
  .refine((data) => !data.type || data.type === "plot" || data.plotNumber === undefined, {
    message: "plotNumber is only allowed for plot properties",
    path: ["plotNumber"],
  });

export const propertyIdParamsSchema = z.object({
    propertyId: z
    .string()
    .min(1, "propertyId is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid propertyId format")
}).strict();