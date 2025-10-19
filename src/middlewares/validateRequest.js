import { failureResponse } from "../utils/response.js";

export const validateRequest = (schemas) => (req, res, next) => {
  // schemas = { body?: zodSchema, params?: zodSchema, query?: zodSchema }

  try {
    // Validate body
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        const errors = result.error.issues.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));
        return failureResponse(res, errors, 400);
      }
      req.body = result.data;
    }

    // Validate params
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        const errors = result.error.issues.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));
        return failureResponse(res, errors, 400);
      }
      req.params = result.data;
    }

    // Validate query
    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        const errors = result.error.issues.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));
        return failureResponse(res, errors, 400);
      }
      req.query = result.data;
    }

    next();
  } catch (error) {
    return failureResponse(res, [{ message: error.message }], 500);
  }
};