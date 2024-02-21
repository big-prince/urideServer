// const catchAsync = (fn) => (req, res, next) => {
//   Promise.resolve(fn(req, res, next)).catch((err) => next(err));
// };

//Better function handling sync and async scenarios gracefully
const catchAsync = (asyncFunction) => (req, res, next) => {
  try {
    const result = asyncFunction(req, res, next);

    // If the result is a Promise, handle it; otherwise, convert to Promise
    if (result instanceof Promise) {
      result.catch((err) => next(err));
    } else {
      Promise.resolve(result).catch((err) => next(err));
    }
  } catch (err) {
    // Handle synchronous errors
    next(err);
  }
};


export default catchAsync;
