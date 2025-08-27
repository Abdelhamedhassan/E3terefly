import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import * as authService from "./auth.service.js";
import * as validators from "./auth.validation.js";

const router = Router();

router.post("/signup", validation(validators.signup), authService.signUp);

router.patch("/confirm-email",validation(validators.confirmEmail) ,authService.confirmEmail);

router.post("/login", validation(validators.login), authService.login);

router.post("/signup/gmail",validation(validators.signUpWithGmail), authService.signUpWithGmail);
router.post("/login/gmail",validation(validators.signUpWithGmail), authService.loginWithGmail);

router.patch("/forgot-password", validation(validators.sendForgotPassword),authService.sendForgotPassword)
router.patch("/verify-forgot-Password" , validation(validators.verifyForgotPassword), authService.verifyForgotPassword)
router.patch("/reset-forgot-Password" , validation(validators.resetForgotPassword), authService.resetForgotPassword)



export default router;
