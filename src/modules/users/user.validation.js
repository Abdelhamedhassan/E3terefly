import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";
import { genderEnum } from "../../DB/models/User.model.js";
import { logoutEnum } from "../../utils/security/token.security.js";
import { fileValidation } from "../../utils/multer/local.multer.js";

export const shareProfile = {
  params: joi
    .object()
    .keys({
      userId: generalFields.id.required(),
    })
    .required(),
};

export const updateBasicProfile = {
  body: joi
    .object()
    .keys({
      firstName: generalFields.fullName,
      lastName: generalFields.fullName,
      phone: generalFields.phone,
      gender: joi.string().valid(...Object.values(genderEnum)),
    })
    .required(),
};

export const freezeAccount = {
  params: joi
    .object()
    .keys({
      userId: generalFields.id,
    })
    .required(),
};

export const restoreAccount = freezeAccount;
export const hardDelete = freezeAccount;

export const updatePassword = {
  body: joi
    .object()
    .keys({
      oldPassword: generalFields.password.required(),
      password: generalFields.password
        .not(joi.ref("oldPassword"))
        .messages({
          "any.invalid": "New password should be different from old Password",
        })
        .required(),
      confirmPassword: generalFields.confirmPassword.required(),
    })
    .required(),
};

export const logout = {
  body: joi
    .object()
    .keys({
      flag: joi
        .string()
        .valid(...Object.values(logoutEnum))
        .default(logoutEnum.stayLoggedIn),
    })
    .required(),
};

export const coverImages = {
  files: joi.array().items(
    joi.object().keys({
      fieldname: joi.string().valid("images").required(),
      originalname: joi.string().required(),
      encoding: joi.string().required(),
      mimetype: joi
        .string()
        .valid(...Object.values(fileValidation.image))
        .required(),
      // finalPath: joi.string().required(),
      destination: joi.string().required(),
      filename: joi.string().required(),
      path: joi.string().required(),
      size: joi.number().positive().required(),
    }).required()
  ).min(1).max(2).required()
};
