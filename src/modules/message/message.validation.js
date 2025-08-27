import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";
import { fileValidation } from "../../utils/multer/cloud.multer.js";

export const sendMessage = {
  params: joi
    .object()
    .keys({
      receiverId: generalFields.id.required(),
    })
    .required(),

  body: joi
    .object()
    .keys({
      content: joi.string().min(2).max(10000),
    })
    .messages({
      "any.required":
        "You have to enter a content or attachments to send a message",
    })
    .required(),

  files: joi.array().items(
    joi.object().keys({
      fieldname: joi.string().valid("attachments").required(),
      originalname: joi.string().required(),
      encoding: joi.string().required(),
      mimetype: joi
        .string()
        .valid(...Object.values(fileValidation.image))
        .required(),
      destination: joi.string().required(),
      filename: joi.string().required(),
      path: joi.string().required(),
      size: joi.number().positive().required(),
    })
  ),
};
