import jwt from "jsonwebtoken";
import { rolesEmum, userModel } from "../../DB/models/User.model.js";
import * as DBService from "../../DB/db.service.js";
import { RevokeTokenModel } from "../../DB/models/Revoke.Token.model.js";
import { nanoid } from "nanoid";

export const signitureTypeEnum = { system: "System", bearer: "Bearer" };
export const tokenTypeEnum = { access: "access", refresh: "refresh" };
export const logoutEnum = {
  signoutFromAll: "signoutFromAll",
  signout: "signout",
  stayLoggedIn: "stayLoggedIn",
};

//generate the token for user
export const generateToken = async ({
  payload = {},
  signiture = process.env.ACCESS_TOKEN_USER_SIGNITURE,
  options = { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) },
} = {}) => {
  return jwt.sign(payload, signiture, options);
};

//pass the token and signature then get the token data
export const verifyToken = async ({
  token = "{}",
  signiture = process.env.ACCESS_TOKEN_USER_SIGNITURE,
} = {}) => {
  return jwt.verify(token, signiture);
};

//get the level of the user then return the accessSignature and refreshSignature
export const getSignitares = async ({
  signitureLevel = signitureTypeEnum.bearer,
} = {}) => {
  const signitures = {
    accessSigniture: undefined,
    refreshSigniture: undefined,
  };

  if (signitureLevel === signitureTypeEnum.system) {
    signitures.accessSigniture = process.env.ACCESS_TOKEN_SYSTEM_SIGNITURE;
    signitures.refreshSigniture = process.env.REFRESH_TOKEN_SYSTEM_SIGNITURE;
  } else if (signitureLevel === signitureTypeEnum.bearer) {
    signitures.accessSigniture = process.env.ACCESS_TOKEN_USER_SIGNITURE;
    signitures.refreshSigniture = process.env.REFRESH_TOKEN_USER_SIGNITURE;
  } else {
    throw new Error("Invalid token prefix");
  }

  return signitures;
};

//get the Role and ccall generateToken function --> access token and refresh roken based on Role
export const getLoginCredentials = async ({ user } = {}) => {
  const signiture = await getSignitares({
    signitureLevel:
      user.role != rolesEmum.user
        ? signitureTypeEnum.system
        : signitureTypeEnum.bearer,
  });

  const jwtid = nanoid();

  const access_token = await generateToken({
    payload: { _id: user._id },
    signiture: signiture.accessSigniture,
    options: {
      expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
      jwtid,
    },
  });

  const refresh_token = await generateToken({
    payload: { _id: user._id },
    signiture: signiture.refreshSigniture,
    options: {
      expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
      jwtid,
    },
  });

  return { access_token, refresh_token };
};

//first layer to decode token from postman
export const decodedToken = async ({
  authorization = "",
  tokenType = tokenTypeEnum.access,
  next,
} = {}) => {
  const [prefix, token] = authorization?.split(" ") || [];

  if (!token || !prefix) {
    return next(new Error("Missing token parts", { cause: 401 }));
  }
  const signiture = await getSignitares({ signitureLevel: prefix }); 

  const decoded = await verifyToken({
    token,
    signiture:
      tokenType === tokenTypeEnum.access
        ? signiture.accessSigniture
        : signiture.refreshSigniture,
  });
  
  if (
    decoded.jti &&
    (await DBService.findOne({
      model: RevokeTokenModel,
      filter: { jti: decoded.jti },
    }))
  ) {
    return next(new Error("In-valid login Credentials", { cause: 401 }));
  }

  const user = await DBService.findById({
    model: userModel,
    id: decoded._id,
  });

  if (!user) {
    return next(new Error("Not register account ", { cause: 404 }));
  }
  if (decoded.iat * 1000 < user.changeCredentialsTime?.getTime()) {
    return next(new Error("Old Token", { cause: 401 }));
  }

  return { user, decoded };
};
