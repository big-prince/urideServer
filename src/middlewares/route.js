//log the current route called details
const routeLogger = (req, res, next) => {
  console.log(`🔥🔥ROUTE CALLED: ${req.originalUrl}`);
  next();
};
export default routeLogger;
