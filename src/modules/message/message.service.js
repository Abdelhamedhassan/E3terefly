import { asyncHandler, successResponse } from "../../utils/response.js";
import * as DBService from "../../DB/db.service.js";
import { userModel } from "../../DB/models/User.model.js";
import { MessageModel } from "../../DB/models/Message.model.js";
import { uploadFiles } from "../../middleware/cloudinary.js";

export const sendMessage = asyncHandler(async (req, res, next) => {
  const { receiverId } = req.params;
  if (
    !(await DBService.findOne({
      model: userModel,
      filter: {
        _id: receiverId,
        deletedAt: { $exists: false },
        confirmEmail: { $exists: true },
        freezedBy: { $exists: false },
      },
    }))
  ) {
    return next(new Error("In-vaild reciepent user ", { cause: 404 }));
  }

  const { content } = req.body;
  let attachments = []

  if (req.files) {
    attachments = await uploadFiles({ files: req.files, path: `messages/${receiverId}` });
  }
  const [message] = await DBService.create({
    model: MessageModel,
    data: [
      {
        receiverId,
        content,
        attachments,
      },
    ],
  });

  successResponse({ res, status: 201, data: { message } });
});


export const sendMessageSender = asyncHandler(async (req, res, next) => {
  const { receiverId } = req.params;
  if (
    !(await DBService.findOne({
      model: userModel,
      filter: {
        _id: receiverId,
        deletedAt: { $exists: false },
        confirmEmail: { $exists: true },
        freezedBy: { $exists: false },
      },
    }))
  ) {
    return next(new Error("In-vaild reciepent user ", { cause: 404 }));
  }

  const { content } = req.body;
  let attachments = []

  if (req.files) {
    attachments = await uploadFiles({ files: req.files, path: `messages/${receiverId}` });
  }
  const [message] = await DBService.create({
    model: MessageModel,
    data: [
      {
        receiverId,
        content,
        attachments,
        senderId: req.user?._id,
      },
    ],
  });

  successResponse({ res, status: 201, data: { message } });
});
