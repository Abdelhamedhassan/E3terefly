import {
  authenticaton,
  authorization,
} from "../../middleware/authentication.middleware.js";
import { endPoint } from "./user.authorization.js";
import { Router } from "express";
import { tokenTypeEnum } from "../../utils/security/token.security.js";
import * as validators from "./user.validation.js";
import { validation } from "../../middleware/validation.middleware.js";

import * as userService from "./user.service.js";
import {
  fileValidation,
  localFileUpload,
} from "../../utils/multer/local.multer.js";
import { cloudFileUpload } from "../../utils/multer/cloud.multer.js";

const router = Router();

router.get(
  "/",
  authenticaton(),
  authorization(endPoint.profile),
  userService.profile
);
router.get(
  "/:userId/profile",
  validation(validators.shareProfile),
  userService.shareProfile
);

router.patch(
  "/",
  authenticaton(),
  validation(validators.updateBasicProfile),
  userService.updateBasicProfile
);

router.delete(
  "{/:userId}/freeze",
  authenticaton(),
  validation(validators.freezeAccount),
  userService.freezeAccount
);
router.patch(
  "{/:userId}/restore",
  authenticaton(),
  validation(validators.restoreAccount),
  userService.restoreAccount
);

router.delete(
  "{/:userId}/hard-delete",
  authenticaton(),
  validation(validators.hardDelete),
  userService.hardDelete
);

router.patch(
  "/password",
  authenticaton(),
  validation(validators.updatePassword),
  userService.updatePassword
);

router.get(
  "/refresh-token",
  authenticaton({ tokenType: tokenTypeEnum.refresh }),
  userService.getNewLoginCredentials
);

router.post(
  "/logout",
  authenticaton(),
  validation(validators.logout),
  userService.logout
);

// router.patch(
//   "/profile-image",
//   authenticaton(),
//   localFileUpload({
//     customPath: "user",
//     validation: fileValidation.image,
//   }).single("image"),
//   userService.profileImage
// );

router.patch(
  "/profile-image",
  authenticaton(),
  cloudFileUpload({
    validation: fileValidation.image,
  }).single("image"),
  userService.profileImage
);

router.patch(
  "/profile-cover-images",
  authenticaton(),
  cloudFileUpload({
    // customPath: "user",
    validation: fileValidation.image,
  }).array("images", 2),
  validation(validators.coverImages),
  userService.profileCoverImages
);

export default router;
