import { asyncHandler, successResponse } from "../../utils/response.js";

import {
  decryptData,
  encryptData,
} from "../../utils/security/encryption.security.js";
import {
  getLoginCredentials,
  logoutEnum,
} from "../../utils/security/token.security.js";
import * as DBService from "../../DB/db.service.js";
import { rolesEmum, userModel } from "../../DB/models/User.model.js";
import {
  compareHash,
  generateHash,
} from "../../utils/security/hash.security.js";
import { RevokeTokenModel } from "../../DB/models/Revoke.Token.model.js";
import {
  deleteResources,
  deleteResourcesByPrefix,
  destroyFile,
  uploadFile,
  uploadFiles,
} from "../../middleware/cloudinary.js";

export const profile = asyncHandler(async (req, res, next) => {
  const user = await DBService.findById({
    model:userModel,
    id:req.user._id,
    populate:{
      path:"messages"
    }
  })

  req.user.phone = await decryptData({
    cipherText: req.user.phone,
  });
  return successResponse({ res, data: { user }, status: 200 });
});

export const shareProfile = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await DBService.findOne({
    model: userModel,
    filter: { _id: userId },
    select: "-phone -role",
  });

  return user
    ? successResponse({ res, data: { user }, status: 200 })
    : next(new Error("Not registerd account", { couse: 404 }));
});

export const updateBasicProfile = asyncHandler(async (req, res, next) => {
  if (req.body.phone) {
    req.body.phone = await encryptData({ plainText: req.body.phone });
  }

  const user = await DBService.findOneAndUpdate({
    model: userModel,
    filter: { _id: req.user._id },
    data: {
      $set: req.body,
      $inc: { __v: 1 },
    },
  });

  return user
    ? successResponse({ res, data: { user }, status: 200 })
    : next(new Error("Not registerd account", { couse: 404 }));
});

export const freezeAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  if (userId && req.user.role !== rolesEmum.admin) {
    return next(
      new Error("You are not allowed to freeze Accounts", { cause: 403 })
    );
  }

  const user = await DBService.updateOne({
    model: userModel,
    filter: {
      _id: userId || req.user._id,
      freezedAt: { $exists: false },
    },
    data: {
      $set: {
        freezedAt: Date.now(),
        freezedBy: req.user._id,
      },
      $inc: { __v: 1 },
    },
  });

  return user.matchedCount
    ? successResponse({ res, data: user, status: 200 })
    : next(new Error("Not registerd account", { couse: 404 }));
});

export const restoreAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  if (userId && req.user.role !== rolesEmum.admin) {
    return next(
      new Error("You are not allowed to restore Accounts", { cause: 403 })
    );
  }

  const user = await DBService.updateOne({
    model: userModel,
    filter: {
      _id: userId || req.user._id,
      freezedAt: { $exists: true },
    },
    data: {
      $set: {
        restoredBy: req.user._id,
      },
      $unset: {
        freezedAt: 1,
        freezedBy: 1,
      },
      $inc: { __v: 1 },
    },
  });

  return user.matchedCount
    ? successResponse({ res, data: user, status: 200 })
    : next(new Error("Not registerd account", { couse: 404 }));
});

export const hardDelete = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  if (userId && req.user.role !== rolesEmum.admin) {
    return next(
      new Error("You are not allowed to Delete Accounts", { cause: 403 })
    );
  }

  const user = await DBService.deleteOne({
    model: userModel,
    filter: {
      _id: userId || req.user._id,
      freezedAt: { $exists: true },
    },
  });

  if (user.deletedCount) {
    await deleteResourcesByPrefix({ prefix: `user/${userId}` });
  }

  return user.deletedCount
    ? successResponse({ res, data: user, status: 200 })
    : next(new Error("Not registerd account", { couse: 404 }));
});

export const updatePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, password } = req.body;

  if (
    !(await compareHash({
      plainText: oldPassword,
      hashValue: req.user.password,
    }))
  ) {
    return next(new Error("In-valid Old password", { cause: 400 }));
  }

  const hashPassword = await generateHash({ plainText: password });

  const user = await DBService.updateOne({
    model: userModel,
    filter: {
      _id: req.user._id,
    },
    data: {
      $set: {
        password: hashPassword,
        changeCredentialsTime: Date.now(),
      },
      $inc: {
        __v: 1,
      },
    },
  });

  return user.matchedCount
    ? successResponse({ res, data: user, status: 200 })
    : next(new Error("Not registerd account", { couse: 404 }));
});

export const profileImage = asyncHandler(async (req, res, next) => {
  const { secure_url, public_id } = await uploadFile({
    file: req.file,
    path: `user/${req.user._id}/profile`,
  });

  const user = await DBService.findOneAndUpdate({
    model: userModel,
    filter: { _id: req.user._id },
    data: {
      picture: { secure_url, public_id },
    },
    options: {
      new: false,
    },
  });

  if (user?.picture?.public_id) {
    await destroyFile({ public_id: user.picture.public_id });
  }

  return successResponse({ res, data: { user } });
});

export const profileCoverImages = asyncHandler(async (req, res, next) => {
  const attachments = await uploadFiles({
    files: req.files,
    path: `user/${req.user._id}/cover`,
  });
  const user = await DBService.findOneAndUpdate({
    model: userModel,
    filter: { _id: req.user._id },
    data: {
      coverImages: attachments,
    },
    options: {
      new: false,
    },
  });

  if (user?.cover?.length) {
    await deleteResources({
      public_ids: user.cover.map((ele) => ele.public_id),
    });
  }

  return successResponse({ res, data: user });
});

export const logout = asyncHandler(async (req, res, next) => {
  const { flag } = req.body;
  let status = 200;
  switch (flag) {
    case logoutEnum.signoutFromAll:
      await DBService.updateOne({
        model: userModel,
        filter: {
          _id: req.decoded._id,
        },
        data: {
          $set: {
            changeCredentialsTime: Date.now(),
          },
        },
      });
      break;
    default:
      await DBService.create({
        model: RevokeTokenModel,
        data: [
          {
            jti: req.decoded.jti,
            expiresIn:
              req.decoded.iat + Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
            userId: req.decoded._id,
          },
        ],
      });
      status = 201;
      break;
  }

  return successResponse({ res, status });
});

export const getNewLoginCredentials = asyncHandler(async (req, res, next) => {
  const credentials = await getLoginCredentials({ user: req.user });
  return successResponse({ res, data: { credentials } });
});
