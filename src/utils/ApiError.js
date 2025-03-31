class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    }
    // else {
    //   Error.captureStackTrace(this, this.constructor);
    // }
  }
}
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || "Something went wrong";

  console.error("Error:", { statusCode, message, stack: err.stack });

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default ApiError;
