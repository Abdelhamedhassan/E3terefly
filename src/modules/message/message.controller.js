import { Router } from "express";
import * as messageService from "./message.service.js";
import * as validators from "./message.validation.js";
import {
  cloudFileUpload,
  fileValidation,
} from "../../utils/multer/cloud.multer.js";
import { validation } from "../../middleware/validation.middleware.js";
import { authenticaton } from "../../middleware/authentication.middleware.js";
const router = Router();

router.post(
  "/:receiverId",
  cloudFileUpload({ validation: fileValidation.image }).array("attachments", 2),
  validation(validators.sendMessage),
  messageService.sendMessage
);

router.post(
  "/:receiverId/sender",
  authenticaton(),
  cloudFileUpload({ validation: fileValidation.image }).array("attachments", 2),
  validation(validators.sendMessage),
  messageService.sendMessageSender
);

router.get(
  "/listMessages",
  authenticaton(),
  messageService.listMessages
);

//get message : by deafult received By Get profile 

export default router;
