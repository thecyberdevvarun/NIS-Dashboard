import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

export default (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const details = result.array().map((e) => ({ field: e.path, message: e.msg }));
  next(new ApiError(422, details[0].message, details));
};
