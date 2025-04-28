/**
 * Middleware to log route access details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const routeLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const route = req.originalUrl;

  console.log(`⚠️ [${timestamp}] API REQUEST | Method: ${method} | Route: ${route}`);
  next();
};

export default routeLogger;
