import { Types } from "mongoose";
import { genderEnum, rolesEmum } from "../DB/models/User.model.js";
import { asyncHandler } from "../utils/response.js";

import joi from "joi";

export const generalFields = {
  fullName: joi.string().min(2).max(20).messages({
    "string.max": "max fillName length is 20 char",
    "any.required": "fullName is Mandatory",
    "string.empty": "empty value is not allowed",
  }),
  email: joi.string().email({
    minDomainSegments: 2,
    maxDomainSegments: 3,
    tlds: { allow: ["com", "net"] },
  }),
  password: joi
    .string()
    .pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
  confirmPassword: joi.string().valid(joi.ref("password")),
  phone: joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
  gender: joi.string().valid(...Object.values(genderEnum)),
  role: joi.string().valid(...Object.values(rolesEmum)),
  otp: joi.string().pattern(new RegExp(/^\d{6}$/)),
  id: joi.string().custom((value, helper) => {
    return Types.ObjectId.isValid(value)
      ? true
      : helper.message("In-valid mongoDB-Id");
  }),
};

export const validation = (schema) => {
  return asyncHandler(async (req, res, next) => {
    const validationErrors = [];
    for (const key of Object.keys(schema)) {
      const validationResult = schema[key].validate(req[key], {
        abortEarly: false,
      });

      if (validationResult.error) {
        validationErrors.push(validationResult.error?.details);
      }
    }

    if (validationErrors.length) {
      return res
        .status(400)
        .json({ err_message: "Validation error", data: validationErrors });
    }

    return next();
  });
};
