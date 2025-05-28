import { RequestHandler } from "express";

export const asyncHandler = (...fn: RequestHandler[]): RequestHandler => {
  return (req, res, next) => {
    Promise.all(fn.map((f) => f(req, res, next)))
      .then(() => next())
      .catch((err) => {
        next(err);
      });
  };
};
