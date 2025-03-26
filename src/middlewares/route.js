//log the current route called details
const routeLogger = (req, res, next) => {
  console.log(`Route called: ${req.originalUrl}`);
  next();
};
export default routeLogger;
