export const asyncHandler = (fn) => {
  return async (req, res, next) => {
    await fn(req, res, next).catch((error) => {
      return next(error, { cause: (error.cause = 500) });
    });
  };
};

export const globalErrorHandler = (error, req, res, next) => {
  return res
    .status(error.cause || 400)
    .json({ 
      err_message: error.message, 
      error:error,
      stack: process.env.MOOD==="DEV"? error.stack  : undefined
    });
};

export const successResponse = ({
  res,
  message = "Done",
  status = 200,
  data = {},
} = {}) => {
  return res.status(status).json({ message, data });
};
