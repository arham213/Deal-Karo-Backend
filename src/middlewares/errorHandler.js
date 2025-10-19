import { failureResponse } from "../utils/response.js";

export const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);

  let statusCode = err.statusCode || 500;
  let message = "Something went wrong. Please try again later.";

  // Handle specific error types
  if (err.name === "ValidationError") {
    message = Object.values(err.errors).map(e => e.message).join(", ");
    statusCode = 400;
  } 
  else if (err.code === 11000) { // Duplicate key error
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists. Please use a different one.`;
    statusCode = 400;
  } 
  else if (err.message?.toLowerCase().includes("unauthorized")) {
    statusCode = 403;
    message = "You are not authorized to perform this action.";
  } 
  else if (err.message?.toLowerCase().includes("token")) {
    statusCode = 401;
    message = "Invalid or expired token. Please log in again.";
  } 
  else if (err.message?.toLowerCase().includes("bcrypt") || err.message?.includes("data and salt")) {
    statusCode = 500;
    message = "Password processing failed. Please try again.";
  } 
  else if (err.message?.toLowerCase().includes("not found")) {
    statusCode = 404;
    message = err.message;
  } 
  else if (err.message?.toLowerCase().includes("expired")) {
    statusCode = 400;
    message = err.message;
  } 
  else if (err.message && !err.message.toLowerCase().startsWith("err")) {
    message = err.message; // custom user-defined messages like "Invalid OTP"
  }

  return failureResponse(res, { message }, statusCode);
};