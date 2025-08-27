import { providerEnum, userModel } from "../../DB/models/User.model.js";
import { asyncHandler, successResponse } from "../../utils/response.js";
import { compareHash, generateHash } from "../../utils/security/hash.security.js";
import { encryptData } from "../../utils/security/encryption.security.js";

import { getLoginCredentials } from "../../utils/security/token.security.js";

import { OAuth2Client } from "google-auth-library";
import { customAlphabet } from "nanoid";
import { emailEvent } from "../../utils/Events/email.event.js";
import * as DBService from "../../DB/db.service.js";

//helper service methods
async function verifyGoogleAccount({ idToken }) {
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.web_CLIENT_IDS.split(","),
  });
  const payload = ticket.getPayload();
  return payload;
}

//System authentication
export const signUp = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, gender, phone, role } = req.body;

  if (await DBService.findOne({ model: userModel, filter: { email } })) {
    return next(new Error("Email Exist", { cause: 409 }));
  }

  const hashPassword = await generateHash({
    plainText: password,
  });

  const encPhone = await encryptData({
    plainText: phone,
  });

  const otp = customAlphabet("0123456789", 6)();
  const hashOtp = await generateHash({ plainText: otp });

  const [user] = await DBService.create({
    model: userModel,
    data: [
      {
        fullName,
        email,
        password: hashPassword,
        gender,
        phone: encPhone,
        confirmEmailOtp: hashOtp,
        role,
      },
    ],
  });

  emailEvent.emit("sendConfirmEmail", { email, otp });

  return successResponse({ res, status: 201, data: { user } });
});

export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await DBService.findOne({
    model: userModel,
    filter: {
      email,
      provider: providerEnum.system,
      confirmEmail: { $exists: false },
      confirmEmailOtp: { $exists: true },
    },
  });

  if (!user) {
    return next(new Error("In-valid Account", { cause: 404 }));
  }

  if (!(await compareHash({ plainText: otp, hashValue: user.confirmEmailOtp }))){
    return next(new Error("In-valid OTP", { cause: 400 }));
  }

  await DBService.updateOne({
    model: userModel,
    filter: { email },
    data: {
      $set: { confirmEmail: Date.now() },
      $unset: {
        confirmEmailOtp: 1,
      },
    },
  });

  successResponse({ res });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await DBService.findOne({
    model: userModel,
    filter: { email, provider: providerEnum.system },
  });
  if (!user) {
    return next(new Error("Invaild login Data", { cause: 404 }));
  }

  if (!user.confirmEmail) {
    return next(new Error("Please Verify your account First", { cause: 400 }));
  }

  if (!(await compareHash({ plainText: password, hashValue: user.password }))) {
    return next(new Error("Invaild login data", { cause: 404 }));
  }

  const credentials = await getLoginCredentials({ user });

  return successResponse({
    res,
    status: 200,
    data: { credentials },
  });
});


//Google provider authentication
export const signUpWithGmail = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;
  const { picture, name, email, email_verified } = await verifyGoogleAccount({
    idToken,
  });
  if (!email_verified) {
    return next(new Error("Not verified email", { cause: 400 }));
  }
  const user = await DBService.findOne({ model: userModel, filter: { email } });
  if (user) {
    return next(new Error("Email Exist", { cause: 409 }));
  }

  const newUser = await DBService.create({
    model: userModel,
    data: [
      {
        fullName: name,
        email,
        picture,
        confirmEmail: Date.now(),
        provider: providerEnum.google,
      },
    ],
  });
  const credentials = await getLoginCredentials({ user });

  return successResponse({
    res,
    status: 201,
    data: { credentials },
    status: 201,
  });
});

export const loginWithGmail = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;
  const { email, email_verified } = await verifyGoogleAccount({
    idToken,
  });
  if (!email_verified) {
    return next(new Error("Not verified email", { cause: 400 }));
  }

  const user = await DBService.findOne({
    model: userModel,
    filter: { email, provider: providerEnum.google },
  });

  if (!user) {
    return next(
      new Error("invalid login data email or provider", { cause: 404 })
    );
  }

  const credentials = await getLoginCredentials({ user });

  return successResponse({
    res,
    status: 200,
    credentials,
  });
});


export const sendForgotPassword = asyncHandler(async(req,res,next)=>{
  const {email} = req.body
  const otp = customAlphabet("0123456789",6)()
  const hashOtp = await generateHash({plainText:otp})

  const user = await DBService.findOneAndUpdate({
    model: userModel,
    filter:{
      email,
      freezedAt: {$exists:false},
      confirmEmail:{$exists: true}
    },
    data:{
      forgotCode:hashOtp
    }
  })

  if(!user){
    return next(new Error("Invalid Email, Not exists", {cause : 404}))
  }

  emailEvent.emit("forgetPassword", {email,otp})

    return successResponse({
    res,
    status: 200
  });
})

export const verifyForgotPassword = asyncHandler(async(req,res,next)=>{
  const {email, otp} = req.body

  const user = await DBService.findOne({
    model: userModel,
    filter:{
      email,
      freezedAt: {$exists:false},
      confirmEmail:{$exists: true}
    }
  })

  if(!user){
    return next(new Error("Invalid Account", {cause : 404}))
  }

  if(!await compareHash({plainText:otp , hashValue: user.forgotCode})){
    return next(new Error("Invalid OTP", {cause : 404}))
  }

    return successResponse({
    res,
    status: 200
  });
})

export const resetForgotPassword = asyncHandler(async(req,res,next)=>{
  const {email, otp, password} = req.body

  const user = await DBService.findOne({
    model: userModel,
    filter:{
      email,
      freezedAt: {$exists:false},
      confirmEmail:{$exists: true}
    }
  })

  if(!user){
    return next(new Error("Invalid Account", {cause : 404}))
  }

  if(!await compareHash({plainText:otp , hashValue: user.forgotCode})){
    return next(new Error("Invalid OTP", {cause : 404}))

  }

  const hashPassword = await generateHash({plainText:password})

  await DBService.updateOne({
    model: userModel,
    filter:{
      email
    },
    data:{
      $set:{password: hashPassword, changeCredentialsTime: Date.now()},
      $unset:{forgotCode: 1},
      $inc:{__v:1}
    }
  })

    return successResponse({
    res,
    status: 200
  });
})

