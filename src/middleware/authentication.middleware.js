import { asyncHandler } from "../utils/response.js";
import { decodedToken, tokenTypeEnum } from "../utils/security/token.security.js";

export const authenticaton = ({ tokenType = tokenTypeEnum.access } = {}) => {
  return asyncHandler(async (req, res, next) => {
    const {user , decoded} = await decodedToken({
      authorization: req.headers.authorization,
      next,
      tokenType
    }) || {}
    req.user = user
    req.decoded = decoded
    return next();
  });
};

export const authorization = ( accessRoles = [] ) => {
  return asyncHandler(async (req, res, next) => {
    if (!accessRoles.includes(req.user.role)) {
      return next(new Error("Not authorized account", {cause:403}))
    }
    return next()
  });
};

export const auth = ({tokenType=tokenTypeEnum.access , accessRoles=[]} = {})=>{
  return asyncHandler(
    async(req,res,next)=>{
      const {user , decoded} = await decodedToken({
        authorization: req.headers.authorization,
        next,
        tokenType
      }) || {}
      req.user = user
      req.decoded = decoded

      if(!accessRoles.includes(req.user.role)){
        return next(new Error("Not authorized account" , {cause:405}))
      }
      return next()
    }
  )
}